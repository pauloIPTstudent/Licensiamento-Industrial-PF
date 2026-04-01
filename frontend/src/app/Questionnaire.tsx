import React, { useCallback, useMemo, useState, useEffect } from 'react';
interface FlowNode {
  id: string;
  pergunta: string;
  tipo: 'INTERMEDIARIO' | 'CONCLUSAO';
  trechoLei: string;
  conclusao: string | null;
  proximos: { sim: string | null; nao: string | null };
}

export default function Questionnaire({ fluxData }: { fluxData: FlowNode[] }) {
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(fluxData[0]?.id || null);
  const [history, setHistory] = useState<any[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  // Encontra o nó atual no JSON
  const currentNode = useMemo(() => 
    fluxData.find(n => n.id === currentNodeId), 
    [currentNodeId, fluxData]
  );

  const handleAnswer = (choice: 'sim' | 'nao') => {
    if (!currentNode) return;

    // 1. Guardar no histórico para a IA
    const newHistory = [
      ...history,
      {
        pergunta: currentNode.pergunta,
        resposta: choice.toUpperCase(),
        lei: currentNode.trechoLei
      }
    ];
    setHistory(newHistory);

    // 2. Definir próximo passo
    const nextId = currentNode.proximos[choice];

    if (nextId) {
      setCurrentNodeId(nextId);
    } else {
      // Se não houver próximo ID, verificamos se o nó atual já era uma conclusão
      setIsFinished(true);
    }
  };

  // Se chegámos ao fim
  if (isFinished || (currentNode?.tipo === 'CONCLUSAO')) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white shadow-lg rounded-xl">
        <h2 className="text-2xl font-bold text-green-600 mb-4">Resultado da Análise</h2>
        <div className="p-4 bg-gray-50 border-l-4 border-green-500 mb-6">
          <p className="font-semibold">{currentNode?.pergunta || "Conclusão Atingida"}</p>
          <p className="text-gray-700 mt-2">{currentNode?.conclusao}</p>
        </div>
        
        {/* BOTÃO PARA A FASE 4 (IA) */}
        <button 
          onClick={() => console.log("Enviar histórico para Gemini:", history)}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
        >
          Gerar Relatório Técnico com AI ✨
        </button>
      </div>
    );
  }

  if (!currentNode) return <div>Erro: Nó não encontrado no fluxo.</div>;

  return (
    <div className="max-w-2xl mx-auto p-8 mt-10 bg-white shadow-xl rounded-2xl border border-gray-100">
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-500">Pergunta Atual</span>
        <h1 className="text-3xl font-extrabold text-gray-900 mt-2 leading-tight">
          {currentNode.pergunta}
        </h1>
      </div>

      {currentNode.trechoLei && (
        <div className="mb-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 italic">
            <strong>Base Legal:</strong> "{currentNode.trechoLei}"
          </p>
        </div>
      )}

      <div className="flex gap-4">
        <button 
          onClick={() => handleAnswer('sim')}
          className="flex-1 bg-green-500 text-white py-4 rounded-xl text-xl font-bold hover:bg-green-600 transform hover:scale-105 transition-all shadow-md"
        >
          Sim
        </button>
        <button 
          onClick={() => handleAnswer('nao')}
          className="flex-1 bg-red-500 text-white py-4 rounded-xl text-xl font-bold hover:bg-red-600 transform hover:scale-105 transition-all shadow-md"
        >
          Não
        </button>
      </div>

      <div className="mt-8 pt-6 border-top border-gray-100">
        <p className="text-xs text-gray-400 text-center">
          Progresso: {history.length} perguntas respondidas
        </p>
      </div>
    </div>
  );
}