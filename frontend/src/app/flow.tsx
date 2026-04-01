'use client';

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';

import 'reactflow/dist/style.css';

// Importação dos seus componentes customizados
import DndSidebar from './DndSidebar';
import EditSidebar from './EditSidebar';
import { QuestionNode, ConclusionNode } from './CustomNodes';

// 1. Registro dos tipos de nodes
const nodeTypes = {
  question: QuestionNode,
  conclusion: ConclusionNode,
};

export default function Flow({ onExport }: any) { // Recebe da Home
  return (
    <div className="wrapper" style={{ width: '100vw', height: '100vh', display: 'flex' }}>
      <ReactFlowProvider>
        <DnDFlow onExport={onExport} /> {/* Passa para o DnDFlow */}
      </ReactFlowProvider>
    </div>
  );
}

function DnDFlow({ onExport }: any) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  const reactFlowInstance = useReactFlow();

  // Encontra o node selecionado para o EditSidebar
  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) || null,
    [nodes, selectedNodeId]
  );
  const onDeleteNode = useCallback((id: string) => {
    // Remove o node
    setNodes((nds) => nds.filter((node) => node.id !== id));
    // Remove as linhas (edges) ligadas a ele para não deixar lixo no gráfico
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
    // Fecha o sidebar
    setSelectedNodeId(null);
  }, [setNodes, setEdges]); 
  // --- LÓGICA DE CONEXÃO ---
  const onConnect = useCallback((params: any) => {
  // 1. Cria a linha visual (Edge)
  const edge = { ...params, label: params.sourceHandle === 'sim' ? 'Sim' : 'Não' };
  setEdges((eds) => addEdge(edge, eds));

  // 2. Atualiza os dados lógicos do Node de Origem
  setNodes((nds) =>
      nds.map((node) => {
        if (node.id === params.source) {
          const field = params.sourceHandle; // 'sim' ou 'nao'
          return {
            ...node,
            data: {
              ...node.data,
              proximos: {
                ...node.data.proximos,
                [field]: params.target, // Salva o ID do node de destino
              },
            },
          };
        }
        return node;
      })
    );
  }, [setEdges, setNodes]);
  // Dentro do DnDFlow em flow.tsx
useEffect(() => {
  const newEdges: any[] = [];

  nodes.forEach((node) => {
    if (node.type === 'question' && node.data.proximos) {
      // Verifica o caminho SIM
      if (node.data.proximos.sim) {
        newEdges.push({
          id: `e-${node.id}-${node.data.proximos.sim}-sim`,
          source: node.id,
          target: node.data.proximos.sim,
          sourceHandle: 'sim',
          label: 'Sim',
          animated: true, // Opcional: para dar um feedback visual de que foi manual
        });
      }
      // Verifica o caminho NÃO
      if (node.data.proximos.nao) {
        newEdges.push({
          id: `e-${node.id}-${node.data.proximos.nao}-nao`,
          source: node.id,
          target: node.data.proximos.nao,
          sourceHandle: 'nao',
          label: 'Não',
          animated: true,
        });
      }
    }
  });

  // Atualiza os Edges apenas se houver mudança real para evitar loops infinitos
  setEdges(newEdges);
}, [nodes, setEdges]);
  // --- LÓGICA DE CLIQUE (EDITAR) ---
  const onNodeClick = useCallback((_: any, node: any) => {
    setSelectedNodeId(node.id);
  }, []);

  const onUpdateNode = useCallback((id: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: newData };
        }
        return node;
      })
    );
  }, [setNodes]);

  // --- LÓGICA DE DRAG & DROP ---
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: crypto.randomUUID(),
        type,
        position,
        data: { 
          label: type === 'question' ? 'Nova Pergunta?' : 'Nova Conclusão',
          trechoLei: '',
          conclusaoText: '',
          proximos: { sim: null, nao: null } // INICIALIZE AQUI
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  return (
    <>
      <div className="reactflow-wrapper" style={{ flexGrow: 1, position: 'relative' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          onPaneClick={() => setSelectedNodeId(null)}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Controls />
          <MiniMap />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>

        {/* Sidebar de Edição (Aparece quando clica num node) */}
        {/* Dentro do return do DnDFlow*/}
        <EditSidebar 
          selectedNode={selectedNode} 
          nodes={nodes}
          onUpdateNode={onUpdateNode}
          onDeleteNode={onDeleteNode}  // <--- ESTA LINHA É A QUE ESTÁ FALTANDO
          onClose={() => setSelectedNodeId(null)}
        />
      </div>

      {/* Sidebar de Ferramentas (Sempre visível) */}
      <DndSidebar nodes={nodes} onExport={onExport} />
    </>
  );
}