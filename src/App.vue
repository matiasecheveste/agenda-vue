<!-- Agenda semanal — Matías Nicolás Echeveste Cardozo -->
<script setup lang="ts">
import { ref } from 'vue'
import FormularioEvento from './components/FormularioEvento.vue'
import VistaSemana from './components/VistaSemana.vue'
import { useAgenda } from './stores/agenda'

const agenda = useAgenda()
const mensaje = ref('')

function alGuardar(cantidad: number) {
  mensaje.value = cantidad === 1 ? 'Evento agregado.' : `Se agregaron ${cantidad} eventos.`
}
</script>

<template>
  <main>
    <header>
      <h1>Agenda semanal</h1>
      <label>
        Mostrar
        <select v-model="agenda.filtro" name="filtro">
          <option value="todas">Todas las categorías</option>
          <option value="trabajo">Trabajo</option>
          <option value="estudio">Estudio</option>
          <option value="salud">Salud</option>
          <option value="personal">Personal</option>
        </select>
      </label>
    </header>
    <div class="disposicion">
      <VistaSemana />
      <aside>
        <FormularioEvento :fecha="agenda.semanaActual" @guardado="alGuardar" />
        <p class="mensaje" role="status">{{ mensaje }}</p>
        <section aria-labelledby="titulo-resumen" class="resumen">
          <h2 id="titulo-resumen">Horas de la semana</h2>
          <dl>
            <template v-for="(horas, categoria) in agenda.horasPorCategoria" :key="categoria">
              <dt>{{ categoria }}</dt>
              <dd>{{ horas.toLocaleString('es-UY', { maximumFractionDigits: 1 }) }} h</dd>
            </template>
          </dl>
        </section>
      </aside>
    </div>
  </main>
</template>
