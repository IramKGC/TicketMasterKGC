import React from 'react'
import Image from 'next/image'

const ticketmaster = () => {
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
          <h1 className="text-black text-3xl font-sans mb-4">Iniciar Sesión</h1>
          <input type="text" placeholder="Nombre de usuario" className="w-3/4 h-8 mb-4 p-2 border-0 gris rounded-2xl text-zinc-800 focus:bordeamarillokgc"/>
          <input type="password" placeholder="Contraseña" className="w-3/4 h-8 mb-4 p-2 border-0 gris rounded-2xl text-zinc-800 focus:bordeamarillokgc" />
          <button className="w-4/12 h-8 mt-4 border-0 gris rounded-2xl text-zinc-800 amarillokgc text-sm font-bold">Acceder</button>
        </div>
    </div>  )
}

export default ticketmaster