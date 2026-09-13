"use client";

import { useState } from "react";
import Image from "next/image";
import { IconoWhatsApp } from "@/shared/components/ui/Iconos";
import { NEGOCIO } from "@/shared/config/negocio";
import { useNavbarOculto } from "@/shared/lib/useNavbarOculto";

/*
  Anclas, no rutas. El sitio es una sola página: estos enlaces bajan a su
  sección con scroll suave (lo hace `scroll-behavior` en globals.css).
*/
/** El pedido arranca con el saludo ya escrito, no con un chat en blanco. */
const MENSAJE_INICIAL = encodeURIComponent(
  `Hola ${NEGOCIO.nombre}, quiero hacer un pedido.`,
);

const ENLACES = [
  { href: "#menu", texto: "Menú" },
  { href: "#promesa", texto: "Nosotros" },
  { href: "#preguntas", texto: "Preguntas" },
  { href: "#ubicacion", texto: "Dónde estamos" },
];

export function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  /*
    El menú abierto bloquea el ocultamiento. Si el navbar se va mientras el
    menú móvil está desplegado, el menú se va con él y el usuario queda
    mirando la nada.
  */
  const oculto = useNavbarOculto(menuAbierto);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-transform duration-300 ${
        oculto ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <nav
        className="border-b border-crema/10 bg-negro/85 backdrop-blur-md"
        aria-label="Principal"
      >
        <div className="mx-auto flex h-18 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
          <a
            href="#inicio"
            className="flex items-center gap-2.5"
            onClick={() => setMenuAbierto(false)}
          >
            <Image
              src="/marca/logo-128-v2.webp"
              alt={`${NEGOCIO.nombre}, pizzería en San Ramón`}
              width={44}
              height={49}
              priority
              className="h-11 w-auto"
            />
            <span className="font-display text-lg font-black leading-none tracking-tight text-crema sm:text-xl">
              Gordillo&apos;s
            </span>
          </a>

          <div className="hidden items-center gap-8 md:flex">
            {ENLACES.map((e) => (
              <a
                key={e.href}
                href={e.href}
                className="text-sm font-medium text-crema/80 transition-colors hover:text-ambar"
              >
                {e.texto}
              </a>
            ))}
            {/*
              Antes esto era una pastilla roja con el numero pelado. Un numero
              suelto no dice que hacer con el: ¿llamar, escribir, guardarlo?
              Ahora el icono dice el canal, la linea de arriba dice la accion y
              el numero queda de apoyo. El icono va sobre un circulo claro
              propio para que se lea tambien sobre el rojo.
            */}
            <a
              href={`${NEGOCIO.whatsapp}?text=${MENSAJE_INICIAL}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2.5 rounded-full bg-rojo py-2 pl-2 pr-5 transition-colors hover:bg-rojo-osc"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-white/20 text-white transition-transform duration-300 group-hover:scale-110">
                <IconoWhatsApp className="size-4" />
              </span>
              <span className="flex flex-col leading-none">
                <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/70">
                  Pedí ya
                </span>
                <span className="mt-0.5 text-sm font-bold text-white">
                  {NEGOCIO.telefono}
                </span>
              </span>
            </a>
          </div>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-crema md:hidden"
            aria-expanded={menuAbierto}
            aria-controls="menu-movil"
            aria-label={menuAbierto ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setMenuAbierto((v) => !v)}
          >
            <span aria-hidden="true" className="relative block h-4 w-6">
              <span
                className={`absolute inset-x-0 top-0 h-0.5 bg-current transition-transform ${
                  menuAbierto ? "translate-y-[7px] rotate-45" : ""
                }`}
              />
              <span
                className={`absolute inset-x-0 top-[7px] h-0.5 bg-current transition-opacity ${
                  menuAbierto ? "opacity-0" : ""
                }`}
              />
              <span
                className={`absolute inset-x-0 top-[14px] h-0.5 bg-current transition-transform ${
                  menuAbierto ? "-translate-y-[7px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>

        <div
          id="menu-movil"
          hidden={!menuAbierto}
          className="border-t border-crema/10 bg-negro px-5 pb-6 pt-2 md:hidden"
        >
          {ENLACES.map((e) => (
            <a
              key={e.href}
              href={e.href}
              className="block py-3 text-base font-medium text-crema/85"
              onClick={() => setMenuAbierto(false)}
            >
              {e.texto}
            </a>
          ))}
          <a
            href={`${NEGOCIO.whatsapp}?text=${MENSAJE_INICIAL}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-2.5 rounded-full bg-rojo px-5 py-3.5 text-white"
            onClick={() => setMenuAbierto(false)}
          >
            <span className="flex size-7 items-center justify-center rounded-full bg-white/20">
              <IconoWhatsApp className="size-4" />
            </span>
            <span className="text-sm font-bold">
              Pedir al {NEGOCIO.telefono}
            </span>
          </a>
        </div>
      </nav>
    </header>
  );
}
