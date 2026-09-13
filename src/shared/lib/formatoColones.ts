/**
 * Formatea un monto en colones costarricenses.
 *
 * Se hace a mano en vez de con `toLocaleString('es-CR')` a proposito: el
 * resultado de `toLocaleString` depende de los datos ICU del runtime, que no
 * son identicos entre Node local, el runtime de Vercel y el navegador. Para
 * precios eso no es aceptable — el separador de miles tiene que ser un punto
 * siempre, en todo lado.
 */
export function formatoColones(monto: number): string {
  const entero = Math.round(monto);
  const conSeparadores = String(Math.abs(entero)).replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ".",
  );
  return `${entero < 0 ? "-" : ""}₡${conSeparadores}`;
}
