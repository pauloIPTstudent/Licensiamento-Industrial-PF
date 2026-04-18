'use client';

import React, { useMemo, useState } from 'react';

export default function Questionnaire({ fluxData }: { fluxData: any[] }) {
  // Estado para o nó atual
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(() => {
    return fluxData && fluxData.length > 0 ? fluxData[0].id : null;
  });

  // Estado para o histórico de navegação (IDs dos nós visitados)
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  
  // Estado para os dados das respostas (para a IA)
  const [historyData, setHistoryData] = useState<any[]>([]);
  
  const [isFinished, setIsFinished] = useState(false);

  const currentNode = useMemo(() => 
    fluxData.find(n => n.id === currentNodeId), 
    [currentNodeId, fluxData]
  );

  // --- FUNÇÃO PARA VOLTAR ---
  const handleBack = () => {
    if (navigationHistory.length === 0) return;

    // Se estiver na tela de conclusão, desmarcamos o fim
    if (isFinished) setIsFinished(false);

    // Pegamos o último ID da pilha
    const previousHistory = [...navigationHistory];
    const lastNodeId = previousHistory.pop() || null;

    // Atualizamos os estados
    setNavigationHistory(previousHistory);
    setCurrentNodeId(lastNodeId);

    // Removemos também o último registro de dados das respostas
    setHistoryData(prev => prev.slice(0, -1));
  };

  const handleAnswer = (optionIndex: number) => {
    if (!currentNode) return;
    
    const handleId = `handle-${optionIndex}`;
    const nextId = currentNode.data.proximos[handleId];

    // Salva o ID atual na pilha de navegação ANTES de mudar
    setNavigationHistory(prev => [...prev, currentNode.id]);

    // Salva os dados para o relatório
    setHistoryData([...historyData, {
      pergunta: currentNode.data.label,
      resposta: currentNode.data.opcoes?.[optionIndex],
      lei: currentNode.data.trechoLei
    }]);

    if (nextId) {
      setCurrentNodeId(nextId);
    } else {
      setIsFinished(true);
    }
  };

  // --- TELA DE CONCLUSÃO ---
  if (isFinished || (currentNode?.type === 'conclusion')) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white shadow-2xl rounded-2xl mt-10 border border-gray-200">
        {/* Botão Voltar na Conclusão */}
        <button 
          onClick={handleBack}
          className="mb-6 text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1"
        >
          ← Voltar pergunta
        </button>

        <div className="flex items-center gap-2 mb-6">
          <div className="w-3 h-8 bg-green-500 rounded-full"></div>
          <h2 className="text-3xl font-black text-slate-900">Análise Concluída</h2>
        </div>

        <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 mb-8">
          <h3 className="text-sm font-bold text-green-700 uppercase tracking-widest mb-2 text-black">Resultado Final</h3>
          <p className="text-2xl font-bold text-slate-900 mb-4">{currentNode?.data?.label}</p>
          <div className="text-lg text-slate-800 leading-relaxed whitespace-pre-wrap bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
             {currentNode?.data?.conclusaoText || "Conclusão sem descrição detalhada."}
          </div>
        </div>
        
        <button 
          onClick={() => console.log("Histórico para IA:", historyData)}
          className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-lg hover:bg-blue-700 transition-all shadow-lg"
        >
          Gerar Relatório Técnico ✨
        </button>
      </div>
    );
  }

  if (!currentNode) return <div className="p-10 text-slate-900 font-bold">Carregando fluxo...</div>;

  return (
    <div className="max-w-2xl mx-auto p-8 mt-10 bg-white shadow-2xl rounded-2xl border border-gray-100">
      
      {/* HEADER COM BOTÃO VOLTAR E PROGRESSO */}
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={handleBack}
          disabled={navigationHistory.length === 0}
          className={`text-sm font-bold flex items-center gap-1 transition-colors ${
            navigationHistory.length === 0 ? 'text-gray-200 cursor-not-allowed' : 'text-slate-400 hover:text-blue-600'
          }`}
        >
          ← Voltar pergunta
        </button>
        <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">
          Passo {navigationHistory.length + 1}
        </span>
      </div>

      <div className="mb-8">
        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-black uppercase">
          Pergunta do Sistema
        </span>
        <h1 className="text-3xl font-black text-slate-900 mt-4 leading-tight">
          {currentNode.data.label}
        </h1>
      </div>

      {currentNode.data.trechoLei && (
        <div className="mb-8 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
          <p className="text-sm text-amber-900 leading-relaxed italic">
            <strong className="block not-italic mb-1 font-bold text-black">⚖️ Fundamentação Legal:</strong>
            "{currentNode.data.trechoLei}"
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {(currentNode.data.opcoes || []).map((opcao: string, index: number) => (
          <button 
            key={index}
            onClick={() => handleAnswer(index)}
            className="w-full bg-white border-2 border-slate-200 text-slate-800 py-4 px-6 rounded-xl text-lg font-bold hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all text-left shadow-sm flex justify-between items-center group"
          >
            {opcao}
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-400">→</span>
          </button>
        ))}
      </div>
    </div>
  );
}