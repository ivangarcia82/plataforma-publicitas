# Módulo de Catálogos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar los campos de texto libre `ejecutivo`, `empresa` y `nombreCliente` (presentes en Visitas Comerciales, Obsequios y Citas Generadas) por catálogos pre-cargados con autocomplete y quick-create inline, usando relaciones FK.

**Architecture:** Tres modelos Prisma nuevos (Ejecutivo, Empresa, Cliente). Cliente tiene FK a Empresa (1:N). Los modelos operativos pasan a referenciar `ejecutivoId` y `clienteId`. Páginas CRUD bajo `/catalogos/*`. Componente `<EntityCombobox>` reutilizable con quick-create. `onDelete: Restrict` en todas las FKs operativas para preservar integridad histórica.

**Tech Stack:** Next.js 15 (App Router, Server Components), Prisma 6, PostgreSQL, React 19, TypeScript, react-hot-toast, react-icons.

**Spec source:** `docs/superpowers/specs/2026-05-06-modulo-catalogos-design.md`

**Convention notes:**
- No hay test runner instalado. Verificación es manual: `curl` para endpoints, dev server (`npm run dev`) + navegador para UI. Cada tarea termina en commit.
- API routes siguen el patrón existente (ver `app/api/citas-comerciales/route.ts`): `Response.json()` directo, sin librería de validación, errores Prisma se dejan caer al runtime de Next salvo que haya un caso explícito que manejar.
- El usuario confirmó proyecto en setup, sin datos productivos. La migración es destructiva (`prisma migrate reset`).

---

## File Structure

**Created:**
- `prisma/schema.prisma` — modificado (ver Tarea 1)
- `app/api/catalogos/ejecutivos/route.ts`
- `app/api/catalogos/empresas/route.ts`
- `app/api/catalogos/empresas/[id]/route.ts`
- `app/api/catalogos/clientes/route.ts`
- `app/catalogos/ejecutivos/page.tsx`
- `app/catalogos/empresas/page.tsx`
- `app/catalogos/empresas/[id]/page.tsx`
- `app/catalogos/clientes/page.tsx`
- `components/EntityCombobox.tsx`

**Modified:**
- `app/api/citas-comerciales/route.ts` — usar `ejecutivoId`, `clienteId`, `include` relaciones
- `app/api/obsequios/route.ts` — idem
- `app/api/citas-generadas/route.ts` — idem
- `app/api/analytics/route.ts` — agrupar por IDs, resolver nombres con join
- `app/citas-comerciales/page.tsx` — usar `<EntityCombobox>`, mostrar nombres por relación
- `app/obsequios/page.tsx` — idem
- `app/citas-generadas/page.tsx` — idem
- `components/Sidebar.tsx` — nueva sección "Catálogos"

---

## Task 1: Schema + migración destructiva

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Reemplazar `prisma/schema.prisma` completo**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Ejecutivo {
  id        String   @id @default(cuid())
  nombre    String
  email     String   @default("")
  telefono  String   @default("")
  cargo     String   @default("")
  activo    Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  citasComerciales CitaComercial[]
  obsequios        Obsequio[]
  citasGeneradas   CitaGenerada[]
}

model Empresa {
  id           String   @id @default(cuid())
  nombre       String
  ciudadEstado String   @default("")
  notas        String   @default("")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  clientes Cliente[]
}

model Cliente {
  id        String   @id @default(cuid())
  nombre    String
  cargo     String   @default("")
  email     String   @default("")
  telefono  String   @default("")
  notas     String   @default("")
  empresaId String
  empresa   Empresa  @relation(fields: [empresaId], references: [id], onDelete: Restrict)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  citasComerciales CitaComercial[]
  obsequios        Obsequio[]
  citasGeneradas   CitaGenerada[]
}

