'use client'

import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { HiOutlinePlus, HiOutlineTrash, HiOutlineDocumentText, HiOutlinePhoto, HiOutlineLink, HiOutlineArrowDownTray } from 'react-icons/hi2'
import { useCurrentUser } from '@/components/UserContext'

interface Material {
  id: string
  nombre: string
  descripcion: string
  categoria: string
  url: string
  tipo: string
}

const CATEGORIAS = ['General', 'Presentaciones', 'Precios', 'Mapas', 'Contratos', 'Otro']

const tipoIcon = (tipo: string) => {
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(tipo)) return HiOutlinePhoto
  if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'pptx'].includes(tipo)) return HiOutlineDocumentText
  return HiOutlineLink
}

export default function MaterialesPage() {
  const { user } = useCurrentUser()
  const isAdmin = user?.rol === 'admin'
  const [data, setData] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ nombre: '', descripcion: '', categoria: 'General', url: '' })
  const [file, setFile] = useState<File | null>(null)
  const [filterCat, setFilterCat] = useState('')

  const fetchData = useCallback(async () => {
    const res = await fetch('/api/materiales')
    setData(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const openCreate = () => {
    setForm({ nombre: '', descripcion: '', categoria: 'General', url: '' })
    setFile(null)
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file && !form.url.trim()) {
      toast.error('Sube un archivo o ingresa una URL')
      return
    }
    // Vercel serverless body limit ≈ 4.5 MB. Reject early with a clear error.
    if (file && file.size > 4 * 1024 * 1024) {
      toast.error(`Archivo muy grande (${(file.size / 1024 / 1024).toFixed(1)} MB). Máx 4 MB — sube a un servicio externo y pega la URL.`)
      return
    }
    const fd = new FormData()
    fd.append('nombre', form.nombre)
    fd.append('descripcion', form.descripcion)
    fd.append('categoria', form.categoria)
    if (file) fd.append('file', file)
    else fd.append('url', form.url)

    const t = toast.loading('Subiendo material...')
    try {
      const res = await fetch('/api/materiales', { method: 'POST', body: fd })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Error ${res.status}`)
      }
      toast.success('Material registrado', { id: t })
      setShowModal(false)
      fetchData()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al subir', { id: t })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este material?')) return
    try {
      const res = await fetch('/api/materiales', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Error ${res.status}`)
      }
      toast.success('Material eliminado')
      fetchData()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al eliminar')
    }
  }

  const filtered = filterCat ? data.filter(d => d.categoria === filterCat) : data
  const categorias = [...new Set(data.map(d => d.categoria))]

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Materiales Digitales</h1>
          <p className="page-subtitle">Repositorio de documentos, presentaciones y recursos del equipo</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={openCreate}>
            <HiOutlinePlus /> Subir Material
          </button>
        )}
      </div>

      <div className="filters-bar">
        <select className="input" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="">Todas las categorías</option>
          {categorias.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="empty-state"><p>Cargando...</p></div>
      ) : filtered.length === 0 ? (
        <div className="glass-card">
          <div className="empty-state">
            <div className="icon">📂</div>
            <p>No hay materiales registrados</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
          {filtered.map(item => {
            const Icon = tipoIcon(item.tipo)
            return (
              <div key={item.id} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(245,130,31,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F5821F', fontSize: '18px' }}>
                    <Icon />
                  </div>
                  <span className="badge badge-neutral">{item.categoria}</span>
                </div>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 4px', color: 'var(--color-text-primary)' }}>{item.nombre}</h3>
                  {item.descripcion && (
                    <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.4 }}>{item.descripcion}</p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '6px', marginTop: 'auto' }}>
                  <a href={item.url} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>
                    <HiOutlineArrowDownTray /> Descargar
                  </a>
                  {isAdmin && (
                    <button className="action-btn delete" onClick={() => handleDelete(item.id)}>
                      <HiOutlineTrash />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 20px' }}>Subir Material</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre</label>
                <input className="input" required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre del documento" />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <input className="input" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} placeholder="Breve descripción (opcional)" />
              </div>
              <div className="form-group">
                <label>Categoría</label>
                <select className="input" value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}>
                  {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Archivo</label>
                <input
                  className="input"
                  type="file"
                  onChange={e => setFile(e.target.files?.[0] || null)}
                  style={{ padding: '8px' }}
                />
              </div>
              {!file && (
                <div className="form-group">
                  <label>O URL externa</label>
                  <input className="input" value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
                </div>
              )}
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Subir</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
