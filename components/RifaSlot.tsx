'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  HiOutlineArrowLeft, HiTrophy, HiSparkles, HiCheckCircle, HiXCircle, HiOutlineGift,
} from 'react-icons/hi2'

interface Participante {
  id: string
  nombre: string
  empresa: string
  numeroTicket: number
  diaRifa: string
  ganoEn: string | null
  entregado: boolean
  rechazado: boolean
  ejecutivo: { nombre: string } | null
}

type Tipo = 'premium' | 'sencilla'

const DIAS = ['Día 1', 'Día 2', 'Día 3']

// Slot machine config
const DIGIT_HEIGHT = 180
const REEL_WIDTH = 150
const REEL_CYCLES = [22, 28, 34]
const REEL_LOCK_MS = [2200, 3700, 5200]
const COLUMN_DIGITS = 360

function digitsOf(num: number): [number, number, number] {
  const s = String(num).padStart(3, '0').slice(-3)
  return [Number(s[0]), Number(s[1]), Number(s[2])]
}

const PALETTES: Record<Tipo, { accent: string; accentSoft: string; title: string; sub: string; Icon: typeof HiSparkles }> = {
  premium:  { accent: '#F5821F', accentSoft: '#fff7ed', title: 'Rifa Premium',  sub: 'Solo clientes',          Icon: HiSparkles },
  sencilla: { accent: '#2BA9A0', accentSoft: '#f0fdfa', title: 'Rifa Sencilla', sub: 'Clientes y prospectos',  Icon: HiOutlineGift },
}

