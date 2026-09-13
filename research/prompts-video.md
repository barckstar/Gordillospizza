# Prompts de video — Google Flow (Veo 3)

Imagen base: `assets-fuente/gordito-plaza.png` (generada por el cliente).
Se usa como PRIMER FRAME (Frames to Video), 16:9.

Restriccion dura: el hero es scroll-scrub, asi que el clip tiene que ser UNA SOLA
TOMA CONTINUA, camara estable y movimiento lento y parejo. Un corte se ve como
error al rebobinar. Ver `CLAUDE.md`.

---

## A — el del hero (recomendado)

Single continuous take, no cuts. Cinematic slow dolly-back at walking pace.

The smiling mustachioed chef in the white jacket and red neckerchief walks
slowly toward the camera across wet cobblestones, holding the wooden board
with the pizza steady in front of him, thin steam curling off the melted
cheese. His apron sways with each step. The camera retreats at exactly his
pace, keeping him centered and the same size in frame.

A small wooden table enters the bottom of the frame. A boy around seven,
seated three-quarters away from camera, looks up as the chef arrives. The
chef lowers the board onto the table; it settles and he rests one hand on
the boy's shoulder, still smiling.

Night. Warm tungsten key on the chef's face and on the pizza. Background
plaza, church and string lights thrown far out of focus, creamy bokeh,
shallow depth of field at f/1.8. Deep blacks, rich contrast, 35mm film
grain, no highlight clipping.

Motion is slow and even throughout. Camera is smooth and stabilized.

Audio: distant crowd murmur, soft footsteps on wet stone, a faint wooden
clack as the board meets the table.

---

## B — respaldo, camara fija (nunca falla para scrub)

Single continuous take, no cuts. Locked-off camera, tripod, zero movement.

The mustachioed chef in the white jacket and red neckerchief walks slowly
toward the camera from deep in the plaza, holding the pizza board level,
steam rising. He grows from small to filling the frame, stops, and lifts
the board slightly toward the lens with a warm smile.

Night, warm tungsten rim light, background thrown completely out of focus,
deep blacks, shallow depth of field, 35mm film grain.

Slow even motion throughout. Nothing else in the frame moves quickly.

Audio: distant plaza murmur, footsteps on wet stone.

---

## C — opcional, para la seccion del menu

Single continuous take, no cuts. Extreme close-up, slow push-in.

Hands lift one slice from the pizza on the wooden board; the melted cheese
stretches in a long slow strand and finally parts. Steam rises.

Night, warm tungsten light from one side, black background, shallow depth
of field, 35mm film grain, slow motion.

Audio: faint crackle, a soft crust crunch.

---

## Negative prompt (los tres)

cuts, jump cuts, scene change, text, captions, subtitles, watermark, logo,
camera shake, handheld wobble, fast motion, speed ramp, zoom pumping,
deformed hands, extra fingers, warped face, morphing

## Ajustes en Flow

- 16:9. La imagen va como PRIMER FRAME, no como referencia de estilo.
- Generar 3 variaciones y quedarse con la de camara mas quieta, no con la mas bonita.
- Para pasar de 8s usar Extend (continua desde el ultimo frame). Nunca pegar dos
  clips aparte: el corte se nota al rebobinar.
- Descargar el original en maxima calidad. No recomprimir. No mandar por WhatsApp.
