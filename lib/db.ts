import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// PrismaClient singleton para evitar múltiples instancias en desarrollo
const prisma = globalThis.prisma || new PrismaClient({
  log: ['warn', 'error'], // Opcional: puedes agregar 'query' para depuración
});

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

// Función para cerrar todas las conexiones activas
export async function cleanupConnections() {
  try {
    await prisma.$disconnect();
    console.log('Conexión cerrada correctamente.');
  } catch (error) {
    console.error('Error limpiando conexiones:', error);
  }
}

export default prisma;