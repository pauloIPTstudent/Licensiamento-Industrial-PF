import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Listar todos
export async function GET() {
  const data = await prisma.questionnaire.findMany({
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json(data);
}

// POST: Criar novo
export async function POST(request: Request) {
  const body = await request.json();
  const newItem = await prisma.questionnaire.create({
    data: {
      title: body.title,
      description: body.description,
    },
  });
  return NextResponse.json(newItem, { status: 201 });
}