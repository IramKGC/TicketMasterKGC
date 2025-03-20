"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ReactPaginate from "react-paginate";

export default function Inicio() {
  const [tickets, setTickets] = useState([]);
  const [usuario, setUsuario] = useState("");
  const [rol, setRol] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const ticketsPerPage = 15; // Número de tickets por página
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
        const data = await response.json();
        setUsuario(data.username);
        setRol(data.rol);

        if (data.departamento !== "Sistemas") {
          router.push("/generar-ticket");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    const fetchTickets = async () => {
      try {
        const response = await fetch("/api/tickets", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.status === 401) {
          localStorage.removeItem("token");
          router.push("/");
          return;
        }
        const data = await response.json();
        setTickets(data);
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

  const handleTicketClick = (id) => {
    router.push(`/ver-ticket/${id}`);
  };

  const handleStatusChange = async (id, newStatus) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/tickets`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id, estado: newStatus })
      });
      if (response.ok) {
        const updatedTicket = await response.json();
        setTickets(tickets.map(ticket => ticket.id === id ? updatedTicket : ticket));
      } else {
        console.error('Error updating ticket status');
      }
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const filteredTickets = tickets.filter(
    (ticket) =>
      (filterStatus === "Todos" || ticket.estado !== "Completado") &&
      (ticket.asunto.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ticket.user?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ??
          false) ||
        new Date(ticket.fecha).toLocaleDateString().includes(searchQuery) ||
        ticket.estado.toLowerCase().replace(" ", "_").includes(searchQuery.toLowerCase()) ||
        ticket.estado.toLowerCase().replace("_", " ").includes(searchQuery.toLowerCase()) ||
        (ticket.user?.departamento?.toLowerCase().includes(searchQuery.toLowerCase()) ??
          false))
  );

  // Calcular los tickets a mostrar en la página actual
  const offset = currentPage * ticketsPerPage;
  const currentTickets = filteredTickets.slice(offset, offset + ticketsPerPage);
  const pageCount = Math.ceil(filteredTickets.length / ticketsPerPage);

  return (
    <div className="p-6 bg-white text-black min-h-screen">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <p className="text-xs text-gray-500">{usuario}</p>
          <h1 className="text-2xl font-bold">Ticket Master</h1>
        </div>
        <div className="flex justify-center items-center ">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar..."
            className="border border-gray-200 rounded-lg p-2 text-sm w-lg max-w-3xl"
          />
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">
              Filtrar por estado:
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
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

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-400">
              <th className="p-2">Categoria</th>
              <th className="p-2">Urgencia</th>
              <th className="p-2">Fecha</th>
              <th className="p-2">Responsable</th>
              <th className="p-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {currentTickets.map((ticket, index) => (
              <tr
                key={index}
                className={`hover:bg-blue-100 cursor-pointer ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-200"
                }`}
                onClick={() => handleTicketClick(ticket.id)}
              >
                <td className="p-2">{ticket.categoria}</td>
                <td className="p-2">{ticket.urgencia}</td>
                <td className="p-2">
                  {new Date(ticket.fecha).toLocaleDateString()}
                </td>
                <td className="p-2">{ticket.user?.username ?? "Desconocido"}</td>
                <td className="p-2">
                  <select
                    value={ticket.estado}
                    onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="border border-gray-300 rounded p-1"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="En_proceso">En proceso</option>
                    <option value="Completado">Completado</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
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
