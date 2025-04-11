import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || '';

export async function middleware(request: NextRequest) {
  console.log(`Middleware ejecutado para la ruta: ${request.nextUrl.pathname}`);
  const url = request.nextUrl;

  // Excluir rutas públicas como login y registro
  if (url.pathname.startsWith('/api/login') || url.pathname.startsWith('/api/register')) {
    console.log('Ruta pública detectada:', url.pathname);
    return NextResponse.next();
  }

  // Verificar el token en las demás rutas
  const token = request.headers.get('Authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json(
      { message: 'Token no proporcionado' },
      { status: 401 }
    );
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { userId: string };

    // Si el token es válido, agregar el userId en los headers de la respuesta
    const response = NextResponse.next();
    response.headers.set('x-user-id', decoded.userId);

    return response;
  } catch (error) {
    let message = 'Token inválido';
    if (error instanceof jwt.TokenExpiredError) {
      message = 'Token expirado, inicie sesión nuevamente';
    }
    return NextResponse.json({ message }, { status: 401 });
  }
}

export const config = {
  matcher: ['/api/:path*', '/app/api/:path*'], // Aplica a ambas rutas
};