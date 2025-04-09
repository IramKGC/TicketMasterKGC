// app/api/login/route.ts
import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import prisma from '@/lib/db'

const SECRET_KEY = process.env.JWT_SECRET || ''
const TOKEN_EXPIRATION = '8h'

export async function POST(request: Request) {
  try {
    // 1. Validación rápida del cuerpo
    const body = await request.json()
    const { username, password } = body
    
    if (!username?.trim() || !password?.trim()) {
      return NextResponse.json(
        { message: 'Usuario y contraseña requeridos' },
        { status: 400 }
      )
    }

    // 2. Buscar usuario (solo campos necesarios)
    const user = await prisma.user.findUnique({
      where: { username: username.trim() },
      select: { id: true, password: true, username: true, departamento: true }
    })

    // 3. Comparación segura de contraseña
    const isValid = user && await bcrypt.compare(password.trim(), user.password)
    if (!isValid) {
      return NextResponse.json(
        { message: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    // 4. Generar token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username
      },
      SECRET_KEY,
      { expiresIn: TOKEN_EXPIRATION }
    )

    // 5. Responder con datos seguros
    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        departamento: user.departamento
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    
    // Manejo específico de errores de base de datos
    if (error instanceof Error && error.message.includes('P2024')) {
      await prisma.$disconnect()
      return NextResponse.json(
        { message: 'Servicio no disponible' },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { message: 'Error en el servidor' },
      { status: 500 }
    )
  }
}