import { Handle, Position } from 'reactflow';

const nodeStyle = {
  padding: '10px',
  borderRadius: '8px',
  fontSize: '12px',
  color: '#fff',
  textAlign: 'center' as const,
  border: '1px solid #1e3a8a',
  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
};

export const QuestionNode = ({ data }: any) => {
  // Garantimos que 'opcoes' existe para não quebrar o map
  const opcoes = data.opcoes || [];

  return (
    <div style={{ 
      ...nodeStyle, 
      background: '#2563eb', 
      width: '180px', 
      minHeight: '60px',
      position: 'relative' 
    }}>
      {/* Entrada superior única */}
      <Handle type="target" position={Position.Top} style={{ background: '#fff' }} />
      
      <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
        {data.label}
      </div>

      {/* Renderização dinâmica das opções e seus respectivos Handles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {opcoes.map((opcao: string, index: number) => (
          <div 
            key={index} 
            style={{ 
              background: 'rgba(255, 255, 255, 0.2)', 
              padding: '4px 8px', 
              borderRadius: '4px',
              fontSize: '10px',
              position: 'relative',
              textAlign: 'right',
              marginRight: '-5px'
            }}
          >
            {opcao}
            <Handle
              type="source"
              position={Position.Right}
              id={`handle-${index}`} // O ID deve ser idêntico ao que o Flow.tsx espera
              style={{ 
                right: '-10px', 
                background: '#fbbf24', // Cor amarela para destacar as saídas
                width: '8px',
                height: '8px'
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export const ConclusionNode = ({ data }: any) => (
  <div style={{ 
    ...nodeStyle, 
    background: '#059669', 
    width: '150px',
    border: '1px solid #064e3b' 
  }}>
    <Handle type="target" position={Position.Top} style={{ background: '#fff' }} />
    <div>
      <strong style={{ fontSize: '10px', opacity: 0.8 }}>CONCLUSÃO</strong>
      <br />
      {data.label}
    </div>
  </div>
);