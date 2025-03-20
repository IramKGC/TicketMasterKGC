import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const SECRET_KEY = 'iAHu4fyQ90zONRoESIdqAHx4QjpZJtxY6NYOvl7VgrE=';

export async function PUT(req: NextRequest, context) {
  const params = await context.params;

  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  const token = authHeader.split(' ')[1];
  try {
    jwt.verify(token, SECRET_KEY);
    const { asunto, estado, departamento, responsable, descripcion } = await req.json();

    // Validar el valor de estado
    const validEstados = ['Pendiente', 'En_proceso', 'Completado'];
    if (!validEstados.includes(estado)) {
      console.error('Estado inválido:', estado);
      return NextResponse.json({ message: 'Estado inválido' }, { status: 400 });
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: parseInt(params.id) },
      data: { asunto, estado, departamento, responsable, descripcion },
    });
    return NextResponse.json(updatedTicket, { status: 200 });
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json({ message: 'Error actualizando el ticket' }, { status: 500 });
  }
}