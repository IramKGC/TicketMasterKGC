"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Departamento } from '@prisma/client'; // Importa el enum de Prisma

const Registrar = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [departamento, setDepartamento] = useState<string>('');
  const router = useRouter();

  // Obtiene los departamentos directamente del enum de Prisma
  const departamentos = Object.values(Departamento).map(dep => ({
    value: dep,
    label: dep.replace(/_/g, ' ') // Formatea para mostrar
  }));

  const handleRegistrar = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Registrando usuario:', { username, password, departamento });

    try {
      const response = await fetch('/api/registrar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, departamento }),
      });

      console.log('Estado de la respuesta:', response.status);

      if (response.ok) {
        router.push('/');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Error al registrar el usuario');
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      alert('Error de conexión al registrar el usuario');
    }
  };

  return (
    <div className="relative custom-size rounded-md shadow-2xl flex justify-center items-center">
      <div className="relative w-4/12 h-10/12 bg-white rounded-3xl flex flex-col justify-center items-center border-2 border-zinc-100">
        <Image 
          src="/INVERSO.png" 
          alt="Logo" 
          width={200} 
          height={200}
          className="w-auto h-2/12 rounded-full border-2 border-black mb-4 mt-4"
        />
        <h1 className="text-black text-3xl font-sans mb-4">Registrar Usuario</h1>
        <form onSubmit={handleRegistrar} className="w-full flex flex-col items-center">
          <input
            type="text"
            placeholder="Nombre de usuario"
            className="w-3/4 h-8 mb-4 p-2 border-2 border-zinc-100 gris rounded-2xl text-zinc-800 focus:border-amarillokgc"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="w-3/4 h-8 mb-4 p-2 border-2 border-zinc-100 gris rounded-2xl text-zinc-800 focus:border-amarillokgc"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <select
            className="w-3/4 h-8 mb-4 p-2 border-2 border-zinc-100 gris rounded-2xl text-zinc-800 focus:border-amarillokgc"
            value={departamento}
            onChange={(e) => setDepartamento(e.target.value)}
            required
          >
            <option value="" disabled>Selecciona un departamento</option>
            {departamentos.map((dep, index) => (
              <option key={index} value={dep.value}>
                {dep.label}
              </option>
            ))}
          </select>
          <button 
            type="submit" 
            className="w-4/12 h-8 mt-4 border-0 gris rounded-2xl text-zinc-800 bg-gray-200 text-sm font-bold hover:bg-gray-300 transition-colors"
          >
            Registrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Registrar;