'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { HiOutlineArrowLeft, HiTrophy, HiSparkles, HiCheckCircle, HiXCircle } from 'react-icons/hi2'

interface Participante {
  id: string
  nombre: string
  empresa: string
  numeroTicket: number
  diaRifa: string
  ganoEn: string | null
  entregado: boolean
  rechazado: boolean
  ejecutivo: { nombre: string }
}

const DIAS = ['Día 1', 'Día 2', 'Día 3']

const SEGMENT_COLORS = [
  '#F5821F', '#2BA9A0', '#7c3aed', '#dc2626', '#3498db', '#f59e0b',
  '#06b6d4', '#ec4899', '#84cc16', '#8b5cf6', '#ef4444', '#0ea5e9',
]

const WHEEL_SIZE = 540 // px
const SPIN_DURATION = 5500 // ms
const NUMBER_MODE_THRESHOLD = 30 // above this, switch from wheel to number-roll
const ROLL_DURATION = 5000 // ms

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
}

function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`
}

export default function RuletaPage() {
  const [participantes, setParticipantes] = useState<Participante[]>([])
  const [selectedDia, setSelectedDia] = useState('Día 1')
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [pendingWinner, setPendingWinner] = useState<Participante | null>(null)
  const [rollingNumber, setRollingNumber] = useState<number | null>(null)

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/rifa/participantes?dia=${encodeURIComponent(selectedDia)}`)
    if (!res.ok) return
    const data = await res.json()
    setParticipantes(data)
  }, [selectedDia])

  useEffect(() => { fetchData() }, [fetchData])

  // Pool for the wheel: never-selected, never-delivered, never-rejected participants
  const pool = participantes.filter(p => !p.ganoEn && !p.entregado && !p.rechazado)
  const entregados = participantes.filter(p => p.entregado)
  const rechazados = participantes.filter(p => p.rechazado)

  const N = pool.length
  const segmentAngle = N > 0 ? 360 / N : 0
  const radius = WHEEL_SIZE / 2
  const numberMode = N > NUMBER_MODE_THRESHOLD

  const handleSortear = async () => {
    if (spinning || pendingWinner) return
    if (N === 0) { toast.error('No hay participantes elegibles'); return }
    setSpinning(true)
    const res = await fetch('/api/rifa/sortear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dia: selectedDia }),
    })
    if (!res.ok) {
      setSpinning(false)
      const { error } = await res.json()
      toast.error(error || 'Error al sortear')
      return
    }
    const { ganador } = await res.json()

    if (numberMode) {
      // Number-roll mode: cycle ticket numbers, decelerate, land on winner.
      const ticketNumbers = pool.map(p => p.numeroTicket)
      const startTime = performance.now()
      let lastUpdate = 0
      const animate = (now: number) => {
        const elapsed = now - startTime
        const progress = Math.min(elapsed / ROLL_DURATION, 1)
        // Interval decelerates from ~40ms to ~480ms (ease-out quad)
        const eased = 1 - Math.pow(1 - progress, 2)
        const interval = 40 + eased * 440
        if (now - lastUpdate >= interval) {
          lastUpdate = now
          const idx = Math.floor(Math.random() * ticketNumbers.length)
          setRollingNumber(ticketNumbers[idx])
        }
        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setRollingNumber(ganador.numeroTicket)
          setSpinning(false)
          setPendingWinner(ganador)
          fetchData()
        }
      }
      requestAnimationFrame(animate)
      return
    }

    const winnerIdx = pool.findIndex(p => p.id === ganador.id)
    if (winnerIdx < 0) {
      await fetchData()
      setSpinning(false)
      setPendingWinner(ganador)
      return
    }
    // Compute target rotation so winner segment lands at top (12 o'clock pointer)
    const winnerCenter = winnerIdx * segmentAngle + segmentAngle / 2
    const baseSpins = 6 * 360
    const target = baseSpins + (360 - winnerCenter)
    // Add the current rotation so it always spins forward
    setRotation(prev => prev + (target - (prev % 360)))
    setTimeout(async () => {
      setSpinning(false)
      setPendingWinner(ganador)
      await fetchData()
    }, SPIN_DURATION + 200)
  }

  const handleConfirm = async (accepted: boolean) => {
    if (!pendingWinner) return
    const res = await fetch('/api/rifa/confirmar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: pendingWinner.id, accepted }),
    })
    if (!res.ok) { toast.error('Error al actualizar'); return }
    toast.success(accepted ? '✅ Premio entregado' : '❌ Marcado como ausente')
    setPendingWinner(null)
    await fetchData()
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 50%, #4a2c70 100%)',
      color: 'white',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '13px' }}>
            <HiOutlineArrowLeft /> Volver
          </Link>
          <h1 style={{ fontSize: '36px', fontWeight: 800, margin: '8px 0 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <HiSparkles style={{ color: '#F5821F' }} /> Rifa Expo Publicitas
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {DIAS.map(d => (
            <button
              key={d}
              onClick={() => { if (!spinning && !pendingWinner) { setSelectedDia(d); setRotation(0); setRollingNumber(null) } }}
              disabled={spinning || !!pendingWinner}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: selectedDia === d ? '#F5821F' : 'rgba(255,255,255,0.05)',
                color: 'white',
                fontWeight: 600,
                fontSize: '14px',
                cursor: (spinning || pendingWinner) ? 'not-allowed' : 'pointer',
                opacity: (spinning || pendingWinner) ? 0.5 : 1,
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', flex: 1, minHeight: 0 }}>
        {/* Wheel area */}
        <div style={{
          background: 'rgba(0,0,0,0.35)',
          borderRadius: '20px',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.08)',
          overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', width: '100%' }}>
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>Pool elegible</div>
              <div style={{ fontSize: '28px', fontWeight: 800 }}>{N}</div>
            </div>
            <button
              onClick={handleSortear}
              disabled={spinning || N === 0 || !!pendingWinner}
              style={{
                padding: '14px 28px',
                borderRadius: '12px',
                border: 'none',
                background: (spinning || pendingWinner) ? 'rgba(245,130,31,0.3)' : 'linear-gradient(135deg, #F5821F 0%, #ff9b3d 100%)',
                color: 'white',
                fontWeight: 700,
                fontSize: '16px',
                cursor: (spinning || N === 0 || pendingWinner) ? 'not-allowed' : 'pointer',
                boxShadow: (spinning || pendingWinner) ? 'none' : '0 8px 24px rgba(245,130,31,0.4)',
                transition: 'all 0.2s',
              }}
            >
              {spinning ? '🎲 Girando...' : pendingWinner ? '⏳ Confirma o rechaza' : '🎯 Girar ruleta'}
            </button>
          </div>

          {/* Display: number-roll for many participants, SVG wheel for few */}
          {numberMode ? (
            <div style={{
              width: WHEEL_SIZE,
              height: WHEEL_SIZE,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              background: 'radial-gradient(circle at center, rgba(245,130,31,0.18) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.65) 100%)',
              border: '2px solid rgba(245,130,31,0.35)',
              boxShadow: spinning ? '0 0 80px rgba(245,130,31,0.5), inset 0 0 60px rgba(245,130,31,0.15)' : '0 0 40px rgba(245,130,31,0.25)',
              transition: 'box-shadow 0.4s',
              position: 'relative',
            }}>
              <div style={{
                fontSize: '13px',
                textTransform: 'uppercase',
                letterSpacing: '0.28em',
                color: 'rgba(255,255,255,0.55)',
                fontWeight: 700,
                marginBottom: '20px',
              }}>
                {spinning ? 'Sorteando…' : pendingWinner ? '🎉 Ticket ganador' : 'Ticket ganador'}
              </div>
              <div style={{
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                fontSize: '220px',
                fontWeight: 900,
                color: '#F5821F',
                textShadow: spinning
                  ? '0 0 80px rgba(245,130,31,0.85), 0 0 30px rgba(245,130,31,0.6)'
                  : '0 0 50px rgba(245,130,31,0.55), 0 0 20px rgba(245,130,31,0.4)',
                letterSpacing: '-0.04em',
                lineHeight: 1,
                minWidth: '380px',
                textAlign: 'center',
                animation: spinning ? 'pulseGlow 0.5s ease-in-out infinite alternate' : (pendingWinner ? 'winnerPop 0.6s ease-out' : 'none'),
              }}>
                {rollingNumber !== null ? `#${rollingNumber}` : '#---'}
              </div>
              <div style={{
                fontSize: '14px',
                color: 'rgba(255,255,255,0.45)',
                marginTop: '24px',
                letterSpacing: '0.05em',
              }}>
                {N} participantes elegibles
              </div>
            </div>
          ) : (
          <div style={{ position: 'relative', width: WHEEL_SIZE, height: WHEEL_SIZE }}>
            {/* Pointer (fixed at top) */}
            <div style={{
              position: 'absolute',
              top: -8,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '18px solid transparent',
              borderRight: '18px solid transparent',
              borderTop: '32px solid #F5821F',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))',
              zIndex: 3,
            }} />
            {/* Wheel SVG */}
            <svg
              width={WHEEL_SIZE}
              height={WHEEL_SIZE}
              viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: spinning ? `transform ${SPIN_DURATION}ms cubic-bezier(0.16, 1, 0.3, 1)` : 'none',
                display: 'block',
              }}
            >
              <defs>
                <filter id="wheelShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feOffset in="blur" dy="4" result="offsetBlur" />
                  <feMerge>
                    <feMergeNode in="offsetBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {/* Background circle */}
              <circle cx={radius} cy={radius} r={radius - 4} fill="rgba(0,0,0,0.5)" />

              {N === 0 ? (
                <text x={radius} y={radius} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.4)" fontSize="18">
                  Sin participantes
                </text>
              ) : (
                pool.map((p, i) => {
                  const startAngle = i * segmentAngle
                  const endAngle = (i + 1) * segmentAngle
                  const color = SEGMENT_COLORS[i % SEGMENT_COLORS.length]
                  const textAngle = startAngle + segmentAngle / 2
                  const textRadius = radius * 0.6
                  const textPos = polarToCartesian(radius, radius, textRadius, textAngle)
                  const showName = N <= 18
                  return (
                    <g key={p.id}>
                      <path d={arcPath(radius, radius, radius - 6, startAngle, endAngle)} fill={color} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
                      <g transform={`rotate(${textAngle} ${textPos.x} ${textPos.y})`}>
                        <text
                          x={textPos.x}
                          y={textPos.y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fill="white"
                          fontSize={showName ? 13 : 16}
                          fontWeight={700}
                          style={{ pointerEvents: 'none' }}
                        >
                          {showName ? p.nombre.split(' ')[0] : `#${p.numeroTicket}`}
                        </text>
                        {showName && (
                          <text
                            x={textPos.x}
                            y={textPos.y + 14}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="rgba(255,255,255,0.85)"
                            fontSize={10}
                            fontWeight={600}
                            style={{ pointerEvents: 'none' }}
                          >
                            #{p.numeroTicket}
                          </text>
                        )}
                      </g>
                    </g>
                  )
                })
              )}
              {/* Center hub */}
              <circle cx={radius} cy={radius} r={28} fill="white" stroke="rgba(0,0,0,0.2)" strokeWidth={2} />
              <circle cx={radius} cy={radius} r={10} fill="#F5821F" />
            </svg>
          </div>
          )}

          {/* Winner card with confirmation */}
          {pendingWinner && !spinning && (
            <div style={{
              width: '100%',
              background: 'linear-gradient(135deg, #F5821F 0%, #ff9b3d 100%)',
              borderRadius: '16px',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              boxShadow: '0 12px 40px rgba(245,130,31,0.4)',
              animation: 'winnerPop 0.6s ease-out',
            }}>
              <HiTrophy style={{ fontSize: '56px', color: 'white', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, opacity: 0.9 }}>🎉 ¡Posible ganador!</div>
                <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pendingWinner.nombre}</div>
                <div style={{ fontSize: '14px', opacity: 0.9, marginTop: '2px' }}>{pendingWinner.empresa || '—'} · Ticket #{pendingWinner.numeroTicket}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                <button
                  onClick={() => handleConfirm(true)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'rgba(255,255,255,0.95)',
                    color: '#2BA9A0',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <HiCheckCircle /> Confirmar entrega
                </button>
                <button
                  onClick={() => handleConfirm(false)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.4)',
                    background: 'transparent',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <HiXCircle /> No está presente
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Side: ganadores / rechazados */}
        <div style={{
          background: 'rgba(0,0,0,0.35)',
          borderRadius: '20px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.08)',
          overflow: 'hidden',
        }}>
          <div>
            <div style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>
              Premios entregados · {entregados.length}
            </div>
            {entregados.length === 0 ? (
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', padding: '12px 0' }}>Aún no hay ganadores confirmados</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '40vh', overflowY: 'auto' }}>
                {entregados.map((g, idx) => (
                  <div key={g.id} style={{ background: 'rgba(43,169,160,0.12)', border: '1px solid rgba(43,169,160,0.3)', borderRadius: '10px', padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <HiTrophy style={{ color: '#2BA9A0' }} />
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, color: '#2BA9A0' }}>#{idx + 1}</span>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 700 }}>{g.nombre}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{g.empresa || '—'} · Ticket #{g.numeroTicket}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {rechazados.length > 0 && (
            <div>
              <div style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
                Ausentes · {rechazados.length}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '20vh', overflowY: 'auto' }}>
                {rechazados.map(r => (
                  <div key={r.id} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '8px 10px', fontSize: '12px' }}>
                    <div style={{ color: 'rgba(255,255,255,0.7)' }}>{r.nombre}</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>Ticket #{r.numeroTicket}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes winnerPop {
          0% { transform: scale(0.85); opacity: 0; }
          60% { transform: scale(1.04); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes pulseGlow {
          0% { transform: scale(1); filter: brightness(1); }
          100% { transform: scale(1.03); filter: brightness(1.15); }
        }
      `}</style>
    </div>
  )
}
