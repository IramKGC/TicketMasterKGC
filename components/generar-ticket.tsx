"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import Modal from 'react-modal';
import Image from "next/image";
import ventaDeEntradas from '/public/venta-de-entradas.png';

// Definición de tipos
interface UserData {
  username: string;
  departamento: string;
}

interface FormErrors {
  asunto?: string;
  descripcion?: string;
  submit?: string;
}

type Urgencia = 'Baja' | 'Media' | 'Alta';
type Categoria = 'Desarrollo' | 'Soporte' | 'Redes' | 'Correos';

interface TicketData {
  asunto: string;
  descripcion: string;
  urgencia: Urgencia;
  categoria: Categoria;
}

Modal.setAppElement('body'); // Para accesibilidad del modal

export default function GenerarTicket() {
  // Estados con tipos definidos
  const [asunto, setAsunto] = useState<string>('');
  const [descripcion, setDescripcion] = useState<string>('');
  const [urgencia, setUrgencia] = useState<Urgencia>('Baja');
  const [categoria, setCategoria] = useState<Categoria>('Desarrollo');
  const [usuario, setUsuario] = useState<string>('');
  const [departamento, setDepartamento] = useState<string>('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [modalIsOpen, setModalIsOpen] = useState<boolean>(false);
  const router = useRouter();

  // Constantes
  const MAX_ASUNTO = 40;
  const MAX_DESCRIPCION = 400;

  // Efecto para cargar datos del usuario
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
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.status === 401) {
          localStorage.removeItem('token');
          router.push('/');
          return;
        }

        const data: UserData = await response.json();
        setUsuario(data.username);
        setDepartamento(data.departamento);

        // Bloquear interacción si no es de Sistemas
        if (data.departamento !== 'Sistemas') {
          const element = document.querySelector('.hide-on-small');
          if (element instanceof HTMLElement) {
            element.style.pointerEvents = 'none';
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUsuario();
  }, [router]);

  // Manejador de envío del formulario
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validación
    const newErrors: FormErrors = {};
    if (!asunto.trim()) newErrors.asunto = 'El asunto es obligatorio';
    if (!descripcion.trim()) newErrors.descripcion = 'La descripción es obligatoria';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return;
    }

    try {
      const ticketData: TicketData = {
        asunto,
        descripcion,
        urgencia,
        categoria
      };

      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(ticketData),
      });

      if (response.ok) {
        // Resetear formulario
        setAsunto('');
        setDescripcion('');
        setUrgencia('Baja');
        setCategoria('Desarrollo');
        setErrors({});

        // Mostrar modal si no es de Sistemas
        if (departamento !== 'Sistemas') {
          setModalIsOpen(true);
        }
      } else {
        const errorData = await response.json();
        console.error('Error al crear el ticket:', errorData.message);
        setErrors({ submit: 'Error al crear el ticket. Intente nuevamente.' });
      }
    } catch (error) {
      console.error('Error en la solicitud:', error);
      setErrors({ submit: 'Error de conexión. Intente nuevamente.' });
    }
  };

  // Manejadores de cambios
  const handleAsuntoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_ASUNTO) {
      setAsunto(value);
      setErrors({ ...errors, asunto: undefined });
    } else {
      setErrors({ ...errors, asunto: `Máximo ${MAX_ASUNTO} caracteres` });
    }
  };

  const handleDescripcionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_DESCRIPCION) {
      setDescripcion(value);
      setErrors({ ...errors, descripcion: undefined });
    } else {
      setErrors({ ...errors, descripcion: `Máximo ${MAX_DESCRIPCION} caracteres` });
    }
  };

  const handleUrgenciaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUrgencia(e.target.value as Urgencia);
  };

  const handleCategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoria(e.target.value as Categoria);
  };

  // Manejadores del modal
  const closeModal = () => {
    setModalIsOpen(false);
  };

  const handleClosePage = () => {
    router.push('/');
  };

  return (
    <div className="relative custom-size rounded-md shadow-2xl flex justify-center items-center p-4">
      <div className="absolute top-4 left-4 hidden md:block hide-on-small">
        <p className="text-xs text-gray-500">{usuario}</p>
        <h1 
          className="text-2xl font-bold text-black cursor-pointer"
          onClick={() => departamento === 'Sistemas' && router.push('/inicio')}
        >
          Ticket Master
        </h1>
      </div>
      
      <div className="relative w-3/5 custom-height bg-white rounded-3xl flex flex-col justify-center items-center border-2 border-zinc-100 p-6 lg:p-12">
        <div className="w-full flex flex-col items-center">
          <div className="flex flex-col items-center mb-4">
            <Image
              src={ventaDeEntradas}
              alt="Venta de Entradas"
              className="w-auto h-16 lg:h-24 mb-4"
              priority
            />
            <h1 className="text-2xl lg:text-3xl font-bold text-black">Generar Ticket</h1>
          </div>
          
          <form onSubmit={handleSubmit} className="w-full flex flex-col items-center space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div>
                <label className="block text-sm font-medium text-gray-700">Asunto*</label>
                <input
                  type="text"
                  value={asunto}
                  onChange={handleAsuntoChange}
                  placeholder="Asunto del ticket"
                  className="mt-1 block w-full border border-gray-300 rounded-2xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100 p-2 placeholder-gray-400 text-black"
                  required
                />
                {errors.asunto && <p className="text-xs text-red-500 mt-1">{errors.asunto}</p>}
                <p className="text-xs text-gray-500 text-right mt-1">
                  {asunto.length}/{MAX_ASUNTO}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Urgencia*</label>
                <select
                  value={urgencia}
                  onChange={handleUrgenciaChange}
                  className="mt-1 block w-full border border-gray-300 rounded-2xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100 p-2 text-black"
                  required
                >
                  <option value="Baja">Baja</option>
                  <option value="Media">Media</option>
                  <option value="Alta">Alta</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Categoría*</label>
                <select
                  value={categoria}
                  onChange={handleCategoriaChange}
                  className="mt-1 block w-full border border-gray-300 rounded-2xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100 p-2 text-black"
                  required
                >
                  <option value="Desarrollo">Desarrollo</option>
                  <option value="Soporte">Soporte</option>
                  <option value="Redes">Redes</option>
                  <option value="Correos">Correos</option>
                </select>
              </div>
            </div>
            
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700">Descripción*</label>
              <textarea
                value={descripcion}
                onChange={handleDescripcionChange}
                placeholder="Describa el problema o solicitud"
                className="mt-1 block w-full border border-gray-300 rounded-2xl shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-100 p-2 h-24 placeholder-gray-400 text-black"
                required
              />
              {errors.descripcion && <p className="text-xs text-red-500 mt-1">{errors.descripcion}</p>}
              <p className="text-xs text-gray-500 text-right mt-1">
                {descripcion.length}/{MAX_DESCRIPCION}
              </p>
            </div>
            
            {errors.submit && (
              <p className="text-sm text-red-500 mt-2">{errors.submit}</p>
            )}
            
            <div className="w-full flex justify-end">
              <button
                type="submit"
                className="amarillokgc hover:amarillokgc-hover text-black px-4 py-2 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer"
                disabled={!!errors.asunto || !!errors.descripcion}
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
        className="modal bg-white rounded-lg p-6 max-w-md mx-auto mt-20 shadow-xl"
        overlayClassName="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20"
      >
        <div className="modal-content">
          <h2 className="text-xl font-bold mb-4">Ticket Creado Exitosamente</h2>
          <p className="mb-6">El ticket ha sido creado y será atendido por el equipo correspondiente.</p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={handleClosePage}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-2xl shadow-sm"
            >
              Salir
            </button>
            <button
              onClick={() => {
                closeModal();
                // Resetear formulario
                setAsunto('');
                setDescripcion('');
                setUrgencia('Baja');
                setCategoria('Desarrollo');
                setErrors({});
              }}
              className="amarillokgc hover:amarillokgc-hover text-black px-4 py-2 rounded-2xl shadow-sm"
            >
              Crear Otro
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}