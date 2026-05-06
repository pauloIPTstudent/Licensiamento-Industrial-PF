'use client';

import { useState, useEffect } from "react";
import Flow from "./flow";
import Questionnaire from "./Questionnaire";

type ViewMode = 'landing' | 'flow' | 'quiz';

export default function Home() {
  const [view, setView] = useState<ViewMode>('landing');
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  
  // Estados para a lista de projetos
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. BUSCAR LISTA DE PROJETOS (GET /api/questionnaires)
  useEffect(() => {
    if (view === 'landing') {
      fetchProjects();
    }
  }, [view]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/questionnaires');
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("Erro ao buscar projetos:", error);
    } finally {
      setLoading(false);
    }
  };

  const deletarProjeto = async (id: number, title: string) => {
  if (!confirm(`Tem certeza que deseja apagar o fluxo "${title}"?`)) return;

  try {
    const response = await fetch(`/api/questionnaires/${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      // Remove o projeto da lista localmente para a interface atualizar na hora
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } else {
      alert("Erro ao apagar o projeto.");
    }
  } catch (error) {
    console.error("Erro ao deletar:", error);
    alert("Erro de conexão com a API.");
  }
};

  // 2. CARREGAR UM PROJETO ESPECÍFICO (GET /api/questionnaires/[id])
  const carregarProjeto = async (id: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/questionnaires/${id}`);
      if (!response.ok) throw new Error("Projeto não encontrado");
      
      const data = await response.json();
      
      // O banco guarda o JSON no campo 'content'
      // Verificamos se vem no formato {nodes, edges} ou apenas array
      const content = typeof data.content === 'string' ? JSON.parse(data.content) : data.content;
      
      setNodes(content.nodes || content || []);
      setEdges(content.edges || []);
      setView('flow');
    } catch (error) {
      alert("Erro ao carregar o projeto.");
    } finally {
      setLoading(false);
    }
  };

  const iniciarNovoProjeto = () => {
    setNodes([]); 
    setEdges([]);
    setView('flow');
  };

  return (
    <main className="min-h-screen bg-gray-50 text-slate-900">
      
      {view === 'landing' && (
        <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col items-start min-h-[90vh]">
          <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-3 text-slate-900">
            Meus Fluxos de <br /> Especialista
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mb-10 leading-relaxed">
            Gerencie seus questionários salvos no banco de dados ou crie uma nova arquitetura de decisão.
          </p>

          <div className="grid md:grid-cols-3 gap-6 w-full">
            {/* CARD: NOVO PROJETO */}
            <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 flex flex-col items-start hover:shadow-md transition-all group h-full">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-900 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <span className="text-xl font-bold">+</span>
              </div>
              <h2 className="text-xl font-bold mb-2">Novo Fluxo</h2>
              <p className="text-xs text-slate-400 mb-6 flex-grow leading-snug">
                Comece do zero com nosso editor visual.
              </p>
              <button 
                onClick={iniciarNovoProjeto}
                className="w-full bg-[#0a122a] text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all"
              >
                Criar Novo <span>→</span>
              </button>
            </div>

            {/* TABELA DE PROJETOS (Ocupa 2 colunas) */}
            <div className="md:col-span-2 bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                <h2 className="font-black uppercase tracking-widest text-xs text-slate-400">Projetos Recentes</h2>
                {loading && <span className="text-[10px] animate-pulse text-blue-500 font-bold">CARREGANDO...</span>}
              </div>

              <div className="overflow-y-auto max-h-[400px]">
                {projects.length === 0 && !loading ? (
                  <div className="p-10 text-center text-slate-300 text-sm italic">Nenhum projeto encontrado no banco.</div>
                ) : (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] uppercase tracking-tighter text-slate-400">
                        <th className="px-6 py-3 font-bold">Título</th>
                        <th className="px-6 py-3 font-bold">Criado em</th>
                        <th className="px-6 py-3 font-bold text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {projects.map((project) => (
                        <tr key={project.id} className="hover:bg-blue-50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-700 group-hover:text-blue-700">{project.title}</div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[200px]">{project.description || 'Sem descrição'}</div>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-400">
                            {new Date(project.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button 
                              onClick={() => carregarProjeto(project.id)}
                              className="bg-white border border-slate-200 text-slate-600 px-3 py-1 rounded text-xs font-bold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
                            >
                              Abrir
                            </button>
                            <button 
                              onClick={() => deletarProjeto(project.id, project.title)}
                              className="bg-white border border-slate-200 text-red-500 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-500 hover:text-white hover:border-red-500 transition-all flex items-center justify-center"
                              title="Apagar projeto"
                            >
                              <span>🗑️</span>
                            </button>
                            </div>
                            
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-center">
                 <button onClick={fetchProjects} className="text-[10px] font-bold text-blue-600 hover:underline">Atualizar Lista ↻</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. EDITOR (FLOW) */}
      {view === 'flow' && (
        <div className="w-full h-screen relative">
          <button 
            onClick={() => setView('landing')}
            className="absolute top-3 left-3 z-50 bg-white border border-slate-200 px-3 py-1.5 rounded-md shadow-sm hover:bg-slate-50 transition-colors text-[10px] font-black uppercase tracking-wider"
          >
            ← Início / Sair
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