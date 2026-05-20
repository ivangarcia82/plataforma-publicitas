'use client'

import { useEffect, useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import { HiOutlineTrash, HiOutlineStar, HiStar, HiOutlineMagnifyingGlass } from 'react-icons/hi2'

interface Review {
  id: string
  nombre: string
  empresa: string
  cargo: string
  rating: number
  texto: string
  createdAt: string
}

export default function AdminResenasPage() {
  const [items, setItems] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterRating, setFilterRating] = useState<number | 'all'>('all')
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/reviews')
    if (res.ok) setItems(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter(r => {
      if (filterRating !== 'all' && r.rating !== filterRating) return false
      if (q && !(r.nombre.toLowerCase().includes(q) || r.empresa.toLowerCase().includes(q) || r.texto.toLowerCase().includes(q))) return false
      return true
    })
  }, [items, search, filterRating])

  const remove = async (r: Review) => {
    if (!confirm(`¿Eliminar reseña de ${r.nombre}? Esta acción es definitiva.`)) return
    setBusyId(r.id)
    const res = await fetch(`/api/admin/reviews/${r.id}`, { method: 'DELETE' })
    setBusyId(null)
    if (!res.ok) { toast.error('Error al eliminar'); return }
    toast.success('Eliminada')
    setItems(prev => prev.filter(x => x.id !== r.id))
  }

  const avgRating = items.length === 0 ? 0 : items.reduce((s, r) => s + r.rating, 0) / items.length

  return (
    <div style={{ padding: '24px', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <HiStar style={{ color: '#F5821F' }} /> Reseñas (Admin)
          </h1>
          <p style={{ fontSize: '13px', color: '#6b6b7b', margin: '4px 0 0' }}>
            {items.length} reseñas · Promedio {avgRating.toFixed(1)} ⭐
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <HiOutlineMagnifyingGlass style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9b9bab' }} />
            <input
              className="input"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar nombre, empresa, texto…"
              style={{ paddingLeft: '32px', minWidth: '260px' }}
            />
          </div>
          <select className="input" value={filterRating} onChange={e => setFilterRating(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}>
            <option value="all">Todos los ratings</option>
            {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} estrella{n > 1 ? 's' : ''}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#9b9bab' }}>Cargando…</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#9b9bab', background: '#fafafa', borderRadius: '12px' }}>
          {items.length === 0 ? 'Aún no hay reseñas registradas.' : 'No hay resultados con esos filtros.'}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {filtered.map(r => (
            <div key={r.id} style={{ background: 'white', borderRadius: '12px', padding: '16px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #f0f0f4', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: '15px' }}>{r.nombre}</strong>
                  {r.empresa && <span style={{ fontSize: '13px', color: '#6b6b7b' }}>· {r.empresa}</span>}
                  {r.cargo && <span style={{ fontSize: '12px', color: '#9b9bab' }}>· {r.cargo}</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', margin: '4px 0 8px' }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    n <= r.rating
                      ? <HiStar key={n} style={{ color: '#F5821F', fontSize: '16px' }} />
                      : <HiOutlineStar key={n} style={{ color: '#e8e8ec', fontSize: '16px' }} />
                  ))}
                  <span style={{ fontSize: '11px', color: '#9b9bab', marginLeft: '8px' }}>{new Date(r.createdAt).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                </div>
                <p style={{ fontSize: '13px', color: '#3b3b4b', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{r.texto}</p>
              </div>
              <button
                onClick={() => remove(r)}
                disabled={busyId === r.id}
                title="Eliminar"
                style={{
                  flexShrink: 0,
                  background: 'transparent',
                  border: '1px solid #fee2e2',
                  color: '#dc2626',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  cursor: busyId === r.id ? 'not-allowed' : 'pointer',
                  opacity: busyId === r.id ? 0.5 : 1,
                }}
              >
                <HiOutlineTrash />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
