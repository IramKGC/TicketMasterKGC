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
      const decoded = jwt.verify(token, SECRET_KEY) as { id: number };
      const userId = decoded.id;

      const { asunto, estado, descripcion, urgencia, categoria } = await req.json(); // Obtener urgencia y categoria

      const fecha = new Date();

      const validEstados = ['Pendiente', 'En_proceso', 'Completado'];
      if (!validEstados.includes(estado)) {
          return NextResponse.json({ message: 'Estado inválido' }, { status: 400 });
      }

      const validUrgencia = ['Baja', 'Media', 'Alta'];
      if (!validUrgencia.includes(urgencia)) {
        return NextResponse.json({message: "urgencia invalida"}, {status: 400})
      }

      const validCategoria = ["Desarrollo", "Soporte", "Redes", "Correos"];
      if (!validCategoria.includes(categoria)) {
        return NextResponse.json({message: "categoria invalida"}, {status: 400})
      }

      const ticket = await prisma.ticket.create({
          data: {
              asunto,
              estado,
              fecha,
              descripcion,
              userId: userId,
              urgencia, 
              categoria, 
          },
      });

      const user = await prisma.user.findUnique({
          where: {
              id: userId,
          },
      });

      if (user) {
          return NextResponse.json({ ...ticket, departamento: user.departamento }, { status: 201 });
      } else {
          return NextResponse.json(ticket, { status: 201 });
      }
  } catch (error) {
      console.error('Error creating ticket:', error);
      return NextResponse.json({ message: 'Error al crear el ticket' }, { status: 500 });
  }
}