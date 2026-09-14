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

## El boton de ubicacion en el checkout

Con el express confirmado, el checkout captura el punto exacto con
`navigator.geolocation` — API del navegador: no cuesta nada, no pide llave y no
suma dependencias. Solo exige HTTPS, y funciona en localhost y en Vercel.

- **NO reemplaza a las señas escritas, las acompaña.** En Costa Rica las
  direcciones son descriptivas: el mensajero se orienta con el texto y usa el
  pin para el ultimo tramo. Por eso el campo de direccion sigue siendo
  obligatorio aunque haya coordenadas.
- **No hay geocodificacion inversa** (coordenadas -> nombre de calle) porque eso
  si requiere una API de pago, y ademas no aporta: aqui las calles no tienen
  nombre util.
- En el mensaje va como **enlace de Google Maps**. `wa.me` no permite adjuntar
  un pin de ubicacion, pero el mensajero toca el enlace y le abre la ruta.
- Cada motivo de error tiene su propio mensaje: permiso denegado, tiempo
  agotado o fallo generico. "No se pudo" a secas deja a la persona sin saber si
  reintentar, revisar un permiso o escribir las señas a mano.

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

## Dos bugs de movil que costaron caro

**1. El sitio quedaba sin scroll despues de pedir.** Cada modal guardaba el
`overflow` del body que encontro y lo restauraba al cerrarse. Con UN modal
funciona; aca se solapan siempre:

    hoja de pizza abierta -> overflow: hidden, guarda ""
    se toca "Agregar" -> la hoja SALE (sigue montada 190 ms) y el pedido ABRE
    el pedido monta, lee "hidden" y se lo guarda como "lo de antes"
    se cierra el pedido -> restaura "hidden"  -> BODY BLOQUEADO PARA SIEMPRE

En movil la persona no podia seguir desplazandose y solo recuperaba el sitio
recargando. Ahora el bloqueo es del DOCUMENTO, con una CUENTA de modales
abiertos: el primero bloquea, el ultimo libera. Ver `shared/lib/modal.ts`.

**2. Desborde horizontal de 13 px.** `revelar-izquierda` y `revelar-derecha`
desplazan 32 px en horizontal ANTES de revelar. A 375 px eso sacaba el
documento a 388 px y aparecia scroll lateral en toda la pagina. Por debajo de
640 px el desplazamiento lateral se anula: en un telefono no hay margen para
percibirlo, asi que no aportaba nada y solo costaba.

**Y una incoherencia de unidades en el hero.** La pista media `340vh` y el
marco `100svh`, y el progreso se calculaba contra `window.innerHeight`. En el
telefono las tres cosas difieren y ninguna es estable: `innerHeight` cambia
mientras la barra del navegador se esconde con el scroll, asi que el divisor
cambiaba a mitad del gesto y el video pegaba saltos. Ahora la pista va en
`svh` como el marco, y el progreso se mide contra `marco.offsetHeight`, que
es un elemento del DOM y no depende de la barra.

## Los modales en movil van a PANTALLA COMPLETA

Antes eran hojas pegadas abajo con tope de `92svh`. Ese 8% sobrante no era
aire de diseño: era una franja negra inutil arriba que ademas dejaba el quinto
tamaño de pizza ("Extra") cortado desde el primer momento, obligando a
desplazarse antes de poder elegir.

Ahora, por debajo de `sm`, el panel va de borde a borde: `items-stretch`, sin
esquinas redondeadas y sin borde. **Los cinco tamaños entran sin scroll** a
375x812 (medido: contenido 812, visible 812). En el pedido, ademas, el pie
queda pegado al fondo, o sea "Hacer pedido" justo bajo el pulgar.

A partir de `sm` vuelve a ser la tarjeta centrada de siempre: 512 px, esquinas
de 24 px y borde. Ahi el modal a pantalla completa no tendria sentido.

**La animacion tuvo que cambiar con esto.** El zoom entraba desde una escala
de 0,9: en una tarjeta centrada se lee como que viene desde el fondo, pero
encoger la PANTALLA ENTERA al 90% deja ver el velo por los cuatro bordes y
parece que la interfaz se despega. Por eso la intensidad sale de variables
CSS y en movil es mucho mas contenida (0,97), con el origen en el centro.

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

## Calidad del video — medida en dos ejes, no en uno

No basta con mirar la nitidez: en un hero con scrub, cada salto del scroll
obliga a decodificar un frame entero. Por eso cada version se mide con **SSIM**
(fidelidad) Y con el **tiempo real de cada salto** en el navegador, con 24
saltos cronometrados por version.

| version | peso | SSIM | salto mediano | p90 |
|---|---|---|---|---|
| 960 CRF28 (la primera) | 4,1 MB | 0,912 | — | — |
| 720 CRF25 | 3,6 MB | 0,902 | — | — |
| 1280 CRF26 | 7,1 MB | 0,948 | 10,9 ms | 12,9 ms |
| **1280 CRF18 (hoy)** | **14,7 MB** | **0,980** | **7,3 ms** | **8,6 ms** |
| 1280 CRF14 | 20,9 MB | 0,988 | 7,4 ms | 18,9 ms |
| 1280 CRF18 a 48 fps | 24,7 MB | 0,950 | 13,7 ms | 17,9 ms |

**El presupuesto es 16,7 ms**, que es lo que dura un frame a 60 Hz. Pasarse de
ahi se ve como tartamudeo.

Dos resultados que no se esperaban:

- **Mas calidad no ralentiza el salto.** CRF18 es el mas CONSISTENTE de todos.
  CRF14 tiene mejor mediana pero su p90 se va a 18,9 ms: tiembla.
