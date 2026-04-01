'use client';

import React from 'react';

export default function DndSidebar({ nodes, onExport }: any) { // Recebe onExport via props
   /* Esta função é disparada quando o usuário começa a arrastar o elemento.
   * Ela salva o tipo do node (question ou conclusion) para que o canvas
   * saiba o que renderizar quando o mouse for solto.
   */
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };
const gerarJsonFinal = () => {
    const fluxoFormatado = nodes.map((node: any) => ({
      id: node.id,
      pergunta: node.data.label,
      tipo: node.type === 'question' ? 'INTERMEDIARIO' : 'CONCLUSAO',
      trechoLei: node.data.trechoLei,
      conclusao: node.type === 'conclusion' ? node.data.conclusaoText : null,
      proximos: node.data.proximos || { sim: null, nao: null }
    }));

    // Em vez de apenas console.log, enviamos para fora!
    onExport(fluxoFormatado);
  };
  return (
    <aside style={{ 
      width: '240px', 
      borderLeft: '1px solid #ddd', 
      padding: '20px', 
      background: '#fcfcfc',
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    }}>
      <h3 style={{ 
        fontSize: '14px', 
        fontWeight: 'bold', 
        color: '#333', 
        marginBottom: '5px' 
      }}>
        Painel de Ferramentas
      </h3>
      <p style={{ fontSize: '11px', color: '#666', marginBottom: '10px' }}>
        Arraste os blocos para a área de desenho para montar o fluxo de licenciamento.
      </p>

      {/* Bloco de Pergunta (Intermediário) */}
      <div 
        style={{ 
          padding: '15px', 
          background: '#2563eb', 
          color: '#fff', 
          cursor: 'grab', 
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: '500',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid #1d4ed8'
        }}
        onDragStart={(event) => onDragStart(event, 'question')}
        draggable
      >
        ➕ Pergunta (Intermediário)
      </div>

      {/* Bloco de Resultado (Conclusão) */}
      <div 
        style={{ 
          padding: '15px', 
          background: '#059669', 
          color: '#fff', 
          cursor: 'grab', 
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: '500',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid #047857'
        }}
        onDragStart={(event) => onDragStart(event, 'conclusion')}
        draggable
      >
        🏁 Resultado (Conclusão)
      </div>

      <hr style={{ border: '0', borderTop: '1px solid #eee', margin: '10px 0' }} />
      
      <div style={{ fontSize: '11px', color: '#999', lineHeight: '1.4' }}>
        <strong>Dica:</strong> Após arrastar, clique no bloco para editar os textos legais e as condições.
      </div>
      <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
        <button 
        onClick={gerarJsonFinal}
        style={{
          width: '100%',
          padding: '12px',
          background: '#111827',
          color: '#fff',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 'bold',
          marginTop: 'auto'
        }}
      >
        Testar Questionário
      </button>
      </div>
    </aside>
  );
}