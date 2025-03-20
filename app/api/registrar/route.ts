import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const departamentos = await prisma.$queryRaw`SHOW COLUMNS FROM User LIKE 'departamento'`;
    console.log('Departamentos:', departamentos);
    const enumValues = departamentos[0].Type.match(/enum\(([^)]+)\)/)[1].split(',').map(value => value.replace(/'/g, ''));
    console.log('Enum Values:', enumValues);
    return NextResponse.json(enumValues, { status: 200 });
  } catch (error) {
    console.error('Error fetching departamentos:', error);
    return NextResponse.json({ message: 'Error fetching departamentos' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { username, password, departamento } = await req.json();

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        departamento,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error al registrar el usuario:', error);
    return NextResponse.json({ message: 'Error en el servidor' }, { status: 500 });
  }
}