- **Interpolar a 48 fps con `minterpolate` es peor en todo**: inventa los
  frames intermedios y pierde fidelidad, duplica el tiempo de salto y se pasa
  del presupuesto. Duplicar frames NO da fluidez.

**Estado temporal:** hoy estan a maxima calidad porque el cliente pidio verlo
sin mirar el peso. 14,7 MB + 10,3 MB. **Hay que revisarlo antes del final** —
CRF26 baja a 7,1 MB perdiendo 0,03 de SSIM.

## Por que el scrub se veia "cortado" — y no era falta de frames

Atado punto por punto al scroll, un tick de rueda (~100 px) recorre de golpe
medio segundo de video. Simulando el bucle frame a frame a 60 Hz:

| gesto | antes | ahora |
|---|---|---|
| un tick de rueda | **7,88x** la velocidad natural | 1,60x |
| un golpe de scroll fuerte | **20,88x** | 1,60x |

A 7,88x el primer frame del bucle avanzaba 0,131 s de video: unos **3 frames
del clip dentro de un solo frame de pantalla**. A 20,88x eran 20. Eso el ojo
no lo lee como movimiento, lo lee como un corte. **No faltaban frames:
sobraba velocidad.**

`VELOCIDAD_MAXIMA = 1.6` topa cuanto puede avanzar el video por segundo real.
Con eso un tick ya no salta: el video SE REPRODUCE hasta el punto nuevo y se
detiene ahi. Si la persona scrollea muy rapido el video se queda atras un
momento y se pone al dia — que llegue tarde es tolerable; que se vea cortado,
no.

Por encima de 1,6x vuelve a sentirse acelerado. Es la perilla a tocar si el
cliente lo quiere mas pegado al dedo (subir) o mas cinematografico (bajar).

### Y por que despues "se teletransportaba de frame a frame"

Un tope FIJO de 1,6x no alcanza, y el corte seco por tamaño de brecha lo
empeoraba. Con el tope, scrollear rapido HACE que la brecha crezca —esa es la
idea— asi que el corte, que miraba la brecha, se disparaba una y otra vez:
crecia, cortaba, crecia, cortaba.

**Un atraso acumulado y un salto real de scroll son cosas distintas**, y las
estaba midiendo con la misma vara. Ahora:

- **El teletransporte se detecta por el salto del SCROLL en UN frame**
  (`TELETRANSPORTE_T = 0.25`), no por la brecha. 25% de la pista en un frame
  no se alcanza ni scrolleando a lo bestia: solo pasa al recargar a media
  pista, volver de un ancla o arrastrar la barra.
- **La velocidad permitida CRECE con la brecha**, de forma continua:
  `1,6x + (brecha - 0,35 s) x 4`, con techo de `8x`. Con brecha chica se lee
  como reproduccion; cuando se agranda, acelera para alcanzar al scroll sin
  ninguna discontinuidad.

Simulado a 60 Hz:

| escenario | antes | ahora |
|---|---|---|
| scroll rapido continuo | **2 teletransportes** | 0 · vel max 4,00x · atraso 0,04 s |
| scroll muy violento | **2 teletransportes** | 0 · vel max 8,00x · atraso 0,01 s |
| un tick suelto | — | vel max 2,20x · llega en 0,57 s |

Un tope fijo tenia el defecto opuesto: scrollear de golpe toda la pista dejaba
al video reproduciendose SOLO durante seis segundos despues de que la persona
ya se habia detenido.

## El hero — decisiones medidas, no supuestas

- **El mp4 de Veo traía 1 keyframe en 240** (ffprobe). Buscar un punto intermedio
  obligaba a decodificar desde el principio: el scrub temblaba entero. Recodificado a
  **240/240 keyframes** pesa 4,3 MB en vez de 4,8 MB — más barato Y funciona.
- Se midieron cuatro técnicas: secuencia WebP de 120 frames (5,8 MB), de 80 frames
  (3,9 MB), **mp4 todo-keyframes (240 frames)** y VP9 todo-keyframes (22 MB).
  Ganó el mp4.
- **La primera version se sirvio a 960 y fue un error**: el poster es de 1280, asi
  que se veia un poster nitido y al arrancar el video la calidad BAJABA. En un
  monitor de 1920 ese 960 se estiraba al doble. Medido con SSIM contra el original:

  | version | peso | SSIM |
  |---|---|---|
  | 960 CRF28 (la que habia) | 4,1 MB | 0,912 |
  | 720 CRF25 | 3,6 MB | **0,902** |
  | 960 CRF25 (movil, hoy) | 5,3 MB | 0,932 |
  | 1280 CRF27 | 6,4 MB | 0,942 |
  | **1280 CRF26 (escritorio, hoy)** | **7,1 MB** | **0,948** |

  El dato que no se esperaba: **720 sale PEOR que 960 aunque tenga mejor CRF**.
  En este material la resolucion pesa mas que la compresion, asi que bajar de
  960 no compensa nunca.
- El corte entre las dos versiones esta en **768 px**, no en 640.
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
- [x] **Entregas a domicilio CONFIRMADAS por el cliente** (2026-09-14). El
      checkout lleva ademas el boton de ubicacion exacta.
- [ ] Video de botellas (`assets-fuente/botellas-original.mp4`, 8 s vertical) sin usar
- [x] Técnica del hero con scroll — mp4 todo-keyframes, medido
- [ ] Decidir qué reemplaza al menú-video (aquel era un video por plato)
- [ ] Correr Lighthouse sobre el build de producción y confirmar >95

## Bloqueos de herramientas

- `APIFY_TOKEN` **inválido** → no se pudo bajar el material de Instagram en bloque.
- MCP **higgsfield sin autorizar** → no hay generación de video. Se autoriza con `/mcp`
  desde una terminal `claude` interactiva.
