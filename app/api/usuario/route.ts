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
    const decoded = jwt.verify(token, SECRET_KEY) as { userId: string }; // Asegura el tipo
    
    // Convierte el userId a número
    const userId = parseInt(decoded.userId, 10);
    
    // Verifica que la conversión fue exitosa
    if (isNaN(userId)) {
      return NextResponse.json({ message: 'ID de usuario inválido' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }, // Usa el número convertido
    });

    if (!user) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('Error fetching user information:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Token inválido o expirado' },
      { status: 401 }
    );
  }
}