export default function RifaSlot({ tipo }: { tipo: Tipo }) {
  const p = PALETTES[tipo]
  const [participantes, setParticipantes] = useState<Participante[]>([])
  const [selectedDia, setSelectedDia] = useState('Día 1')
  const [spinning, setSpinning] = useState(false)
  const [pendingWinner, setPendingWinner] = useState<Participante | null>(null)
  const [scrolled, setScrolled] = useState<[number, number, number]>([0, 0, 0])
  const [animate, setAnimate] = useState<[boolean, boolean, boolean]>([false, false, false])
  const [lockedReels, setLockedReels] = useState<[boolean, boolean, boolean]>([false, false, false])

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/rifa/participantes?dia=${encodeURIComponent(selectedDia)}&tipo=${tipo}`)
    if (!res.ok) return
    const data = await res.json()
    setParticipantes(data)
  }, [selectedDia, tipo])

  useEffect(() => { fetchData() }, [fetchData])

  const pool = participantes.filter(x => !x.ganoEn && !x.entregado && !x.rechazado)
  const entregados = participantes.filter(x => x.entregado)
  const rechazados = participantes.filter(x => x.rechazado)
  const N = pool.length

  const handleSortear = async () => {
    if (spinning || pendingWinner) return
    if (N === 0) { toast.error('No hay participantes elegibles'); return }
    setSpinning(true)
    setLockedReels([false, false, false])

    const res = await fetch('/api/rifa/sortear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dia: selectedDia, tipo }),
    })
    if (!res.ok) {
      setSpinning(false)
      const { error } = await res.json()
      toast.error(error || 'Error al sortear')
      return
    }
    const { ganador } = await res.json()
    const targets = digitsOf(ganador.numeroTicket)

    setAnimate([true, true, true])
    setScrolled(prev => {
      return prev.map((s, idx) => {
        const currentDigit = s % 10
        const delta = (targets[idx] - currentDigit + 10) % 10
        return s + REEL_CYCLES[idx] * 10 + delta
      }) as [number, number, number]
    })

    REEL_LOCK_MS.forEach((ms, idx) => {
      setTimeout(() => {
        setLockedReels(prev => {
          const next = [...prev] as [boolean, boolean, boolean]
          next[idx] = true
          return next
        })
      }, ms)
    })

    setTimeout(() => {
      setSpinning(false)
      setPendingWinner(ganador)
      fetchData()
      setAnimate([false, false, false])
      setScrolled(prev => prev.map(s => s % 10) as [number, number, number])
    }, REEL_LOCK_MS[2] + 400)
  }

  const handleConfirm = async (accepted: boolean) => {
    if (!pendingWinner) return
    const res = await fetch('/api/rifa/confirmar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: pendingWinner.id, accepted, tipo }),
    })
    if (!res.ok) { toast.error('Error al actualizar'); return }
    toast.success(accepted ? 'Premio entregado' : 'Marcado como ausente')
    setPendingWinner(null)
    setLockedReels([false, false, false])
    await fetchData()
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#fafafa',
      color: '#1a1a1a',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#6b6b7b', textDecoration: 'none', fontSize: '13px' }}>
            <HiOutlineArrowLeft /> Volver al admin
          </Link>
          <h1 style={{ fontSize: '32px', fontWeight: 800, margin: '6px 0 0', display: 'flex', alignItems: 'center', gap: '10px', color: '#1a1a1a' }}>
            <p.Icon style={{ color: p.accent }} /> {p.title}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {DIAS.map(d => (
            <button
              key={d}
              onClick={() => { if (!spinning && !pendingWinner) { setSelectedDia(d) } }}
              disabled={spinning || !!pendingWinner}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: selectedDia === d ? `2px solid ${p.accent}` : '1px solid #e5e7eb',
                background: selectedDia === d ? p.accent : 'white',
                color: selectedDia === d ? 'white' : '#1a1a1a',
                fontWeight: 700,
                fontSize: '14px',
                cursor: (spinning || pendingWinner) ? 'not-allowed' : 'pointer',
                opacity: (spinning || pendingWinner) ? 0.5 : 1,
                transition: 'all 0.12s',
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', flex: 1, minHeight: 0 }}>
        {/* Slot machine area */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          border: '1px solid #f0f0f4',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', width: '100%' }}>
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9b9bab', fontWeight: 700 }}>Pool elegible</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#1a1a1a' }}>{N}</div>
            </div>
            <button
              onClick={handleSortear}
              disabled={spinning || N === 0 || !!pendingWinner}
              style={{
                padding: '14px 28px',
                borderRadius: '10px',
                border: 'none',
                background: (spinning || pendingWinner) ? '#fbe6d0' : p.accent,
                color: 'white',
                fontWeight: 700,
                fontSize: '15px',
                cursor: (spinning || N === 0 || pendingWinner) ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {spinning ? 'Girando…' : pendingWinner ? 'Confirma o rechaza' : 'Girar'}
            </button>
          </div>

          <div style={{
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.28em',
            color: '#9b9bab',
            fontWeight: 700,
          }}>
            {spinning ? 'Sorteando…' : pendingWinner ? 'Ticket ganador' : 'Ticket ganador'}
          </div>

          {/* Slot machine */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '24px 32px',
            borderRadius: '20px',
            background: '#fafafa',
            border: `2px solid ${p.accent}`,
          }}>
            <div style={{
              fontSize: '120px',
              fontWeight: 900,
              color: p.accent,
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
                accent={p.accent}
              />
            ))}
          </div>

          <div style={{ fontSize: '13px', color: '#9b9bab', letterSpacing: '0.04em' }}>
            {N} participantes elegibles
          </div>

          {/* Winner card */}
          {pendingWinner && !spinning && (
            <div style={{
              width: '100%',
              background: p.accent,
              borderRadius: '14px',
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              animation: 'winnerPop 0.6s ease-out',
            }}>
              <HiTrophy style={{ fontSize: '52px', color: 'white', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, color: 'white', opacity: 0.9 }}>¡Posible ganador!</div>
                <div style={{ fontSize: '26px', fontWeight: 800, marginTop: '2px', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pendingWinner.nombre}</div>
                <div style={{ fontSize: '14px', color: 'white', opacity: 0.95, marginTop: '2px' }}>{pendingWinner.empresa || '—'} · Ticket #{pendingWinner.numeroTicket}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                <button
                  onClick={() => handleConfirm(true)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'white',
                    color: p.accent,
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
                    border: '1px solid rgba(255,255,255,0.65)',
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

        {/* Side: ganadores / ausentes */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          border: '1px solid #f0f0f4',
          boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}>
          <div>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: '#6b6b7b', marginBottom: '10px' }}>
              Premios entregados · {entregados.length}
            </div>
            {entregados.length === 0 ? (
              <div style={{ fontSize: '13px', color: '#9b9bab', padding: '12px 0' }}>Aún no hay ganadores confirmados</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '40vh', overflowY: 'auto' }}>
                {entregados.map((g, idx) => (
                  <div key={g.id} style={{ background: p.accentSoft, border: `1px solid ${p.accent}40`, borderRadius: '10px', padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <HiTrophy style={{ color: p.accent }} />
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, color: p.accent }}>#{idx + 1}</span>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a1a1a' }}>{g.nombre}</div>
                    <div style={{ fontSize: '11px', color: '#6b6b7b' }}>{g.empresa || '—'} · Ticket #{g.numeroTicket}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {rechazados.length > 0 && (
            <div>
              <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: '#9b9bab', marginBottom: '8px' }}>
                Ausentes · {rechazados.length}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '20vh', overflowY: 'auto' }}>
                {rechazados.map(r => (
                  <div key={r.id} style={{ background: '#fafafa', border: '1px solid #f0f0f4', borderRadius: '8px', padding: '8px 10px', fontSize: '12px' }}>
                    <div style={{ color: '#1a1a1a' }}>{r.nombre}</div>
                    <div style={{ color: '#9b9bab', fontSize: '10px' }}>Ticket #{r.numeroTicket}</div>
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
      `}</style>
    </div>
  )
}

function Reel({ idx, scrolled, animate, locked, accent }: { idx: number; scrolled: number; animate: boolean; locked: boolean; accent: string }) {
  const innerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = innerRef.current
    if (!el) return
    if (!animate) {
      el.style.transition = 'none'
      el.style.transform = `translateY(-${scrolled * DIGIT_HEIGHT}px)`
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
        border: `2px solid ${accent}80`,
        background: 'white',
        position: 'relative',
        boxShadow: locked
          ? `0 0 0 4px ${accent}33, inset 0 0 24px ${accent}11`
          : `inset 0 4px 8px rgba(0,0,0,0.05), inset 0 -4px 8px rgba(0,0,0,0.05)`,
        transition: 'box-shadow 0.3s',
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
              color: accent,
              lineHeight: 1,
            }}
          >
            {i % 10}
          </div>
        ))}
      </div>
      {/* Top/bottom fade for "behind glass" feel */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '36px',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 100%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '36px',
        background: 'linear-gradient(0deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 100%)',
        pointerEvents: 'none',
      }} />
    </div>
  )
}
