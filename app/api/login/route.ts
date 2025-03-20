import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const SECRET_KEY = 'iAHu4fyQ90zONRoESIdqAHx4QjpZJtxY6NYOvl7VgrE=';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json({ message: 'Nombre de usuario o contraseña incorrectos' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Nombre de usuario o contraseña incorrectos' }, { status: 401 });
    }

    const token = jwt.sign({ userId: user.id, departamento: user.departamento }, SECRET_KEY, {
      expiresIn: '1h',
    });

    return NextResponse.json({ token }, { status: 200 });
  } catch (error) {
    console.error('Error en el inicio de sesión:', error);
    return NextResponse.json({ message: 'Error en el servidor' }, { status: 500 });
  }
}