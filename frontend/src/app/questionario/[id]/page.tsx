import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import QuestionnaireClient from './QuestionnaireClient';

interface QuestionnairePageProps {
  params: Promise<{ id: string }>;
}

export default async function QuestionnairePage({ params }: QuestionnairePageProps) {
  // 1. Obter o ID da URL (aguardando a Promise conforme exigido pelo Next.js 15/16)
  const { id } = await params;
  const idInt = parseInt(id);

  // 2. Procurar no banco de dados
  const questionnaire = await prisma.questionnaire.findUnique({
    where: { id: idInt },
  });

  // 3. Se não existir o questionário, mostrar 404
  if (!questionnaire) {
    notFound();
  }

  // 4. Processamento dos dados (Lógica para tratar o objeto do React Flow)
  let fluxData: any[] = [];

  try {
    // Tenta converter a string do SQLite para objeto JS
    const rawContent = typeof questionnaire.content === 'string' 
      ? JSON.parse(questionnaire.content) 
      : questionnaire.content;

    // VERIFICAÇÃO DE ESTRUTURA:
    // Se o conteúdo for um objeto que contém uma chave 'nodes' (padrão React Flow)
    if (rawContent && typeof rawContent === 'object' && !Array.isArray(rawContent)) {
      if (Array.isArray(rawContent.nodes)) {
        fluxData = rawContent.nodes;
      } else {
        // Se for um objeto mas não tiver a chave nodes, tentamos transformar em array
        fluxData = [rawContent];
      }
    } 
    // Se já for um array direto
    else if (Array.isArray(rawContent)) {
      fluxData = rawContent;
    }
  } catch (error) {
    console.error("Erro ao processar fluxData:", error);
    fluxData = [];
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Cabeçalho da Página com dados do banco */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            {questionnaire.title}
          </h1>
          {questionnaire.description && (
            <p className="text-slate-500 mt-3 text-lg">
              {questionnaire.description}
            </p>
          )}
          <div className="mt-4 flex justify-center">
            <div className="h-1 w-20 bg-blue-600 rounded-full"></div>
          </div>
        </div>

        {/* 5. Renderização do Componente Cliente com os dados filtrados */}
        {fluxData.length > 0 ? (
          <QuestionnaireClient fluxData={fluxData} />
        ) : (
          <div className="p-10 bg-white rounded-2xl shadow-sm border border-red-100 text-center">
            <p className="text-red-500 font-bold">
              Erro: A estrutura do questionário é inválida ou está vazia.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}