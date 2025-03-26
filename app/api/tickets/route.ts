import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET ||'iAHu4fyQ90zONRoESIdqAHx4QjpZJtxY6NYOvl7VgrE=';

export async function PUT(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    }

    // Verificar el token
    jwt.verify(token, SECRET_KEY);

    // Obtener datos del cuerpo
    const { id, estado } = await req.json();

    // Validar datos
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ message: 'ID de ticket inválido' }, { status: 400 });
    }

    const validStates = ['Pendiente', 'En_proceso', 'Completado'];
    if (!estado || !validStates.includes(estado)) {
      return NextResponse.json({ message: 'Estado inválido' }, { status: 400 });
    }

    // Actualizar el ticket
    const updatedTicket = await prisma.ticket.update({
      where: { id: Number(id) },
      data: { estado },
      include: { user: true },
    });

    return NextResponse.json(updatedTicket);

  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) throw new Error('No autorizado');
    
    jwt.verify(token, SECRET_KEY);
    
    const tickets = await prisma.ticket.findMany({
      include: { user: true },
    });
    
    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error del servidor' },
      { status: 401 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('Authorization')?.split(' ')[1];
    if (!token) throw new Error('No autorizado');
    
    const decoded = jwt.verify(token, SECRET_KEY) as { userId: string };
    const { asunto, descripcion, urgencia, categoria } = await req.json();
    
    const newTicket = await prisma.ticket.create({
      data: {
        asunto,
        descripcion,
        urgencia,
        categoria,
        estado: 'Pendiente',
        userId: parseInt(decoded.userId, 10), // Conversión a número
        fecha: new Date(),
      },
    });
    
    return NextResponse.json(newTicket, { status: 201 });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Error del servidor' },
      { status: 401 }
    );
  }
}