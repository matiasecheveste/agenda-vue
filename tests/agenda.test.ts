/*
 * Agenda semanal — Matías Nicolás Echeveste Cardozo
 * Pruebas del store, las utilidades de fechas y los componentes.
 */
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../src/App.vue'
import { lunesDe, rangoLegible, semana, seSuperponen } from '../src/lib/fechas'
import { CLAVE_ALMACEN, useAgenda, validar } from '../src/stores/agenda'

const base = { titulo: 'Reunión', fecha: '2026-03-04', inicio: '09:00', fin: '10:00', categoria: 'trabajo' as const }

beforeEach(() => {
  localStorage.clear()
  setActivePinia(createPinia())
})

describe('fechas', () => {
  it('calcula la semana desde el lunes', () => {
    expect(lunesDe('2026-03-08')).toBe('2026-03-02') // domingo
    expect(semana('2026-03-04')).toHaveLength(7)
    expect(semana('2026-03-04')[6]).toBe('2026-03-08')
  })
  it('detecta superposiciones sin contar los bordes', () => {
    expect(seSuperponen({ inicio: '09:00', fin: '10:00' }, { inicio: '09:30', fin: '11:00' })).toBe(true)
    expect(seSuperponen({ inicio: '09:00', fin: '10:00' }, { inicio: '10:00', fin: '11:00' })).toBe(false)
  })
})

describe('store', () => {
  it('valida los datos', () => {
    expect(validar({ ...base, titulo: ' ' })).toContain('El título es obligatorio.')
    expect(validar({ ...base, fin: '08:00' })).toContain('La hora de fin debe ser posterior al inicio.')
    expect(() => useAgenda().agregar({ ...base, fin: '08:00' })).toThrow()
  })

  it('agrega eventos repetidos semanalmente y detecta conflictos', () => {
    const agenda = useAgenda()
    const creados = agenda.agregar(base, 3)
    expect(creados.map((e) => e.fecha)).toEqual(['2026-03-04', '2026-03-11', '2026-03-18', '2026-03-25'])
    expect(agenda.conflictos({ ...base, inicio: '09:30', fin: '10:30' })).toHaveLength(1)
    expect(agenda.conflictos({ ...base, fecha: '2026-03-05' })).toHaveLength(0)
  })

  it('agrupa por día, filtra por categoría y suma horas', () => {
    const agenda = useAgenda()
    agenda.semanaActual = '2026-03-04'
    agenda.agregar({ ...base, inicio: '14:00', fin: '15:30' })
    agenda.agregar(base)
    agenda.agregar({ ...base, titulo: 'Gimnasio', categoria: 'salud', fecha: '2026-03-06' })
    expect(agenda.porDia['2026-03-04']!.map((e) => e.inicio)).toEqual(['09:00', '14:00'])
    expect(agenda.horasPorCategoria.trabajo).toBe(2.5)
    agenda.filtro = 'salud'
    expect(agenda.porDia['2026-03-04']).toHaveLength(0)
    expect(agenda.porDia['2026-03-06']).toHaveLength(1)
  })

  it('persiste en localStorage y descarta datos corruptos', async () => {
    const agenda = useAgenda()
    agenda.agregar(base)
    await Promise.resolve()
    expect(JSON.parse(localStorage.getItem(CLAVE_ALMACEN)!)).toHaveLength(1)

    localStorage.setItem(CLAVE_ALMACEN, '{no es json')
    setActivePinia(createPinia())
    expect(useAgenda().eventos).toEqual([])
  })
})

describe('interfaz', () => {
  it('agrega un evento desde el formulario y lo muestra en el día', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    useAgenda().semanaActual = '2026-03-04'
    const app = mount(App, { global: { plugins: [pinia] } })

    await app.find('input[name="titulo"]').setValue('Clase de inglés')
    await app.find('input[name="fecha"]').setValue('2026-03-05')
    await app.find('input[name="inicio"]').setValue('18:00')
    await app.find('input[name="fin"]').setValue('19:30')
    await app.find('select[name="categoria"]').setValue('estudio')
    await app.find('form').trigger('submit')

    const jueves = app.find('[data-fecha="2026-03-05"]')
    expect(jueves.text()).toContain('18:00–19:30 Clase de inglés')
    expect(app.text()).toContain('Evento agregado.')
  })

  it('muestra errores de validación y no agrega', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const app = mount(App, { global: { plugins: [pinia] } })
    await app.find('form').trigger('submit')
    expect(app.find('[role="alert"]').text()).toContain('El título es obligatorio.')
    expect(useAgenda().eventos).toHaveLength(0)
  })

  it('advierte superposiciones antes de guardar', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const agenda = useAgenda()
    agenda.semanaActual = '2026-03-04'
    agenda.agregar(base)
    const app = mount(App, { global: { plugins: [pinia] } })
    await app.find('input[name="titulo"]').setValue('Otra')
    await app.find('input[name="fecha"]').setValue('2026-03-04')
    await app.find('input[name="inicio"]').setValue('09:30')
    await app.find('input[name="fin"]').setValue('10:30')
    expect(app.find('.advertencia').text()).toContain('Reunión (09:00–10:00)')
  })
})

describe('rangoLegible', () => {
  it('nombra la semana sin repetir el mes ni el año', () => {
    expect(rangoLegible('2026-11-02', '2026-11-08')).toBe('2 al 8 de noviembre de 2026')
    expect(rangoLegible('2026-11-30', '2026-12-06')).toBe('30 de noviembre al 6 de diciembre de 2026')
    expect(rangoLegible('2026-12-28', '2027-01-03')).toBe('28 de diciembre de 2026 al 3 de enero de 2027')
  })
})
