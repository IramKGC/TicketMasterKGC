import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();
interface DepartamentoColumn {
  Type: string;
}

export async function GET() {
  try {
      const departamentos = await prisma.$queryRaw<DepartamentoColumn[]>`SHOW COLUMNS FROM User LIKE 'departamento'`;
      if (departamentos && departamentos.length > 0) {
          const matchResult = departamentos[0].Type.match(/enum\(([^)]+)\)/);
          if (matchResult) {
            // Especificar el tipo de 'value' como string
              const enumValues = matchResult[1].split(',').map((value: string) => value.replace(/'/g, '')); 
              return NextResponse.json(enumValues, { status: 200 });
          } else {
            // Devuelve un array vacío si no es un enum
              return NextResponse.json([], { status: 200 }); 
          }
      } else {
        // Devuelve un array vacío si no se encuentra la columna
          return NextResponse.json([], { status: 200 }); 
      }
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