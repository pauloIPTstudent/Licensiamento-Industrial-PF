import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Importa a instância que você configurou

// GET: Listar todos os questionários
export async function GET() {
  try {
    const questionnaires = await prisma.questionnaire.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // Como o 'content' é salvo como String/JSON no SQLite, 
    // fazemos o parse para enviar como objeto real para o frontend
    const formattedData = questionnaires.map(q => ({
      ...q,
      content: JSON.parse(q.content)
    }));

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Erro no GET:", error);
    return NextResponse.json({ error: "Erro ao buscar dados" }, { status: 500 });
  }
}

// POST: Criar um novo questionário
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newQuestionnaire = await prisma.questionnaire.create({
      data: {
        title: body.title,
        description: body.description,
        // Stringify necessário para salvar o objeto JSON no campo de texto do SQLite
        content: JSON.stringify(body.content)
      }
    });

    return NextResponse.json(newQuestionnaire, { status: 201 });
  } catch (error) {
    console.error("Erro no POST:", error);
    return NextResponse.json({ error: "Erro ao criar questionário" }, { status: 500 });
  }
}