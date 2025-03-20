import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Crear usuarios de prueba
  const usuarios = [
    { username: 'admin', password: 'admin123', departamento: 'Sistemas' },
    { username: 'rh_user', password: 'rh123', departamento: 'Recursos Humanos' },
    { username: 'fin_user', password: 'fin123', departamento: 'Finanzas' },
    { username: 'mon_user', password: 'mon123', departamento: 'Monitoreo' },
    { username: 'seg_user', password: 'seg123', departamento: 'Seguridad Patrimonial' },
    { username: 'ope_user', password: 'ope123', departamento: 'Operaciones' },
    { username: 'ven_user', password: 'ven123', departamento: 'Ventas' },
  ];

  // Insertar usuarios en la base de datos
  for (const usuario of usuarios) {
    const hashedPassword = await bcrypt.hash(usuario.password, 10);
    await prisma.user.create({
      data: {
        username: usuario.username,
        password: hashedPassword,
        departamento: usuario.departamento.replace(' ', '_') as any, // Reemplazar espacios por guiones bajos para coincidir con el enum
      },
    });
  }

  console.log('Datos de prueba insertados correctamente');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });