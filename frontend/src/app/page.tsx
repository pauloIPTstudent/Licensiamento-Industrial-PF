'use client';

import { useState, useEffect } from "react";
import Flow from "./flow";
import Questionnaire from "./Questionnaire";

type ViewMode = 'landing' | 'flow' | 'quiz';

export default function Home() {
  const [view, setView] = useState<ViewMode>('landing');
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);

  useEffect(() => {
    const savedNodes = localStorage.getItem('flow-nodes');
    const savedEdges = localStorage.getItem('flow-edges');
    if (savedNodes) setNodes(JSON.parse(savedNodes));
    if (savedEdges) setEdges(JSON.parse(savedEdges));
  }, []);

  useEffect(() => {
    if (nodes.length > 0) {
      localStorage.setItem('flow-nodes', JSON.stringify(nodes));
      localStorage.setItem('flow-edges', JSON.stringify(edges));
    }
  }, [nodes, edges]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        setNodes(json.nodes || []);
        setEdges(json.edges || []);
        setView('flow');
      } catch (error) { alert("Erro ao ler o arquivo JSON."); }
    };
    reader.readAsText(file);
  };

  const iniciarNovoProjeto = () => {
    if (confirm("Isso apagará seu progresso atual. Deseja continuar?")) {
      setNodes([]); setEdges([]);
      localStorage.removeItem('flow-nodes');
      localStorage.removeItem('flow-edges');
      setView('flow');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 text-slate-900">
      
      {/* 1. PAGINA INICIAL (Reduzida em escala) */}
      {view === 'landing' && (
        <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col items-start justify-center min-h-[90vh]">
          <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-3 text-slate-900">
            Crie seu Fluxo de <br /> Especialista
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mb-10 leading-relaxed">
            Transforme decisões complexas em questionários simples. 
            Organize sua lógica com clareza arquitetural.
          </p>

          <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl">
            {/* CARD: NOVO PROJETO */}
            <div className="bg-white p-8 rounded-[1.5rem] shadow-sm border border-gray-100 flex flex-col items-start hover:shadow-md transition-all group">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-900 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <span className="text-xl font-bold">+</span>
              </div>
              <h2 className="text-xl font-bold mb-2">Iniciar Novo Fluxo</h2>
              <p className="text-sm text-slate-400 mb-6 flex-grow leading-snug">
                Comece do zero com nosso editor visual. Arraste e solte nós de decisão.
              </p>
              <button 
                onClick={iniciarNovoProjeto}
                className="bg-[#0a122a] text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-all"
              >
                Criar Projeto <span>→</span>
              </button>
            </div>

            {/* CARD: IMPORTAR PROJETO */}
            <div className="bg-[#f8f9fb] p-8 rounded-[1.5rem] border-2 border-dashed border-slate-200 flex flex-col items-start hover:border-blue-400 transition-all">
              <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                 <span className="text-lg">☁️</span>
              </div>
              <h2 className="text-xl font-bold mb-2">Importar Projeto</h2>
              <p className="text-sm text-slate-400 mb-6 leading-snug">
                Já tem um arquivo .json? Arraste-o para cá e continue de onde parou.
              </p>
              
              <label className="w-full h-24 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition-colors">
                <span className="text-xl mb-1">📄</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selecionar arquivo</span>
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          {nodes.length > 0 && (
            <button 
              onClick={() => setView('flow')}
              className="mt-8 text-sm text-blue-600 font-bold hover:underline"
            >
              Continuar projeto anterior →
            </button>
          )}
        </div>
      )}

      {/* 2. EDITOR (FLOW) */}
      {view === 'flow' && (
        <div className="w-full h-screen relative">
          <button 
            onClick={() => setView('landing')}
            className="absolute top-3 left-3 z-50 bg-white border border-slate-200 px-3 py-1.5 rounded-md shadow-sm hover:bg-slate-50 transition-colors text-[10px] font-black uppercase tracking-wider"
          >
            ← Início
          </button>
          <Flow 
            onExport={() => setView('quiz')} 
            initialNodes={nodes}
            setNodesHome={setNodes}
            initialEdges={edges}
            setEdgesHome={setEdges}
          />
        </div>
      )}

      {/* 3. QUESTIONÁRIO (QUIZ) */}
      {view === 'quiz' && (
        <div className="w-full min-h-screen pt-12 pb-10 bg-gray-50">
          <button 
            onClick={() => setView('flow')}
            className="fixed top-4 left-4 bg-white border border-gray-300 shadow-sm px-4 py-2 rounded-lg text-black text-xs font-bold hover:bg-gray-100 z-50 transition-colors"
          >
            ← Voltar ao Editor
          </button>
          <Questionnaire fluxData={nodes} />
        </div>
      )}
    </main>
  );
}