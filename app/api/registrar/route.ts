// app/api/register/route.ts
import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import prisma from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { username, password, departamento } = await request.json()

    // Validación básica de campos
    if (!username || !password || !departamento) {
      return NextResponse.json(
        { message: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'El nombre de usuario ya existe' },
        { status: 409 }
      )
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Crear nuevo usuario
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        departamento
      },
      select: {
        id: true,
        username: true,
        departamento: true
      }
    })

    return NextResponse.json(newUser, { status: 201 })

  } catch (error) {
    console.error('Error en registro:', error)
    
    // Manejo específico para error de conexión
    if (error instanceof Error && error.message.includes('P2024')) {
      await prisma.$disconnect()
      return NextResponse.json(
        { message: 'Servicio no disponible, intente más tarde' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { message: 'Error al registrar usuario' },
      { status: 500 }
    )
  }
}