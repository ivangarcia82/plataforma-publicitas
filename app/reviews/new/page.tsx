'use client'

import { useState } from 'react'

export default function NuevaResenaPage() {
  const [nombre, setNombre] = useState('')
  const [empresa, setEmpresa] = useState('')
  const [cargo, setCargo] = useState('')
  const [rating, setRating] = useState(5)
  const [texto, setTexto] = useState('')
  const [hoverStar, setHoverStar] = useState(0)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nombre.trim() || !texto.trim()) {
      setError('Por favor completa tu nombre y tu reseña.')
      return
    }
    setError('')
    setSending(true)

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, empresa, cargo, rating, texto }),
      })

      if (!res.ok) throw new Error('Error al enviar')

      setSent(true)
    } catch {
      setError('Hubo un problema al enviar tu reseña. Intenta de nuevo.')
    } finally {
      setSending(false)
    }
  }

  function handleReset() {
    setNombre('')
    setEmpresa('')
    setCargo('')
    setRating(5)
    setTexto('')
    setSent(false)
    setError('')
  }

  if (sent) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: '#fff',
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '440px',
          animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '24px',
            background: 'linear-gradient(135deg, #2BA9A0, #38D9A9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '36px', margin: '0 auto 24px',
            boxShadow: '0 8px 24px rgba(43,169,160,0.3)',
            animation: 'successPop 0.5s ease 0.2s both',
          }}>
            ✓
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 8px', color: '#1a1a1a' }}>
            ¡Gracias por tu reseña!
          </h2>
          <p style={{ fontSize: '15px', color: '#6b6b7b', margin: '0 0 32px', lineHeight: 1.6 }}>
            Tu opinión ya está visible en nuestra pantalla en vivo. ¡Apreciamos mucho tu confianza!
          </p>
          <button
            onClick={handleReset}
            style={{
              padding: '12px 28px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #F5821F, #FF6B35)',
              color: '#fff',
              border: 'none',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(245,130,31,0.3)',
              transition: 'all 0.2s ease',
            }}
          >
            Enviar otra reseña
          </button>
        </div>

        <style>{`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(24px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes successPop {
            from { transform: scale(0.5); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: '#fff',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Decorative blurs */}
      <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(245,130,31,0.06)', filter: 'blur(60px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(43,169,160,0.05)', filter: 'blur(50px)', pointerEvents: 'none' }} />

      <div style={{
        width: '100%',
        maxWidth: '520px',
        position: 'relative',
        zIndex: 1,
        animation: 'fadeInUp 0.5s ease',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #F5821F, #FF6B35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '26px', margin: '0 auto 16px',
            boxShadow: '0 6px 20px rgba(245,130,31,0.3)',
          }}>
            ⭐
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 6px', color: '#1a1a1a', letterSpacing: '-0.02em' }}>
            Tu opinión es importante
          </h1>
          <p style={{ fontSize: '14px', color: '#6b6b7b', margin: 0 }}>
            Cuéntanos tu experiencia en Expo Publicitas 2026
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{
          background: '#fff',
          border: '1px solid #e8e8ec',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        }}>
          {/* Name */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>
              Nombre completo <span style={{ color: '#F5821F' }}>*</span>
            </label>
            <input
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej. María González"
              style={inputStyle}
            />
          </div>

          {/* Company + Role row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>Empresa</label>
              <input
                type="text"
                value={empresa}
                onChange={e => setEmpresa(e.target.value)}
                placeholder="Ej. Grupo VTR"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Cargo</label>
              <input
                type="text"
                value={cargo}
                onChange={e => setCargo(e.target.value)}
                placeholder="Ej. Directora de Marketing"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Star Rating */}
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Calificación</label>
            <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
              {[1, 2, 3, 4, 5].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  onMouseEnter={() => setHoverStar(s)}
                  onMouseLeave={() => setHoverStar(0)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '32px',
                    color: s <= (hoverStar || rating) ? '#F5821F' : '#e0e0e0',
                    transition: 'all 0.15s ease',
                    transform: s <= (hoverStar || rating) ? 'scale(1.1)' : 'scale(1)',
                    padding: '2px',
                    lineHeight: 1,
                  }}
                  aria-label={`${s} estrellas`}
                >
                  ★
                </button>
              ))}
              <span style={{ fontSize: '13px', color: '#6b6b7b', alignSelf: 'center', marginLeft: '8px' }}>
                {rating === 5 ? '¡Excelente!' : rating === 4 ? 'Muy bueno' : rating === 3 ? 'Bueno' : rating === 2 ? 'Regular' : 'Malo'}
              </span>
            </div>
          </div>

          {/* Review text */}
          <div style={{ marginBottom: '24px' }}>
            <label style={labelStyle}>
              Tu reseña <span style={{ color: '#F5821F' }}>*</span>
            </label>
            <textarea
              value={texto}
              onChange={e => setTexto(e.target.value)}
              placeholder="Cuéntanos sobre tu experiencia con nuestro servicio..."
              rows={4}
              style={{
                ...inputStyle,
                resize: 'vertical',
                minHeight: '100px',
                lineHeight: 1.6,
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(231,76,60,0.08)',
              color: '#c0392b',
              fontSize: '13px',
              fontWeight: 500,
              marginBottom: '16px',
              border: '1px solid rgba(231,76,60,0.15)',
            }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={sending}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              background: sending
                ? '#ccc'
                : 'linear-gradient(135deg, #F5821F, #FF6B35)',
              color: '#fff',
              border: 'none',
              fontSize: '15px',
              fontWeight: 700,
              cursor: sending ? 'not-allowed' : 'pointer',
              boxShadow: sending ? 'none' : '0 4px 14px rgba(245,130,31,0.3)',
              transition: 'all 0.2s ease',
              letterSpacing: '-0.01em',
            }}
          >
            {sending ? 'Enviando...' : 'Publicar Mi Reseña'}
          </button>
        </form>

        <p style={{
          textAlign: 'center',
          fontSize: '12px',
          color: '#9b9bab',
          margin: '20px 0 0',
        }}>
          Tu reseña aparecerá en la pantalla en vivo al instante ✨
        </p>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

/* ──── Shared styles ──── */
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  color: '#6b6b7b',
  marginBottom: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 14px',
  background: '#f5f5f7',
  border: '1px solid #e8e8ec',
  borderRadius: '10px',
  color: '#1a1a1a',
  fontSize: '14px',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'all 0.15s ease',
}
