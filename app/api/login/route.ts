import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/db';

const SECRET_KEY = process.env.JWT_SECRET || '';
const TOKEN_EXPIRATION = '8h';

export async function POST(request: Request) {
  try {
    console.log('Intentando cerrar conexiones activas...');

    // Obtener la conexión activa de Prisma
    const currentConnection = await prisma.$queryRawUnsafe<{ ID: number }[]>(
      `SELECT CONNECTION_ID() as ID`
    );
    const currentConnectionId = currentConnection[0]?.ID;

    // Obtener todas las conexiones activas del usuario
    const connections = await prisma.$queryRawUnsafe<{ ID: number }[]>(
      `SELECT ID FROM information_schema.PROCESSLIST WHERE USER = 'uheggxpusu88w0cy'`
    );

    console.log(`Conexiones activas encontradas: ${connections.length}`);

    // Filtrar conexiones para excluir la conexión activa de Prisma
    const connectionsToKill = connections.filter(
      (conn) => conn.ID !== currentConnectionId
    );

    for (const conn of connectionsToKill) {
      await prisma.$executeRawUnsafe(`KILL ${conn.ID}`);
      console.log(`Conexión cerrada: ${conn.ID}`);
    }

    console.log('Conexiones activas cerradas correctamente.');

    // Validación rápida del cuerpo
    const body = await request.json();
    const { username, password } = body;

    if (!username?.trim() || !password?.trim()) {
      return NextResponse.json(
        { message: 'Usuario y contraseña requeridos' },
        { status: 400 }
      );
    }

    // Buscar usuario (solo campos necesarios)
    const user = await prisma.user.findUnique({
      where: { username: username.trim() },
      select: { id: true, password: true, username: true, departamento: true },
    });

    // Comparación segura de contraseña
    const isValid = user && (await bcrypt.compare(password.trim(), user.password));
    if (!isValid) {
      return NextResponse.json(
        { message: 'Credenciales inválidas' },
        { status: 401 }
      );
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
      },
      SECRET_KEY,
      { expiresIn: TOKEN_EXPIRATION }
    );

    // Responder con datos seguros
    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        departamento: user.departamento,
      },
    });
  } catch (error) {
    console.error('Login error:', error);

    // Manejo específico de errores de base de datos
    if (error instanceof Error && error.message.includes('P2024')) {
      await prisma.$disconnect();
      return NextResponse.json(
        { message: 'Servicio no disponible' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { message: 'Error en el servidor' },
      { status: 500 }
    );
  } finally {
    // Asegurarse de cerrar conexiones después de la solicitud
    try {
      await prisma.$disconnect();
      console.log('Conexiones inactivas cerradas.');
    } catch (error) {
      console.error('Error limpiando conexiones inactivas:', error);
    }
  }
}