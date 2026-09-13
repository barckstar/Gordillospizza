"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { CarritoBoton } from "@/features/carrito/components/CarritoBoton";
import { CarritoDrawer } from "@/features/carrito/components/CarritoDrawer";
import { useCarrito } from "@/shared/lib/carrito";

/**
 * Une el botón flotante, el carrito y el checkout.
 *
 * VIVE EN `app/` Y NO DENTRO DE UNA FEATURE porque COMPONE DOS: carrito y
 * checkout. Una feature no importa de otra; la composición se hace acá, que
 * es el punto que la arquitectura designa para eso.
 */

/*
  EL CHECKOUT SE CARGA APARTE.

  `CarritoUI` se monta en el layout, así que todo lo que importe viaja en la
  carga inicial. El checkout arrastra su esquema de Zod —lo necesita para
  validar el formulario— y eso lo bajaría TODO EL MUNDO, incluido quien entra,
  mira el menú y se va sin pedir nada.

  `ssr: false` porque es un modal: no hay nada que renderizar en servidor de
  algo que empieza cerrado.
*/
const CheckoutDrawer = dynamic(
  () =>
    import("@/features/checkout/components/CheckoutDrawer").then(
      (m) => m.CheckoutDrawer,
    ),
  { ssr: false },
);

export function CarritoUI() {
  const { cerrar, abierto } = useCarrito();
  const [checkoutAbierto, setCheckoutAbierto] = useState(false);

  /*
    Se adelanta la descarga al abrir el carrito, que es el paso anterior. Sin
    esto, cargar el checkout aparte solo mueve el costo: al pulsar "Continuar"
    habría que esperar el chunk, y en una conexión lenta eso es medio segundo
    en el que el botón parece no responder — justo en el momento de comprar.
  */
  useEffect(() => {
    if (abierto) void import("@/features/checkout/components/CheckoutDrawer");
  }, [abierto]);

  return (
    <>
      {/*
        El botón flotante desaparece con un drawer abierto. Ofrecer "Ver el
        pedido" con el pedido en pantalla no aporta nada y se monta encima
        del propio drawer.
      */}
      {!abierto && !checkoutAbierto && <CarritoBoton />}

      <CarritoDrawer
        onIrAlCheckout={() => {
          cerrar();
          setCheckoutAbierto(true);
        }}
      />

      {/*
        MONTADO SOLO CUANDO ESTÁ ABIERTO. `dynamic` descarga el chunk en cuanto
        el componente se RENDERIZA: si estuviera siempre en el árbol dejándole
        decidir con una prop, el chunk bajaría igual y toda esta separación no
        serviría de nada.
      */}
      {checkoutAbierto && (
        <CheckoutDrawer onCerrar={() => setCheckoutAbierto(false)} />
      )}
    </>
  );
}
