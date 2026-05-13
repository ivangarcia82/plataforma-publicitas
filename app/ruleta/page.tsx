'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { HiOutlineArrowLeft, HiTrophy, HiSparkles } from 'react-icons/hi2'

interface Participante {
  id: string
  nombre: string
  empresa: string
  numeroTicket: number
  diaRifa: string
  ganoEn: string | null
  ejecutivo: { nombre: string }
}

const DIAS = ['Día 1', 'Día 2', 'Día 3']

const ITEM_HEIGHT = 100

export default function RuletaPage() {
  const [participantes, setParticipantes] = useState<Participante[]>([])
  const [selectedDia, setSelectedDia] = useState('Día 1')
  const [spinning, setSpinning] = useState(false)
  const [winner, setWinner] = useState<Participante | null>(null)
  const [offset, setOffset] = useState(0)
  const stripRef = useRef<HTMLDivElement>(null)

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/rifa/participantes?dia=${encodeURIComponent(selectedDia)}`)
    if (!res.ok) return
    const data = await res.json()
    setParticipantes(data)
  }, [selectedDia])

  useEffect(() => { fetchData() }, [fetchData])

  const elegibles = participantes.filter(p => !p.ganoEn)
  const ganadores = participantes.filter(p => p.ganoEn)

  const handleSortear = async () => {
    if (spinning) return
    if (elegibles.length === 0) {
      toast.error('No hay participantes elegibles para esta rifa')
      return
    }
    setSpinning(true)
    setWinner(null)
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
    const winnerIdx = elegibles.findIndex(p => p.id === ganador.id)
    if (winnerIdx < 0) {
      // fallback: refresh and stop
      await fetchData()
      setSpinning(false)
      setWinner(ganador)
      return
    }
    // Animate strip: scroll fast and end with the winner centered
    // Strip is rendered with elegibles repeated enough times for the animation to feel "long"
    const loops = 6 // how many times to loop through the list
    const finalOffset = (loops * elegibles.length + winnerIdx) * ITEM_HEIGHT
    setOffset(0)
    requestAnimationFrame(() => {
      setOffset(finalOffset)
    })
    // After animation, set winner and refresh
    setTimeout(async () => {
      setWinner(ganador)
      setSpinning(false)
      await fetchData()
    }, 5200)
  }

  // Repeated list for the scrolling strip animation (only includes elegibles for the spin)
  const stripItems: Participante[] = []
  const stripLoops = 7
  for (let i = 0; i < stripLoops; i++) {
    stripItems.push(...elegibles)
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
              onClick={() => { if (!spinning) { setSelectedDia(d); setWinner(null) } }}
              disabled={spinning}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: selectedDia === d ? '#F5821F' : 'rgba(255,255,255,0.05)',
                color: 'white',
                fontWeight: 600,
                fontSize: '14px',
                cursor: spinning ? 'not-allowed' : 'pointer',
                opacity: spinning ? 0.5 : 1,
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', flex: 1, minHeight: 0 }}>
        {/* Main: ruleta strip */}
        <div style={{
          background: 'rgba(0,0,0,0.35)',
          borderRadius: '20px',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div>
              <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>Participantes elegibles</div>
              <div style={{ fontSize: '32px', fontWeight: 800 }}>{elegibles.length}</div>
            </div>
            <button
              onClick={handleSortear}
              disabled={spinning || elegibles.length === 0}
              style={{
                padding: '16px 32px',
                borderRadius: '12px',
                border: 'none',
                background: spinning ? 'rgba(245,130,31,0.3)' : 'linear-gradient(135deg, #F5821F 0%, #ff9b3d 100%)',
                color: 'white',
                fontWeight: 700,
                fontSize: '18px',
                cursor: spinning || elegibles.length === 0 ? 'not-allowed' : 'pointer',
                boxShadow: spinning ? 'none' : '0 8px 24px rgba(245,130,31,0.4)',
                transition: 'all 0.2s',
              }}
            >
              {spinning ? '🎲 Sorteando...' : '🎯 Sortear ahora'}
            </button>
          </div>

          {/* Slot machine strip */}
          <div style={{
            position: 'relative',
            height: `${ITEM_HEIGHT * 3}px`,
            overflow: 'hidden',
            borderRadius: '12px',
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            {/* Selection indicator (center band) */}
            <div style={{
              position: 'absolute',
              top: `${ITEM_HEIGHT}px`,
              left: 0,
              right: 0,
              height: `${ITEM_HEIGHT}px`,
              borderTop: '2px solid #F5821F',
              borderBottom: '2px solid #F5821F',
              background: 'rgba(245,130,31,0.08)',
              pointerEvents: 'none',
              zIndex: 2,
            }} />
            <div
              ref={stripRef}
              style={{
                transform: `translateY(-${offset}px)`,
                transition: spinning ? 'transform 5s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
              }}
            >
              {stripItems.length === 0 ? (
                <div style={{ height: `${ITEM_HEIGHT * 3}px`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: 'rgba(255,255,255,0.4)' }}>
                  No hay participantes para {selectedDia}
                </div>
              ) : stripItems.map((p, i) => (
                <div
                  key={`${p.id}-${i}`}
                  style={{
                    height: `${ITEM_HEIGHT}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 32px',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{
                      fontSize: '36px',
                      fontWeight: 800,
                      color: '#F5821F',
                      minWidth: '80px',
                    }}>
                      #{p.numeroTicket}
                    </div>
                    <div>
                      <div style={{ fontSize: '22px', fontWeight: 700 }}>{p.nombre}</div>
                      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>{p.empresa || '—'}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{p.ejecutivo.nombre}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Winner banner */}
          {winner && !spinning && (
            <div style={{
              marginTop: '8px',
              background: 'linear-gradient(135deg, #F5821F 0%, #ff9b3d 100%)',
              borderRadius: '16px',
              padding: '24px 32px',
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              boxShadow: '0 12px 40px rgba(245,130,31,0.4)',
              animation: 'winnerPop 0.6s ease-out',
            }}>
              <HiTrophy style={{ fontSize: '72px', color: 'white' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700, opacity: 0.9 }}>🎉 ¡Ganador!</div>
                <div style={{ fontSize: '36px', fontWeight: 800, marginTop: '4px' }}>{winner.nombre}</div>
                <div style={{ fontSize: '16px', opacity: 0.9, marginTop: '2px' }}>{winner.empresa || '—'} · Ticket #{winner.numeroTicket}</div>
              </div>
            </div>
          )}
        </div>

        {/* Side: ganadores del día */}
        <div style={{
          background: 'rgba(0,0,0,0.35)',
          borderRadius: '20px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.08)',
          overflow: 'hidden',
        }}>
          <div style={{ fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>Ganadores de {selectedDia}</div>
          {ganadores.length === 0 ? (
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', padding: '24px 0', textAlign: 'center' }}>Aún no hay ganadores</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
              {ganadores.map((g, idx) => (
                <div key={g.id} style={{ background: 'rgba(245,130,31,0.1)', border: '1px solid rgba(245,130,31,0.3)', borderRadius: '10px', padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <HiTrophy style={{ color: '#F5821F' }} />
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, color: '#F5821F' }}>#{idx + 1}</span>
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700 }}>{g.nombre}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{g.empresa || '—'} · Ticket #{g.numeroTicket}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes winnerPop {
          0% { transform: scale(0.8); opacity: 0; }
          60% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
