
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verify } from 'jsonwebtoken';

const prisma = new PrismaClient();
const SECRET_KEY = process.env.JWT_SECRET || 'tu-clave-secreta-fuerte-aqui';

export async function GET(request: NextRequest) {
  try {
    // Obtener ID de la URL manualmente (solución definitiva)
    const id = request.nextUrl.pathname.split('/').pop();
    
    if (!id || !/^\d+$/.test(id)) {
      return NextResponse.json(
        { message: 'ID de ticket inválido' },
        { status: 400 }
      );
    }

    const ticketId = parseInt(id, 10);

    // Verificación de token
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Token no proporcionado' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    verify(token, SECRET_KEY); // Validación del token

    // Consulta a la base de datos
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { user: true },
    });

    return ticket
      ? NextResponse.json(ticket)
      : NextResponse.json(
          { message: 'Ticket no encontrado' },
          { status: 404 }
        );

  } catch (error) {
    console.error('Error en endpoint:', error);
    return NextResponse.json(
      { message: 'Error de servidor' },
      { status: 500 }
    );
  }
}