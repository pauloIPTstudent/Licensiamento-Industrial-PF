'use client';

import React, { useMemo, useState } from 'react';

// O seu componente atual, renomeado para QuestionnaireClient
export default function QuestionnaireClient({ fluxData }: { fluxData: any[] }) {
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(() => {
    return fluxData && fluxData.length > 0 ? fluxData[0].id : null;
  });

  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const currentNode = useMemo(() => 
    fluxData.find(n => n.id === currentNodeId), 
    [currentNodeId, fluxData]
  );

  const handleBack = () => {
    if (navigationHistory.length === 0) return;
    if (isFinished) setIsFinished(false);

    const previousHistory = [...navigationHistory];
    const lastNodeId = previousHistory.pop() || null;

    setNavigationHistory(previousHistory);
    setCurrentNodeId(lastNodeId);
    setHistoryData(prev => prev.slice(0, -1));
  };

  const handleAnswer = (optionIndex: number) => {
    if (!currentNode) return;
    
    const handleId = `handle-${optionIndex}`;
    const nextId = currentNode.data.proximos[handleId];

    setNavigationHistory(prev => [...prev, currentNode.id]);
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

  // --- O RESTANTE DO SEU CÓDIGO (Returns de conclusão e perguntas) ---
  // ... (Cole aqui o restante do JSX que você enviou)
  if (isFinished || (currentNode?.type === 'conclusion')) {
      return (
          <div className="max-w-2xl mx-auto p-8 bg-white shadow-2xl rounded-2xl border border-gray-200">
              {/* JSX de Conclusão */}
              <button onClick={handleBack} className="mb-6 text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1">← Voltar</button>
              <h2 className="text-3xl font-black text-slate-900 mb-6">Análise Concluída</h2>
              <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 mb-8">
                  <p className="text-2xl font-bold text-slate-900">{currentNode?.data?.label}</p>
                  <div className="mt-4 text-slate-800 bg-white p-4 rounded-lg border border-slate-100 shadow-sm whitespace-pre-wrap">
                      {currentNode?.data?.conclusaoText || "Conclusão sem descrição detalhada."}
                  </div>
              </div>
              <button onClick={() => console.log("Histórico para IA:", historyData)} className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-lg hover:bg-blue-700 transition-all shadow-lg">Gerar Relatório Técnico ✨</button>
          </div>
      )
  }

  if (!currentNode) return <div className="p-10 text-slate-900 font-bold">Carregando fluxo...</div>;

  return (
      <div className="max-w-2xl mx-auto p-8 bg-white shadow-2xl rounded-2xl border border-gray-100">
          {/* JSX de Pergunta */}
          <div className="flex justify-between items-center mb-6">
              <button onClick={handleBack} disabled={navigationHistory.length === 0} className={`text-sm font-bold flex items-center gap-1 ${navigationHistory.length === 0 ? 'text-gray-200' : 'text-slate-400 hover:text-blue-600'}`}>← Voltar</button>
              <span className="text-xs font-bold text-slate-300 uppercase">Passo {navigationHistory.length + 1}</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-8 leading-tight">{currentNode.data.label}</h1>
          {currentNode.data.trechoLei && (
              <div className="mb-8 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
                  <p className="text-sm text-amber-900 italic font-medium">"{currentNode.data.trechoLei}"</p>
              </div>
          )}
          <div className="flex flex-col gap-3">
              {(currentNode.data.opcoes || []).map((opcao: string, index: number) => (
                  <button key={index} onClick={() => handleAnswer(index)} className="w-full bg-white border-2 border-slate-200 text-slate-800 py-4 px-6 rounded-xl text-lg font-bold hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all text-left flex justify-between items-center group">
                      {opcao}
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-400">→</span>
                  </button>
              ))}
          </div>
      </div>
  );
}