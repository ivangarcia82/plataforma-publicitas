'use client'

import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineExclamationTriangle } from 'react-icons/hi2'

interface Item {
  id: string
  nombre: string
  stockTotal: number
  stockActual: number
  alertaMinimo: number
}

const emptyForm = { nombre: '', stockTotal: '0', stockActual: '0', alertaMinimo: '5' }

export default function InventarioPage() {
  const [data, setData] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Item | null>(null)
  const [form, setForm] = useState(emptyForm)

  const fetchData = useCallback(async () => {
    const res = await fetch('/api/inventario')
    setData(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true) }
  const openEdit = (item: Item) => {
    setEditing(item)
    setForm({
      nombre: item.nombre,
      stockTotal: String(item.stockTotal),
      stockActual: String(item.stockActual),
      alertaMinimo: String(item.alertaMinimo),
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { ...form, ...(editing ? { id: editing.id } : {}) }
    await fetch('/api/inventario', {
      method: editing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    toast.success(editing ? 'Artículo actualizado' : 'Artículo registrado')
    setShowModal(false)
    fetchData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este artículo del inventario?')) return
    await fetch('/api/inventario', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    toast.success('Artículo eliminado')
    fetchData()
  }

  const lowStockItems = data.filter(i => i.stockActual <= i.alertaMinimo)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Inventario de Obsequios</h1>
          <p className="page-subtitle">Control de stock de artículos para entregar</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <HiOutlinePlus /> Nuevo Artículo
        </button>
      </div>

      {lowStockItems.length > 0 && (
        <div
          style={{
            background: 'rgba(231,76,60,0.06)',
            border: '1px solid rgba(231,76,60,0.2)',
            borderRadius: '10px',
            padding: '14px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <HiOutlineExclamationTriangle style={{ color: '#e74c3c', fontSize: '20px', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <strong style={{ color: '#e74c3c' }}>Stock bajo:</strong>{' '}
            <span style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>
              {lowStockItems.map(i => `${i.nombre} (${i.stockActual} restantes)`).join(', ')}
            </span>
          </div>
        </div>
      )}

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div className="empty-state"><p>Cargando...</p></div>
        ) : data.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📦</div>
            <p>No hay artículos en inventario</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Artículo</th>
                <th>Stock Actual</th>
                <th>Stock Total</th>
                <th>Nivel</th>
                <th>Alerta Mín.</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => {
                const pct = item.stockTotal > 0 ? (item.stockActual / item.stockTotal) * 100 : 0
                const isLow = item.stockActual <= item.alertaMinimo
                const barColor = isLow ? '#e74c3c' : pct > 50 ? '#2BA9A0' : '#F5821F'
                return (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600 }}>{item.nombre}</td>
                    <td>
                      <span style={{ fontWeight: 700, color: isLow ? '#e74c3c' : 'var(--color-text-primary)' }}>
                        {item.stockActual}
                      </span>
                    </td>
                    <td style={{ color: 'var(--color-text-secondary)' }}>{item.stockTotal}</td>
                    <td style={{ minWidth: '140px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1, height: '6px', background: '#f0f0f4', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: '3px', transition: 'width 0.3s ease' }} />
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', minWidth: '32px' }}>{Math.round(pct)}%</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{item.alertaMinimo}</td>
                    <td>
                      <div className="actions-cell">
                        <button className="action-btn" onClick={() => openEdit(item)}><HiOutlinePencil /></button>
                        <button className="action-btn delete" onClick={() => handleDelete(item.id)}><HiOutlineTrash /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 20px' }}>
              {editing ? 'Editar Artículo' : 'Nuevo Artículo'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre del Artículo</label>
                <input className="input" required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Termo, Libreta, Pluma..." />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Stock Total</label>
                  <input className="input" type="number" min="0" required value={form.stockTotal} onChange={e => setForm({ ...form, stockTotal: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Stock Actual</label>
                  <input className="input" type="number" min="0" required value={form.stockActual} onChange={e => setForm({ ...form, stockActual: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Alerta Mínimo (unidades)</label>
                <input className="input" type="number" min="0" value={form.alertaMinimo} onChange={e => setForm({ ...form, alertaMinimo: e.target.value })} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Guardar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
