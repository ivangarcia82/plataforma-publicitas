'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { HiOutlineCheckCircle, HiOutlineClipboardDocumentList } from 'react-icons/hi2'

const ACCION_OPTIONS = ['Catálogo', 'Cotización', 'Cita', 'Otro']

const todayISO = () => {
  const now = new Date()
  const offsetMs = -6 * 60 * 60 * 1000
  return new Date(now.getTime() + offsetMs).toISOString().slice(0, 10)
}

export default function NuevaCitaPage() {
  const [form, setForm] = useState({
    fecha: todayISO(),
    empresaTexto: '',
    contactoTexto: '',
    ejecutivoTexto: '',
    accion: 'Cita',
    notas: '',
  })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.empresaTexto.trim() && !form.contactoTexto.trim()) {
      toast.error('Captura al menos empresa o contacto')
      return
    }
    setLoading(true)
    const res = await fetch('/api/public/citas-generadas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setLoading(false)
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Error al registrar' }))
      toast.error(error || 'Error al registrar')
      return
    }
    setDone(true)
  }

  const resetForm = () => {
    setForm({
      fecha: todayISO(),
      empresaTexto: '',
      contactoTexto: '',
      ejecutivoTexto: '',
      accion: 'Cita',
      notas: '',
    })
    setDone(false)
  }

  if (done) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)' }}>
        <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center', background: 'white', borderRadius: '16px', padding: '40px 32px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: '64px', color: '#2BA9A0', marginBottom: '12px' }}>
            <HiOutlineCheckCircle style={{ display: 'inline-block' }} />
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, margin: '0 0 12px', color: '#1a1a1a' }}>¡Cita registrada!</h1>
          <p style={{ fontSize: '15px', color: '#6b6b7b', margin: '0 0 24px', lineHeight: 1.5 }}>
            Quedó capturada en la plataforma. Le daremos seguimiento a la brevedad.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={resetForm}
            style={{ width: '100%', justifyContent: 'center', fontSize: '15px', padding: '12px' }}
          >
            Registrar otra cita
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', padding: '20px', background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)' }}>
      <div style={{ maxWidth: '520px', margin: '0 auto', background: 'white', borderRadius: '16px', padding: '32px 28px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #F5821F 0%, #f59e0b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px' }}>
            <HiOutlineClipboardDocumentList />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0, color: '#1a1a1a' }}>Registrar Cita</h1>
        </div>
        <p style={{ fontSize: '13px', color: '#6b6b7b', margin: '0 0 24px' }}>
          Captura una cita generada o seguimiento de prospecto. Solo toma unos segundos.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Fecha *</label>
            <input className="input" type="date" required value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Empresa</label>
              <input className="input" value={form.empresaTexto} onChange={e => setForm({ ...form, empresaTexto: e.target.value })} placeholder="Nombre de la empresa" />
            </div>
            <div className="form-group">
              <label>Contacto</label>
              <input className="input" value={form.contactoTexto} onChange={e => setForm({ ...form, contactoTexto: e.target.value })} placeholder="Nombre del contacto" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>¿Quién te atendió?</label>
              <input
                className="input"
                value={form.ejecutivoTexto}
                onChange={e => setForm({ ...form, ejecutivoTexto: e.target.value })}
                placeholder="Nombre de quien te atendió"
              />
            </div>
            <div className="form-group">
              <label>Acción *</label>
              <select className="input" value={form.accion} onChange={e => setForm({ ...form, accion: e.target.value })}>
                {ACCION_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Notas</label>
            <textarea
              className="input"
              rows={3}
              value={form.notas}
              onChange={e => setForm({ ...form, notas: e.target.value })}
              placeholder="Notas de seguimiento, intereses, etc."
              style={{ resize: 'vertical' }}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', fontSize: '15px', padding: '12px', marginTop: '8px' }}
          >
            {loading ? 'Enviando...' : 'Registrar cita'}
          </button>
          <p style={{ fontSize: '11px', color: '#9b9bab', textAlign: 'center', margin: '12px 0 0' }}>
            Captura al menos empresa o contacto. La fecha por defecto es hoy.
          </p>
        </form>
      </div>
    </div>
  )
}
