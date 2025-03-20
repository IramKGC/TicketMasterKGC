"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const Registrar = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [departamentos, setDepartamentos] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchDepartamentos = async () => {
      const response = await fetch('/api/registrar');
      const data = await response.json();
      console.log('Departamentos obtenidos:', data);
      setDepartamentos(data);
      setDepartamento(''); // Establecer el valor predeterminado como vacío
    };

    fetchDepartamentos();
  }, []);

  const handleRegistrar = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Registrando usuario:', { username, password, departamento });

    const response = await fetch('/api/registrar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, departamento }),
    });

    console.log('Estado de la respuesta:', response.status);

    if (response.ok) {
      // Si el registro es exitoso, redirige a /
      router.push('/');
    } else {
      // Manejar el error de registro
      alert('Error al registrar el usuario');
    }
  };

  return (
    <div className="relative custom-size rounded-md shadow-2xl flex justify-center items-center">
      <div className="relative w-4/12 h-10/12 bg-white rounded-3xl flex flex-col justify-center items-center border-2 border-zinc-100">
        <img src="/INVERSO.png" alt="" className="w-auto h-2/12 rounded-full border-2 border-black mb-4 mt-4"/> 
        <h1 className="text-black text-3xl font-sans mb-4">Registrar Usuario</h1>
        <form onSubmit={handleRegistrar} className="w-full flex flex-col items-center">
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
          <select
            className="w-3/4 h-8 mb-4 p-2 border-2 border-zinc-100 gris rounded-2xl text-zinc-800 focus:border-amarillokgc"
            value={departamento}
            onChange={(e) => setDepartamento(e.target.value)}
          >
            <option value="" disabled>Selecciona un departamento</option>
            {departamentos.map((dep, index) => (
              <option key={index} value={dep}>
                {dep.replace('_', ' ')}
              </option>
            ))}
          </select>
          <button type="submit" className="w-4/12 h-8 mt-4 border-0 gris rounded-2xl text-zinc-800 bg-gray-200 text-sm font-bold">
            Registrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Registrar;