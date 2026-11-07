<!-- Agenda semanal — Matías Nicolás Echeveste Cardozo -->
<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useAgenda, validar, type Categoria, type DatosEvento } from '../stores/agenda'

const props = defineProps<{ fecha: string }>()
const emit = defineEmits<{ guardado: [cantidad: number] }>()

const agenda = useAgenda()
const datos = reactive<DatosEvento>({ titulo: '', fecha: props.fecha, inicio: '09:00', fin: '10:00', categoria: 'trabajo' })
const repetir = ref(0)
const errores = ref<string[]>([])
const intentado = ref(false)

const conflictos = computed(() => (validar(datos).length ? [] : agenda.conflictos(datos)))

const CATEGORIAS: { valor: Categoria; texto: string }[] = [
  { valor: 'trabajo', texto: 'Trabajo' },
  { valor: 'estudio', texto: 'Estudio' },
  { valor: 'salud', texto: 'Salud' },
  { valor: 'personal', texto: 'Personal' },
]

function guardar() {
  intentado.value = true
  errores.value = validar(datos)
  if (errores.value.length) return
  const nuevos = agenda.agregar({ ...datos }, repetir.value)
  emit('guardado', nuevos.length)
  datos.titulo = ''
  intentado.value = false
}
</script>

<template>
  <form class="formulario" novalidate aria-labelledby="titulo-formulario" @submit.prevent="guardar">
    <h2 id="titulo-formulario">Nuevo evento</h2>
    <label>
      Título
      <input v-model="datos.titulo" name="titulo" maxlength="80" required :aria-invalid="intentado && !datos.titulo.trim()" />
    </label>
    <div class="fila">
      <label>Fecha <input v-model="datos.fecha" type="date" name="fecha" required /></label>
      <label>Inicio <input v-model="datos.inicio" type="time" name="inicio" required /></label>
      <label>Fin <input v-model="datos.fin" type="time" name="fin" required /></label>
    </div>
    <div class="fila">
      <label>
        Categoría
        <select v-model="datos.categoria" name="categoria">
          <option v-for="c in CATEGORIAS" :key="c.valor" :value="c.valor">{{ c.texto }}</option>
        </select>
      </label>
      <label>
        Repetir
        <select v-model.number="repetir" name="repetir">
          <option :value="0">No</option>
          <option v-for="n in [1, 3, 7, 11]" :key="n" :value="n">{{ n + 1 }} semanas</option>
        </select>
      </label>
    </div>
    <ul v-if="errores.length" class="errores" role="alert">
      <li v-for="e in errores" :key="e">{{ e }}</li>
    </ul>
    <p v-if="conflictos.length" class="advertencia" role="status">
      Se superpone con: {{ conflictos.map((c) => `${c.titulo} (${c.inicio}–${c.fin})`).join(', ') }}
    </p>
    <button type="submit">Agregar</button>
  </form>
</template>
