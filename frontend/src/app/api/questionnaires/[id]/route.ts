import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PATCH: Atualizar um questionário específico
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Note o Promise aqui
) {
  try {
    const body = await request.json();
    
    // É OBRIGATÓRIO dar await no params agora
    const { id } = await params; 
    const idInt = parseInt(id);

    const updated = await prisma.questionnaire.update({
      where: { id: idInt },
      data: {
        title: body.title,
        description: body.description,
        // Garante que salvamos como string se houver conteúdo novo
        content: body.content ? JSON.stringify(body.content) : undefined
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}

// DELETE: Remover um questionário
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Note o Promise aqui
) {
  try {
    // É OBRIGATÓRIO dar await no params agora
    const { id } = await params;
    const idInt = parseInt(id);

    await prisma.questionnaire.delete({
      where: { id: idInt }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao eliminar" }, { status: 500 });
  }
}

// Opcional: GET para um único questionário
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const questionnaire = await prisma.questionnaire.findUnique({
      where: { id: parseInt(id) }
    });

    if (!questionnaire) {
      return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      ...questionnaire,
      content: JSON.parse(questionnaire.content)
    });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao procurar" }, { status: 500 });
  }
}