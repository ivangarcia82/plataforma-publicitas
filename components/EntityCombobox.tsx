// components/EntityCombobox.tsx
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import toast from 'react-hot-toast'

type Tipo = 'ejecutivo' | 'empresa' | 'cliente'

interface EntityOption {
  id: string
  nombre: string
  // campos adicionales que pueden venir según el tipo (ignorados aquí)
  [key: string]: unknown
}

interface EntityComboboxProps {
  tipo: Tipo
  value: string | null
  onChange: (id: string) => void
  empresaId?: string  // requerido cuando tipo='cliente' para encadenar
  required?: boolean
  placeholder?: string
  disabled?: boolean
}

const ENDPOINT: Record<Tipo, string> = {
  ejecutivo: '/api/catalogos/ejecutivos',
  empresa: '/api/catalogos/empresas',
  cliente: '/api/catalogos/clientes',
}

const LABEL: Record<Tipo, string> = {
  ejecutivo: 'ejecutivo',
  empresa: 'empresa',
  cliente: 'contacto',
}

export default function EntityCombobox({
  tipo, value, onChange, empresaId, required, placeholder, disabled,
}: EntityComboboxProps) {
  const [options, setOptions] = useState<EntityOption[]>([])
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [showQuickCreate, setShowQuickCreate] = useState(false)
  const [quickCreateForm, setQuickCreateForm] = useState<Record<string, string | boolean>>({})
  const wrapperRef = useRef<HTMLDivElement>(null)

  const fetchOptions = useCallback(async () => {
    let url = tipo === 'ejecutivo' ? `${ENDPOINT.ejecutivo}?activo=true` : ENDPOINT[tipo]
    if (tipo === 'cliente' && empresaId) {
      url = `${ENDPOINT.cliente}?empresaId=${empresaId}`
    }
    const res = await fetch(url)
    setOptions(await res.json())
  }, [tipo, empresaId])

  useEffect(() => { fetchOptions() }, [fetchOptions])

  // Cierra el dropdown al hacer click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selected = options.find(o => o.id === value)
  const filtered = options.filter(o => o.nombre.toLowerCase().includes(query.toLowerCase()))
  const showCreate = query.trim().length > 0 && !filtered.some(o => o.nombre.toLowerCase() === query.toLowerCase())

  const handleSelect = (id: string) => {
    onChange(id)
    setQuery('')
    setOpen(false)
  }

  const openQuickCreate = () => {
    const initial: Record<string, string | boolean> = { nombre: query.trim() }
    if (tipo === 'ejecutivo') Object.assign(initial, { email: '', telefono: '', cargo: '', activo: true })
    if (tipo === 'empresa') Object.assign(initial, { ciudadEstado: '', notas: '' })
    if (tipo === 'cliente') Object.assign(initial, { cargo: '', email: '', telefono: '', notas: '', empresaId: empresaId || '' })
    setQuickCreateForm(initial)
    setShowQuickCreate(true)
    setOpen(false)
  }

  const handleQuickCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (tipo === 'cliente' && !quickCreateForm.empresaId) {
      toast.error('Selecciona una empresa primero en el formulario.')
      return
    }
    const res = await fetch(ENDPOINT[tipo], {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quickCreateForm),
    })
    if (!res.ok) { toast.error('Error al crear'); return }
    const created = await res.json()
    setOptions(prev => [...prev, created])
    onChange(created.id)
    setShowQuickCreate(false)
    setQuery('')
    toast.success(`${LABEL[tipo].charAt(0).toUpperCase() + LABEL[tipo].slice(1)} creado`)
  }

  const isClienteWithoutEmpresa = tipo === 'cliente' && !empresaId
  const effectivePlaceholder = isClienteWithoutEmpresa
    ? 'Selecciona empresa primero'
    : placeholder || `Buscar ${LABEL[tipo]}...`

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <input
        className="input"
        type="text"
        value={open ? query : (selected?.nombre || '')}
        onFocus={() => { if (!disabled && !isClienteWithoutEmpresa) setOpen(true) }}
        onChange={e => { setQuery(e.target.value); setOpen(true) }}
        placeholder={effectivePlaceholder}
        required={required && !value}
        disabled={disabled || isClienteWithoutEmpresa}
        autoComplete="off"
      />
      {open && (
        <div
          style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
            background: 'var(--color-bg-elevated, white)',
            border: '1px solid var(--color-border)',
            borderRadius: '6px', marginTop: '4px',
            maxHeight: '240px', overflow: 'auto',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}
        >
          {filtered.length === 0 && !showCreate && (
            <div style={{ padding: '12px', color: 'var(--color-text-muted)', fontSize: '13px' }}>Sin resultados</div>
          )}
          {filtered.map(o => (
            <button
              key={o.id}
              type="button"
              onClick={() => handleSelect(o.id)}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '8px 12px', border: 'none', background: 'transparent',
                cursor: 'pointer', fontSize: '14px',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg-hover, #f5f5f5)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              {o.nombre}
            </button>
          ))}
          {showCreate && (
            <button
              type="button"
              onClick={openQuickCreate}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '8px 12px', border: 'none', background: 'transparent',
                cursor: 'pointer', fontSize: '14px',
                color: 'var(--color-primary, #3b82f6)',
                borderTop: filtered.length > 0 ? '1px solid var(--color-border)' : 'none',
              }}
            >
              + Crear &quot;{query.trim()}&quot; como {LABEL[tipo] === 'contacto' ? 'nuevo contacto' : `nueva ${LABEL[tipo]}`}
            </button>
          )}
        </div>
      )}

      {showQuickCreate && (
        <div className="modal-overlay" onClick={() => setShowQuickCreate(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>
              Crear {LABEL[tipo] === 'contacto' ? 'nuevo contacto' : `nueva ${LABEL[tipo]}`}
            </h2>
            <form onSubmit={handleQuickCreateSubmit}>
              <div className="form-group">
                <label>Nombre</label>
                <input
                  className="input" required
                  value={(quickCreateForm.nombre as string) || ''}
                  onChange={e => setQuickCreateForm(p => ({ ...p, nombre: e.target.value }))}
                />
              </div>
              {tipo === 'ejecutivo' && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Cargo</label>
                      <input className="input" value={(quickCreateForm.cargo as string) || ''} onChange={e => setQuickCreateForm(p => ({ ...p, cargo: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input className="input" type="email" value={(quickCreateForm.email as string) || ''} onChange={e => setQuickCreateForm(p => ({ ...p, email: e.target.value }))} />
                    </div>
                  </div>
                </>
              )}
              {tipo === 'empresa' && (
                <div className="form-group">
                  <label>Ciudad / Estado</label>
                  <input className="input" value={(quickCreateForm.ciudadEstado as string) || ''} onChange={e => setQuickCreateForm(p => ({ ...p, ciudadEstado: e.target.value }))} />
                </div>
              )}
              {tipo === 'cliente' && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Cargo</label>
                    <input className="input" value={(quickCreateForm.cargo as string) || ''} onChange={e => setQuickCreateForm(p => ({ ...p, cargo: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input className="input" type="email" value={(quickCreateForm.email as string) || ''} onChange={e => setQuickCreateForm(p => ({ ...p, email: e.target.value }))} />
                  </div>
                </div>
              )}
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowQuickCreate(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Crear y seleccionar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
