import React from 'react';

export default function EditSidebar({ selectedNode, nodes, onUpdateNode, onDeleteNode, onClose }: any) {
  if (!selectedNode) return null;

  const isQuestion = selectedNode.type === 'question';

  // Função para atualizar campos simples e o objeto 'proximos'
  const handleChange = (field: string, value: any) => {
    if (field === 'sim' || field === 'nao') {
      onUpdateNode(selectedNode.id, {
        ...selectedNode.data,
        proximos: {
          ...selectedNode.data.proximos,
          [field]: value,
        },
      });
    } else {
      onUpdateNode(selectedNode.id, {
        ...selectedNode.data,
        [field]: value,
      });
    }
  };

  return (
    <aside style={{
      width: '320px',
      borderRight: '1px solid #ddd',
      padding: '20px',
      background: '#fff',
      position: 'absolute',
      left: 0,
      top: 0,
      height: '100%',
      color:'#000',
      zIndex: 10,
      boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
      overflowY: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h3 style={{ fontWeight: 'bold' }}>Configurar Nó</h3>
        <button onClick={onClose} style={{ cursor: 'pointer', border: 'none', background: 'none' }}>✕</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {/* Título/Pergunta */}
        <label style={{ fontSize: '12px', fontWeight: 'bold' }}>
          {isQuestion ? 'Pergunta Dinâmica' : 'Título da Conclusão'}
          <input
            style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
            value={selectedNode.data.label || ''}
            onChange={(e) => handleChange('label', e.target.value)}
          />
        </label>

        {/* Trecho da Lei */}
        <label style={{ fontSize: '12px', fontWeight: 'bold' }}>
          Trecho da Lei (Referência)
          <textarea
            style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #ccc', minHeight: '60px', borderRadius: '4px' }}
            value={selectedNode.data.trechoLei || ''}
            onChange={(e) => handleChange('trechoLei', e.target.value)}
          />
        </label>

        {/* Lógica de Próximos Nodes (Apenas se for Pergunta) */}
        {isQuestion && (
          <div style={{ background: '#f8f9fa', padding: '10px', borderRadius: '8px', border: '1px solid #eee' }}>
            <p style={{ fontSize: '11px', fontWeight: 'bold', color: '#666', marginBottom: '10px' }}>LOGICA DE FLUXO</p>
            
            <label style={{ fontSize: '11px', display: 'block', marginBottom: '8px' }}>
              Se a resposta for **SIM**, ir para:
              <select 
                style={{ width: '100%', padding: '5px', marginTop: '3px' }}
                value={selectedNode.data.proximos?.sim || ''}
                onChange={(e) => handleChange('sim', e.target.value)}
              >
                <option value="">(Nenhum - Fim do Fluxo)</option>
                {nodes.filter((n: any) => n.id !== selectedNode.id).map((n: any) => (
                  <option key={n.id} value={n.id}>{n.data.label || n.id}</option>
                ))}
              </select>
            </label>

            <label style={{ fontSize: '11px', display: 'block' }}>
              Se a resposta for **NÃO**, ir para:
              <select 
                style={{ width: '100%', padding: '5px', marginTop: '3px' }}
                value={selectedNode.data.proximos?.nao || ''}
                onChange={(e) => handleChange('nao', e.target.value)}
              >
                <option value="">(Nenhum - Fim do Fluxo)</option>
                {nodes.filter((n: any) => n.id !== selectedNode.id).map((n: any) => (
                  <option key={n.id} value={n.id}>{n.data.label || n.id}</option>
                ))}
              </select>
            </label>
          </div>
        )}

        {/* Campo de Conclusão Final */}
        {!isQuestion && (
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#059669' }}>
            Parecer Final (Conclusão)
            <textarea
              style={{ width: '100%', padding: '8px', marginTop: '5px', border: '1px solid #059669', minHeight: '80px', borderRadius: '4px' }}
              value={selectedNode.data.conclusaoText || ''}
              onChange={(e) => handleChange('conclusaoText', e.target.value)}
              placeholder="Ex: O licenciamento deve ser do tipo 1 conforme DL..."
            />
          </label>
        )}
      </div>
    <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
        <button 
          onClick={() => onDeleteNode(selectedNode.id)}
          style={{
            width: '100%',
            padding: '10px',
            background: '#fee2e2',
            color: '#ef4444',
            border: '1px solid #fca5a5',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Apagar este Nó
        </button>
      </div>
    </aside>
  );
}