model CitaComercial {
  id          String   @id @default(cuid())
  ejecutivoId String
  ejecutivo   Ejecutivo @relation(fields: [ejecutivoId], references: [id], onDelete: Restrict)
  clienteId   String
  cliente     Cliente   @relation(fields: [clienteId], references: [id], onDelete: Restrict)
  dia         String
  status      String   @default("Tentativa")
  horario     String
  transporte  String   @default("")
  notas       String   @default("")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model StaffMember {
  id              String   @id @default(cuid())
  nombre          String
  rol             String   @default("Staff")
  diaAsignado     String
  horarioEntrada  String
  horarioSalida   String
  horaComida      String   @default("")
  seccion         String   @default("")
  viaticoCantidad Float    @default(0)
  viaticoStatus   String   @default("Pendiente")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Obsequio {
  id            String   @id @default(cuid())
  fecha         String
  ejecutivoId   String
  ejecutivo     Ejecutivo @relation(fields: [ejecutivoId], references: [id], onDelete: Restrict)
  clienteId     String
  cliente       Cliente   @relation(fields: [clienteId], references: [id], onDelete: Restrict)
  tipoCliente   String   @default("Prospecto")
  articulo      String   @default("")
  observaciones String   @default("")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model CitaGenerada {
  id          String   @id @default(cuid())
  fecha       String
  ejecutivoId String
  ejecutivo   Ejecutivo @relation(fields: [ejecutivoId], references: [id], onDelete: Restrict)
  clienteId   String
  cliente     Cliente   @relation(fields: [clienteId], references: [id], onDelete: Restrict)
  accion      String   @default("Otro")
  notas       String   @default("")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model InventarioObsequio {
  id           String   @id @default(cuid())
  nombre       String
  stockTotal   Int
  stockActual  Int
  alertaMinimo Int      @default(5)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model MaterialDigital {
  id          String   @id @default(cuid())
  nombre      String
  descripcion String   @default("")
  categoria   String   @default("General")
  url         String
  tipo        String   @default("pdf")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Review {
  id        String   @id @default(cuid())
  nombre    String
  empresa   String   @default("")
  cargo     String   @default("")
  rating    Int      @default(5)
  texto     String
  createdAt DateTime @default(now())
}
```

**Cambios respecto al schema actual:**
- Nuevos modelos: `Ejecutivo`, `Empresa`, `Cliente`.
- `CitaComercial`, `Obsequio`, `CitaGenerada`: removidos `ejecutivo`, `empresa`, `nombreCliente`/`nombre` (string). Añadidos `ejecutivoId`, `clienteId` con relaciones.
- `Review` queda con `empresa: String` intacto (no afecta el módulo de catálogos; es feedback de visitantes, no parte del flujo comercial).

- [ ] **Step 2: Reset de la base de datos**

Ejecutar:
```bash
npx prisma migrate reset --force
```

Esperado: tablas existentes se borran, se aplican migraciones previas, base queda vacía. Sin prompts (`--force` salta confirmación).

- [ ] **Step 3: Crear nueva migración**

Ejecutar:
```bash
npx prisma migrate dev --name add_catalogos
```

Esperado: se genera `prisma/migrations/YYYYMMDDHHMMSS_add_catalogos/migration.sql` y la BD queda actualizada. El cliente Prisma se regenera automáticamente.

- [ ] **Step 4: Verificar que el cliente Prisma compila**

Ejecutar:
```bash
npx tsc --noEmit
```

Esperado: el comando termina con errores en `app/api/citas-comerciales/route.ts`, `app/api/obsequios/route.ts`, `app/api/citas-generadas/route.ts`, `app/api/analytics/route.ts`, y las 3 páginas correspondientes (porque referencian campos que ya no existen). **Esto es esperado** — los siguientes tasks los arreglan. Verificar que NO hay errores en otros archivos.

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat(db): add catalogos schema (Ejecutivo, Empresa, Cliente) and FK relations"
```

---

## Task 2: API CRUD de Ejecutivos

**Files:**
- Create: `app/api/catalogos/ejecutivos/route.ts`

- [ ] **Step 1: Crear el endpoint**

```ts
// app/api/catalogos/ejecutivos/route.ts
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const activo = searchParams.get('activo')

  const where: Prisma.EjecutivoWhereInput = {}
  if (activo === 'true') where.activo = true
  if (activo === 'false') where.activo = false

  const ejecutivos = await prisma.ejecutivo.findMany({
    where,
    orderBy: { nombre: 'asc' },
  })
  return Response.json(ejecutivos)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const ejecutivo = await prisma.ejecutivo.create({ data: body })
  return Response.json(ejecutivo, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const { id, ...data } = body
  const ejecutivo = await prisma.ejecutivo.update({ where: { id }, data })
  return Response.json(ejecutivo)
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json()
  try {
    await prisma.ejecutivo.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') {
      return Response.json(
        { error: 'No se puede borrar: tiene registros asociados. Desactívalo en su lugar.' },
        { status: 409 }
      )
    }
    throw e
  }
}
```

- [ ] **Step 2: Verificar manualmente**

Asegurar que dev server corre (`npm run dev`). En otra terminal:

```bash
# Crear
curl -X POST http://localhost:3000/api/catalogos/ejecutivos \
  -H 'Content-Type: application/json' \
  -d '{"nombre":"Juan Pérez","email":"juan@example.com","cargo":"KAM"}'
# Esperado: 201, JSON con id, nombre, email, cargo, activo:true, etc.

# Listar
curl http://localhost:3000/api/catalogos/ejecutivos
# Esperado: array con el ejecutivo creado.

# Listar solo activos
curl 'http://localhost:3000/api/catalogos/ejecutivos?activo=true'
# Esperado: array con el ejecutivo creado.

# Actualizar (sustituye <ID>)
curl -X PUT http://localhost:3000/api/catalogos/ejecutivos \
  -H 'Content-Type: application/json' \
  -d '{"id":"<ID>","activo":false}'
# Esperado: JSON con activo:false.

# Borrar
curl -X DELETE http://localhost:3000/api/catalogos/ejecutivos \
  -H 'Content-Type: application/json' \
  -d '{"id":"<ID>"}'
# Esperado: {"success":true}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/catalogos/ejecutivos/route.ts
git commit -m "feat(api): add ejecutivos catalog CRUD endpoint"
```

---

## Task 3: API CRUD de Empresas

**Files:**
- Create: `app/api/catalogos/empresas/route.ts`
- Create: `app/api/catalogos/empresas/[id]/route.ts`

- [ ] **Step 1: Crear endpoint de listado/CRUD principal**

```ts
// app/api/catalogos/empresas/route.ts
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'

export async function GET() {
  const empresas = await prisma.empresa.findMany({
    orderBy: { nombre: 'asc' },
    include: { _count: { select: { clientes: true } } },
  })
  return Response.json(empresas)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const empresa = await prisma.empresa.create({ data: body })
  return Response.json(empresa, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const { id, ...data } = body
  const empresa = await prisma.empresa.update({ where: { id }, data })
  return Response.json(empresa)
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json()
  try {
    await prisma.empresa.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') {
      return Response.json(
        { error: 'No se puede borrar: la empresa tiene contactos o registros asociados.' },
        { status: 409 }
      )
    }
    throw e
  }
}
```

- [ ] **Step 2: Crear endpoint de detalle (con clientes embebidos)**

```ts
// app/api/catalogos/empresas/[id]/route.ts
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const empresa = await prisma.empresa.findUnique({
    where: { id },
    include: {
      clientes: { orderBy: { nombre: 'asc' } },
    },
  })
  if (!empresa) {
    return Response.json({ error: 'Empresa no encontrada' }, { status: 404 })
  }
  return Response.json(empresa)
}
```

**Nota Next.js 15:** los segmentos dinámicos (`[id]`) reciben `params` como `Promise`. Hay que `await` antes de leer `id`. Esto es un cambio de Next.js 15 respecto a versiones anteriores.

- [ ] **Step 3: Verificar manualmente**

```bash
# Crear empresa
curl -X POST http://localhost:3000/api/catalogos/empresas \
  -H 'Content-Type: application/json' \
  -d '{"nombre":"Coca Cola Femsa","ciudadEstado":"CDMX"}'
# Esperado: 201, JSON con id, nombre, _count probablemente ausente en POST (sin include).

# Listar
curl http://localhost:3000/api/catalogos/empresas
# Esperado: array con _count.clientes:0

# Detalle (sustituye <ID>)
curl http://localhost:3000/api/catalogos/empresas/<ID>
# Esperado: JSON con clientes:[]
```

- [ ] **Step 4: Commit**

```bash
git add app/api/catalogos/empresas/
git commit -m "feat(api): add empresas catalog CRUD and detail endpoint"
```

---

## Task 4: API CRUD de Clientes

**Files:**
- Create: `app/api/catalogos/clientes/route.ts`

- [ ] **Step 1: Crear el endpoint**

```ts
// app/api/catalogos/clientes/route.ts
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  const empresaId = request.nextUrl.searchParams.get('empresaId')

  const where: Prisma.ClienteWhereInput = {}
  if (empresaId) where.empresaId = empresaId

  const clientes = await prisma.cliente.findMany({
    where,
    orderBy: { nombre: 'asc' },
    include: { empresa: true },
  })
  return Response.json(clientes)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const cliente = await prisma.cliente.create({
    data: body,
    include: { empresa: true },
  })
  return Response.json(cliente, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const { id, ...data } = body
  const cliente = await prisma.cliente.update({
    where: { id },
    data,
    include: { empresa: true },
  })
  return Response.json(cliente)
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json()
  try {
    await prisma.cliente.delete({ where: { id } })
    return Response.json({ success: true })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') {
      return Response.json(
        { error: 'No se puede borrar: el cliente tiene citas u obsequios asociados.' },
        { status: 409 }
      )
    }
    throw e
  }
}
```

- [ ] **Step 2: Verificar manualmente**

```bash
# Crear cliente (necesitas un empresaId previo de la Tarea 3)
curl -X POST http://localhost:3000/api/catalogos/clientes \
  -H 'Content-Type: application/json' \
  -d '{"nombre":"Ana López","cargo":"Compras","email":"ana@coca.com","empresaId":"<EMPRESA_ID>"}'
# Esperado: 201, JSON con cliente y empresa anidada.

# Listar
curl http://localhost:3000/api/catalogos/clientes
# Esperado: array con clientes y empresa anidada.

# Filtrar por empresa
curl 'http://localhost:3000/api/catalogos/clientes?empresaId=<EMPRESA_ID>'
# Esperado: solo clientes de esa empresa.
```

- [ ] **Step 3: Commit**

```bash
git add app/api/catalogos/clientes/route.ts
git commit -m "feat(api): add clientes catalog CRUD endpoint"
```

---

## Task 5: Página /catalogos/ejecutivos

**Files:**
- Create: `app/catalogos/ejecutivos/page.tsx`

- [ ] **Step 1: Crear la página**

```tsx
// app/catalogos/ejecutivos/page.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineUserGroup } from 'react-icons/hi2'

interface Ejecutivo {
  id: string
  nombre: string
  email: string
  telefono: string
  cargo: string
  activo: boolean
}

const emptyForm: Omit<Ejecutivo, 'id'> = {
  nombre: '', email: '', telefono: '', cargo: '', activo: true,
}

export default function EjecutivosPage() {
  const [data, setData] = useState<Ejecutivo[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Ejecutivo | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [filterActivo, setFilterActivo] = useState('')

  const fetchData = useCallback(async () => {
    const params = new URLSearchParams()
    if (filterActivo) params.set('activo', filterActivo)
    const res = await fetch(`/api/catalogos/ejecutivos?${params}`)
    setData(await res.json())
    setLoading(false)
  }, [filterActivo])

  useEffect(() => { fetchData() }, [fetchData])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true) }
  const openEdit = (item: Ejecutivo) => {
    setEditing(item)
    setForm({ nombre: item.nombre, email: item.email, telefono: item.telefono, cargo: item.cargo, activo: item.activo })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editing) {
      await fetch('/api/catalogos/ejecutivos', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing.id, ...form }) })
      toast.success('Ejecutivo actualizado')
    } else {
      await fetch('/api/catalogos/ejecutivos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      toast.success('Ejecutivo creado')
    }
    setShowModal(false)
    fetchData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este ejecutivo? Si tiene registros asociados, no se podrá borrar.')) return
    const res = await fetch('/api/catalogos/ejecutivos', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    if (!res.ok) {
      const { error } = await res.json()
      toast.error(error || 'Error al eliminar')
      return
    }
    toast.success('Ejecutivo eliminado')
    fetchData()
  }

  const handleToggleActivo = async (item: Ejecutivo) => {
    await fetch('/api/catalogos/ejecutivos', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: item.id, activo: !item.activo }) })
    toast.success(item.activo ? 'Ejecutivo desactivado' : 'Ejecutivo activado')
    fetchData()
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Ejecutivos</h1>
          <p className="page-subtitle">Catálogo de ejecutivos comerciales</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <HiOutlinePlus /> Nuevo Ejecutivo
        </button>
      </div>

      <div className="filters-bar">
        <select className="input" value={filterActivo} onChange={e => setFilterActivo(e.target.value)}>
          <option value="">Todos</option>
          <option value="true">Solo activos</option>
          <option value="false">Solo inactivos</option>
        </select>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div className="empty-state"><p>Cargando...</p></div>
        ) : data.length === 0 ? (
          <div className="empty-state">
            <div className="icon"><HiOutlineUserGroup /></div>
            <p>No hay ejecutivos registrados</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Cargo</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Estatus</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600 }}>{item.nombre}</td>
                  <td>{item.cargo || '—'}</td>
                  <td>{item.email || '—'}</td>
                  <td>{item.telefono || '—'}</td>
                  <td>
                    <button
                      className={`badge ${item.activo ? 'badge-success' : 'badge-neutral'}`}
                      onClick={() => handleToggleActivo(item)}
                      style={{ cursor: 'pointer', border: 'none' }}
                    >
                      {item.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button className="action-btn" onClick={() => openEdit(item)}><HiOutlinePencil /></button>
                      <button className="action-btn delete" onClick={() => handleDelete(item.id)}><HiOutlineTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px', margin: '0 0 24px' }}>
              {editing ? 'Editar Ejecutivo' : 'Nuevo Ejecutivo'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre completo</label>
                <input className="input" required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Cargo</label>
                  <input className="input" value={form.cargo} onChange={e => setForm({ ...form, cargo: e.target.value })} placeholder="KAM, Senior, etc." />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input className="input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="correo@ejemplo.com" />
                </div>
              </div>
              <div className="form-group">
                <label>Teléfono / WhatsApp</label>
                <input className="input" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} placeholder="+52 ..." />
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.activo} onChange={e => setForm({ ...form, activo: e.target.checked })} />
                  Activo
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Guardar Cambios' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verificar manualmente en el navegador**

Con dev server corriendo, abrir `http://localhost:3000/catalogos/ejecutivos`.

Verificar:
1. Página carga sin error.
2. Botón "Nuevo Ejecutivo" abre modal, formulario crea correctamente, aparece en la tabla.
3. Editar funciona.
4. Click en badge "Activo" lo togglea a "Inactivo".
5. Filtro "Solo inactivos" muestra solo el desactivado.
6. Borrar funciona (sin registros asociados todavía).

- [ ] **Step 3: Commit**

```bash
git add app/catalogos/ejecutivos/
git commit -m "feat(catalogos): add ejecutivos page with CRUD and toggle activo"
```

---

## Task 6: Página /catalogos/empresas (lista)

**Files:**
- Create: `app/catalogos/empresas/page.tsx`

- [ ] **Step 1: Crear la página**

```tsx
// app/catalogos/empresas/page.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineBuildingOffice2 } from 'react-icons/hi2'

interface Empresa {
  id: string
  nombre: string
  ciudadEstado: string
  notas: string
  _count: { clientes: number }
}

const emptyForm = { nombre: '', ciudadEstado: '', notas: '' }

export default function EmpresasPage() {
  const [data, setData] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Empresa | null>(null)
  const [form, setForm] = useState(emptyForm)

  const fetchData = useCallback(async () => {
    const res = await fetch('/api/catalogos/empresas')
    setData(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true) }
  const openEdit = (item: Empresa) => {
    setEditing(item)
    setForm({ nombre: item.nombre, ciudadEstado: item.ciudadEstado, notas: item.notas })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editing) {
      await fetch('/api/catalogos/empresas', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing.id, ...form }) })
      toast.success('Empresa actualizada')
    } else {
      await fetch('/api/catalogos/empresas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      toast.success('Empresa creada')
    }
    setShowModal(false)
    fetchData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta empresa? Si tiene contactos o registros, no se podrá borrar.')) return
    const res = await fetch('/api/catalogos/empresas', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    if (!res.ok) {
      const { error } = await res.json()
      toast.error(error || 'Error al eliminar')
      return
    }
    toast.success('Empresa eliminada')
    fetchData()
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Empresas</h1>
          <p className="page-subtitle">Catálogo de empresas con sus contactos</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <HiOutlinePlus /> Nueva Empresa
        </button>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div className="empty-state"><p>Cargando...</p></div>
        ) : data.length === 0 ? (
          <div className="empty-state">
            <div className="icon"><HiOutlineBuildingOffice2 /></div>
            <p>No hay empresas registradas</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Ciudad / Estado</th>
                <th>Contactos</th>
                <th>Notas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600 }}>
                    <Link href={`/catalogos/empresas/${item.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {item.nombre}
                    </Link>
                  </td>
                  <td>{item.ciudadEstado || '—'}</td>
                  <td><span className="badge badge-neutral">{item._count.clientes}</span></td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.notas || '—'}</td>
                  <td>
                    <div className="actions-cell">
                      <button className="action-btn" onClick={() => openEdit(item)}><HiOutlinePencil /></button>
                      <button className="action-btn delete" onClick={() => handleDelete(item.id)}><HiOutlineTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px', margin: '0 0 24px' }}>
              {editing ? 'Editar Empresa' : 'Nueva Empresa'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre comercial</label>
                <input className="input" required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Empresa S.A. de C.V." />
              </div>
              <div className="form-group">
                <label>Ciudad / Estado</label>
                <input className="input" value={form.ciudadEstado} onChange={e => setForm({ ...form, ciudadEstado: e.target.value })} placeholder="CDMX, Monterrey, etc." />
              </div>
              <div className="form-group">
                <label>Notas</label>
                <textarea className="input" rows={3} value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} placeholder="Notas internas..." style={{ resize: 'vertical' }} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Guardar Cambios' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verificar en el navegador**

Abrir `http://localhost:3000/catalogos/empresas`. Crear, editar, borrar empresa. Verificar columna "Contactos" muestra `0`.

- [ ] **Step 3: Commit**

```bash
git add app/catalogos/empresas/page.tsx
git commit -m "feat(catalogos): add empresas list page with CRUD"
```

---

## Task 7: Página /catalogos/empresas/[id] (detalle con contactos)

**Files:**
- Create: `app/catalogos/empresas/[id]/page.tsx`

- [ ] **Step 1: Crear la página**

```tsx
// app/catalogos/empresas/[id]/page.tsx
'use client'

import { useEffect, useState, useCallback, use } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineArrowLeft } from 'react-icons/hi2'

interface Cliente {
  id: string
  nombre: string
  cargo: string
  email: string
  telefono: string
  notas: string
}

interface Empresa {
  id: string
  nombre: string
  ciudadEstado: string
  notas: string
  clientes: Cliente[]
}

const emptyClienteForm = { nombre: '', cargo: '', email: '', telefono: '', notas: '' }

export default function EmpresaDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Cliente | null>(null)
  const [form, setForm] = useState(emptyClienteForm)

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/catalogos/empresas/${id}`)
    if (!res.ok) {
      setLoading(false)
      return
    }
    setEmpresa(await res.json())
    setLoading(false)
  }, [id])

  useEffect(() => { fetchData() }, [fetchData])

  const openCreate = () => { setEditing(null); setForm(emptyClienteForm); setShowModal(true) }
  const openEdit = (item: Cliente) => {
    setEditing(item)
    setForm({ nombre: item.nombre, cargo: item.cargo, email: item.email, telefono: item.telefono, notas: item.notas })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editing) {
      await fetch('/api/catalogos/clientes', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing.id, ...form, empresaId: id }) })
      toast.success('Contacto actualizado')
    } else {
      await fetch('/api/catalogos/clientes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, empresaId: id }) })
      toast.success('Contacto agregado')
    }
    setShowModal(false)
    fetchData()
  }

  const handleDelete = async (clienteId: string) => {
    if (!confirm('¿Eliminar este contacto? Si tiene citas u obsequios asociados, no se podrá borrar.')) return
    const res = await fetch('/api/catalogos/clientes', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: clienteId }) })
    if (!res.ok) {
      const { error } = await res.json()
      toast.error(error || 'Error al eliminar')
      return
    }
    toast.success('Contacto eliminado')
    fetchData()
  }

  if (loading) return <div className="empty-state"><p>Cargando...</p></div>
  if (!empresa) return <div className="empty-state"><p>Empresa no encontrada</p></div>

  return (
    <div>
      <div className="page-header">
        <div>
          <Link href="/catalogos/empresas" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-text-muted)', textDecoration: 'none', marginBottom: '8px' }}>
            <HiOutlineArrowLeft /> Volver a Empresas
          </Link>
          <h1 className="page-title">{empresa.nombre}</h1>
          <p className="page-subtitle">{empresa.ciudadEstado || 'Sin ubicación'} · {empresa.clientes.length} contactos</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <HiOutlinePlus /> Agregar Contacto
        </button>
      </div>

      {empresa.notas && (
        <div className="glass-card" style={{ padding: '16px', marginBottom: '16px' }}>
          <strong>Notas:</strong> {empresa.notas}
        </div>
      )}

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {empresa.clientes.length === 0 ? (
          <div className="empty-state"><p>No hay contactos en esta empresa</p></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Cargo</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empresa.clientes.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.nombre}</td>
                  <td>{c.cargo || '—'}</td>
                  <td>{c.email || '—'}</td>
                  <td>{c.telefono || '—'}</td>
                  <td>
                    <div className="actions-cell">
                      <button className="action-btn" onClick={() => openEdit(c)}><HiOutlinePencil /></button>
                      <button className="action-btn delete" onClick={() => handleDelete(c.id)}><HiOutlineTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px', margin: '0 0 24px' }}>
              {editing ? 'Editar Contacto' : `Nuevo Contacto en ${empresa.nombre}`}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre completo</label>
                  <input className="input" required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre" />
                </div>
                <div className="form-group">
                  <label>Cargo</label>
                  <input className="input" value={form.cargo} onChange={e => setForm({ ...form, cargo: e.target.value })} placeholder="Director, Compras..." />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input className="input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="correo@ejemplo.com" />
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input className="input" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} placeholder="+52 ..." />
                </div>
              </div>
              <div className="form-group">
                <label>Notas</label>
                <textarea className="input" rows={3} value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} placeholder="Notas..." style={{ resize: 'vertical' }} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Guardar Cambios' : 'Agregar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
