"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import Modal from 'react-modal';

export default function GenerarTicket() {
  const [asunto, setAsunto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [urgencia, setUrgencia] = useState('Baja'); // Valor por defecto
  const [categoria, setCategoria] = useState('Desarrollo'); // Valor por defecto
  const [usuario, setUsuario] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [errors, setErrors] = useState({});
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const router = useRouter();

  const MAX_ASUNTO = 40; // Cambiado a 40
  const MAX_DESCRIPCION = 400; // Cambiado a 400

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    const fetchUsuario = async () => {
      try {
        const response = await fetch('/api/usuario', {
          headers: {
            'Authorization': `Bearer ${token}` // Corregido la interpolación de cadena
          }
        });
        if (response.status === 401) {
          localStorage.removeItem('token');
          router.push('/');
          return;
        }
        const data = await response.json();
        setUsuario(data.username);
        setDepartamento(data.departamento);

        // Bloquear acceso a la página de inicio para usuarios no autorizados
        if (data.departamento !== 'Sistemas') {
          document.querySelector('.hide-on-small').style.pointerEvents = 'none';
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUsuario();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar que todos los campos estén completos
    const newErrors = {};
    if (!asunto) newErrors.asunto = 'El asunto es obligatorio';
    if (!descripcion) newErrors.descripcion = 'La descripción es obligatoria';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    const response = await fetch('/api/tickets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Corregido la interpolación de cadena
      },
      body: JSON.stringify({ asunto, descripcion, urgencia, categoria }),
    });

    if (response.ok) {
      setAsunto('');
      setDescripcion('');
      setUrgencia('Baja');
      setCategoria('Desarrollo');
      setErrors({});

      // Mostrar modal si el usuario no es del departamento de sistemas
      if (departamento !== 'Sistemas') {
        setModalIsOpen(true);
      }
    } else {
      const errorData = await response.json();
      console.error(`Error al crear el ticket: ${errorData.message}`);
    }
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleClosePage = () => {
    router.push('/');
  };

  const handleAsuntoChange = (e) => {
    if (e.target.value.length <= MAX_ASUNTO) {
      setAsunto(e.target.value);
    } else {
      setErrors({ ...errors, asunto: `Máximo ${MAX_ASUNTO} caracteres permitidos.` });
    }
  };

  const handleDescripcionChange = (e) => {
    if (e.target.value.length <= MAX_DESCRIPCION) {
      setDescripcion(e.target.value);
    } else {
      setErrors({ ...errors, descripcion: `Máximo ${MAX_DESCRIPCION} caracteres permitidos.` });
    }
  };

  return (
    <div className="relative custom-size rounded-md shadow-2xl flex justify-center items-center p-4">
      <div className="absolute top-4 left-4 hidden md:block hide-on-small">
        <p className="text-xs text-gray-500">{usuario}</p>
        <h1 className="text-2xl font-bold text-black cursor-pointer">Ticket Master</h1>
      </div>
      <div className="relative w-3/5 custom-height bg-white rounded-3xl flex flex-col justify-center items-center border-2 border-zinc-100 p-6 lg:p-12">
        <div className="w-full flex flex-col items-center">
          <div className="flex flex-col items-center mb-4">
            <img src="/venta-de-entradas.png" alt="Venta de Entradas" className="w-auto h-16 lg:h-24 mb-4" />
            <h1 className="text-2xl lg:text-3xl font-bold text-black">Generar Ticket</h1>
          </div>
          <form onSubmit={handleSubmit} className="w-full flex flex-col items-center space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div>
                <label className="block text-sm font-medium text-gray-700">Asunto</label>
                <input
                  type="text"
                  value={asunto}
                  onChange={handleAsuntoChange} // Usar la función modificada
                  placeholder="Asunto"
                  className="mt-1 block w-full border border-gray-300 rounded-2xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100 p-2 placeholder-gray-400 text-black"
                />
                {errors.asunto && <p className="text-xs text-red-500">{errors.asunto}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Urgencia</label>
                <select
                  value={urgencia}
                  onChange={(e) => setUrgencia(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-2xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100 p-2 text-black"
                >
                  <option value="Baja">Baja</option>
                  <option value="Media">Media</option>
                  <option value="Alta">Alta</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Categoría</label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-2xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100 p-2 text-black"
                >
                  <option value="Desarrollo">Desarrollo</option>
                  <option value="Soporte">Soporte</option>
                  <option value="Redes">Redes</option>
                  <option value="Correos">Correos</option>
                </select>
              </div>
            </div>
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700">Descripción</label>
              <textarea
                value={descripcion}
                onChange={handleDescripcionChange} // Usar la función modificada
                placeholder="Descripción"
                className="mt-1 block w-full border border-gray-300 rounded-2xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100 p-2 h-24 placeholder-gray-400 text-black"
              />
              {errors.descripcion && <p className="text-xs text-red-500">{errors.descripcion}</p>}
            </div>
            <div className="w-full flex justify-end">
              <button
                type="submit"
                className="amarillokgc hover:amarillokgc-hover text-black px-4 py-2 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer"
              >
                Crear Ticket
              </button>
            </div>
          </form>
        </div>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Ticket Creado"
        className="modal"
        overlayClassName="modal-overlay"
        ariaHideApp={false} // Desactivar la advertencia de accesibilidad
      >
        <div className="modal-content">
          <h2 className="text-xl font-bold mb-4">Ticket Creado Exitosamente</h2>
          <p className="mb-4">El ticket ha sido creado con éxito.</p>
          <div className="flex justify-end space-x-4">
          <button
            onClick={handleClosePage}
            className="amarillokgc hover:amarillokgc-hover text-black px-4 py-2 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer"
          >
            Salir
          </button>

            <button
              onClick={() => {
                closeModal();
                setAsunto('');
                setDescripcion('');
                setUrgencia('Baja');
                setCategoria('Desarrollo');
              }}
              className="amarillokgc hover:amarillokgc-hover text-black px-4 py-2 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer"
            >
              Crear Otro
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}