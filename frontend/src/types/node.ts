export enum NodeType {
  INTERMEDIARIO = "INTERMEDIARIO",
  CONCLUSAO = "CONCLUSAO",
}

export interface QuestionNode {
  id: string;
  pergunta: string;
  tipo: NodeType;
  trechoLei: string;
  conclusao: string | null;
  proximos: { sim: string | null; nao: string | null };
}