```

**Nota:** En componentes cliente de Next.js 15, `params` se desempaqueta con el hook `use()` (importado de React) en lugar de `await`.

- [ ] **Step 2: Verificar en el navegador**

Desde `/catalogos/empresas`, click en el nombre de una empresa. Verificar que carga el detalle, agregar/editar/borrar contactos funciona, y la columna "Contactos" en la lista de empresas se actualiza al volver.

- [ ] **Step 3: Commit**

```bash
git add app/catalogos/empresas/[id]/page.tsx
git commit -m "feat(catalogos): add empresa detail page with contactos management"
```

---

## Task 8: Página /catalogos/clientes (vista global)

**Files:**
- Create: `app/catalogos/clientes/page.tsx`

- [ ] **Step 1: Crear la página**

```tsx
// app/catalogos/clientes/page.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineUsers } from 'react-icons/hi2'

interface Empresa { id: string; nombre: string }
interface Cliente {
  id: string; nombre: string; cargo: string; email: string; telefono: string; notas: string
  empresaId: string
  empresa: Empresa
}

const emptyForm = { nombre: '', cargo: '', email: '', telefono: '', notas: '', empresaId: '' }

export default function ClientesPage() {
  const [data, setData] = useState<Cliente[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Cliente | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [filterEmpresa, setFilterEmpresa] = useState('')

  const fetchData = useCallback(async () => {
    const params = new URLSearchParams()
    if (filterEmpresa) params.set('empresaId', filterEmpresa)
    const [clientesRes, empresasRes] = await Promise.all([
      fetch(`/api/catalogos/clientes?${params}`),
      fetch('/api/catalogos/empresas'),
    ])
    setData(await clientesRes.json())
    setEmpresas(await empresasRes.json())
    setLoading(false)
  }, [filterEmpresa])

  useEffect(() => { fetchData() }, [fetchData])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true) }
  const openEdit = (item: Cliente) => {
    setEditing(item)
    setForm({ nombre: item.nombre, cargo: item.cargo, email: item.email, telefono: item.telefono, notas: item.notas, empresaId: item.empresaId })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.empresaId) { toast.error('Selecciona una empresa'); return }
    if (editing) {
      await fetch('/api/catalogos/clientes', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing.id, ...form }) })
      toast.success('Contacto actualizado')
    } else {
      await fetch('/api/catalogos/clientes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      toast.success('Contacto creado')
    }
    setShowModal(false)
    fetchData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este contacto?')) return
    const res = await fetch('/api/catalogos/clientes', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    if (!res.ok) {
      const { error } = await res.json()
      toast.error(error || 'Error al eliminar')
      return
    }
    toast.success('Contacto eliminado')
    fetchData()
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Clientes</h1>
          <p className="page-subtitle">Búsqueda global de contactos en todas las empresas</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <HiOutlinePlus /> Nuevo Contacto
        </button>
      </div>

      <div className="filters-bar">
        <select className="input" value={filterEmpresa} onChange={e => setFilterEmpresa(e.target.value)}>
          <option value="">Todas las empresas</option>
          {empresas.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
        </select>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div className="empty-state"><p>Cargando...</p></div>
        ) : data.length === 0 ? (
          <div className="empty-state">
            <div className="icon"><HiOutlineUsers /></div>
            <p>No hay contactos registrados</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Cargo</th>
                <th>Empresa</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600 }}>{item.nombre}</td>
                  <td>{item.cargo || '—'}</td>
                  <td>{item.empresa.nombre}</td>
                  <td>{item.email || '—'}</td>
                  <td>{item.telefono || '—'}</td>
                  <td>
                    <div className="actions-cell">
                      <button className="action-btn" onClick={() => openEdit(item)}><HiOutlinePencil /></button>
                      <button className="action-btn delete" onClick={() => handleDelete(item.id)}><HiOutlineTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px', margin: '0 0 24px' }}>
              {editing ? 'Editar Contacto' : 'Nuevo Contacto'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Empresa</label>
                <select className="input" required value={form.empresaId} onChange={e => setForm({ ...form, empresaId: e.target.value })}>
                  <option value="">Selecciona empresa</option>
                  {empresas.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre completo</label>
                  <input className="input" required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Cargo</label>
                  <input className="input" value={form.cargo} onChange={e => setForm({ ...form, cargo: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input className="input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input className="input" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Notas</label>
                <textarea className="input" rows={3} value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} style={{ resize: 'vertical' }} />
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
```

- [ ] **Step 2: Verificar en el navegador**

Abrir `/catalogos/clientes`. Verificar listado global, filtro por empresa, alta requiere empresa, edición funciona.

- [ ] **Step 3: Commit**

```bash
git add app/catalogos/clientes/page.tsx
git commit -m "feat(catalogos): add clientes global page with empresa filter"
```

---

## Task 9: Componente `<EntityCombobox>` con quick-create

**Files:**
- Create: `components/EntityCombobox.tsx`

- [ ] **Step 1: Crear el componente**

```tsx
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
```

**Notas de diseño del componente:**
- Cuando `tipo='cliente'` y no hay `empresaId`, el input se deshabilita y muestra "Selecciona empresa primero". Esto fuerza el orden Empresa → Cliente en los formularios.
- El quick-create del cliente toma `empresaId` del prop, así viene siempre pre-asociado.
- El quick-create solo pide los campos esenciales (nombre + 1-2 más). El resto se completa después desde el módulo de catálogos.
- Para ejecutivos solo lista activos (filtro hardcoded `?activo=true`).

- [ ] **Step 2: Verificar manualmente con un sandbox temporal**

Para validar el componente sin modificar páginas reales todavía, abrir temporalmente `app/page.tsx` y agregar al JSX (sin commitear):

```tsx
{/* TEMP: probar EntityCombobox */}
<EntityCombobox tipo="empresa" value={null} onChange={(id) => console.log('seleccionado', id)} />
```

(Importarlo arriba: `import EntityCombobox from '@/components/EntityCombobox'`)

En el navegador:
1. El input despliega lista al enfocar.
2. Escribir filtra opciones.
3. Escribir un nombre que no existe muestra "+ Crear..." → click abre mini-modal → guardar agrega y selecciona.

Una vez verificado, **revertir** los cambios temporales en `app/page.tsx`.

- [ ] **Step 3: Commit**

```bash
git add components/EntityCombobox.tsx
git commit -m "feat(components): add EntityCombobox with autocomplete and quick-create"
```

---

## Task 10: Integrar EntityCombobox en Visitas Comerciales

**Files:**
- Modify: `app/api/citas-comerciales/route.ts`
- Modify: `app/citas-comerciales/page.tsx`

- [ ] **Step 1: Actualizar el endpoint de citas comerciales**

Reemplazar todo el contenido de `app/api/citas-comerciales/route.ts` con:

```ts
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const dia = searchParams.get('dia')
  const status = searchParams.get('status')
  const ejecutivoId = searchParams.get('ejecutivoId')

  const where: Prisma.CitaComercialWhereInput = {}
  if (dia) where.dia = dia
  if (status) where.status = status
  if (ejecutivoId) where.ejecutivoId = ejecutivoId

  const citas = await prisma.citaComercial.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      ejecutivo: true,
      cliente: { include: { empresa: true } },
    },
  })
  return Response.json(citas)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const cita = await prisma.citaComercial.create({
    data: body,
    include: { ejecutivo: true, cliente: { include: { empresa: true } } },
  })
  return Response.json(cita, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const { id, ...data } = body
  const cita = await prisma.citaComercial.update({
    where: { id },
    data,
    include: { ejecutivo: true, cliente: { include: { empresa: true } } },
  })
  return Response.json(cita)
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json()
  await prisma.citaComercial.delete({ where: { id } })
  return Response.json({ success: true })
}
```

- [ ] **Step 2: Reemplazar `app/citas-comerciales/page.tsx`**

```tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineCalendar } from 'react-icons/hi2'
import EntityCombobox from '@/components/EntityCombobox'

interface Ejecutivo { id: string; nombre: string }
interface Empresa { id: string; nombre: string }
interface Cliente { id: string; nombre: string; empresaId: string; empresa: Empresa }
interface CitaComercial {
  id: string
  ejecutivoId: string
  ejecutivo: Ejecutivo
  clienteId: string
  cliente: Cliente
  dia: string
  status: string
  horario: string
  transporte: string
  notas: string
}

const STATUS_OPTIONS = ['Confirmada', 'Tentativa', 'Reagendada', 'Atendida']
const DIA_OPTIONS = ['Día 1', 'Día 2', 'Día 3']
const TRANSPORTE_OPTIONS = ['', 'Uber', 'Estacionamiento', 'Otro']

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Confirmada: 'badge-success',
    Tentativa: 'badge-warning',
    Reagendada: 'badge-info',
    Atendida: 'badge-accent',
  }
  return map[status] || 'badge-neutral'
}

