'use client'

import { useEffect, useState } from 'react'

interface Cita {
  id: string
  cliente: { nombre: string; empresa: { nombre: string } }
  ejecutivo: { nombre: string }
  dia: string
  status: string
  horario: string
  transporte: string
}

const DIAS = ['Día 1', 'Día 2', 'Día 3']
const HORAS = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']

const statusColor = (s: string) => {
  switch (s) {
    case 'Confirmada': return '#2BA9A0'
    case 'Tentativa': return '#F5821F'
    case 'Reagendada': return '#3498db'
    case 'Atendida': return '#6b6b7b'
    default: return '#9b9bab'
  }
}

export default function CalendarioPage() {
  const [citas, setCitas] = useState<Cita[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDia, setSelectedDia] = useState('Día 1')

  useEffect(() => {
    fetch('/api/citas-comerciales')
      .then(r => r.json())
      .then(data => { setCitas(data); setLoading(false) })
  }, [])

  const citasDelDia = citas.filter(c => c.dia === selectedDia)
  const citasSinHorario = citasDelDia.filter(c => !c.horario)

  const getCitaForHour = (hora: string) => {
    return citasDelDia.filter(c => c.horario === hora)
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Calendario de Citas</h1>
          <p className="page-subtitle">Vista por día y horario de todas las visitas comerciales</p>
        </div>
      </div>

      {/* Day selector tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
        {DIAS.map(dia => (
          <button
            key={dia}
            className={`btn ${selectedDia === dia ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedDia(dia)}
            style={{ minWidth: '100px', justifyContent: 'center' }}
          >
            {dia}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2BA9A0', display: 'inline-block' }} /> Confirmada
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F5821F', display: 'inline-block' }} /> Tentativa
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3498db', display: 'inline-block' }} /> Reagendada
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6b6b7b', display: 'inline-block' }} /> Atendida
          </span>
        </div>
      </div>

      {loading ? (
        <div className="empty-state"><p>Cargando...</p></div>
      ) : (
        <>
        {citasSinHorario.length > 0 && (
          <div className="glass-card" style={{ overflow: 'hidden', marginBottom: '16px' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f4', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)' }}>
              Sin horario asignado · {citasSinHorario.length}
            </div>
            <div style={{ padding: '12px 16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {citasSinHorario.map(cita => (
                <div
                  key={cita.id}
                  style={{
                    background: `${statusColor(cita.status)}10`,
                    border: `1px solid ${statusColor(cita.status)}30`,
                    borderLeft: `3px solid ${statusColor(cita.status)}`,
                    borderRadius: '6px',
                    padding: '6px 10px',
                    fontSize: '12px',
                    lineHeight: 1.4,
                    minWidth: '180px',
                  }}
                >
                  <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {cita.cliente.nombre}
                  </div>
                  <div style={{ color: 'var(--color-text-secondary)' }}>
                    {cita.cliente.empresa.nombre} · {cita.ejecutivo.nombre}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          {HORAS.map(hora => {
            const citasHora = getCitaForHour(hora)
            return (
              <div
                key={hora}
                style={{
                  display: 'flex',
                  borderBottom: '1px solid #f0f0f4',
                  minHeight: '56px',
                }}
              >
                {/* Time column */}
                <div
                  style={{
                    width: '70px',
                    flexShrink: 0,
                    padding: '12px 14px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--color-text-muted)',
                    borderRight: '1px solid #f0f0f4',
                    display: 'flex',
                    alignItems: 'flex-start',
                  }}
                >
                  {hora}
                </div>
                {/* Events */}
                <div style={{ flex: 1, padding: '8px 12px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {citasHora.length === 0 ? (
                    <span style={{ fontSize: '12px', color: '#ddd' }}>—</span>
                  ) : (
                    citasHora.map(cita => (
                      <div
                        key={cita.id}
                        style={{
                          background: `${statusColor(cita.status)}10`,
                          border: `1px solid ${statusColor(cita.status)}30`,
                          borderLeft: `3px solid ${statusColor(cita.status)}`,
                          borderRadius: '6px',
                          padding: '6px 10px',
                          fontSize: '12px',
                          lineHeight: 1.4,
                          minWidth: '180px',
                        }}
                      >
                        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                          {cita.cliente.nombre}
                        </div>
                        <div style={{ color: 'var(--color-text-secondary)' }}>
                          {cita.cliente.empresa.nombre} · {cita.ejecutivo.nombre}
                        </div>
                        {cita.transporte && (
                          <div style={{ color: 'var(--color-text-muted)', marginTop: '2px' }}>
                            🚗 {cita.transporte}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
        </>
      )}
    </div>
  )
}
