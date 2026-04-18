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
  Panel,
} from 'reactflow';
import dagre from 'dagre';

import 'reactflow/dist/style.css';

import DndSidebar from './DndSidebar';
import EditSidebar from './EditSidebar';
import { QuestionNode, ConclusionNode } from './CustomNodes';

const nodeTypes = {
  question: QuestionNode,
  conclusion: ConclusionNode,
};

// --- LÓGICA DO AUTO-LAYOUT (DAGRE) ---
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 250;
const nodeHeight = 150;

const getLayoutedElements = (nodes: any[], edges: any[], direction = 'LR') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: isHorizontal ? 'left' : 'top',
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

export default function Flow(props: any) {
  return (
    <div className="wrapper" style={{ 
      width: '100vw', 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'row', 
      overflow: 'hidden' 
    }}>
      <ReactFlowProvider>
        <DnDFlow {...props} />
      </ReactFlowProvider>
    </div>
  );
}

function DnDFlow({ onExport, initialNodes, setNodesHome, initialEdges, setEdgesHome }: any) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  const reactFlowInstance = useReactFlow();

  // Sincroniza com o estado da Home
  useEffect(() => {
    setNodesHome(nodes);
  }, [nodes, setNodesHome]);

  useEffect(() => {
    setEdgesHome(edges);
  }, [edges, setEdgesHome]);

  // --- FUNÇÃO PARA ORGANIZAR OS NÓS ---
  const onLayout = useCallback(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes,
      edges
    );

    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
    
    // Faz o zoom automático para focar os novos lugares
    setTimeout(() => reactFlowInstance.fitView(), 50);
  }, [nodes, edges, setNodes, setEdges, reactFlowInstance]);

  // --- FUNÇÃO PARA SALVAR ARQUIVO JSON ---
  const saveToFile = useCallback(() => {
    const flowData = { nodes, edges };
    const blob = new Blob([JSON.stringify(flowData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'fluxo-especialista.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) || null,
    [nodes, selectedNodeId]
  );

  const onDeleteNode = useCallback((id: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== id));
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
    setSelectedNodeId(null);
  }, [setNodes, setEdges]);

  const onConnect = useCallback((params: any) => {
    setNodes((nds) => {
      const sourceNode = nds.find((n) => n.id === params.source);
      if (!params.sourceHandle) return nds;

      const handleIndex = parseInt(params.sourceHandle.split('-')[1]);
      const labelOpcao = sourceNode?.data.opcoes?.[handleIndex] || 'Opção';

      setEdges((eds) => addEdge({ ...params, label: labelOpcao, animated: true }, eds));

      return nds.map((node) => {
        if (node.id === params.source) {
          return {
            ...node,
            data: {
              ...node.data,
              proximos: { ...node.data.proximos, [params.sourceHandle]: params.target },
            },
          };
        }
        return node;
      });
    });
  }, [setEdges, setNodes]);

  // Auto-sincronização de edges
  useEffect(() => {
    const newEdges: any[] = [];
    nodes.forEach((node) => {
      if (node.type === 'question' && node.data?.proximos) {
        Object.keys(node.data.proximos).forEach((handleId) => {
          const targetId = node.data.proximos[handleId];
          if (targetId) {
            const handleIndex = parseInt(handleId.split('-')[1]);
            const labelOpcao = node.data.opcoes?.[handleIndex] || 'Opção';
            newEdges.push({
              id: `e-${node.id}-${targetId}-${handleId}`,
              source: node.id,
              target: targetId,
              sourceHandle: handleId,
              label: labelOpcao,
              animated: true,
            });
          }
        });
      }
    });

    setEdges((currentEdges) => {
      if (JSON.stringify(currentEdges) === JSON.stringify(newEdges)) return currentEdges;
      return newEdges;
    });
  }, [nodes, setEdges]);

  const onNodeClick = useCallback((_: any, node: any) => {
    setSelectedNodeId(node.id);
  }, []);

  const onUpdateNode = useCallback((id: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) => (node.id === id ? { ...node, data: newData } : node))
    );
  }, [setNodes]);

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
          opcoes: type === 'question' ? ['Opção 1', 'Opção 2'] : [],
          proximos: {} 
        },
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  return (
    <>
      <div className="reactflow-wrapper" style={{ flex: 1, height: '100%', position: 'relative' }}>
        
        {/* PAINEL DE BOTÕES SUPERIOR */}
        <div className="absolute top-4 right-4 z-50 flex gap-2">
          <button 
            onClick={onLayout}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold shadow-md transition-all flex items-center gap-2"
          >
            <span>🪄</span> Arrumar Fluxo
          </button>
          
          <button 
            onClick={saveToFile}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold shadow-md transition-all flex items-center gap-2"
          >
            <span>💾</span> Salvar JSON
          </button>
        </div>

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
          <Background gap={12} size={1} />
        </ReactFlow>

        <EditSidebar 
          selectedNode={selectedNode} 
          nodes={nodes}
          onUpdateNode={onUpdateNode}
          onDeleteNode={onDeleteNode}
          onClose={() => setSelectedNodeId(null)}
        />
      </div>

      <DndSidebar nodes={nodes} onExport={() => onExport(nodes)} />
    </>
  );
}