/*
 * Agenda semanal — Matías Nicolás Echeveste Cardozo
 * Store de Pinia: eventos, validación, detección de conflictos, repetición semanal y persistencia local.
 */
import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { isoLocal, minutos, semana, seSuperponen, sumarDias } from '../lib/fechas'

export type Categoria = 'trabajo' | 'estudio' | 'salud' | 'personal'

export interface Evento {
  id: string
  titulo: string
  fecha: string // AAAA-MM-DD
  inicio: string // HH:MM
  fin: string // HH:MM
  categoria: Categoria
  notas?: string
}

export type DatosEvento = Omit<Evento, 'id'>

export const CLAVE_ALMACEN = 'agenda-semanal/v1'

function cargar(): Evento[] {
  try {
    const crudo = globalThis.localStorage?.getItem(CLAVE_ALMACEN)
    const datos = crudo ? JSON.parse(crudo) : []
    return Array.isArray(datos) ? datos.filter(esEvento) : []
  } catch {
    return []
  }
}

function esEvento(x: unknown): x is Evento {
  const e = x as Evento
  return typeof e?.id === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(e.fecha) && /^\d{2}:\d{2}$/.test(e.inicio)
}

export function validar(datos: DatosEvento): string[] {
  const errores: string[] = []
  if (!datos.titulo.trim()) errores.push('El título es obligatorio.')
  if (datos.titulo.length > 80) errores.push('El título admite hasta 80 caracteres.')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datos.fecha)) errores.push('La fecha no es válida.')
  if (!/^\d{2}:\d{2}$/.test(datos.inicio) || !/^\d{2}:\d{2}$/.test(datos.fin)) errores.push('Las horas no son válidas.')
  else if (minutos(datos.fin) <= minutos(datos.inicio)) errores.push('La hora de fin debe ser posterior al inicio.')
  return errores
}

export const useAgenda = defineStore('agenda', () => {
  const eventos = ref<Evento[]>(cargar())
  const semanaActual = ref(isoLocal(new Date()))
  const filtro = ref<Categoria | 'todas'>('todas')

  const dias = computed(() => semana(semanaActual.value))

  const visibles = computed(() =>
    eventos.value.filter((e) => filtro.value === 'todas' || e.categoria === filtro.value),
  )

  const porDia = computed(() =>
    Object.fromEntries(
      dias.value.map((d) => [
        d,
        visibles.value.filter((e) => e.fecha === d).sort((a, b) => minutos(a.inicio) - minutos(b.inicio)),
      ]),
    ) as Record<string, Evento[]>,
  )

  const horasPorCategoria = computed(() => {
    const total: Record<Categoria, number> = { trabajo: 0, estudio: 0, salud: 0, personal: 0 }
    for (const e of eventos.value.filter((x) => dias.value.includes(x.fecha))) {
      total[e.categoria] += (minutos(e.fin) - minutos(e.inicio)) / 60
    }
    return total
  })

  function conflictos(datos: DatosEvento, ignorarId?: string): Evento[] {
    return eventos.value.filter((e) => e.id !== ignorarId && e.fecha === datos.fecha && seSuperponen(e, datos))
  }

  function agregar(datos: DatosEvento, repetirSemanas = 0): Evento[] {
    const errores = validar(datos)
    if (errores.length) throw new Error(errores.join(' '))
    const nuevos = Array.from({ length: repetirSemanas + 1 }, (_, i) => ({
      ...datos,
      titulo: datos.titulo.trim(),
      fecha: sumarDias(datos.fecha, i * 7),
      id: crypto.randomUUID(),
    }))
    eventos.value.push(...nuevos)
    return nuevos
  }

  function actualizar(id: string, datos: DatosEvento) {
    const errores = validar(datos)
    if (errores.length) throw new Error(errores.join(' '))
    const i = eventos.value.findIndex((e) => e.id === id)
    if (i === -1) throw new Error('El evento no existe.')
    eventos.value[i] = { ...datos, id }
  }

  function eliminar(id: string) {
    eventos.value = eventos.value.filter((e) => e.id !== id)
  }

  function moverSemana(delta: number) {
    semanaActual.value = sumarDias(semanaActual.value, delta * 7)
  }

  function irAHoy() {
    semanaActual.value = isoLocal(new Date())
  }

  watch(
    eventos,
    (valor) => {
      try {
        globalThis.localStorage?.setItem(CLAVE_ALMACEN, JSON.stringify(valor))
      } catch {
        /* almacenamiento no disponible: la agenda sigue funcionando en memoria */
      }
    },
    { deep: true },
  )

  return {
    eventos,
    semanaActual,
    filtro,
    dias,
    porDia,
    horasPorCategoria,
    conflictos,
    agregar,
    actualizar,
    eliminar,
    moverSemana,
    irAHoy,
  }
})
