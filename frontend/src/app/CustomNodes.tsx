import { Handle, Position } from 'reactflow';

// Estilo comum para os nodes
const nodeStyle = {
  padding: '10px',
  borderRadius: '5px',
  fontSize: '12px',
  color: '#fff',
  textAlign: 'center' as const,
  border: '1px solid #222',
};

// Node Intermediário (Pergunta)
export const QuestionNode = ({ data }: any) => (
  <div style={{ ...nodeStyle, background: '#2563eb', width: '150px' }}>
    <Handle type="target" position={Position.Top} />
    <div><strong>Pergunta:</strong><br />{data.label}</div>
    {/* Saídas específicas para Sim e Não */}
    <Handle type="source" position={Position.Bottom} id="sim" style={{ left: '30%', background: '#22c55e' }} />
    <div style={{ position: 'absolute', bottom: '-20px', left: '20%', fontSize: '10px', color: '#000' }}>Sim</div>
    
    <Handle type="source" position={Position.Bottom} id="nao" style={{ left: '70%', background: '#ef4444' }} />
    <div style={{ position: 'absolute', bottom: '-20px', left: '65%', fontSize: '10px', color: '#000' }}>Não</div>
  </div>
);

// Node de Conclusão
export const ConclusionNode = ({ data }: any) => (
  <div style={{ ...nodeStyle, background: '#059669', width: '150px' }}>
    <Handle type="target" position={Position.Top} />
    <div><strong>Conclusão:</strong><br />{data.label}</div>
  </div>
);