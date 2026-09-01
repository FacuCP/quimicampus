# Iconos de las tarjetas del inicio

Cada tarjeta de la página principal (`src/presentation/pages/HomePage.tsx`) muestra el
archivo con su nombre de ruta:

| Tarjeta          | Archivo                |
| ---------------- | ---------------------- |
| Tabla periódica  | `tabla-periodica.svg`  |
| Calcular         | `calcular.svg`         |
| Compuestos       | `compuestos.svg`       |

Hoy los tres son una copia de `placeholder.svg`. Para poner el icono definitivo,
**reemplazá el contenido del archivo correspondiente** (mismo nombre) por tu SVG.

Recomendaciones:

- SVG con `viewBox="0 0 24 24"` y trazo (`stroke`) en vez de relleno, para que se vea
  parejo con el resto.
- Se renderiza dentro de un `<img>`, así que el color queda fijo en el propio SVG. Las
  tarjetas tienen fondo turquesa con texto oscuro en ambos temas, por lo que conviene un
  trazo oscuro (`#0f172a` o similar).
- Tamaño en pantalla: 32–40 px. No hace falta que el archivo tenga `width`/`height`.

Estos archivos viven en `public/`, o sea que se sirven tal cual desde `/icons/<nombre>.svg`
y no pasan por el bundler: alcanza con guardar el archivo y recargar.
