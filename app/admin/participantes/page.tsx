'use client'

import { useEffect, useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import { HiOutlineTrash, HiOutlineSparkles, HiOutlineMagnifyingGlass, HiOutlineBriefcase, HiOutlineUserGroup } from 'react-icons/hi2'

interface Participante {
  id: string
  nombre: string
  empresa: string
  cargo: string
  email: string
  telefono: string
  diaRifa: string
  numeroTicket: number
  rating: number
  comentario: string
  tipoCliente: string
  servicioInteres: string | null
  npsScore: number | null
  gustoMas: string[]
  satisfaccionAsesor: number | null
  npsAsesor: number | null
  ganoEnPremium: string | null
  entregadoPremium: boolean
  rechazadoPremium: boolean
  ganoEnSencilla: string | null
  entregadoSencilla: boolean
  rechazadoSencilla: boolean
  createdAt: string
  ejecutivo: { id: string; nombre: string } | null
}

const SERVICIO_LABEL: Record<string, string> = {
  digital_evolution: 'Digital Evolution',
  promotional_workshop: 'Promotional Workshop',
  print_shop: 'Print Shop',
}
const GUSTO_LABEL: Record<string, string> = {
  beneficios: 'Beneficios',
  zona_vip: 'Zona VIP',
  tematica: 'Temática',
  obsequios: 'Obsequios',
  todo: 'Todo',
}

export default function AdminParticipantesPage() {
  const [items, setItems] = useState<Participante[]>([])
  const [loading, setLoading] = useState(true)
  const [filterTipo, setFilterTipo] = useState<'all' | 'cliente' | 'prospecto'>('all')
  const [filterDia, setFilterDia] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/participantes')
    if (res.ok) setItems(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const dias = useMemo(() => Array.from(new Set(items.map(i => i.diaRifa))).sort(), [items])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter(p => {
      if (filterTipo !== 'all' && p.tipoCliente !== filterTipo) return false
      if (filterDia !== 'all' && p.diaRifa !== filterDia) return false
      if (q && !(p.nombre.toLowerCase().includes(q) || p.empresa.toLowerCase().includes(q) || p.email.toLowerCase().includes(q))) return false
      return true
    })
  }, [items, filterTipo, filterDia, search])

  const remove = async (p: Participante) => {
    if (!confirm(`¿Eliminar a ${p.nombre} (#${p.numeroTicket})? Esta acción es definitiva.`)) return
    setBusyId(p.id)
    const res = await fetch(`/api/admin/participantes/${p.id}`, { method: 'DELETE' })
    setBusyId(null)
    if (!res.ok) { toast.error('Error al eliminar'); return }
    toast.success('Eliminado')
    setItems(prev => prev.filter(x => x.id !== p.id))
  }

  const countCliente = items.filter(i => i.tipoCliente === 'cliente').length
  const countProspecto = items.filter(i => i.tipoCliente === 'prospecto').length

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <HiOutlineSparkles style={{ color: '#F5821F' }} /> Participantes de la Rifa
          </h1>
          <p style={{ fontSize: '13px', color: '#6b6b7b', margin: '4px 0 0' }}>
            {items.length} registrados · {countCliente} clientes · {countProspecto} prospectos
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <HiOutlineMagnifyingGlass style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9b9bab' }} />
            <input
              className="input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar nombre, empresa, email…"
              style={{ paddingLeft: '32px', minWidth: '240px' }}
            />
          </div>
          <select className="input" value={filterTipo} onChange={e => setFilterTipo(e.target.value as 'all' | 'cliente' | 'prospecto')}>
            <option value="all">Todos los tipos</option>
            <option value="cliente">Solo clientes</option>
            <option value="prospecto">Solo prospectos</option>
          </select>
          <select className="input" value={filterDia} onChange={e => setFilterDia(e.target.value)}>
            <option value="all">Todos los días</option>
            {dias.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#9b9bab' }}>Cargando…</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#9b9bab', background: '#fafafa', borderRadius: '12px' }}>
          {items.length === 0 ? 'Aún no hay participantes registrados.' : 'No hay resultados con esos filtros.'}
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', border: '1px solid #f0f0f4' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#fafafa', borderBottom: '1px solid #f0f0f4' }}>
                  <th style={th}>Ticket</th>
                  <th style={th}>Día</th>
                  <th style={th}>Tipo</th>
                  <th style={th}>Nombre</th>
                  <th style={th}>Empresa</th>
                  <th style={th}>Contacto</th>
                  <th style={th}>Asesor</th>
                  <th style={th}>Rating</th>
                  <th style={th}>NPS GI</th>
                  <th style={th}>Servicio</th>
                  <th style={th}>Gustó más</th>
                  <th style={th}>Sat. Asesor</th>
                  <th style={th}>NPS Asesor</th>
                  <th style={th}>Estado rifa</th>
                  <th style={th}></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const isCliente = p.tipoCliente === 'cliente'
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid #f5f5f9' }}>
                      <td style={td}><span style={{ fontWeight: 700, color: '#F5821F' }}>#{p.numeroTicket}</span></td>
                      <td style={td}>{p.diaRifa}</td>
                      <td style={td}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: isCliente ? '#fff7ed' : '#f0fdfa', color: isCliente ? '#F5821F' : '#2BA9A0' }}>
                          {isCliente ? <HiOutlineBriefcase /> : <HiOutlineUserGroup />}
                          {isCliente ? 'Cliente' : 'Prospecto'}
                        </span>
                      </td>
                      <td style={td}>{p.nombre}</td>
                      <td style={td}>{p.empresa || '—'}</td>
                      <td style={{ ...td, fontSize: '12px', color: '#6b6b7b' }}>
                        <div>{p.email}</div>
                        {p.telefono && <div>{p.telefono}</div>}
                      </td>
                      <td style={td}>{p.ejecutivo?.nombre || '—'}</td>
                      <td style={td}>{p.rating} ⭐</td>
                      <td style={td}>{p.npsScore ?? '—'}</td>
                      <td style={td}>{p.servicioInteres ? SERVICIO_LABEL[p.servicioInteres] : '—'}</td>
                      <td style={{ ...td, maxWidth: '180px' }}>
                        {p.gustoMas.length === 0 ? '—' : p.gustoMas.map(g => GUSTO_LABEL[g] || g).join(', ')}
                      </td>
                      <td style={td}>{p.satisfaccionAsesor ? `${p.satisfaccionAsesor} ⭐` : '—'}</td>
                      <td style={td}>{p.npsAsesor ?? '—'}</td>
                      <td style={{ ...td, fontSize: '11px' }}>
                        {raffleStatus(p)}
                      </td>
                      <td style={td}>
                        <button
                          onClick={() => remove(p)}
                          disabled={busyId === p.id}
                          title="Eliminar"
                          style={{
                            background: 'transparent',
                            border: '1px solid #fee2e2',
                            color: '#dc2626',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            cursor: busyId === p.id ? 'not-allowed' : 'pointer',
                            opacity: busyId === p.id ? 0.5 : 1,
                          }}
                        >
                          <HiOutlineTrash />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6b6b7b', fontWeight: 700, whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '10px 12px', verticalAlign: 'top' }

function raffleStatus(p: Participante) {
  const parts: string[] = []
  if (p.entregadoPremium) parts.push('🏆 Premium')
  else if (p.rechazadoPremium) parts.push('❌ Premium')
  else if (p.ganoEnPremium) parts.push('⏳ Premium')
  if (p.entregadoSencilla) parts.push('🏆 Sencilla')
  else if (p.rechazadoSencilla) parts.push('❌ Sencilla')
  else if (p.ganoEnSencilla) parts.push('⏳ Sencilla')
  return parts.length === 0 ? <span style={{ color: '#9b9bab' }}>En pool</span> : parts.join(' · ')
}
