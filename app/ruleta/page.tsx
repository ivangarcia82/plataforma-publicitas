'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
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

// Slot machine config
const DIGIT_HEIGHT = 180          // px per digit cell
const REEL_WIDTH = 150            // px reel width
const REEL_CYCLES = [22, 28, 34]  // full 0-9 cycles per spin (more cycles = later lock)
const REEL_LOCK_MS = [2200, 3700, 5200]
const COLUMN_DIGITS = 360         // enough headroom for one spin + the modulo reset trick

function digitsOf(num: number): [number, number, number] {
  const s = String(num).padStart(3, '0').slice(-3)
  return [Number(s[0]), Number(s[1]), Number(s[2])]
}

export default function RuletaPage() {
  const [participantes, setParticipantes] = useState<Participante[]>([])
  const [selectedDia, setSelectedDia] = useState('Día 1')
  const [spinning, setSpinning] = useState(false)
  const [pendingWinner, setPendingWinner] = useState<Participante | null>(null)
  const [scrolled, setScrolled] = useState<[number, number, number]>([0, 0, 0])
  const [animate, setAnimate] = useState<[boolean, boolean, boolean]>([false, false, false])
  const [lockedReels, setLockedReels] = useState<[boolean, boolean, boolean]>([false, false, false])

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

  const handleSortear = async () => {
    if (spinning || pendingWinner) return
    if (N === 0) { toast.error('No hay participantes elegibles'); return }
    setSpinning(true)
    setLockedReels([false, false, false])

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
    const targets = digitsOf(ganador.numeroTicket)

    // Enable transitions for all 3 reels and animate to the landing positions
    setAnimate([true, true, true])
    setScrolled(prev => {
      return prev.map((s, idx) => {
        const currentDigit = s % 10
        const delta = (targets[idx] - currentDigit + 10) % 10
        return s + REEL_CYCLES[idx] * 10 + delta
      }) as [number, number, number]
    })

    // Lock-flash effect per reel as each one stops
    REEL_LOCK_MS.forEach((ms, idx) => {
      setTimeout(() => {
        setLockedReels(prev => {
          const next = [...prev] as [boolean, boolean, boolean]
          next[idx] = true
          return next
        })
      }, ms)
    })

    // After the last reel locks, reveal winner + reset reels invisibly for next spin
    setTimeout(() => {
      setSpinning(false)
      setPendingWinner(ganador)
      fetchData()
      // Invisible reset: disable transitions and modulo the scroll position.
      // The visible digit doesn't change (it's the same digit, just lower in the column).
      setAnimate([false, false, false])
      setScrolled(prev => prev.map(s => s % 10) as [number, number, number])
    }, REEL_LOCK_MS[2] + 400)
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
    setLockedReels([false, false, false])
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
              onClick={() => { if (!spinning && !pendingWinner) { setSelectedDia(d) } }}
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
        {/* Slot machine area */}
        <div style={{
          background: 'rgba(0,0,0,0.35)',
          borderRadius: '20px',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '28px',
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
              {spinning ? '🎰 Girando...' : pendingWinner ? '⏳ Confirma o rechaza' : '🎯 Girar'}
            </button>
          </div>

          <div style={{
            fontSize: '13px',
            textTransform: 'uppercase',
            letterSpacing: '0.28em',
            color: 'rgba(255,255,255,0.55)',
            fontWeight: 700,
          }}>
            {spinning ? 'Sorteando…' : pendingWinner ? '🎉 Ticket ganador' : 'Ticket ganador'}
          </div>

          {/* Slot machine */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '28px 36px',
            borderRadius: '24px',
            background: 'linear-gradient(180deg, rgba(245,130,31,0.18) 0%, rgba(0,0,0,0.45) 50%, rgba(245,130,31,0.12) 100%)',
            border: '2px solid rgba(245,130,31,0.4)',
            boxShadow: spinning
              ? '0 0 80px rgba(245,130,31,0.45), inset 0 0 50px rgba(0,0,0,0.5)'
              : '0 0 30px rgba(245,130,31,0.18), inset 0 0 40px rgba(0,0,0,0.45)',
            transition: 'box-shadow 0.4s',
          }}>
            <div style={{
              fontSize: '120px',
              fontWeight: 900,
              color: '#F5821F',
              textShadow: '0 0 24px rgba(245,130,31,0.55)',
              lineHeight: 1,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              marginRight: '4px',
            }}>#</div>
            {[0, 1, 2].map(idx => (
              <Reel
                key={idx}
                idx={idx}
                scrolled={scrolled[idx]}
                animate={animate[idx]}
                locked={lockedReels[idx]}
              />
            ))}
          </div>

          <div style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.45)',
            letterSpacing: '0.05em',
          }}>
            {N} participantes elegibles
          </div>

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
        @keyframes reelLockPulse {
          0% { transform: scale(1); box-shadow: 0 0 12px rgba(245,130,31,0.25), inset 0 0 30px rgba(0,0,0,0.6); }
          40% { transform: scale(1.06); box-shadow: 0 0 60px rgba(245,130,31,0.95), inset 0 0 30px rgba(0,0,0,0.4); }
          100% { transform: scale(1); box-shadow: 0 0 24px rgba(245,130,31,0.5), inset 0 0 30px rgba(0,0,0,0.55); }
        }
      `}</style>
    </div>
  )
}

function Reel({ idx, scrolled, animate, locked }: { idx: number; scrolled: number; animate: boolean; locked: boolean }) {
  const innerRef = useRef<HTMLDivElement>(null)

  // When `animate` flips from true → false (post-spin reset), suppress the transition
  // for one frame so the modulo-reset doesn't visibly scroll back.
  useEffect(() => {
    const el = innerRef.current
    if (!el) return
    if (!animate) {
      el.style.transition = 'none'
      el.style.transform = `translateY(-${scrolled * DIGIT_HEIGHT}px)`
      // Force layout, then drop the inline override so future renders can use the prop transition
      void el.offsetHeight
      el.style.transition = ''
    } else {
      el.style.transition = ''
      el.style.transform = `translateY(-${scrolled * DIGIT_HEIGHT}px)`
    }
  }, [animate, scrolled])

  return (
    <div
      style={{
        width: REEL_WIDTH,
        height: DIGIT_HEIGHT,
        overflow: 'hidden',
        borderRadius: '14px',
        border: '3px solid rgba(245,130,31,0.55)',
        background: 'linear-gradient(180deg, #0a0418 0%, #1a0a2e 50%, #0a0418 100%)',
        position: 'relative',
        boxShadow: 'inset 0 0 30px rgba(0,0,0,0.7), 0 0 12px rgba(245,130,31,0.25)',
        animation: locked ? 'reelLockPulse 0.45s ease-out' : 'none',
      }}
    >
      <div
        ref={innerRef}
        style={{
          willChange: 'transform',
          transform: `translateY(-${scrolled * DIGIT_HEIGHT}px)`,
          transition: animate ? `transform ${REEL_LOCK_MS[idx]}ms cubic-bezier(0.18, 0.85, 0.25, 1)` : 'none',
        }}
      >
        {Array.from({ length: COLUMN_DIGITS }, (_, i) => (
          <div
            key={i}
            style={{
              height: DIGIT_HEIGHT,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '130px',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontWeight: 900,
              color: '#F5821F',
              textShadow: '0 0 24px rgba(245,130,31,0.55), 0 2px 0 rgba(0,0,0,0.4)',
              lineHeight: 1,
            }}
          >
            {i % 10}
          </div>
        ))}
      </div>
      {/* Edge fade gradients for "behind glass" feel */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '40px',
        background: 'linear-gradient(180deg, rgba(10,4,24,0.9) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px',
        background: 'linear-gradient(0deg, rgba(10,4,24,0.9) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />
    </div>
  )
}
