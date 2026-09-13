/**
 * Datos del negocio.
 *
 * Esto NO va a JSON a proposito: cada campo necesita explicar de donde
 * salio y que tan confiable es. JSON no admite comentarios y esa memoria
 * se perderia. Ver la regla "Datos en JSON validado" en CLAUDE.md.
 */
export const NEGOCIO = {
  nombre: "Gordillo's Pizza",
  /** Como aparece en Google Business. */
  categoria: "Pizzería",
  ciudad: "San Ramón",
  provincia: "Alajuela",
  pais: "Costa Rica",
  codigoPostal: "20201",

  /** Confirmado en la ficha de Google Business (2026-09-12). */
  telefono: "8532 8000",
  telefonoE164: "+50685328000",
  whatsapp: "https://wa.me/50685328000",

  /*
    OJO — LA DIRECCION NO CONCUERDA ENTRE FUENTES.

    Google Business: "contiguo a la Musi, 200 norte y 25 oeste del hospital
                      Carlos Luis Valverde Vega"
    Bio de Instagram: "200 sur de los semaforos del hospital y 15m oeste,
                       contiguo a La Musi"

    Norte vs sur, 25 vs 15 metros. Se usa la de Google porque es la que
    alimenta Maps y Waze, pero HAY QUE CONFIRMARLA CON EL DUEÑO: esta es
    la linea que decide si el cliente llega o no llega.
  */
  direccion:
    "Contiguo a La Musi, 200 metros norte y 25 oeste del Hospital Carlos Luis Valverde Vega",
  direccionPendienteDeConfirmar: true,

  /*
    Coordenadas del PIN REAL de Google, que mando el cliente:
    https://maps.app.goo.gl/QrqnTrG9niTXFiFx9

    No salen de buscar "Gordillo's Pizza" en Maps —esa busqueda devuelve otros
    negocios homonimos— sino del enlace corto que el mismo dueño compartio,
    resuelto a su forma larga. Es el dato que alimenta el mapa y el JSON-LD.
  */
  geo: { lat: 10.0901758, lng: -84.4695741 },

  /** El enlace corto del cliente. Abre Maps o Waze en el telefono. */
  enlaceMapa: "https://maps.app.goo.gl/QrqnTrG9niTXFiFx9",

  /*
    Google solo publica que cierra a las 9 p.m. El resto del horario esta
    pendiente del dueño. Mientras tanto el sitio no promete horas que no
    sabemos.
  */
  cierraA: "21:00",
  horarioCompleto: null as string | null,

  redes: {
    instagram: "https://www.instagram.com/gordillos_pizza/",
    facebook: "https://www.facebook.com/p/Pizza-Gordillos-61584699775219/",
  },

  /** Claim de ellos, tomado literal de sus propias promociones. */
  promesa: "Masa fresca hecha diario",

  /*
    Google: 3,0 con 2 reseñas. NO SE MUESTRA EN EL SITIO.
    Se deja anotado para que nadie lo "agregue" mas adelante sin saber.
    Con dos reseñas la calificacion no dice nada del negocio y mostrarla
    solo los perjudica. Ver CLAUDE.md.
  */
  googleCalificacion: { valor: 3.0, cantidad: 2, mostrar: false },

  sitio: "https://gordillos-pizza.vercel.app",
} as const;
