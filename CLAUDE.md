# CLAUDE.md — Gordillo's Pizza

Sitio web de **Gordillo's Pizza**, pizzería en San Ramón, Alajuela, Costa Rica.
Negocio nuevo, **sin sitio web** (Google dice "Agregar sitio web"). Amigos del cliente.

Estado: **corriendo**. `npm run dev` — puerto 3002 en `.claude/launch.json`,
con `autoPort`, asi que puede tomar otro si esta ocupado.

**UNA SOLA PAGINA (SPA), sin rutas internas.** Mismo criterio que ticoshot: el
menu no es `/menu`, es la seccion `#menu` de `/`. El carrito y el checkout son
drawers montados en el layout. Quien entra ve el video, baja, elige la pizza,
elige el tamaño y manda el pedido sin cambiar nunca de pagina.

Secciones: hero (scroll-scrub) -> promesa -> la de la casa -> menu -> preguntas
-> ubicacion. Mas la barra social fija al borde derecho (oculta en movil).

## Contexto del negocio

- Teléfono: **8532 8000** → `wa.me/50685328000`
- IG: [@gordillos_pizza](https://www.instagram.com/gordillos_pizza/) · 547 seguidores
- FB: `facebook.com/p/Pizza-Gordillos-61584699775219`
- Claim propio de ellos: **"MASA FRESCA HECHA DIARIO"**
- Promo suya: **MIÉRCOLES 2 POR ₡9.900** (pizzas grandes)
- Ver `research/sondeo.md` y `research/menu.json`

## Lo que NO se puede hacer acá

- **La prueba social no se usa.** Tienen **3,0 con 2 reseñas** en Google. En 5ta Avenida
  la calificación carga media landing; acá mostrarla sería tirarles una piedra. El sitio
  se apoya en la masa fresca, el horno y el personaje — y de paso sirve para que les
  lleguen reseñas.
- **El cliente no tiene fotos propias de sus pizzas ni del local.** Las 19 que hay
  en `public/pizzas/` son de **Pexels** (licencia libre, uso comercial) y estan
  **solo de relleno** hasta que el mande las suyas. Ver `public/pizzas/CREDITOS.md`.
  Ninguna es una pizza de Gordillo's: no se pueden usar en publicidad pagada ni
  presentarlas como propias.
- **El menú-video tipo reels de 5ta Avenida no se puede copiar**: aquel tenía un video
  por plato. Acá hay un video. Hay que resolverlo distinto.

## Diferencias con 5ta Avenida

| | 5ta Avenida | Gordillo's |
|---|---|---|
| Fotos de platos | 1 de 35, reales | 19 de relleno (Pexels) |
| Reseñas | 4,6 · 59 | 3,0 · 2 — no usar |
| Menú | 35 platos, precio único | 19 pizzas × **5 tamaños** = 95 precios |
| Video | varios clips | uno, hecho a medida |

El menú de 5 tamaños es el problema de UI propio de este proyecto: la tarjeta de plato
de 5ta Avenida tiene un precio, acá tiene cinco y un selector de tamaño que además
manda al carrito.

## Stack

Se hereda el estándar (ver `D:\la5taavenida\CLAUDE.md`): Next.js App Router + React,
**TypeScript estricto**, Tailwind v4 CSS-first, arquitectura **feature-based**,
datos de contenido en **JSON validado con Zod al importar**, animación en CSS puro,
navbar que se esconde al scroll, reparto de color **70/30/10**, **Lighthouse >95**
en las cuatro categorías.

## Paleta — fijada, contraste medido

| Franja | Uso | Color |
|---|---|---|
| 70% dominante | Fondos de página y sección | `#0A0807` / `#120D0B` |
| 30% secundario | Tarjetas y superficies | `#1C1310` / `#2A1A15` |
| 10% acento | CTA, precios, badges, activo | `#D0181F` / `#E8A33C` |

Contraste sobre `#0A0807`: `#D0181F` da **3,65:1** — es **decorativo**, nunca texto sobre
negro; como FONDO de botón con texto blanco da 5,48:1 y sí pasa AA. `#FF4A3D` 5,99:1 y
`#E8A33C` 9,26:1 sí sirven de texto. El rojo **nunca** como fondo de sección.

## El pedido — como se arma

La diferencia estructural con 5ta Avenida: alla una linea del carrito era un
plato y el plato traia su precio. Aca **una pizza tiene cinco precios**, asi
que lo que se pide no es "una Suprema" sino "una Suprema grande".

- El carrito guarda un `ItemPedido`: la **variante ya resuelta**, con su precio
  fijo. El id lleva el tamaño dentro (`suprema:grd`).
- **La misma pizza en dos tamaños son DOS lineas.** Verificado.
- La hoja de tamaños **se remonta con `key={pizza.id}`**, no se resetea con un
  efecto. Resetear estado dentro de `useEffect` provoca renders en cascada y
  el lint de React 19 lo marca como error.
- Guardar la copia y no una referencia tambien arregla localStorage: un pedido
  a medias sobrevive a que cambie la carta sin apuntar a un precio que ya no
  existe.
- El mensaje de WhatsApp tiene tope de **1500 caracteres codificados**:
  WhatsApp en iOS trunca antes y lo hace en silencio.

## El filo del logo — por que se veia un borde claro

El cliente lo describio como "un pelo que se nota a kilometros". Tenia razon y
la causa NO era que faltara borrar:

Un recortador deja el borde con **alfa parcial**, pero el COLOR de esos pixeles
sigue siendo el que tenian sobre fondo blanco. Cada pixel del borde vale

    C = a*F + (1-a)*BLANCO

Sobre blanco no se nota. Sobre el negro del sitio, ese `(1-a)*BLANCO` que
quedo metido dentro del color reaparece como un filo claro alrededor de todo.

**Borrar mas pixeles no lo arregla**: solo corre el filo un pixel hacia adentro
y encima come dibujo. Lo que lo arregla es despejar F de esa misma ecuacion —
**descontaminar**, o des-premultiplicar contra blanco:

    F = (C - (1-a)*BLANCO) / a

El pixel conserva su alfa, asi que el borde sigue suave y no queda aserrado,
pero su color pasa a ser el del dibujo. Medido sobre el contorno: **18,0% de
pixeles claros -> 0,0%**.

El que se publica sale del original de 1024 px (no de la vista previa de
remove.bg, capada a 500x500): ahi el alfa se ESTIMA a partir de cuanto se aleja
del blanco —todo el perimetro es contorno cafe oscuro, luminancia ~40— y
despues se descontamina igual. Queda en **827x930**, que a 340 CSS px cubre una
pantalla de 2x sin estirarse. El script quedo en el scratchpad; el resultado,
en `assets-fuente/logo-descontaminado-827.webp`.

Dos cuidados del metodo: con alfa por debajo de 38 la division amplifica ruido
y el pixel se descarta; si quedara algun pixel OPACO claro pegado al borde se
come en una pasada (en este logo no hizo falta: la contaminacion estaba toda en
el alfa parcial).

## La tarjeta para compartir (og.jpg)

Para una pizzeria de pueblo, **WhatsApp es el canal**: el enlace se comparte por
ahi, no por buscador. Asi que `og.jpg` no es un frame suelto del video, es una
tarjeta: el momento en que el chef sirve la pizza, con el logo, "Masa fresca
hecha diario", las tres cifras y el telefono en una pastilla roja. Quien la
recibe ya sabe que es y a donde llamar sin abrir nada.

- **1200x630**, la medida canonica de Open Graph (1,91:1). Antes el archivo
  media 1200x676 mientras el marcado declaraba 675 — y un desajuste entre lo
  declarado y lo real hace que el rastreador descarte la imagen y muestre solo
  el dominio.
- El velo lateral esta calculado para que el texto se lea sobre CUALQUIER frame,
  no solo sobre este.

**WhatsApp cachea la vista previa por URL y por varios dias.** Si se cambia la
imagen, el enlace sigue mostrando la vieja. Se fuerza el refresco en el
Sharing Debugger de Facebook (developers.facebook.com/tools/debug) con "Scrape
Again" — comparten infraestructura. Compartir la URL con `?v=2` tambien sirve
como prueba, porque es otra llave de cache.

## Barra social

Riel fijo al borde derecho con WhatsApp, Instagram, Facebook, Como llegar y
**Compartir**. Oculta en movil (`md:`) a proposito: a 375 px chocaria con la
pastilla del pedido, y las redes siguen en el menu hamburguesa y en el pie.

Es de SERVIDOR salvo el boton de compartir, que necesita la Web Share API y
viaja solo. Ese boton tiene TRES niveles: hoja nativa del sistema en movil,
copiar al portapapeles en escritorio, y WhatsApp Web si hasta el portapapeles
esta bloqueado. Nunca se queda sin hacer nada.

Las etiquetas del lector de pantalla van aparte del texto que se ve: la
plantilla "<nombre> de Gordillo's Pizza" dejaba "Como llegar de Gordillo's
Pizza", que dicho en voz alta no se entiende.

## Animaciones de los modales

La hoja de la pizza, el pedido y el checkout **entran y salen con zoom**. El
cierre NO desmonta de una: `useModal` marca `saliendo`, el contenedor pinta
`data-saliendo="true"`, corre la animacion de salida y recien en `animationend`
se llama a `onCerrar`. Sin eso solo se animaria la entrada.

- **NO poner `animation: none` bajo `prefers-reduced-motion`** en estos modales.
  La regla global ya los baja a 0,01 ms, que es lo correcto: con `none` el
  evento `animationend` nunca llega y **el modal no se podria cerrar**.
- Hay una red de seguridad de 420 ms por si `animationend` no llega.
- La cuadricula del menu entra escalonada, con tope a las 8 primeras tarjetas:
  con 19 y sin tope la ultima entra casi un segundo tarde y se lee como
  lentitud, no como animacion.

## SEO y AEO — para buscadores y para asistentes de IA

- **Los 95 precios estan en el marcado**, no solo en pantalla: cada pizza es un
  `MenuItem` con una `Offer` por tamaño (96 ofertas con `next build`). Un
  asistente que solo ve `priceRange` responde un rango inutil; con esto puede
  responder "la Suprema grande cuesta ₡10.000".
- `Restaurant` + `Menu` + `FAQPage` van en UN `@graph` unido por `@id`, no en
  tres etiquetas sueltas.
- **Seccion de preguntas VISIBLE**, no solo marcado. Un dato que vive solo en el
  JSON-LD y no en la pagina se ignora, y con razon. Va en `<details>` nativo:
  cero JavaScript y el texto existe en el HTML aunque este plegado.
- Las respuestas del FAQ **no repiten numeros a mano**: `faq.json` lleva marcas
  `{{precioMin}}` que se resuelven desde el menu validado. Una marca inexistente
  rompe el build.
- **`/llms.txt` es una RUTA GENERADA** (`app/llms.txt/route.ts`), no un archivo
  escrito a mano, por lo mismo: un llms.txt con precios viejos le da a la IA una
  respuesta equivocada con toda confianza.
- **Sin `aggregateRating`** en el marcado: 3,0 con 2 reseñas pintaria tres
  estrellas en Google.
- **Solo se declara la hora de CIERRE.** El horario de apertura sigue pendiente y
  no se inventa: un horario falso hace que Google diga "abierto" cuando no.

## El hero — decisiones medidas, no supuestas

- **El mp4 de Veo traía 1 keyframe en 240** (ffprobe). Buscar un punto intermedio
  obligaba a decodificar desde el principio: el scrub temblaba entero. Recodificado a
  **240/240 keyframes** pesa 4,3 MB en vez de 4,8 MB — más barato Y funciona.
- Se midieron cuatro técnicas: secuencia WebP de 120 frames (5,8 MB), de 80 frames
  (3,9 MB), **mp4 todo-keyframes 960px (4,1 MB, 240 frames)** y VP9 todo-keyframes
  (22 MB). Ganó el mp4.
- **El LCP es el poster** (`poster.avif`, 92 KB, `fetchPriority="high"`). El video no
  se descarga hasta después del evento `load`.
- **Nunca dejar que el scrub llegue a `duration` exacto**: el `<video>` marca
  `ended: true` y pinta NEGRO. Hay 60 ms de colchón.
- **El suavizado se reescala por tiempo, no por frame.** Atado al frame, una pantalla
  de 120 Hz corre el doble que una de 60.
- Con `prefers-reduced-motion` el video **no se descarga**. No es solo no animarlo:
  son 4 MB que esa persona no pidió.

## Pendiente

- [x] **Video del hero** — generado en Google Flow (Veo 3) desde una imagen del chef.
      Original en `assets-fuente/chef-original.mp4`, recodificado en `public/hero/`.
- [x] **Logo integrado** — navbar, footer, seccion de promesa, favicon y apple-icon.
- [x] **Logo sin filo blanco, a 827x930.** Ver la seccion "El filo del logo".
- [x] **Coordenadas reales** del pin que mando el cliente — mapa y JSON-LD.
- [x] **Carrito y checkout** a WhatsApp, con validacion de telefono CR.
- [ ] **PRECIOS DE LAS BEBIDAS** — las 4 estan en la carta con su foto pero salen
      como "Precio por confirmar" y **no se pueden agregar al pedido**. No se
      inventaron: este sitio se le enseña a clientes de verdad.
- [ ] **Fotos reales de las pizzas** — las 19 de `public/pizzas/` son de Pexels,
      provisionales. Ver `public/pizzas/CREDITOS.md`.
- [ ] Entradas y postres, si existen
- [x] **Dirección confirmada** (2026-09-13): la de Google. La bio de Instagram dice
      "200 sur y 15 m oeste" y **esta mal** — conviene que el dueño la corrija alla.
- [ ] Que el dueño arregle dos erratas EN SU FICHA DE GOOGLE: "contiguo a la
      Contiguo a la Musi" (duplicado) y "Carlo" por "Carlos" Luis Valverde Vega.
      En el sitio ya van corregidas.
- [ ] Horario completo (solo se sabe que cierra 9 p.m.)
- [ ] **Métodos de pago**: hoy el checkout ofrece Efectivo y Sinpe Movil, que son
      los dos universales en CR. **No se lista tarjeta** porque no sabemos si
      tienen datafono — eso se descubriria en la puerta, con la pizza en la mano.
- [ ] **CONFIRMAR SI HACEN ENTREGAS A DOMICILIO.** El checkout ofrece "Express a
      mi casa" y el FAQ lo da por hecho, pero el cliente nunca lo confirmo — se
      asumio porque casi toda pizzeria en CR reparte. Si NO reparten, hay que
      quitar la modalidad express del checkout y la pregunta del FAQ.
- [ ] Video de botellas (`assets-fuente/botellas-original.mp4`, 8 s vertical) sin usar
- [x] Técnica del hero con scroll — mp4 todo-keyframes, medido
- [ ] Decidir qué reemplaza al menú-video (aquel era un video por plato)
- [ ] Correr Lighthouse sobre el build de producción y confirmar >95

## Bloqueos de herramientas

- `APIFY_TOKEN` **inválido** → no se pudo bajar el material de Instagram en bloque.
- MCP **higgsfield sin autorizar** → no hay generación de video. Se autoriza con `/mcp`
  desde una terminal `claude` interactiva.
