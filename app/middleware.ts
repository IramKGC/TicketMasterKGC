// app/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import prisma from '@/lib/db' // Asegúrate de tener esto si necesitas acceder a Prisma

const SECRET_KEY = process.env.JWT_SECRET || ''

export async function middleware(request: NextRequest) {
  // Excluir rutas públicas
  if (request.nextUrl.pathname.startsWith('/api/login') || 
      request.nextUrl.pathname.startsWith('/api/register')) {
    return NextResponse.next()
  }

  const token = request.headers.get('Authorization')?.split(' ')[1]
  
  if (!token) {
    return NextResponse.json(
      { message: 'Token no proporcionado' }, 
      { status: 401 }
    )
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { userId: string }
    
    // Verificar si el usuario existe en la base de datos
    const user = await prisma.user.findUnique({
      where: { id: parseInt(decoded.userId, 10) }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Usuario no válido' },
        { status: 401 }
      );
    }

    // Si el usuario existe, agregar el userId en los headers de la respuesta
    const response = NextResponse.next()
    response.headers.set('x-user-id', decoded.userId)
    return response
  } catch (error) {
    let message = 'Token inválido'
    if (error instanceof jwt.TokenExpiredError) {
      message = 'Token expirado, inicie sesión nuevamente'
    }
    return NextResponse.json({ message }, { status: 401 })
  }
}

export const config = {
  matcher: '/api/:path*' // Aplica a todas las rutas API
}
