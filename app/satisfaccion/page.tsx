'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { HiOutlineStar, HiStar, HiOutlineCheckCircle, HiOutlineUserGroup, HiOutlineBriefcase, HiOutlineArrowLeft } from 'react-icons/hi2'
import { FaInstagram, FaLinkedinIn } from 'react-icons/fa6'

interface Ejecutivo { id: string; nombre: string }

type TipoCliente = 'cliente' | 'prospecto'
type Servicio = 'digital_evolution' | 'promotional_workshop' | 'print_shop'
type Gusto = 'beneficios' | 'zona_vip' | 'tematica' | 'obsequios' | 'todo'

const SERVICIOS: { value: Servicio; label: string }[] = [
  { value: 'digital_evolution', label: 'Digital Evolution' },
  { value: 'promotional_workshop', label: 'Promotional Workshop' },
  { value: 'print_shop', label: 'Print Shop' },
]

const GUSTOS: { value: Gusto; label: string; sub?: string }[] = [
  { value: 'beneficios', label: 'Beneficios', sub: 'Uber, estacionamiento, comida, etc.' },
  { value: 'zona_vip',   label: 'Zona VIP' },
  { value: 'tematica',   label: 'Temática del Stand' },
  { value: 'obsequios',  label: 'Obsequios' },
  { value: 'todo',       label: 'Todo' },
]

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
    servicioInteres: '' as Servicio | '',
    npsScore: 10,
    gustoMas: [] as Gusto[],
    satisfaccionAsesor: 5,
    npsAsesor: 10,
  })
  const [tipoCliente, setTipoCliente] = useState<TipoCliente | null>(null)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'intro' | 'tipo' | 'form'>('intro')
  const [done, setDone] = useState<{ numeroTicket: number; diaRifa: string } | null>(null)

  useEffect(() => {
    fetch('/api/satisfaccion/ejecutivos').then(r => r.json()).then(setEjecutivos)
  }, [])

  const toggleGusto = (g: Gusto) => {
    setForm(prev => {
      // "todo" is mutually exclusive with the rest — picking it clears others; picking any other clears "todo"
      if (g === 'todo') {
        const had = prev.gustoMas.includes('todo')
        return { ...prev, gustoMas: had ? [] : ['todo'] }
      }
      const withoutTodo = prev.gustoMas.filter(v => v !== 'todo')
      const next = withoutTodo.includes(g)
        ? withoutTodo.filter(v => v !== g)
        : [...withoutTodo, g]
      return { ...prev, gustoMas: next }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (tipoCliente === 'cliente') {
      if (!form.ejecutivoId) { toast.error('Selecciona tu asesor de ventas'); return }
      if (form.gustoMas.length === 0) { toast.error('Selecciona qué te gustó más de la experiencia'); return }
      if (!form.servicioInteres) { toast.error('Selecciona qué servicio te interesó más'); return }
      if (!form.comentario.trim()) { toast.error('Comparte tu experiencia para enviar el formulario'); return }
    }
    if (tipoCliente === 'prospecto' && !form.servicioInteres) { toast.error('Selecciona un servicio de interés'); return }
    setLoading(true)
    const payload = {
      ...form,
      tipoCliente,
      // Only send relevant fields per tipo
      ejecutivoId: tipoCliente === 'cliente' ? form.ejecutivoId : null,
      cargo: tipoCliente === 'cliente' ? form.cargo : '',
      servicioInteres: form.servicioInteres || null, // both tipos answer this
      npsScore: form.npsScore,                        // both tipos answer the company NPS
      gustoMas: tipoCliente === 'cliente' ? form.gustoMas : [],
      satisfaccionAsesor: tipoCliente === 'cliente' ? form.satisfaccionAsesor : null,
      npsAsesor: tipoCliente === 'cliente' ? form.npsAsesor : null,
      comentario: tipoCliente === 'cliente' ? form.comentario : '',
    }
    const res = await fetch('/api/satisfaccion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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

  const pickTipo = (t: TipoCliente) => {
    setTipoCliente(t)
    setStep('form')
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

  if (step === 'intro') {
    return (
      <div style={{ minHeight: '100vh', padding: '20px', background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '480px', width: '100%', background: 'white', borderRadius: '16px', padding: '36px 28px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 6px', color: '#1a1a1a' }}>Expo Publicitas 2026</h1>
          <p style={{ fontSize: '14px', color: '#6b6b7b', margin: '0 0 28px' }}>
            ¡Bienvenido! Antes de continuar, síguenos en nuestras redes y entérate de promociones, ideas y novedades.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
            <a
              href="https://instagram.com/generandoideasgi"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '14px 18px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                color: 'white',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '15px',
                boxShadow: '0 6px 18px rgba(220,39,67,0.25)',
              }}
            >
              <FaInstagram style={{ fontSize: '22px' }} /> Síguenos en Instagram
            </a>
            <a
              href="https://www.linkedin.com/company/generandoideas"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '14px 18px',
                borderRadius: '12px',
                background: '#0077b5',
                color: 'white',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '15px',
                boxShadow: '0 6px 18px rgba(0,119,181,0.25)',
              }}
            >
              <FaLinkedinIn style={{ fontSize: '22px' }} /> Síguenos en LinkedIn
            </a>
          </div>

          <button
            type="button"
            onClick={() => setStep('tipo')}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', fontSize: '15px', padding: '14px' }}
          >
            Continuar al formulario →
          </button>
          <p style={{ fontSize: '12px', color: '#9b9bab', margin: '14px 0 0' }}>
            Llena el formulario para participar en la rifa de hoy.
          </p>
        </div>
      </div>
    )
  }

  if (step === 'tipo') {
    return (
      <div style={{ minHeight: '100vh', padding: '20px', background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '480px', width: '100%', background: 'white', borderRadius: '16px', padding: '36px 28px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
          <button
            type="button"
            onClick={() => setStep('intro')}
            style={{ background: 'transparent', border: 'none', color: '#6b6b7b', fontSize: '13px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: 0, marginBottom: '16px' }}
          >
            <HiOutlineArrowLeft /> Atrás
          </button>
          <h1 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 6px', color: '#1a1a1a', textAlign: 'center' }}>¿Eres cliente o prospecto?</h1>
          <p style={{ fontSize: '13px', color: '#6b6b7b', margin: '0 0 24px', textAlign: 'center' }}>
            Selecciona la opción que mejor te describe.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <button
              type="button"
              onClick={() => pickTipo('cliente')}
              style={{
                background: 'white',
                border: '2px solid #F5821F',
                borderRadius: '14px',
                padding: '24px 16px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s',
                color: '#1a1a1a',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#fff7ed'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <HiOutlineBriefcase style={{ fontSize: '40px', color: '#F5821F' }} />
              <span style={{ fontSize: '16px', fontWeight: 700 }}>Soy cliente</span>
              <span style={{ fontSize: '11px', color: '#9b9bab', textAlign: 'center', lineHeight: 1.3 }}>Ya trabajo con Generando Ideas</span>
            </button>
            <button
              type="button"
              onClick={() => pickTipo('prospecto')}
              style={{
                background: 'white',
                border: '2px solid #2BA9A0',
                borderRadius: '14px',
                padding: '24px 16px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s',
                color: '#1a1a1a',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#f0fdfa'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <HiOutlineUserGroup style={{ fontSize: '40px', color: '#2BA9A0' }} />
              <span style={{ fontSize: '16px', fontWeight: 700 }}>Soy prospecto</span>
              <span style={{ fontSize: '11px', color: '#9b9bab', textAlign: 'center', lineHeight: 1.3 }}>Aún no soy cliente</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  const isCliente = tipoCliente === 'cliente'
  const accent = isCliente ? '#F5821F' : '#2BA9A0'

  return (
    <div style={{ minHeight: '100vh', padding: '20px', background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto', background: 'white', borderRadius: '16px', padding: '32px 28px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
        <button
          type="button"
          onClick={() => setStep('tipo')}
          style={{ background: 'transparent', border: 'none', color: '#6b6b7b', fontSize: '13px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: 0, marginBottom: '12px' }}
        >
          <HiOutlineArrowLeft /> Atrás
        </button>
        <h1 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 4px', color: '#1a1a1a' }}>Expo Publicitas 2026</h1>
        <p style={{ fontSize: '13px', color: '#6b6b7b', margin: '0 0 4px' }}>
          {isCliente ? 'Cuéntanos sobre tu experiencia y participa en la rifa de hoy.' : 'Ayúdanos a conocerte mejor y participa en la rifa de hoy.'}
        </p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 700, color: accent, background: isCliente ? '#fff7ed' : '#f0fdfa', padding: '4px 10px', borderRadius: '999px', marginBottom: '20px' }}>
          {isCliente ? <HiOutlineBriefcase /> : <HiOutlineUserGroup />}
          {isCliente ? 'Cliente' : 'Prospecto'}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre completo *</label>
            <input className="input" required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Tu nombre" />
          </div>
          {isCliente ? (
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
          ) : (
            <div className="form-group">
              <label>Empresa *</label>
              <input className="input" required value={form.empresa} onChange={e => setForm({ ...form, empresa: e.target.value })} placeholder="Tu empresa" />
            </div>
          )}
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
            <label>¿Cómo calificas la experiencia en Expo Publicitas? *</label>
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
                    color: n <= form.rating ? accent : '#e8e8ec',
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
          {isCliente && (
            <>
              <div className="form-group">
                <label>¿Qué tan probable es que recomiendes a Generando Ideas a un colega? *</label>
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {Array.from({ length: 11 }, (_, n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setForm({ ...form, npsScore: n })}
                        style={{
                          flex: '1 0 calc(9.09% - 4px)',
                          minWidth: '34px',
                          padding: '10px 0',
                          borderRadius: '8px',
                          border: form.npsScore === n ? `2px solid ${accent}` : '1px solid #e8e8ec',
                          background: form.npsScore === n ? accent : 'white',
                          color: form.npsScore === n ? 'white' : '#1a1a1a',
                          fontWeight: 700,
                          fontSize: '14px',
                          cursor: 'pointer',
                          transition: 'all 0.12s',
                        }}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#9b9bab', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    <span>Nada probable</span>
                    <span>Muy probable</span>
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>¿Qué te gustó más de la experiencia? *</label>
                <p style={{ fontSize: '11px', color: '#9b9bab', margin: '0 0 8px' }}>Puedes seleccionar más de una.</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {GUSTOS.map(g => {
                    const selected = form.gustoMas.includes(g.value)
                    return (
                      <button
                        key={g.value}
                        type="button"
                        onClick={() => toggleGusto(g.value)}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '999px',
                          border: selected ? `2px solid ${accent}` : '2px solid #e8e8ec',
                          background: selected ? '#fff7ed' : 'white',
                          color: selected ? accent : '#1a1a1a',
                          fontWeight: selected ? 700 : 500,
                          fontSize: '13px',
                          cursor: 'pointer',
                          transition: 'all 0.12s',
                          display: 'inline-flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          lineHeight: 1.2,
                        }}
                        aria-pressed={selected}
                      >
                        <span>{selected ? '✓ ' : ''}{g.label}</span>
                        {g.sub && <span style={{ fontSize: '10px', fontWeight: 400, opacity: 0.7 }}>{g.sub}</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="form-group">
                <label>¿Qué servicio fue más interesante? *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', marginTop: '4px' }}>
                  {SERVICIOS.map(s => {
                    const selected = form.servicioInteres === s.value
                    return (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => setForm({ ...form, servicioInteres: s.value })}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '10px',
                          border: selected ? `2px solid ${accent}` : '2px solid #e8e8ec',
                          background: selected ? '#fff7ed' : 'white',
                          color: '#1a1a1a',
                          fontWeight: selected ? 700 : 500,
                          fontSize: '14px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.12s',
                        }}
                      >
                        {selected ? '● ' : '○ '}{s.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div style={{ borderTop: '1px solid #f0f0f4', margin: '8px 0 4px', paddingTop: '12px' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: accent, marginBottom: '8px' }}>
                  Tu asesor de ventas
                </div>
              </div>
              <div className="form-group">
                <label>¿Quién es tu asesor de ventas? *</label>
                <select className="input" required value={form.ejecutivoId} onChange={e => setForm({ ...form, ejecutivoId: e.target.value })}>
                  <option value="">Selecciona a tu asesor</option>
                  {ejecutivos.map(ej => <option key={ej.id} value={ej.id}>{ej.nombre}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>En general, ¿qué tan satisfecho estuviste con la atención de tu vendedor? *</label>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', padding: '8px 0' }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setForm({ ...form, satisfaccionAsesor: n })}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '36px',
                        color: n <= form.satisfaccionAsesor ? accent : '#e8e8ec',
                        padding: '4px',
                        transition: 'transform 0.1s',
                      }}
                      aria-label={`${n} estrellas`}
                    >
                      {n <= form.satisfaccionAsesor ? <HiStar /> : <HiOutlineStar />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>¿Qué probabilidades hay de que recomiendes a tu asesor a un colega? *</label>
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {Array.from({ length: 11 }, (_, n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setForm({ ...form, npsAsesor: n })}
                        style={{
                          flex: '1 0 calc(9.09% - 4px)',
                          minWidth: '34px',
                          padding: '10px 0',
                          borderRadius: '8px',
                          border: form.npsAsesor === n ? `2px solid ${accent}` : '1px solid #e8e8ec',
                          background: form.npsAsesor === n ? accent : 'white',
                          color: form.npsAsesor === n ? 'white' : '#1a1a1a',
                          fontWeight: 700,
                          fontSize: '14px',
                          cursor: 'pointer',
                          transition: 'all 0.12s',
                        }}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#9b9bab', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    <span>Nada probable</span>
                    <span>Muy probable</span>
                  </div>
                </div>
              </div>
            </>
          )}
          {!isCliente && (
            <>
              <div className="form-group">
                <label>¿Qué servicio fue más interesante? *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px', marginTop: '4px' }}>
                  {SERVICIOS.map(s => {
                    const selected = form.servicioInteres === s.value
                    return (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => setForm({ ...form, servicioInteres: s.value })}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '10px',
                          border: selected ? `2px solid ${accent}` : '2px solid #e8e8ec',
                          background: selected ? '#f0fdfa' : 'white',
                          color: '#1a1a1a',
                          fontWeight: selected ? 700 : 500,
                          fontSize: '14px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.12s',
                        }}
                      >
                        {selected ? '● ' : '○ '}{s.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="form-group">
                <label>¿Qué tan probable es que recomiendes a Generando Ideas a un colega? *</label>
                <div style={{ marginTop: '8px' }}>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {Array.from({ length: 11 }, (_, n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setForm({ ...form, npsScore: n })}
                        style={{
                          flex: '1 0 calc(9.09% - 4px)',
                          minWidth: '34px',
                          padding: '10px 0',
                          borderRadius: '8px',
                          border: form.npsScore === n ? `2px solid ${accent}` : '1px solid #e8e8ec',
                          background: form.npsScore === n ? accent : 'white',
                          color: form.npsScore === n ? 'white' : '#1a1a1a',
                          fontWeight: 700,
                          fontSize: '14px',
                          cursor: 'pointer',
                          transition: 'all 0.12s',
                        }}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#9b9bab', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    <span>Nada probable</span>
                    <span>Muy probable</span>
                  </div>
                </div>
              </div>
            </>
          )}
          {isCliente && (
            <div className="form-group">
              <label>Compártenos tu experiencia <span style={{ color: '#F5821F' }}>*</span></label>
              <textarea
                className="input"
                rows={3}
                value={form.comentario}
                onChange={e => setForm({ ...form, comentario: e.target.value })}
                placeholder="Tu comentario aparecerá en nuestras reseñas..."
                required
                style={{ resize: 'vertical' }}
              />
            </div>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              width: '100%',
              justifyContent: 'center',
              fontSize: '15px',
              padding: '12px',
              marginTop: '8px',
              background: accent,
              borderColor: accent,
            }}
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
