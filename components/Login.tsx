"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Enviando credenciales:', { username, password });

    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    console.log('Estado de la respuesta:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('Datos recibidos:', data); // Imprimir datos completos para verificar el token

      if (data.token) {
        localStorage.setItem('token', data.token);
        console.log('Token guardado en localStorage:', localStorage.getItem('token'));

        // Fetch user information to check the department
        const userResponse = await fetch('/api/usuario', {
          headers: {
            'Authorization': `Bearer ${data.token}`
          }
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          console.log('Datos del usuario:', userData);

          if (userData.departamento === 'Sistemas') {
            router.push('/inicio');
          } else {
            router.push('/generar-ticket');
          }
        } else {
          console.error('Error fetching user information');
          alert('Error al obtener la información del usuario');
        }
      } else {
        console.error('No se recibió token en la respuesta');
      }
    } else {
      alert('Nombre de usuario o contraseña incorrectos');
    }
  };

  return (
    <div className="relative custom-size rounded-md shadow-2xl flex justify-center items-center">
      <div className="relative w-4/12 h-10/12 bg-white rounded-3xl flex flex-col justify-center items-center border-2 border-zinc-100">
        <img src="/INVERSO.png" alt="" className="w-auto h-2/12 rounded-full border-2 border-black mb-4 mt-4"/> 
        <h1 className="text-black text-3xl font-sans mb-4">Iniciar Sesión</h1>
        <form onSubmit={handleLogin} className="w-full flex flex-col items-center">
          <input
            type="text"
            placeholder="Nombre de usuario"
            className="w-3/4 h-8 mb-4 p-2 border-2 border-zinc-100 gris rounded-2xl text-zinc-800 focus:border-amarillokgc"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="w-3/4 h-8 mb-4 p-2 border-2 border-zinc-100 gris rounded-2xl text-zinc-800 focus:border-amarillokgc"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="w-4/12 h-8 mt-4 border-0 rounded-2xl text-zinc-800 amarillokgc hover:amarillokgc-hover text-sm font-bold cursor-pointer">
            Acceder
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;