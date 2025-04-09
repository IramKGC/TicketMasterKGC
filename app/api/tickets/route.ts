// app/api/tickets/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import jwt from 'jsonwebtoken'

const SECRET_KEY = process.env.JWT_SECRET || '';


export async function GET() {
  try {
    const tickets = await prisma.ticket.findMany({
      include: {
        user: true, // Incluye los datos del usuario relacionado
      },
    });
    return NextResponse.json(tickets, { status: 200 });
  } catch (error) {
    console.error('Error al obtener los tickets:', error);
    return NextResponse.json({ message: 'Error al obtener los tickets' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { message: 'Error de autenticación: token no encontrado' },
        { status: 401 }
      );
    }

    // Decodificar el token
    const decoded = jwt.verify(token, SECRET_KEY) as { userId: number };
    const userId = decoded.userId;

    const body = await request.json();
    const { asunto, descripcion, urgencia, categoria } = body;

    // Validaciones de datos
    if (!asunto || !descripcion || !urgencia || !categoria) {
      return NextResponse.json(
        { message: 'Todos los campos son requeridos.' },
        { status: 400 }
      );
    }

    // Crear el ticket
    const newTicket = await prisma.ticket.create({
      data: {
        asunto,
        descripcion,
        urgencia,
        categoria,
        fecha: new Date(),
        estado: 'Pendiente',
        userId,
      },
    });

    return NextResponse.json(newTicket, { status: 201 });
  } catch (error) {
    console.error('Error al crear ticket:', error);

    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
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