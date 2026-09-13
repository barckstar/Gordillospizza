import Image from "next/image";
import { NEGOCIO } from "@/shared/config/negocio";
import { Contenedor } from "@/shared/components/ui/Contenedor";

export function Footer() {
  return (
    <footer className="border-t border-crema/10 bg-negro py-14">
      <Contenedor>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Image
              src="/marca/logo-256-v2.webp"
              alt={`${NEGOCIO.nombre}, pizzería en San Ramón, Alajuela`}
              width={90}
              height={101}
              className="h-24 w-auto"
            />
            <p className="mt-4 max-w-xs text-pretty text-sm leading-relaxed text-humo">
              {NEGOCIO.promesa}. {NEGOCIO.ciudad}, {NEGOCIO.provincia}.
            </p>
          </div>

          <div className="text-sm">
            <p className="mb-3 font-semibold uppercase tracking-widest text-crema/55">
              Pedidos
            </p>
            <a
              href={NEGOCIO.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="block font-display text-2xl font-black text-ambar hover:underline"
            >
              {NEGOCIO.telefono}
            </a>
            <p className="mt-3 max-w-xs leading-relaxed text-humo">
              {NEGOCIO.direccion}
            </p>
            <p className="mt-3 text-humo">Todos los días hasta las 9 p.m.</p>
          </div>

          <div className="text-sm">
            <p className="mb-3 font-semibold uppercase tracking-widest text-crema/55">
              Seguinos
            </p>
            <a
              href={NEGOCIO.redes.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-crema hover:text-ambar"
            >
              Instagram
            </a>
            <a
              href={NEGOCIO.redes.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 block text-crema hover:text-ambar"
            >
              Facebook
            </a>
            <a
              href={NEGOCIO.enlaceMapa}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 block text-crema hover:text-ambar"
            >
              Cómo llegar
            </a>
            <a href="#menu" className="mt-1.5 block text-crema hover:text-ambar">
              Menú
            </a>
          </div>
        </div>

        <p className="mt-12 text-xs text-humo/70">
          © {new Date().getFullYear()} {NEGOCIO.nombre}. {NEGOCIO.ciudad},{" "}
          {NEGOCIO.provincia}, {NEGOCIO.pais}.
        </p>
      </Contenedor>
    </footer>
  );
}
