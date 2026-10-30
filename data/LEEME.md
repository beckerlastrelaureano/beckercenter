# Cómo editar el catálogo de libros

Los libros están en `books.json`. Cada libro es un bloque entre llaves `{ }`, separado del siguiente por una coma.

```json
{
  "id": "b137",
  "titulo": "Nombre del libro",
  "autor": "Nombre del autor",
  "categoria": "Desarrollo personal",
  "precio": 22000,
  "tapaDura": false,
  "estado": "disponible",
  "destacado": false,
  "portada": "img/books/b137.jpg",
  "descripcion": "Una o dos frases sobre el libro."
}
```

## Qué significa cada dato

| Dato | Qué poner |
|------|-----------|
| `id` | Un código único. Seguí la numeración: b137, b138… |
| `titulo` | Título del libro, entre comillas. |
| `autor` | Autor, entre comillas. Si no sabés, dejalo vacío: `""`. |
| `categoria` | Tiene que ser **exactamente** igual a una de la lista `categorias` de arriba del archivo. |
| `precio` | Número sin `$`, sin puntos y sin comillas. Ejemplo: `22000`. |
| `tapaDura` | `true` (sí) o `false` (no), sin comillas. |
| `estado` | `"disponible"` (en stock) o `"encargo"` (por encargo). |
| `destacado` | `true` para que aparezca primero en el catálogo. |
| `portada` | Ruta de la imagen. Subí la foto a `img/books/` con el mismo nombre. |
| `descripcion` | Texto corto, entre comillas. |

## Reglas para no romper nada

1. Todos los textos van entre comillas dobles `"..."`.
2. Después de cada dato va una coma, **menos en el último** del bloque.
3. Entre un libro y el siguiente va una coma: `},` — el último libro de la lista termina en `}` sin coma.
4. Si un texto lleva comillas adentro, usá comillas tipográficas “así”.
5. Para quitar un libro, borrá su bloque completo `{ ... },`.

Si después de editar el catálogo no aparece, pegá el contenido en https://jsonlint.com para encontrar el error.

## Combos en oferta

Arriba de los libros, en `combos`. Cada combo junta 3 libros a un precio:

```json
{ "id": "o1", "nombre": "Joe Dispenza", "nota": "Mismo autor", "precio": 50000, "libros": ["b53", "b54", "b55"] }
```

- `libros` son los `id` de los libros del combo.
- Para sacar un combo, borrá su bloque. Si la lista queda vacía (`"combos": []`), la sección no se muestra.

## Nueva categoría

Agregala a la lista `categorias` (arriba del archivo) y usá el mismo nombre en los libros.

---

# Cómo editar las apps (Becker Design)

Las apps están en `apps.json`. Mismas reglas de comillas y comas que los libros.

| Dato | Qué poner |
|------|-----------|
| `id` | Código único sin espacios: `"becker-coach"`. |
| `nombre` / `subtitulo` | Nombre grande y texto chico debajo. |
| `estado` | `"disponible"`, `"proximamente"` o `"desarrollo"`. |
| `destacada` | `true` solo en UNA app: se muestra grande arriba con el celular animado. |
| `tipo` | Etiqueta corta: `"App de entrenamiento"`. |
| `resumen` | Para qué sirve, en una o dos frases. |
| `paraQuien` | Lista entre corchetes: `["Alumnos", "Entrenadores"]`. |
| `funciones` | Lista de funciones (se muestra solo en la destacada). Puede quedar vacía: `[]`. |
| `capturas` | Lista de imágenes en `img/apps/`. Capturas verticales de celular. |
| `probar` | Link para probar la app. Vacío `""` si todavía no existe. |
| `pagina` | Página propia de la app (ej. `"gym-app.html"`). Vacío si no tiene. |
| `mensaje` | Texto que te llega por WhatsApp cuando alguien consulta por esa app. |
