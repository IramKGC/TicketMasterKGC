"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ReactPaginate from "react-paginate";
import Image from "next/image";
import Swal from 'sweetalert2';

// Definición de tipos
interface User {
  id: number;
  username: string;
  departamento?: string;
}

interface Ticket {
  id: number;
  asunto: string;
  descripcion: string;
  estado: 'Pendiente' | 'En_proceso' | 'Completado' | string;
  categoria: string;
  urgencia: string;
  fecha: string | Date;
  user: User;
  borrado: boolean; 
}

type StatusFilter = "Todos" | "Activos";

export default function Inicio() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [usuario, setUsuario] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<StatusFilter>("Todos");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(0);
  const ticketsPerPage = 15;
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    const fetchUsuario = async () => {
      try {
        const response = await fetch("/api/usuario", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 401) {
          localStorage.removeItem("token");
          router.push("/");
          return;
        }
        const data: User = await response.json();
        setUsuario(data.username);

        if (data.departamento !== "Sistemas") {
          router.push("/generar-ticket");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    const fetchTickets = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }
    
      try {
        const response = await fetch("/api/tickets", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
    
        if (!response.ok) {
          console.error(
            `Error al obtener los tickets: ${response.status} ${response.statusText}`
          );
          return;
        }
    
        const data = await response.json();
    
        // Filtrar los tickets que tienen borrado = 0
        const filteredTickets = data.filter((ticket: Ticket) => ticket.borrado === false);
    
        setTickets(filteredTickets);
      } catch (error) {
        console.error("Error fetching tickets:", error);
      }
    };

    fetchUsuario();
    fetchTickets();
  }, [router]);

  const handleGenerateTicket = () => {
    router.push("/generar-ticket");
  };

  const handleTicketClick = (id: number) => {
    router.push(`/ver-ticket/${id}`);
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }
  
    try {
      const response = await fetch(`/api/tickets`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          id, 
          estado: newStatus 
        })
      });
      
      if (response.ok) {
        const updatedTicket = await response.json();
        setTickets(tickets.map(ticket => 
          ticket.id === id ? updatedTicket : ticket
        ));
      } else {
        const errorData = await response.json();
        console.error('Error updating ticket:', errorData.message);
        alert(`Error al actualizar el ticket: ${errorData.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Error de conexión al actualizar el ticket');
    }
  };

  const handleDeleteTicket = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
  
    // Confirmación antes de eliminar
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });
  
    if (!result.isConfirmed) {
      return; // Si el usuario cancela, no se realiza la eliminación
    }
  
    try {
      const response = await fetch(`/api/tickets`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }), // Asegúrate de enviar el ID en el cuerpo
      });
  
      if (response.ok) {
        setTickets(tickets.filter((ticket) => ticket.id !== id));
        Swal.fire('Eliminado', 'El ticket ha sido eliminado.', 'success');
      } else {
        const errorData = await response.json();
        console.error("Error al eliminar el ticket:", errorData.message);
        Swal.fire('Error', `Error al eliminar el ticket: ${errorData.message || "Error desconocido"}`, 'error');
      }
    } catch (error) {
      console.error("Error de red al eliminar el ticket:", error);
      Swal.fire('Error', 'Error de conexión al eliminar el ticket.', 'error');
    }
  };

  const handlePageClick = ({ selected }: { selected: number }) => {
    setCurrentPage(selected);
  };
  
  const filteredTickets = tickets.filter((ticket) => {
    if (filterStatus === "Todos") return true; // Mostrar todos los tickets
    if (filterStatus === "Activos") return ticket.estado !== "Completado"; // Mostrar solo los tickets activos
    return true;
  });
  
  const offset = currentPage * ticketsPerPage;
  const currentTickets = filteredTickets.slice(offset, offset + ticketsPerPage);
  const pageCount = Math.ceil(filteredTickets.length / ticketsPerPage);
  
  return (
    <div className="p-6 bg-white text-black min-h-screen">
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-center">
        <div className="mb-4 sm:mb-0">
          <p className="text-xs text-gray-500">{usuario}</p>
          <h1 className="text-2xl font-bold">Ticket Master</h1>
        </div>
        <div className="hidden sm:flex justify-center items-center mb-4 sm:mb-0">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar..."
            className="border border-gray-200 rounded-lg p-2 text-sm w-full sm:w-lg max-w-3xl"
          />
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">
              Filtrar por estado:
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as StatusFilter)}
              className="border border-gray-300 rounded p-1 text-sm"
            >
              <option value="Todos">Todos</option>
              <option value="Activos">Activos</option>
            </select>
          </div>
          <div
            className="flex items-center space-x-2 cursor-pointer group"
            onClick={handleGenerateTicket}
          >
            <p className="italic text-gray-500 group-hover:text-gray-700">
              Generar Ticket
            </p>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-transparent border-1 border-black text-black text-lg font-light group-hover:bg-gray-200">
              +
            </button>
          </div>
        </div>
      </div>
  
      <div className="overflow-x-hidden w-full">
        <table className="w-full text-left border-collapse table-fixed">
          <thead>
            <tr className="border-b-2 border-gray-400">
              <th className="p-2 w-1/6">Categoria</th>
              <th className="p-2 w-1/6">Fecha</th>
              <th className="p-2 w-1/6 hidden sm:table-cell">Urgencia</th>
              <th className="p-2 w-1/6 hidden sm:table-cell">Responsable</th>
              <th className="p-2 w-1/6">Estado</th>
              <th className="p-2 w-1/6 text-center hidden sm:table-cell">Eliminar</th>
            </tr>
          </thead>
          <tbody>
            {currentTickets.map((ticket, index) => (
              <tr
                key={index}
                className={`hover:bg-blue-100 cursor-pointer ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-200"
                }`}
                onClick={() => handleTicketClick(ticket.id)} // Evento para consultar el ticket
              >
                <td className="p-2">{ticket.categoria}</td>
                <td className="p-2">{new Date(ticket.fecha).toLocaleDateString()}</td>
                <td className="p-2 hidden sm:table-cell">{ticket.urgencia}</td>
                <td className="p-2 hidden sm:table-cell">{ticket.user?.username ?? "Desconocido"}</td>
                <td className="p-2">
                  <select
                    value={ticket.estado}
                    onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()} // Evitar que el clic en el select active el evento de la fila
                    className="border border-gray-300 rounded p-1 text-xs sm:text-sm"
                  >
                    <option value="Pendiente" className="sm:block hidden">Pendiente</option>
                    <option value="Pendiente" className="block sm:hidden">Pend.</option>
                    <option value="En_proceso" className="sm:block hidden">En proceso</option>
                    <option value="En_proceso" className="block sm:hidden">En proc.</option>
                    <option value="Completado" className="sm:block hidden">Completado</option>
                    <option value="Completado" className="block sm:hidden">Compl.</option>
                  </select>
                </td>
                <td className="p-2 text-center hidden sm:table-cell">
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Evitar que el clic en el botón active el evento de la fila
                      handleDeleteTicket(ticket.id);
                    }}
                    className="hover:opacity-75"
                  >
                    <Image
                      src="/basura.png"
                      alt="Eliminar"
                      width={24}
                      height={24}
                      className="inline-block"
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  
      <div className="flex justify-center mt-4">
        <ReactPaginate
          previousLabel={"← Anterior"}
          nextLabel={"Siguiente →"}
          breakLabel={"..."}
          pageCount={pageCount}
          marginPagesDisplayed={2}
          pageRangeDisplayed={3}
          onPageChange={handlePageClick}
          containerClassName={"flex space-x-2"}
          activeClassName={"text-black amarillokgc border border-gray-300 rounded-lg px-3 py-1"}
          pageClassName={"px-3 py-1 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-300"}
          previousClassName={"px-3 py-1 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-300"}
          nextClassName={"px-3 py-1 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-300"}
          disabledClassName={"text-gray-400"}
        />
      </div>
    </div>
  );
}