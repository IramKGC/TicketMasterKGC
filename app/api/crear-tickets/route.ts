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
    const tickets = await prisma.ticket.findMany();
    console.log('Tickets fetched:', tickets); // Agregar registro de consola
    return NextResponse.json(tickets, { status: 200 });
  } catch (error) {
    console.error('Error fetching tickets:', error); // Agregar registro de consola
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
    jwt.verify(token, SECRET_KEY);
    const { asunto, estado, departamento, responsable, descripcion } = await req.json();
    const fecha = new Date(); // Establecer la fecha como un objeto Date

    // Validar el valor del campo estado
    const validEstados = ['Pendiente', 'En_proceso', 'Completado'];
    if (!validEstados.includes(estado)) {
      return NextResponse.json({ message: 'Estado inválido' }, { status: 400 });
    }

    const ticket = await prisma.ticket.create({
      data: {
        asunto,
        estado,
        departamento,
        fecha,
        responsable,
        descripcion, // Incluir el campo de descripción
      },
    });
    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error('Error creating ticket:', error); // Agregar registro de consola
    return NextResponse.json({ message: 'Error al crear el ticket' }, { status: 500 });
  }
}