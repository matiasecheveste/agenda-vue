# Agenda semanal

Agenda web para organizar la semana por categorías (trabajo, estudio, salud y personal), con eventos que se
repiten, aviso de superposiciones y resumen de horas.

**Tecnologías:** Vue 3 (Composition API y `<script setup>`), Pinia, TypeScript, Vite, Vitest, Vue Test Utils y
GitHub Actions. Publicado en Vercel.

## Qué demuestra

- **Store de Pinia en estilo «setup»** con estado, getters (`computed`) y acciones; la lógica de negocio vive en
  el store y los componentes sólo presentan.
- **Reglas del dominio:** validación de datos, detección de superposiciones dentro del mismo día (los bordes no
  cuentan), repetición semanal y suma de horas por categoría.
- **Persistencia local** con `watch` profundo sobre `localStorage`, validando lo que se lee para tolerar datos
  corruptos o un almacenamiento bloqueado.
- **Fechas sin bibliotecas:** semanas que empiezan el lunes, calculadas en hora local para evitar desfasajes
  por zona horaria.
- **Formulario accesible:** etiquetas, `aria-invalid`, errores con `role="alert"` y avisos con `role="status"`.
- **Pruebas** del store, de las utilidades y de los componentes montados con Vue Test Utils; la compilación pasa
  por `vue-tsc` en modo estricto.

## Uso

```bash
npm install
npm run dev
npm test
npm run build
```

## Autoría

Desarrollado por **Matías Nicolás Echeveste Cardozo**. Licencia MIT.
