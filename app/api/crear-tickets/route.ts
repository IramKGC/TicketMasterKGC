import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || '';

export async function POST(request: Request) {
  try {
    // Obtener el token del encabezado Authorization
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

    // Obtener los datos del cuerpo de la solicitud
    const body = await request.json();
    const { asunto, estado, descripcion, urgencia, categoria } = body;

    // Validaciones de los datos
    const validEstados = ['Pendiente', 'En_proceso', 'Completado'];
    const validUrgencia = ['Baja', 'Media', 'Alta'];
    const validCategoria = ['Desarrollo', 'Soporte', 'Redes', 'Correos'];

    if (!asunto || !descripcion || !urgencia || !categoria || !estado) {
      return NextResponse.json(
        { message: 'Todos los campos son requeridos.' },
        { status: 400 }
      );
    }

    if (!validEstados.includes(estado)) {
      return NextResponse.json({ message: 'Estado inválido' }, { status: 400 });
    }

    if (!validUrgencia.includes(urgencia)) {
      return NextResponse.json({ message: 'Urgencia inválida' }, { status: 400 });
    }

    if (!validCategoria.includes(categoria)) {
      return NextResponse.json({ message: 'Categoría inválida' }, { status: 400 });
    }

    // Crear el ticket en la base de datos
    const newTicket = await prisma.ticket.create({
      data: {
        asunto,
        estado,
        descripcion,
        urgencia,
        categoria,
        fecha: new Date(),
        userId,
      },
      include: {
        user: {
          select: {
            departamento: true,
          },
        },
      },
    });

    // Responder con el ticket creado
    return NextResponse.json(newTicket, { status: 201 });
  } catch (error) {
    console.error('Error al crear ticket:', error);

    // Manejar errores específicos de Prisma
    if (error instanceof Error && error.message.includes('P2024')) {
      await prisma.$disconnect();
      return NextResponse.json(
        { message: 'Servicio no disponible, intente más tarde' },
        { status: 503 }
      );
    }

    // Responder con un error genérico
    return NextResponse.json(
      { message: 'Error interno' },
      { status: 500 }
    );
  }
}