/*
 * Agenda semanal — Matías Nicolás Echeveste Cardozo
 * Utilidades de fechas en hora local (sin bibliotecas): semanas que empiezan el lunes, rangos y superposiciones.
 */

export const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] as const

/** Fecha local en formato AAAA-MM-DD. */
export function isoLocal(fecha: Date): string {
  const m = String(fecha.getMonth() + 1).padStart(2, '0')
  const d = String(fecha.getDate()).padStart(2, '0')
  return `${fecha.getFullYear()}-${m}-${d}`
}

export function desdeIso(iso: string): Date {
  const [a, m, d] = iso.split('-').map(Number)
  return new Date(a!, m! - 1, d!)
}

export function sumarDias(iso: string, dias: number): string {
  const f = desdeIso(iso)
  f.setDate(f.getDate() + dias)
  return isoLocal(f)
}

/** Lunes de la semana que contiene la fecha. */
export function lunesDe(iso: string): string {
  const dia = (desdeIso(iso).getDay() + 6) % 7 // 0 = lunes
  return sumarDias(iso, -dia)
}

export function semana(iso: string): string[] {
  const lunes = lunesDe(iso)
  return Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i))
}

/** Convierte HH:MM en minutos desde la medianoche. */
export function minutos(hora: string): number {
  const [h, m] = hora.split(':').map(Number)
  return h! * 60 + m!
}

export function seSuperponen(a: { inicio: string; fin: string }, b: { inicio: string; fin: string }): boolean {
  return minutos(a.inicio) < minutos(b.fin) && minutos(b.inicio) < minutos(a.fin)
}

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'setiembre', 'octubre', 'noviembre', 'diciembre']

/** Rango de una semana en español: «2 al 8 de noviembre de 2026», «30 de noviembre al 6 de diciembre de 2026». */
export function rangoLegible(desde: string, hasta: string): string {
  const d = desdeIso(desde)
  const h = desdeIso(hasta)
  const mes = (f: Date) => MESES[f.getMonth()]
  if (d.getFullYear() !== h.getFullYear()) {
    return `${d.getDate()} de ${mes(d)} de ${d.getFullYear()} al ${h.getDate()} de ${mes(h)} de ${h.getFullYear()}`
  }
  if (d.getMonth() !== h.getMonth()) {
    return `${d.getDate()} de ${mes(d)} al ${h.getDate()} de ${mes(h)} de ${h.getFullYear()}`
  }
  return `${d.getDate()} al ${h.getDate()} de ${mes(h)} de ${h.getFullYear()}`
}

