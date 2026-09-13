"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { AccionCarrito, ItemPedido, LineaCarrito } from "@/shared/types/carrito";
import { leerCrudo, escribirCrudo, suscribir } from "@/shared/lib/almacenLocal";

const CLAVE = "gordillos-pedido";

/**
 * Reducer puro, exportado aparte para poder probarlo sin React.
 * Nunca muta: siempre devuelve un arreglo nuevo.
 */
export function carritoReducer(
  estado: LineaCarrito[],
  accion: AccionCarrito,
): LineaCarrito[] {
  switch (accion.tipo) {
    case "agregar": {
      const suma = accion.cantidad ?? 1;
      if (suma <= 0) return estado;
      const existe = estado.find((l) => l.item.id === accion.item.id);
      if (existe) {
        return estado.map((l) =>
          l.item.id === accion.item.id
            ? { ...l, cantidad: l.cantidad + suma }
            : l,
        );
      }
      return [...estado, { item: accion.item, cantidad: suma }];
    }

    case "cambiarCantidad": {
      // Cero o menos elimina la linea: evita cantidades negativas.
      if (accion.cantidad <= 0) {
        return estado.filter((l) => l.item.id !== accion.id);
      }
      return estado.map((l) =>
        l.item.id === accion.id ? { ...l, cantidad: accion.cantidad } : l,
      );
    }

    case "quitar":
      return estado.filter((l) => l.item.id !== accion.id);

    case "ponerNota":
      return estado.map((l) =>
        l.item.id === accion.id
          ? { ...l, nota: accion.nota.trim() || undefined }
          : l,
      );

    case "vaciar":
      return [];
  }
}

export function total(lineas: LineaCarrito[]): number {
  return lineas.reduce((s, l) => s + l.item.precio * l.cantidad, 0);
}

export function conteo(lineas: LineaCarrito[]): number {
  return lineas.reduce((s, l) => s + l.cantidad, 0);
}

const VACIO: LineaCarrito[] = [];

/**
 * Lee el pedido guardado y descarta la basura.
 *
 * Un `localStorage` de hace dos semanas puede traer cualquier cosa: una línea
 * a medio escribir, un precio que quedó como texto. Se filtra acá y no más
 * adelante, porque una línea sin precio numérico haría que el total diera
 * `NaN` y el cliente vería "₡NaN" en su propio pedido.
 */
function parsear(crudo: string | null): LineaCarrito[] {
  if (!crudo) return VACIO;
  try {
    const dato: unknown = JSON.parse(crudo);
    if (!Array.isArray(dato)) return VACIO;
    return (dato as LineaCarrito[]).filter(
      (l) =>
        l &&
        typeof l.item?.id === "string" &&
        typeof l.item?.nombre === "string" &&
        Number.isFinite(l.item?.precio) &&
        Number.isFinite(l.cantidad) &&
        l.cantidad > 0,
    );
  } catch {
    return VACIO;
  }
}

type ValorCarrito = {
  lineas: LineaCarrito[];
  agregar: (item: ItemPedido, cantidad?: number) => void;
  cambiarCantidad: (id: string, cantidad: number) => void;
  quitar: (id: string) => void;
  ponerNota: (id: string, nota: string) => void;
  vaciar: () => void;
  cantidadDe: (id: string) => number;
  total: number;
  conteo: number;
  abierto: boolean;
  abrir: () => void;
  cerrar: () => void;
};

const CarritoContexto = createContext<ValorCarrito | null>(null);

export function CarritoProvider({ children }: { children: ReactNode }) {
  const [abierto, setAbierto] = useState(false);

  /*
    localStorage es el almacen real y se lee con useSyncExternalStore. Asi no
    hace falta hidratar con un setState dentro de un efecto —patron que React
    19 marca por provocar renders en cascada— y el desajuste servidor/cliente
    lo resuelve React: en el servidor devuelve el snapshot vacio y en el
    cliente el guardado.
  */
  const crudo = useSyncExternalStore(
    useCallback((f) => suscribir(CLAVE, f), []),
    () => leerCrudo(CLAVE),
    () => null, // snapshot del servidor: pedido vacio
  );

  const lineas = useMemo(() => parsear(crudo), [crudo]);

  const despachar = useCallback((accion: AccionCarrito) => {
    const siguiente = carritoReducer(parsear(leerCrudo(CLAVE)), accion);
    escribirCrudo(CLAVE, JSON.stringify(siguiente));
  }, []);

  const valor = useMemo<ValorCarrito>(
    () => ({
      lineas,
      agregar: (item, cantidad) => despachar({ tipo: "agregar", item, cantidad }),
      cambiarCantidad: (id, cantidad) =>
        despachar({ tipo: "cambiarCantidad", id, cantidad }),
      quitar: (id) => despachar({ tipo: "quitar", id }),
      ponerNota: (id, nota) => despachar({ tipo: "ponerNota", id, nota }),
      vaciar: () => despachar({ tipo: "vaciar" }),
      cantidadDe: (id) => lineas.find((l) => l.item.id === id)?.cantidad ?? 0,
      total: total(lineas),
      conteo: conteo(lineas),
      abierto,
      abrir: () => setAbierto(true),
      cerrar: () => setAbierto(false),
    }),
    [lineas, despachar, abierto],
  );

  return (
    <CarritoContexto.Provider value={valor}>{children}</CarritoContexto.Provider>
  );
}

export function useCarrito(): ValorCarrito {
  const ctx = useContext(CarritoContexto);
  if (!ctx) throw new Error("useCarrito debe usarse dentro de <CarritoProvider>");
  return ctx;
}
