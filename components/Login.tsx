"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.token) {
        localStorage.setItem('token', data.token);

        const userResponse = await fetch('/api/usuario', {
          headers: {
            'Authorization': `Bearer ${data.token}`
          }
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          if (userData.departamento === 'Sistemas') {
            router.push('/inicio');
          } else {
            router.push('/generar-ticket');
          }
        } else {
          alert('Error al obtener la información del usuario');
        }
      } else {
        alert('No se recibió token en la respuesta');
      }
    } else {
      alert('Nombre de usuario o contraseña incorrectos');
    }
  };

  return (
    <div className="relative custom-size rounded-md shadow-2xl flex justify-center items-center">
      <div className="relative w-11/12 max-w-md bg-white rounded-3xl flex flex-col justify-center items-center border-2 border-zinc-100 shadow-2xl py-10 sm:py-16">
        <Image 
          src="/INVERSO.png" 
          alt="Logo" 
          width={150}  
          height={150} 
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-black mb-6"
        />
        <h1 className="text-black text-xl sm:text-2xl font-sans mb-6 text-center">Iniciar Sesión</h1>
        <form onSubmit={handleLogin} className="w-full flex flex-col items-center space-y-4 px-6">
          <input
            type="text"
            placeholder="Nombre de usuario"
            className="w-3/4 h-8 mb-4 p-2 border-2 border-zinc-100 bg-gray-100 rounded-2xl text-zinc-800 focus:border-amarillokgc"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="w-3/4 h-8 mb-4 p-2 border-2 border-zinc-100 bg-gray-100 rounded-2xl text-zinc-800 focus:border-amarillokgc"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="w-4/12 h-8 mt-4 border-0 rounded-2xl text-zinc-800 amarillokgc hover:bg-amarillokgc-hover text-sm font-bold cursor-pointer"
          >
            Acceder
          </button>
        </form>
      </div>
    </div>
  );
};