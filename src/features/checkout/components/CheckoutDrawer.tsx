"use client";

import { useState } from "react";
import { useCarrito } from "@/shared/lib/carrito";
import { useModal } from "@/shared/lib/modal";
import { formatoColones } from "@/shared/lib/formatoColones";
import {
  esquemaPedido,
  etiquetaMetodoPago,
  METODOS_PAGO,
  type Modalidad,
} from "../schema";
import { construirMensaje, enviarPorWhatsApp } from "../lib/construirMensaje";
import { BotonUbicacion } from "./BotonUbicacion";

const CAMPO =
  "w-full rounded-xl border border-crema/15 bg-carbon px-4 py-3 text-sm text-crema placeholder:text-humo/60 focus:border-ambar focus:outline-none";

/**
 * Se monta SOLO cuando esta abierto (lo decide CarritoUI), asi que no lleva
 * prop `abierto`: si existe, esta abierto. Eso permite que `useModal` bloquee
 * el scroll y escuche el teclado desde el primer render sin condicionales.
 */
export function CheckoutDrawer({ onCerrar }: { onCerrar: () => void }) {
  const { lineas, total, vaciar } = useCarrito();
  const [modalidad, setModalidad] = useState<Modalidad>("retiro");
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [punto, setPunto] = useState<{ lat: number; lng: number } | null>(null);
  const { saliendo, pedirCierre, alTerminarAnimacion } = useModal(onCerrar);

  const enviar = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const resultado = esquemaPedido.safeParse({
      nombre: fd.get("nombre"),
      telefono: fd.get("telefono"),
      modalidad,
      direccion: fd.get("direccion") ?? undefined,
      metodoPago: fd.get("metodoPago"),
      notas: fd.get("notas") || undefined,
      lat: punto?.lat,
      lng: punto?.lng,
    });

    if (!resultado.success) {
      const mapa: Record<string, string> = {};
      for (const issue of resultado.error.issues) {
        const campo = String(issue.path[0] ?? "");
        if (campo && !mapa[campo]) mapa[campo] = issue.message;
      }
      setErrores(mapa);
      return;
    }

    setErrores({});
    const { texto } = construirMensaje(lineas, resultado.data, total);
    enviarPorWhatsApp(texto);
    /*
      El pedido se vacía DESPUÉS de abrir WhatsApp. Si se vaciara antes y el
      navegador bloqueara la ventana emergente, la persona se quedaría sin
      pedido y sin mensaje.
    */
    vaciar();
    onCerrar();
  };

  return (
    <div
      data-saliendo={saliendo}
      className="fixed inset-0 z-[90] flex items-stretch justify-center sm:items-center"
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={pedirCierre}
        className="modal-velo absolute inset-0 bg-black/80 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-titulo"
        onAnimationEnd={alTerminarAnimacion}
        className="modal-panel relative w-full overflow-y-auto bg-negro-2 sm:max-h-[92svh] sm:max-w-lg sm:rounded-3xl sm:border sm:border-crema/10"
      >
        <header className="flex items-center justify-between border-b border-crema/10 px-5 py-4">
          <h2
            id="checkout-titulo"
            className="font-display text-xl font-black text-crema"
          >
            Últimos datos
          </h2>
          <button
            type="button"
            onClick={pedirCierre}
            aria-label="Cerrar"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-carbon text-lg text-crema"
          >
            ×
          </button>
        </header>

        <form onSubmit={enviar} className="space-y-4 p-5" noValidate>
          <fieldset>
            <legend className="mb-2 text-xs font-semibold uppercase tracking-widest text-humo">
              ¿Cómo lo querés?
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {(["retiro", "express"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setModalidad(m)}
                  aria-pressed={modalidad === m}
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                    modalidad === m
                      ? "border-rojo bg-rojo text-white"
                      : "border-crema/15 bg-carbon text-crema/80"
                  }`}
                >
                  {m === "retiro" ? "Paso a recogerla" : "Express a mi casa"}
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="nombre" className="sr-only">
              Tu nombre
            </label>
            <input
              id="nombre"
              name="nombre"
              className={CAMPO}
              placeholder="Tu nombre"
              autoComplete="name"
            />
            {errores.nombre && (
              <p className="mt-1 text-xs text-rojo-vivo">{errores.nombre}</p>
            )}
          </div>

          <div>
            <label htmlFor="telefono" className="sr-only">
              Tu teléfono
            </label>
            <input
              id="telefono"
              name="telefono"
              type="tel"
              inputMode="numeric"
              className={CAMPO}
              placeholder="Teléfono (8 dígitos)"
              autoComplete="tel-national"
            />
            {errores.telefono && (
              <p className="mt-1 text-xs text-rojo-vivo">{errores.telefono}</p>
            )}
          </div>

          {modalidad === "express" && (
            <div>
              <label htmlFor="direccion" className="sr-only">
                Dirección
              </label>
              <textarea
                id="direccion"
                name="direccion"
                rows={2}
                className={CAMPO}
                placeholder="¿A dónde lo llevamos? Barrio y señas"
              />
              {errores.direccion && (
                <p className="mt-1 text-xs text-rojo-vivo">{errores.direccion}</p>
              )}

              {/*
                El punto exacto va JUNTO a las señas, no en vez de ellas. En
                Costa Rica las direcciones son descriptivas: el mensajero usa
                el texto para orientarse y el pin para el ultimo tramo.
              */}
              <BotonUbicacion
                tieneUbicacion={punto !== null}
                onUbicacion={(lat, lng) => setPunto({ lat, lng })}
                onLimpiar={() => setPunto(null)}
              />
            </div>
          )}

          <fieldset>
            <legend className="mb-2 text-xs font-semibold uppercase tracking-widest text-humo">
              Pago
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {METODOS_PAGO.map((m, i) => (
                <label
                  key={m}
                  className="flex cursor-pointer items-center gap-2 rounded-xl border border-crema/15 bg-carbon px-4 py-3 text-sm text-crema has-[:checked]:border-rojo has-[:checked]:bg-rojo has-[:checked]:text-white"
                >
                  <input
                    type="radio"
                    name="metodoPago"
                    value={m}
                    defaultChecked={i === 0}
                    className="sr-only"
                  />
                  {etiquetaMetodoPago[m]}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="notas" className="sr-only">
              Nota
            </label>
            <input
              id="notas"
              name="notas"
              className={CAMPO}
              placeholder="Algo más que debamos saber (opcional)"
            />
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <span className="text-sm uppercase tracking-widest text-humo">
              Total
            </span>
            <span className="font-display text-2xl font-black text-crema">
              {formatoColones(total)}
            </span>
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-rojo px-6 py-4 text-sm font-semibold text-white transition-colors hover:bg-rojo-osc"
          >
            Enviar el pedido por WhatsApp
          </button>
          <p className="text-center text-[11px] leading-relaxed text-humo">
            Se abre WhatsApp con el pedido ya escrito. Lo confirmás vos al
            enviarlo.
          </p>
        </form>
      </div>
    </div>
  );
}
