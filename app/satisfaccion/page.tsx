'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { HiOutlineStar, HiStar, HiOutlineCheckCircle } from 'react-icons/hi2'
import { FaInstagram, FaLinkedinIn } from 'react-icons/fa6'

interface Ejecutivo { id: string; nombre: string }

export default function SatisfaccionPage() {
  const [ejecutivos, setEjecutivos] = useState<Ejecutivo[]>([])
  const [form, setForm] = useState({
    nombre: '',
    empresa: '',
    cargo: '',
    email: '',
    telefono: '',
    ejecutivoId: '',
    rating: 5,
    comentario: '',
  })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState<{ numeroTicket: number; diaRifa: string } | null>(null)

  useEffect(() => {
    fetch('/api/satisfaccion/ejecutivos').then(r => r.json()).then(setEjecutivos)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.ejecutivoId) { toast.error('Selecciona el ejecutivo que te atendió'); return }
    setLoading(true)
    const res = await fetch('/api/satisfaccion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setLoading(false)
    if (!res.ok) {
      const { error } = await res.json()
      toast.error(error || 'Error al registrar')
      return
    }
    const data = await res.json()
    setDone({ numeroTicket: data.numeroTicket, diaRifa: data.diaRifa })
  }

  if (done) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)' }}>
        <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center', background: 'white', borderRadius: '16px', padding: '40px 32px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: '64px', color: '#2BA9A0', marginBottom: '12px' }}>
            <HiOutlineCheckCircle style={{ display: 'inline-block' }} />
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, margin: '0 0 12px', color: '#1a1a1a' }}>¡Gracias por participar!</h1>
          <p style={{ fontSize: '15px', color: '#6b6b7b', margin: '0 0 24px', lineHeight: 1.5 }}>
            Tu opinión nos ayuda a mejorar y ya estás participando en la rifa de hoy.
          </p>
          <div style={{ background: '#fff7ed', border: '2px dashed #F5821F', borderRadius: '12px', padding: '20px', marginBottom: '8px' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9b6b3b', fontWeight: 700, marginBottom: '4px' }}>{done.diaRifa}</div>
            <div style={{ fontSize: '13px', color: '#6b6b7b', marginBottom: '6px' }}>Tu número de ticket</div>
            <div style={{ fontSize: '52px', fontWeight: 800, color: '#F5821F', lineHeight: 1 }}>#{done.numeroTicket}</div>
          </div>
          <p style={{ fontSize: '12px', color: '#9b9bab', margin: '20px 0 0' }}>Mantente atento, los ganadores se anunciarán en pantalla.</p>

          <div style={{ marginTop: '28px', paddingTop: '24px', borderTop: '1px solid #f0f0f4' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', margin: '0 0 12px' }}>
              Síguenos para más novedades
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <a
                href="https://instagram.com/generandoideasgi"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                  color: 'white',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '13px',
                  flex: 1,
                  maxWidth: '180px',
                }}
              >
                <FaInstagram style={{ fontSize: '18px' }} /> Instagram
              </a>
              <a
                href="https://www.linkedin.com/company/generandoideas"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  background: '#0077b5',
                  color: 'white',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '13px',
                  flex: 1,
                  maxWidth: '180px',
                }}
              >
                <FaLinkedinIn style={{ fontSize: '18px' }} /> LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', padding: '20px', background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto', background: 'white', borderRadius: '16px', padding: '32px 28px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 6px', color: '#1a1a1a' }}>Expo Publicitas 2026</h1>
        <p style={{ fontSize: '13px', color: '#6b6b7b', margin: '0 0 24px' }}>
          Cuéntanos sobre tu experiencia y participa en la rifa de hoy.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre completo *</label>
            <input className="input" required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Tu nombre" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Empresa</label>
              <input className="input" value={form.empresa} onChange={e => setForm({ ...form, empresa: e.target.value })} placeholder="Tu empresa" />
            </div>
            <div className="form-group">
              <label>Cargo</label>
              <input className="input" value={form.cargo} onChange={e => setForm({ ...form, cargo: e.target.value })} placeholder="Tu cargo" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email *</label>
              <input className="input" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="correo@ejemplo.com" />
            </div>
            <div className="form-group">
              <label>Teléfono</label>
              <input className="input" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} placeholder="+52..." />
            </div>
          </div>
          <div className="form-group">
            <label>¿Quién te atendió? *</label>
            <select className="input" required value={form.ejecutivoId} onChange={e => setForm({ ...form, ejecutivoId: e.target.value })}>
              <option value="">Selecciona el ejecutivo</option>
              {ejecutivos.map(ej => <option key={ej.id} value={ej.id}>{ej.nombre}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>¿Cómo calificas el servicio? *</label>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', padding: '8px 0' }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setForm({ ...form, rating: n })}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '36px',
                    color: n <= form.rating ? '#F5821F' : '#e8e8ec',
                    padding: '4px',
                    transition: 'transform 0.1s',
                  }}
                  onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.92)')}
                  onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                  aria-label={`${n} estrellas`}
                >
                  {n <= form.rating ? <HiStar /> : <HiOutlineStar />}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Compártenos tu experiencia (opcional)</label>
            <textarea
              className="input"
              rows={3}
              value={form.comentario}
              onChange={e => setForm({ ...form, comentario: e.target.value })}
              placeholder="Tu comentario aparecerá en nuestras reseñas..."
              style={{ resize: 'vertical' }}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', fontSize: '15px', padding: '12px', marginTop: '8px' }}
          >
            {loading ? 'Enviando...' : 'Enviar y participar en la rifa'}
          </button>
          <p style={{ fontSize: '11px', color: '#9b9bab', textAlign: 'center', margin: '12px 0 0' }}>
            Al enviar, aceptas el uso de tus datos para activaciones de marketing posteriores.
          </p>
        </form>
      </div>
    </div>
  )
}
