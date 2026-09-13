/**
 * Almacen externo minimo sobre `localStorage`, para leerlo con
 * `useSyncExternalStore`.
 *
 * Por que no un `useEffect` que haga setState: React 19 marca ese patron
 * (regla `set-state-in-effect`) porque dispara renders en cascada. Ademas
 * `useSyncExternalStore` resuelve solo el desajuste de hidratacion: en el
 * servidor devuelve el valor por defecto y en el cliente el guardado, sin que
 * el HTML del servidor y el primer render del cliente discrepen.
 *
 * Todo acceso va en try/catch: en modo privado o con el almacenamiento
 * bloqueado, leer o escribir lanza excepcion y la app debe seguir funcionando.
 */

type Escucha = () => void;

const escuchas = new Map<string, Set<Escucha>>();
/** Cache de la instantanea por clave: getSnapshot debe devolver un valor estable. */
const cache = new Map<string, string | null>();

export function leerCrudo(clave: string): string | null {
  if (!cache.has(clave)) {
    try {
      cache.set(clave, window.localStorage.getItem(clave));
    } catch {
      cache.set(clave, null);
    }
  }
  return cache.get(clave) ?? null;
}

export function escribirCrudo(clave: string, valor: string): void {
  cache.set(clave, valor);
  try {
    window.localStorage.setItem(clave, valor);
  } catch {
    // Sin persistencia, pero el valor en memoria sigue siendo valido.
  }
  escuchas.get(clave)?.forEach((f) => f());
}

export function suscribir(clave: string, escucha: Escucha): () => void {
  if (!escuchas.has(clave)) escuchas.set(clave, new Set());
  escuchas.get(clave)!.add(escucha);
  return () => {
    escuchas.get(clave)?.delete(escucha);
  };
}