interface FormState {
  ejecutivoId: string
  empresaId: string  // estado UI: para encadenar el combobox cliente
  clienteId: string
  dia: string
  status: string
  horario: string
  transporte: string
  notas: string
}

const emptyForm: FormState = {
  ejecutivoId: '', empresaId: '', clienteId: '',
  dia: 'Día 1', status: 'Tentativa', horario: '', transporte: '', notas: '',
}

export default function CitasComercialesPage() {
  const [data, setData] = useState<CitaComercial[]>([])
  const [ejecutivos, setEjecutivos] = useState<Ejecutivo[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<CitaComercial | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [filterDia, setFilterDia] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterEjecutivo, setFilterEjecutivo] = useState('')

  const fetchData = useCallback(async () => {
    const params = new URLSearchParams()
    if (filterDia) params.set('dia', filterDia)
    if (filterStatus) params.set('status', filterStatus)
    if (filterEjecutivo) params.set('ejecutivoId', filterEjecutivo)
    const [citasRes, ejecutivosRes] = await Promise.all([
      fetch(`/api/citas-comerciales?${params}`),
      fetch('/api/catalogos/ejecutivos?activo=true'),
    ])
    setData(await citasRes.json())
    setEjecutivos(await ejecutivosRes.json())
    setLoading(false)
  }, [filterDia, filterStatus, filterEjecutivo])

  useEffect(() => { fetchData() }, [fetchData])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true) }
  const openEdit = (item: CitaComercial) => {
    setEditing(item)
    setForm({
      ejecutivoId: item.ejecutivoId,
      empresaId: item.cliente.empresaId,
      clienteId: item.clienteId,
      dia: item.dia, status: item.status, horario: item.horario, transporte: item.transporte, notas: item.notas,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.ejecutivoId || !form.clienteId) {
      toast.error('Selecciona ejecutivo y cliente')
      return
    }
    // El backend ignora empresaId (no es columna en CitaComercial); lo dejamos solo en estado UI.
    const { empresaId: _empresaId, ...payload } = form
    if (editing) {
      await fetch('/api/citas-comerciales', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing.id, ...payload }) })
      toast.success('Cita actualizada')
    } else {
      await fetch('/api/citas-comerciales', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      toast.success('Cita creada')
    }
    setShowModal(false)
    fetchData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta cita?')) return
    await fetch('/api/citas-comerciales', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    toast.success('Cita eliminada')
    fetchData()
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Visitas Comerciales</h1>
          <p className="page-subtitle">Gestión de citas con clientes durante la Expo</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <HiOutlinePlus /> Nueva Cita
        </button>
      </div>

      <div className="filters-bar">
        <select className="input" value={filterDia} onChange={e => setFilterDia(e.target.value)}>
          <option value="">Todos los días</option>
          {DIA_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="input" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Todos los status</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="input" value={filterEjecutivo} onChange={e => setFilterEjecutivo(e.target.value)}>
          <option value="">Todos los ejecutivos</option>
          {ejecutivos.map(ej => <option key={ej.id} value={ej.id}>{ej.nombre}</option>)}
        </select>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div className="empty-state"><p>Cargando...</p></div>
        ) : data.length === 0 ? (
          <div className="empty-state">
            <div className="icon"><HiOutlineCalendar /></div>
            <p>No hay citas registradas</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Empresa</th>
                <th>Ejecutivo</th>
                <th>Día</th>
                <th>Horario</th>
                <th>Status</th>
                <th>Transporte</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600 }}>{item.cliente.nombre}</td>
                  <td>{item.cliente.empresa.nombre}</td>
                  <td>{item.ejecutivo.nombre}</td>
                  <td><span className="badge badge-neutral">{item.dia}</span></td>
                  <td>{item.horario}</td>
                  <td><span className={`badge ${statusBadge(item.status)}`}>{item.status}</span></td>
                  <td>{item.transporte || '—'}</td>
                  <td>
                    <div className="actions-cell">
                      <button className="action-btn" onClick={() => openEdit(item)}><HiOutlinePencil /></button>
                      <button className="action-btn delete" onClick={() => handleDelete(item.id)}><HiOutlineTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px', margin: '0 0 24px' }}>
              {editing ? 'Editar Cita' : 'Nueva Visita Comercial'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Empresa</label>
                  <EntityCombobox
                    tipo="empresa"
                    value={form.empresaId}
                    onChange={empresaId => setForm({ ...form, empresaId, clienteId: '' })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Cliente / Contacto</label>
                  <EntityCombobox
                    tipo="cliente"
                    value={form.clienteId}
                    empresaId={form.empresaId}
                    onChange={clienteId => setForm({ ...form, clienteId })}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Ejecutivo Responsable</label>
                  <EntityCombobox
                    tipo="ejecutivo"
                    value={form.ejecutivoId}
                    onChange={ejecutivoId => setForm({ ...form, ejecutivoId })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Día de la Cita</label>
                  <select className="input" value={form.dia} onChange={e => setForm({ ...form, dia: e.target.value })}>
                    {DIA_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Horario Tentativo</label>
                  <input className="input" type="time" value={form.horario} onChange={e => setForm({ ...form, horario: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Uber / Estacionamiento</label>
                <select className="input" value={form.transporte} onChange={e => setForm({ ...form, transporte: e.target.value })}>
                  {TRANSPORTE_OPTIONS.map(t => <option key={t} value={t}>{t || 'Ninguno'}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Notas Adicionales</label>
                <textarea className="input" rows={3} value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} placeholder="Notas..." style={{ resize: 'vertical' }} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Guardar Cambios' : 'Crear Cita'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Verificar en el navegador**

1. Abrir `/citas-comerciales`. Si hay registros previos (de pruebas anteriores) deben desaparecer (BD se reseteó en Tarea 1).
2. Click "Nueva Cita":
   - Combobox Empresa: escribir nombre nuevo, "+ Crear" abre modal, crear empresa.
   - Combobox Cliente: aparece habilitado tras seleccionar empresa, se filtra a contactos de esa empresa, "+ Crear" lo asocia a la empresa seleccionada.
   - Combobox Ejecutivo: solo lista activos.
3. Crear, verificar tabla muestra nombres correctos.
4. Editar: el modal abre con valores pre-cargados (empresa, cliente, ejecutivo).
5. Filtros funcionan, especialmente "ejecutivo" que ahora viene del catálogo.

- [ ] **Step 4: Commit**

```bash
git add app/api/citas-comerciales/route.ts app/citas-comerciales/page.tsx
git commit -m "feat(citas): integrate EntityCombobox in visitas comerciales"
```

---

## Task 11: Integrar EntityCombobox en Obsequios

**Files:**
- Modify: `app/api/obsequios/route.ts`
- Modify: `app/obsequios/page.tsx`

- [ ] **Step 1: Actualizar el endpoint**

Reemplazar `app/api/obsequios/route.ts` con:

```ts
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const fecha = searchParams.get('fecha')
  const ejecutivoId = searchParams.get('ejecutivoId')

  const where: Prisma.ObsequioWhereInput = {}
  if (fecha) where.fecha = fecha
  if (ejecutivoId) where.ejecutivoId = ejecutivoId

  const obsequios = await prisma.obsequio.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { ejecutivo: true, cliente: { include: { empresa: true } } },
  })
  return Response.json(obsequios)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const obsequio = await prisma.obsequio.create({
    data: body,
    include: { ejecutivo: true, cliente: { include: { empresa: true } } },
  })
  return Response.json(obsequio, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const { id, ...data } = body
  const obsequio = await prisma.obsequio.update({
    where: { id },
    data,
    include: { ejecutivo: true, cliente: { include: { empresa: true } } },
  })
  return Response.json(obsequio)
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json()
  await prisma.obsequio.delete({ where: { id } })
  return Response.json({ success: true })
}
```

- [ ] **Step 2: Reemplazar `app/obsequios/page.tsx`**

```tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineGift } from 'react-icons/hi2'
import EntityCombobox from '@/components/EntityCombobox'

interface Ejecutivo { id: string; nombre: string }
interface Empresa { id: string; nombre: string }
interface Cliente { id: string; nombre: string; empresaId: string; empresa: Empresa }
interface Obsequio {
  id: string
  fecha: string
  ejecutivoId: string
  ejecutivo: Ejecutivo
  clienteId: string
  cliente: Cliente
  tipoCliente: string
  articulo: string
  observaciones: string
}

const TIPO_CLIENTE_OPTIONS = ['Activo', 'Prospecto']

const tipoBadge = (tipo: string) => tipo === 'Activo' ? 'badge-success' : 'badge-info'

interface FormState {
  fecha: string
  ejecutivoId: string
  empresaId: string
  clienteId: string
  tipoCliente: string
  articulo: string
  observaciones: string
}

const todayISO = () => new Date().toISOString().split('T')[0]

const emptyForm = (): FormState => ({
  fecha: todayISO(),
  ejecutivoId: '', empresaId: '', clienteId: '',
  tipoCliente: 'Prospecto', articulo: '', observaciones: '',
})

export default function ObsequiosPage() {
  const [data, setData] = useState<Obsequio[]>([])
  const [ejecutivos, setEjecutivos] = useState<Ejecutivo[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Obsequio | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [filterFecha, setFilterFecha] = useState('')
  const [filterEjecutivo, setFilterEjecutivo] = useState('')

  const fetchData = useCallback(async () => {
    const params = new URLSearchParams()
    if (filterFecha) params.set('fecha', filterFecha)
    if (filterEjecutivo) params.set('ejecutivoId', filterEjecutivo)
    const [obsRes, ejecutivosRes] = await Promise.all([
      fetch(`/api/obsequios?${params}`),
      fetch('/api/catalogos/ejecutivos?activo=true'),
    ])
    setData(await obsRes.json())
    setEjecutivos(await ejecutivosRes.json())
    setLoading(false)
  }, [filterFecha, filterEjecutivo])

  useEffect(() => { fetchData() }, [fetchData])

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setShowModal(true) }
  const openEdit = (item: Obsequio) => {
    setEditing(item)
    setForm({
      fecha: item.fecha,
      ejecutivoId: item.ejecutivoId,
      empresaId: item.cliente.empresaId,
      clienteId: item.clienteId,
      tipoCliente: item.tipoCliente,
      articulo: item.articulo,
      observaciones: item.observaciones,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.ejecutivoId || !form.clienteId) {
      toast.error('Selecciona ejecutivo y cliente')
      return
    }
    const { empresaId: _empresaId, ...payload } = form
    if (editing) {
      await fetch('/api/obsequios', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing.id, ...payload }) })
      toast.success('Obsequio actualizado')
    } else {
      await fetch('/api/obsequios', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      toast.success('Obsequio registrado')
    }
    setShowModal(false)
    fetchData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este obsequio?')) return
    await fetch('/api/obsequios', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    toast.success('Obsequio eliminado')
    fetchData()
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Control de Obsequios</h1>
          <p className="page-subtitle">Registro de obsequios entregados a clientes y prospectos</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <HiOutlinePlus /> Registrar Obsequio
        </button>
      </div>

      <div className="filters-bar">
        <input className="input" type="date" value={filterFecha} onChange={e => setFilterFecha(e.target.value)} style={{ width: 'auto' }} />
        <select className="input" value={filterEjecutivo} onChange={e => setFilterEjecutivo(e.target.value)}>
          <option value="">Todos los ejecutivos</option>
          {ejecutivos.map(ej => <option key={ej.id} value={ej.id}>{ej.nombre}</option>)}
        </select>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div className="empty-state"><p>Cargando...</p></div>
        ) : data.length === 0 ? (
          <div className="empty-state">
            <div className="icon"><HiOutlineGift /></div>
            <p>No hay obsequios registrados</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Empresa</th>
                <th>Tipo</th>
                <th>Ejecutivo</th>
                <th>Observaciones</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id}>
                  <td>{item.fecha}</td>
                  <td style={{ fontWeight: 600 }}>{item.cliente.nombre}</td>
                  <td>{item.cliente.empresa.nombre}</td>
                  <td><span className={`badge ${tipoBadge(item.tipoCliente)}`}>{item.tipoCliente}</span></td>
                  <td>{item.ejecutivo.nombre}</td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.observaciones || '—'}</td>
                  <td>
                    <div className="actions-cell">
                      <button className="action-btn" onClick={() => openEdit(item)}><HiOutlinePencil /></button>
                      <button className="action-btn delete" onClick={() => handleDelete(item.id)}><HiOutlineTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px', margin: '0 0 24px' }}>
              {editing ? 'Editar Obsequio' : 'Registrar Obsequio'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Fecha</label>
                <input className="input" type="date" required value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Empresa</label>
                  <EntityCombobox tipo="empresa" value={form.empresaId} onChange={empresaId => setForm({ ...form, empresaId, clienteId: '' })} required />
                </div>
                <div className="form-group">
                  <label>Cliente / Contacto</label>
                  <EntityCombobox tipo="cliente" value={form.clienteId} empresaId={form.empresaId} onChange={clienteId => setForm({ ...form, clienteId })} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Tipo Cliente</label>
                  <select className="input" value={form.tipoCliente} onChange={e => setForm({ ...form, tipoCliente: e.target.value })}>
                    {TIPO_CLIENTE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Ejecutivo Responsable</label>
                  <EntityCombobox tipo="ejecutivo" value={form.ejecutivoId} onChange={ejecutivoId => setForm({ ...form, ejecutivoId })} required />
                </div>
              </div>
              <div className="form-group">
                <label>Observaciones</label>
                <textarea className="input" rows={3} value={form.observaciones} onChange={e => setForm({ ...form, observaciones: e.target.value })} placeholder="Observaciones..." style={{ resize: 'vertical' }} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Guardar Cambios' : 'Registrar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Verificar en el navegador**

Abrir `/obsequios`. Crear nuevo obsequio: empresa → cliente encadenado → ejecutivo. Verificar tabla, filtro de ejecutivo, edición.

- [ ] **Step 4: Commit**

```bash
git add app/api/obsequios/route.ts app/obsequios/page.tsx
git commit -m "feat(obsequios): integrate EntityCombobox in obsequios"
```

---

## Task 12: Integrar EntityCombobox en Citas Generadas

**Files:**
- Modify: `app/api/citas-generadas/route.ts`
- Modify: `app/citas-generadas/page.tsx`

- [ ] **Step 1: Actualizar el endpoint**

Reemplazar `app/api/citas-generadas/route.ts` con:

```ts
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const accion = searchParams.get('accion')
  const ejecutivoId = searchParams.get('ejecutivoId')

  const where: Prisma.CitaGeneradaWhereInput = {}
  if (accion) where.accion = accion
  if (ejecutivoId) where.ejecutivoId = ejecutivoId

  const citas = await prisma.citaGenerada.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { ejecutivo: true, cliente: { include: { empresa: true } } },
  })
  return Response.json(citas)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const cita = await prisma.citaGenerada.create({
    data: body,
    include: { ejecutivo: true, cliente: { include: { empresa: true } } },
  })
  return Response.json(cita, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const { id, ...data } = body
  const cita = await prisma.citaGenerada.update({
    where: { id },
    data,
    include: { ejecutivo: true, cliente: { include: { empresa: true } } },
  })
  return Response.json(cita)
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json()
  await prisma.citaGenerada.delete({ where: { id } })
  return Response.json({ success: true })
}
```

- [ ] **Step 2: Reemplazar `app/citas-generadas/page.tsx`**

```tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineClipboardDocumentList } from 'react-icons/hi2'
import EntityCombobox from '@/components/EntityCombobox'

interface Ejecutivo { id: string; nombre: string }
interface Empresa { id: string; nombre: string }
interface Cliente { id: string; nombre: string; empresaId: string; empresa: Empresa }
interface CitaGenerada {
  id: string
  fecha: string
  ejecutivoId: string
  ejecutivo: Ejecutivo
  clienteId: string
  cliente: Cliente
  accion: string
  notas: string
}

const ACCION_OPTIONS = ['Catálogo', 'Cotización', 'Cita', 'Otro']

const accionBadge = (accion: string) => {
  const map: Record<string, string> = {
    'Catálogo': 'badge-info',
    'Cotización': 'badge-warning',
    'Cita': 'badge-success',
    'Otro': 'badge-neutral',
  }
  return map[accion] || 'badge-neutral'
}

interface FormState {
  fecha: string
  ejecutivoId: string
  empresaId: string
  clienteId: string
  accion: string
  notas: string
}

const todayISO = () => new Date().toISOString().split('T')[0]

const emptyForm = (): FormState => ({
  fecha: todayISO(),
  ejecutivoId: '', empresaId: '', clienteId: '',
  accion: 'Otro', notas: '',
})

export default function CitasGeneradasPage() {
  const [data, setData] = useState<CitaGenerada[]>([])
  const [ejecutivos, setEjecutivos] = useState<Ejecutivo[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<CitaGenerada | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [filterAccion, setFilterAccion] = useState('')
  const [filterEjecutivo, setFilterEjecutivo] = useState('')

  const fetchData = useCallback(async () => {
    const params = new URLSearchParams()
    if (filterAccion) params.set('accion', filterAccion)
    if (filterEjecutivo) params.set('ejecutivoId', filterEjecutivo)
    const [citasRes, ejecutivosRes] = await Promise.all([
      fetch(`/api/citas-generadas?${params}`),
      fetch('/api/catalogos/ejecutivos?activo=true'),
    ])
    setData(await citasRes.json())
    setEjecutivos(await ejecutivosRes.json())
    setLoading(false)
  }, [filterAccion, filterEjecutivo])

  useEffect(() => { fetchData() }, [fetchData])

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setShowModal(true) }
  const openEdit = (item: CitaGenerada) => {
    setEditing(item)
    setForm({
      fecha: item.fecha,
      ejecutivoId: item.ejecutivoId,
      empresaId: item.cliente.empresaId,
      clienteId: item.clienteId,
      accion: item.accion, notas: item.notas,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.ejecutivoId || !form.clienteId) {
      toast.error('Selecciona ejecutivo y cliente')
      return
    }
    const { empresaId: _empresaId, ...payload } = form
    if (editing) {
      await fetch('/api/citas-generadas', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing.id, ...payload }) })
      toast.success('Cita actualizada')
    } else {
      await fetch('/api/citas-generadas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      toast.success('Cita registrada')
    }
    setShowModal(false)
    fetchData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta cita?')) return
    await fetch('/api/citas-generadas', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    toast.success('Cita eliminada')
    fetchData()
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Citas Generadas</h1>
          <p className="page-subtitle">Citas concretadas con prospectos, envío de catálogos y seguimiento post-evento</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <HiOutlinePlus /> Nueva Cita
        </button>
      </div>

      <div className="filters-bar">
        <select className="input" value={filterAccion} onChange={e => setFilterAccion(e.target.value)}>
          <option value="">Todas las acciones</option>
          {ACCION_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <select className="input" value={filterEjecutivo} onChange={e => setFilterEjecutivo(e.target.value)}>
          <option value="">Todos los ejecutivos</option>
          {ejecutivos.map(ej => <option key={ej.id} value={ej.id}>{ej.nombre}</option>)}
        </select>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div className="empty-state"><p>Cargando...</p></div>
        ) : data.length === 0 ? (
          <div className="empty-state">
            <div className="icon"><HiOutlineClipboardDocumentList /></div>
            <p>No hay citas generadas</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Nombre</th>
                <th>Empresa</th>
                <th>Ejecutivo</th>
                <th>Acción</th>
                <th>Notas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id}>
                  <td>{item.fecha}</td>
                  <td style={{ fontWeight: 600 }}>{item.cliente.nombre}</td>
                  <td>{item.cliente.empresa.nombre}</td>
                  <td>{item.ejecutivo.nombre}</td>
                  <td><span className={`badge ${accionBadge(item.accion)}`}>{item.accion}</span></td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.notas || '—'}</td>
                  <td>
                    <div className="actions-cell">
                      <button className="action-btn" onClick={() => openEdit(item)}><HiOutlinePencil /></button>
                      <button className="action-btn delete" onClick={() => handleDelete(item.id)}><HiOutlineTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px', margin: '0 0 24px' }}>
              {editing ? 'Editar Cita' : 'Registrar Cita Generada'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Fecha</label>
                <input className="input" type="date" required value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Empresa</label>
                  <EntityCombobox tipo="empresa" value={form.empresaId} onChange={empresaId => setForm({ ...form, empresaId, clienteId: '' })} required />
                </div>
                <div className="form-group">
                  <label>Cliente / Contacto</label>
                  <EntityCombobox tipo="cliente" value={form.clienteId} empresaId={form.empresaId} onChange={clienteId => setForm({ ...form, clienteId })} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Ejecutivo que Atendió</label>
                  <EntityCombobox tipo="ejecutivo" value={form.ejecutivoId} onChange={ejecutivoId => setForm({ ...form, ejecutivoId })} required />
                </div>
                <div className="form-group">
                  <label>Acción</label>
                  <select className="input" value={form.accion} onChange={e => setForm({ ...form, accion: e.target.value })}>
                    {ACCION_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Notas</label>
                <textarea className="input" rows={3} value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} placeholder="Notas de seguimiento..." style={{ resize: 'vertical' }} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Guardar Cambios' : 'Registrar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Verificar en el navegador**

Abrir `/citas-generadas`. Crear, editar, filtrar — mismo patrón que en obsequios.

- [ ] **Step 4: Commit**

```bash
git add app/api/citas-generadas/route.ts app/citas-generadas/page.tsx
git commit -m "feat(citas-generadas): integrate EntityCombobox in citas generadas"
```

---

## Task 13: Actualizar Analytics

**Files:**
- Modify: `app/api/analytics/route.ts`

- [ ] **Step 1: Reemplazar el endpoint**

```ts
// app/api/analytics/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const [citas, staff, obsequios, generadas] = await Promise.all([
    prisma.citaComercial.findMany({
      include: {
        ejecutivo: { select: { nombre: true } },
        cliente: { select: { empresa: { select: { nombre: true } } } },
      },
    }),
    prisma.staffMember.findMany(),
    prisma.obsequio.findMany({
      include: { ejecutivo: { select: { nombre: true } } },
    }),
    prisma.citaGenerada.findMany({
      include: { ejecutivo: { select: { nombre: true } } },
    }),
  ])

  const citasPorDia: Record<string, number> = {}
  citas.forEach(c => { citasPorDia[c.dia] = (citasPorDia[c.dia] || 0) + 1 })

  const citasPorStatus: Record<string, number> = {}
  citas.forEach(c => { citasPorStatus[c.status] = (citasPorStatus[c.status] || 0) + 1 })

  // Citas por ejecutivo (ahora deduplicado por ID, mostrando nombre)
  const citasPorEjecutivo: Record<string, number> = {}
  citas.forEach(c => {
    const nombre = c.ejecutivo.nombre
    citasPorEjecutivo[nombre] = (citasPorEjecutivo[nombre] || 0) + 1
  })

  // Citas por empresa (nuevo: aprovecha la relación)
  const citasPorEmpresa: Record<string, number> = {}
  citas.forEach(c => {
    const nombre = c.cliente.empresa.nombre
    citasPorEmpresa[nombre] = (citasPorEmpresa[nombre] || 0) + 1
  })

  const staffPorRol: Record<string, number> = {}
  staff.forEach(s => { staffPorRol[s.rol] = (staffPorRol[s.rol] || 0) + 1 })

  const viaticoTotal = staff.reduce((sum, s) => sum + s.viaticoCantidad, 0)
  const viaticoPendiente = staff.filter(s => s.viaticoStatus === 'Pendiente').reduce((sum, s) => sum + s.viaticoCantidad, 0)
  const viaticoEntregado = viaticoTotal - viaticoPendiente

  const obsequiosPorTipo: Record<string, number> = {}
  obsequios.forEach(o => { obsequiosPorTipo[o.tipoCliente] = (obsequiosPorTipo[o.tipoCliente] || 0) + 1 })

  const generadasPorAccion: Record<string, number> = {}
  generadas.forEach(g => { generadasPorAccion[g.accion] = (generadasPorAccion[g.accion] || 0) + 1 })

  return NextResponse.json({
    totales: {
      citas: citas.length,
      staff: staff.length,
      obsequios: obsequios.length,
      generadas: generadas.length,
    },
    citasPorDia,
    citasPorStatus,
    citasPorEjecutivo,
    citasPorEmpresa,
    staffPorRol,
    viaticos: { total: viaticoTotal, pendiente: viaticoPendiente, entregado: viaticoEntregado },
    obsequiosPorTipo,
    generadasPorAccion,
  })
}
```

**Cambio clave:** la API ahora siempre devuelve nombres deduplicados porque agrupa por `ejecutivoId` implícito (vía la FK) en lugar del string. Se añade `citasPorEmpresa` aprovechando la nueva relación.

- [ ] **Step 2: Verificar en el navegador**

1. Crear 2-3 citas con el mismo ejecutivo y la misma empresa.
2. Abrir `/analytics`. Verificar que el conteo es correcto y los nombres aparecen sin duplicados.
3. Si la página `app/analytics/page.tsx` consume `citasPorEmpresa`, ya tiene el dato; si no, ningún cambio rompe.

**Nota:** la página `app/analytics/page.tsx` no se modifica en este task. Si quieres mostrar el nuevo gráfico `citasPorEmpresa` en la UI, sería un task aparte. La función pura (deduplicación de ejecutivos) ya está cubierta.

- [ ] **Step 3: Commit**

```bash
git add app/api/analytics/route.ts
git commit -m "feat(analytics): aggregate by FK relations to deduplicate executives and companies"
```

---

## Task 14: Sidebar — agregar sección "Catálogos"

**Files:**
- Modify: `components/Sidebar.tsx`

- [ ] **Step 1: Reemplazar el array `sections` y el import**

En `components/Sidebar.tsx`:

Cambiar el import de íconos a:

```tsx
import {
  HiOutlineCalendar, HiOutlineUsers, HiOutlineGift,
  HiOutlineClipboardDocumentList, HiOutlineHome, HiOutlineXMark,
  HiOutlineCalendarDays, HiOutlineChartBar,
  HiOutlineDocumentText, HiOutlineCube, HiOutlineStar,
  HiOutlineUserGroup, HiOutlineBuildingOffice2, HiOutlineIdentification,
} from 'react-icons/hi2'
```

Cambiar el array `sections` a:

```tsx
const sections = [
  {
    label: 'Gestión',
    links: [
      { href: '/', label: 'Dashboard', icon: HiOutlineHome },
      { href: '/citas-comerciales', label: 'Visitas Comerciales', icon: HiOutlineCalendar },
      { href: '/staff', label: 'Staff Operativo', icon: HiOutlineUsers },
      { href: '/obsequios', label: 'Control de Obsequios', icon: HiOutlineGift },
      { href: '/citas-generadas', label: 'Citas Generadas', icon: HiOutlineClipboardDocumentList },
    ],
  },
  {
    label: 'Catálogos',
    links: [
      { href: '/catalogos/ejecutivos', label: 'Ejecutivos', icon: HiOutlineUserGroup },
      { href: '/catalogos/empresas', label: 'Empresas', icon: HiOutlineBuildingOffice2 },
      { href: '/catalogos/clientes', label: 'Clientes', icon: HiOutlineIdentification },
    ],
  },
  {
    label: 'Herramientas',
    links: [
      { href: '/calendario', label: 'Calendario', icon: HiOutlineCalendarDays },
      { href: '/analytics', label: 'Analytics', icon: HiOutlineChartBar },
      { href: '/materiales', label: 'Materiales', icon: HiOutlineDocumentText },
      { href: '/inventario', label: 'Inventario', icon: HiOutlineCube },
      { href: '/reviews', label: 'Reseñas', icon: HiOutlineStar },
    ],
  },
]
```

- [ ] **Step 2: Verificar en el navegador**

1. Recargar cualquier página, ver que el sidebar muestra la sección "CATÁLOGOS" entre Gestión y Herramientas.
2. Click en cada uno de los 3 links navega correctamente.
3. El active state (subrayado del link activo) funciona en `/catalogos/empresas/[id]` también — el `pathname === link.href` solo aplica match exacto, así que el detalle de empresa no marca "Empresas" como activo. Esto es aceptable; si quieres que el detalle también marque, sería un cambio extra fuera de alcance.

- [ ] **Step 3: Commit final**

```bash
git add components/Sidebar.tsx
git commit -m "feat(sidebar): add Catalogos section with ejecutivos, empresas, clientes"
```

---

## Verificación final end-to-end

Después de la Tarea 14, antes de cerrar:

- [ ] **Compilación TypeScript limpia:** `npx tsc --noEmit` debe terminar sin errores.
- [ ] **Lint limpio:** `npm run lint` debe terminar sin errores.
- [ ] **Build de producción:** `npm run build` debe completarse exitosamente.
- [ ] **Smoke test manual end-to-end:**
  1. Crear 2 ejecutivos (uno activo, uno inactivo).
  2. Crear 1 empresa con 2 contactos.
  3. Registrar 1 visita comercial usando los catálogos (con quick-create de un tercer contacto desde el formulario).
  4. Registrar 1 obsequio.
  5. Registrar 1 cita generada.
  6. Abrir analytics: ver que ejecutivos cuentan correctamente y "citasPorEmpresa" tiene la empresa.
  7. Intentar borrar una empresa con contactos: debe devolver toast de error.
  8. Intentar borrar un ejecutivo con citas: debe devolver toast de error.
  9. Desactivar un ejecutivo: en el siguiente combobox de ejecutivo no aparece.

Si todo lo anterior pasa, el módulo está completo.
