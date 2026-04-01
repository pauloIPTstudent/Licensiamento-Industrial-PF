'use client';

// Exemplo do JSON que o teu editor gera (podes passar via props ou carregar de uma API)
interface FlowNode {
  id: string;
  pergunta: string;
  tipo: 'INTERMEDIARIO' | 'CONCLUSAO';
  trechoLei: string;
  conclusao: string | null;
  proximos: { sim: string | null; nao: string | null };
}

