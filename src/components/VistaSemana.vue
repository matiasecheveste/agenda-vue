<!-- Agenda semanal — Matías Nicolás Echeveste Cardozo -->
<script setup lang="ts">
import { computed } from 'vue'
import { DIAS, isoLocal, rangoLegible, seSuperponen } from '../lib/fechas'
import { useAgenda, type Evento } from '../stores/agenda'

const agenda = useAgenda()
const hoy = isoLocal(new Date())

const rango = computed(() => {
  return rangoLegible(agenda.dias[0]!, agenda.dias[6]!)
})

function enConflicto(e: Evento, delDia: Evento[]) {
  return delDia.some((o) => o.id !== e.id && seSuperponen(o, e))
}
</script>

<template>
  <section aria-labelledby="titulo-semana">
    <div class="navegacion">
      <button type="button" aria-label="Semana anterior" @click="agenda.moverSemana(-1)">‹</button>
      <h2 id="titulo-semana">Semana del {{ rango }}</h2>
      <button type="button" aria-label="Semana siguiente" @click="agenda.moverSemana(1)">›</button>
      <button type="button" @click="agenda.irAHoy()">Hoy</button>
    </div>
    <ol class="semana">
      <li v-for="(dia, i) in agenda.dias" :key="dia" :class="{ hoy: dia === hoy }" :data-fecha="dia">
        <h3>{{ DIAS[i] }} <span>{{ dia.slice(8) }}</span></h3>
        <p v-if="!agenda.porDia[dia]?.length" class="libre">Sin eventos</p>
        <ul v-else>
          <li
            v-for="e in agenda.porDia[dia]"
            :key="e.id"
            class="evento"
            :class="[e.categoria, { conflicto: enConflicto(e, agenda.porDia[dia]!) }]"
          >
            <strong>{{ e.inicio }}–{{ e.fin }}</strong> {{ e.titulo }}
            <span v-if="enConflicto(e, agenda.porDia[dia]!)" class="marca">superpuesto</span>
            <button type="button" class="eliminar" :aria-label="`Eliminar ${e.titulo}`" @click="agenda.eliminar(e.id)">×</button>
          </li>
        </ul>
      </li>
    </ol>
  </section>
</template>
