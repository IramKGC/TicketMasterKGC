import { NextResponse } from 'next/server';
import  prisma  from '@/lib/db';

export async function GET(request: Request, context: { params: { id: string } }) {
  try {
    const { params } = context;

    // Validar que params.id esté disponible y sea un número válido
    if (!params?.id || !/^\d+$/.test(params.id)) {
      return NextResponse.json(
        { message: 'ID inválido' },
        { status: 400 }
      );
    }

    // Convertir el ID a un número entero
    const ticketId = parseInt(params.id, 10);

    // Buscar el ticket en la base de datos
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: { user: true }, // Incluye datos relacionados si es necesario
    });

    // Si no se encuentra el ticket, devolver un error 404
    if (!ticket) {
      return NextResponse.json(
        { message: 'Ticket no encontrado' },
        { status: 404 }
      );
    }

    // Devolver el ticket encontrado
    return NextResponse.json(ticket, { status: 200 });
  } catch (error) {
    console.error('Error al obtener el ticket:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}