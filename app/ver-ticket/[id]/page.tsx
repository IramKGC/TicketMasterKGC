"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from 'next/navigation';
import Image from "next/image"; // Añadido para reemplazar img

interface User {
  id: number;
  username: string;
  email: string;
  departamento: string;
  tickets: Ticket[];
}

interface Ticket {
  id: number;
  asunto: string;
  descripcion: string;
  estado: string;
  categoria: string;
  urgencia: string;
  fecha: Date | string;
  user: User;
}

export default function VerTicket() {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [usuario, setUsuario] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    if (!id) return;

    const fetchUsuario = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/');
        return;
      }

      try {
        const response = await fetch('/api/usuario', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.status === 401) {
          localStorage.removeItem('token');
          router.push('/');
          return;
        }
        const data = await response.json();
        setUsuario(data.username);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    const fetchTicket = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/');
        return;
      }

      try {
        const response = await fetch(`/api/ver-ticket/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setTicket(data);
        } else {
          const errorData = await response.json();
          setError(errorData.message);
        }
      } catch (error) {
        setError('Error en la solicitud');
      } finally {
        setLoading(false);
      }
    };

    fetchUsuario();
    fetchTicket();
  }, [id, router]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!ticket) {
    return <div>No se encontró el ticket</div>;
  }

  return (
    <div className="relative bg-white flex justify-center items-center overflow-hidden h-screen">
      <div className="relative custom-size rounded-md shadow-2xl flex justify-center items-center p-4">
        <div className="absolute top-4 left-4 hidden md:block hide-on-small">
          <p className="text-xs text-gray-500">{usuario}</p>
          <h1
            className="text-2xl font-bold text-black cursor-pointer"
            onClick={() => router.push('/inicio')}
          >
            Ticket Master
          </h1>
        </div>
        <div className="relative w-3/5 custom-height bg-white rounded-3xl flex flex-col justify-center items-center border-2 border-zinc-100 p-6 lg:p-12">
          <div className="w-full flex flex-col items-center">
            <div className="flex flex-col items-center mb-4">
              <Image 
                src="/venta-de-entradas.png" 
                alt="Venta de Entradas" 
                width={96} 
                height={96} 
                className="w-auto h-16 lg:h-24 mb-4" 
              />
              <h1 className="text-2xl lg:text-3xl font-bold text-black">Ver Ticket</h1>
            </div>
            <div className="w-full flex flex-col items-center space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Asunto</label>
                  <p className="mt-1 block w-full border border-gray-300 rounded-2xl shadow-sm sm:text-sm bg-gray-100 p-2 text-black">
                    {ticket.asunto}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <p className="mt-1 block w-full border border-gray-300 rounded-2xl shadow-sm sm:text-sm bg-gray-100 p-2 text-black">
                    {ticket.estado}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Departamento</label>
                  <p className="mt-1 block w-full border border-gray-300 rounded-2xl shadow-sm sm:text-sm bg-gray-100 p-2 text-black">
                    {ticket.user.departamento}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Responsable</label>
                  <p className="mt-1 block w-full border border-gray-300 rounded-2xl shadow-sm sm:text-sm bg-gray-100 p-2 text-black">
                    {ticket.user.username}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Categoría</label>
                  <p className="mt-1 block w-full border border-gray-300 rounded-2xl shadow-sm sm:text-sm bg-gray-100 p-2 text-black">
                    {ticket.categoria}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Urgencia</label>
                  <p className="mt-1 block w-full border border-gray-300 rounded-2xl shadow-sm sm:text-sm bg-gray-100 p-2 text-black">
                    {ticket.urgencia}
                  </p>
                </div>
              </div>
              <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700">Descripción</label>
                  <div className="mt-1 block w-full border border-gray-300 rounded-2xl shadow-sm sm:text-sm bg-gray-100 p-2 h-24 text-black" style={{ wordWrap: 'break-word', overflowWrap: 'break-word', overflowY: 'auto' }}>
                    {ticket.descripcion}
                </div>
              </div>
              <div className="w-full flex justify-end">
                <button
                  type="button"
                  className="amarillokgc hover:amarillokgc-hover text-white px-4 py-2 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer"
                  onClick={() => router.push('/inicio')}
                >
                  Volver
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}