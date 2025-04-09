import prisma, { cleanupConnections } from './db';

async function monitor() {
  try {
    const [conn] = await prisma.$queryRaw`SELECT CONNECTION_ID() as id`;
    console.log(`[${new Date().toLocaleTimeString()}] Conexión activa ID: ${conn.id}`);
  } catch (error) {
    console.error('Error en monitoreo:', error);
  }

  // Limpiar conexiones inactivas
  try {
    await cleanupConnections();
  } catch (error) {
    console.error('Error limpiando conexiones:', error);
  }
}

// Monitoreo cada 30 segundos
setInterval(monitor, 30000);