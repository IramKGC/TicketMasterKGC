import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}
console.log('DATABASE_URL:', process.env.DATABASE_URL);
// PrismaClient singleton para evitar múltiples instancias en desarrollo
// y asegurar que las conexiones se cierren adecuadamente en producción
const prisma = globalThis.prisma || new PrismaClient({
  log: ['warn', 'error'], // Opcional: puedes agregar 'query' para depuración
  datasources: {
    db: {
      url: process.env.DATABASE_URL + (process.env.NODE_ENV === 'production' ? '?connection_limit=5' : ''),
    },
  },
});

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;

// Función para limpiar conexiones inactivas
export async function cleanupConnections() {
  try {
    // Cierra todas las conexiones activas
    await prisma.$disconnect();
    console.log('Conexiones cerradas correctamente.');
  } catch (error) {
    console.error('Error limpiando conexiones:', error);
  }
}

export default prisma;