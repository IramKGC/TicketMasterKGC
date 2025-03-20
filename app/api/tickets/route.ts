import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const SECRET_KEY = 'iAHu4fyQ90zONRoESIdqAHx4QjpZJtxY6NYOvl7VgrE=';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  try {
    jwt.verify(token, SECRET_KEY);
    const tickets = await prisma.ticket.findMany({
      include: {
        user: true,
      },
    });
    return NextResponse.json(tickets, { status: 200 });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json({ message: 'Token inválido o expirado' }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const { asunto, descripcion, urgencia, categoria } = await req.json();

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
    }

    const ticket = await prisma.ticket.create({
      data: {
        asunto,
        descripcion,
        urgencia,
        categoria,
        fecha: new Date(),
        estado: 'Pendiente',
        userId: user.id,
      },
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json({ message: 'Token inválido o expirado' }, { status: 401 });
  }
}

export async function PUT(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const { id, estado } = await req.json();

    const ticket = await prisma.ticket.update({
      where: { id },
      data: { estado },
      include: { user: true }, // Asegurarse de incluir la relación user
    });

    return NextResponse.json(ticket, { status: 200 });
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json({ message: 'Token inválido o expirado' }, { status: 401 });
  }
}