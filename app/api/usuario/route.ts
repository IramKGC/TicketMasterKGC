// app/api/usuario/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import jwt from 'jsonwebtoken'

const SECRET_KEY = process.env.JWT_SECRET || ''

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.split(' ')[1]

    if (!token) {
      return NextResponse.json(
        { message: 'No autorizado: token no encontrado' },
        { status: 401 }
      )
    }

    const decoded = jwt.verify(token, SECRET_KEY) as { userId: number }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, username: true, departamento: true }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(user)

  } catch (error) {
    console.error('Error al obtener usuario:', error)
    return NextResponse.json(
      { message: 'Error del servidor' },
      { status: 500 }
    )
  }
}
