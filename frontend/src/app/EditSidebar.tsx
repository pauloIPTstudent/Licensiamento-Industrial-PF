import React from 'react';

export default function EditSidebar({ selectedNode, nodes, onUpdateNode, onDeleteNode, onClose }: any) {
  if (!selectedNode) return null;

  const isQuestion = selectedNode.type === 'question';

  // --- LÓGICA DE ATUALIZAÇÃO ---
  const updateData = (newData: any) => {
    onUpdateNode(selectedNode.id, {
      ...selectedNode.data,
      ...newData,
    });
  };

  // Adicionar nova opção
  const addOption = () => {
    const currentOptions = selectedNode.data.opcoes || [];
    updateData({
      opcoes: [...currentOptions, `Nova Opção ${currentOptions.length + 1}`],
    });
  };

  // Remover opção específica
  const removeOption = (index: number) => {
    const newOptions = [...(selectedNode.data.opcoes || [])];
    const newProximos = { ...selectedNode.data.proximos };
    
    newOptions.splice(index, 1);
    delete newProximos[`handle-${index}`]; // Limpa a conexão lógica se existir

    updateData({
      opcoes: newOptions,
      proximos: newProximos
    });
  };

  // Editar texto da opção
  const updateOptionText = (index: number, text: string) => {
    const newOptions = [...(selectedNode.data.opcoes || [])];
    newOptions[index] = text;
    updateData({ opcoes: newOptions });
  };

  // Ligar opção a um Node (Destino)
  const setTargetNode = (handleId: string, targetId: string) => {
    updateData({
      proximos: {
        ...selectedNode.data.proximos,
        [handleId]: targetId,
      },
    });
  };

  return (
    <aside style={{
      width: '350px', borderRight: '1px solid #ddd', padding: '20px', background: '#fff',
      position: 'absolute', left: 0, top: 0, height: '100%', color:'#000',
      zIndex: 10, boxShadow: '2px 0 5px rgba(0,0,0,0.1)', overflowY: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h3 style={{ fontWeight: 'bold' }}>Configurar Nó</h3>
        <button onClick={onClose} style={{ cursor: 'pointer', border: 'none', background: 'none' }}>✕</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <label style={{ fontSize: '12px', fontWeight: 'bold' }}>
          {isQuestion ? 'Pergunta' : 'Título da Conclusão'}
          <input
            style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
            value={selectedNode.data.label || ''}
            onChange={(e) => updateData({ label: e.target.value })}
          />
        </label>

        {isQuestion && (
          <div style={{ background: '#f0f4ff', padding: '15px', borderRadius: '8px', border: '1px solid #dbeafe' }}>
            <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#1e40af', marginBottom: '10px' }}>OPÇÕES DE RESPOSTA</p>
            
            {(selectedNode.data.opcoes || []).map((opcao: string, index: number) => (
              <div key={index} style={{ marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #bfdbfe' }}>
                <div style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                  <input
                    style={{ flex: 1, padding: '5px', fontSize: '12px' }}
                    value={opcao}
                    onChange={(e) => updateOptionText(index, e.target.value)}
                    placeholder="Texto da opção..."
                  />
                  <button 
                    onClick={() => removeOption(index)}
                    style={{ background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '0 8px' }}
                  >
                    ✕
                  </button>
                </div>

                <select 
                  style={{ width: '100%', padding: '4px', fontSize: '11px' }}
                  value={selectedNode.data.proximos?.[`handle-${index}`] || ''}
                  onChange={(e) => setTargetNode(`handle-${index}`, e.target.value)}
                >
                  <option value="">Ir para: (Fim do Fluxo)</option>
                  {nodes.filter((n: any) => n.id !== selectedNode.id).map((n: any) => (
                    <option key={n.id} value={n.id}>{n.data.label || `Nó: ${n.id.slice(0,4)}`}</option>
                  ))}
                </select>
              </div>
            ))}

            <button 
              onClick={addOption}
              style={{
                width: '100%', padding: '8px', background: '#2563eb', color: '#fff',
                border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold'
              }}
            >
              + Adicionar Opção
            </button>
          </div>
        )}

        <label style={{ fontSize: '12px', fontWeight: 'bold' }}>
          Trecho da Lei (Referência)
          <textarea
            style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ccc', minHeight: '60px', borderRadius: '4px' }}
            value={selectedNode.data.trechoLei || ''}
            onChange={(e) => updateData({ trechoLei: e.target.value })}
          />
        </label>

        {!isQuestion && (
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#059669' }}>
            Parecer Final (Conclusão)
            <textarea
              style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #059669', minHeight: '80px', borderRadius: '4px' }}
              value={selectedNode.data.conclusaoText || ''}
              onChange={(e) => updateData({ conclusaoText: e.target.value })}
            />
          </label>
        )}
      </div>

      <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <button 
          onClick={() => onDeleteNode(selectedNode.id)}
          style={{
            width: '100%', padding: '10px', background: '#fee2e2', color: '#ef4444',
            border: '1px solid #fca5a5', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
          }}
        >
          Apagar este Nó
        </button>
      </div>
    </aside>
  );
}