# Módulo de Catálogos (Ejecutivos · Empresas · Clientes)

**Fecha:** 2026-05-06
**Estado:** Diseño aprobado, pendiente plan de implementación

## Problema

Hoy `ejecutivo`, `empresa` y `nombreCliente` son campos de texto libre repetidos en tres módulos (Visitas Comerciales, Obsequios, Citas Generadas). Cada vez que el usuario los teclea hay riesgo de typo. Esto:

- Fragmenta a la misma persona/empresa en variantes ortográficas ("Coca Cola" / "CocaCola" / "Coca-Cola").
- Rompe analíticas por ejecutivo y por empresa (un mismo ejecutivo aparece como 3 personas distintas).
- Obliga al usuario a recordar la grafía exacta usada antes.

## Objetivo

Sustituir los inputs de texto libre por catálogos pre-cargados con autocomplete y quick-create inline. La fuente de verdad pasa a ser el catálogo; los registros operativos (citas, obsequios) referencian al catálogo por FK.

**Fuera de alcance:** mover los enums hardcoded (status, día, acción, transporte, tipo cliente, categoría material, sección/rol staff) a base de datos. Rara vez cambian y cambiarlos requiere deploy hoy.

## Decisiones tomadas durante el brainstorming

| Pregunta | Decisión |
|---|---|
| Alcance | Ejecutivos + Empresas + Clientes (no enums hardcoded) |
| Ejecutivos vs Staff Operativo | Modelos separados (un ejecutivo comercial ≠ staff de booth) |
| Campos por Ejecutivo | nombre, email, teléfono, cargo, activo (sin foto) |
| Campos por Empresa | nombre, ciudad/estado, notas |
| Relación Cliente-Empresa | Cliente pertenece a una Empresa (cardinalidad 1:N) |
| Campos por Cliente | nombre, cargo, email, teléfono, notas |
| Comportamiento dropdown | Autocomplete con quick-create inline (mini-modal) |
| Datos existentes | Reset limpio (proyecto en setup, sin datos productivos) |

## Modelo de datos

### Modelos nuevos

```prisma
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
```

**Borrado de Empresa:** `onDelete: Restrict`. Si la empresa tiene clientes asociados (o citas vía sus clientes), no se puede borrar — debe desactivarse o reasignarse manualmente. Evita orfanar registros operativos.

### Modelos existentes (cambios)

`CitaComercial`, `Obsequio`, `CitaGenerada` reemplazan los strings por FKs:

```prisma
model CitaComercial {
  // ... campos sin cambio: dia, status, horario, transporte, notas, createdAt, updatedAt
  ejecutivoId String
  ejecutivo   Ejecutivo @relation(fields: [ejecutivoId], references: [id], onDelete: Restrict)
  clienteId   String
  cliente     Cliente   @relation(fields: [clienteId], references: [id], onDelete: Restrict)
  // → eliminados: ejecutivo: String, empresa: String, nombreCliente: String
}

// Mismo patrón para Obsequio y CitaGenerada
```

**Por qué solo `clienteId` y no también `empresaId`:** el cliente ya pertenece a una empresa. Duplicar la FK invitaría a inconsistencias. Las queries que agrupan por empresa hacen `JOIN cliente.empresa`.

`onDelete: Restrict` también aquí: no se puede borrar un ejecutivo o cliente con historial de citas. La forma de "retirarlo" es desactivarlo (en el caso de ejecutivo) o simplemente no usarlo en futuras citas.

## UI

### Sidebar

Nueva sección "Catálogos" entre "Gestión" y "Herramientas":

```
Catálogos
  - Ejecutivos    (/catalogos/ejecutivos)
  - Empresas      (/catalogos/empresas)
  - Clientes      (/catalogos/clientes)
```

### Páginas

**`/catalogos/ejecutivos`** — Tabla: nombre, cargo, email, teléfono, badge Activo/Inactivo, acciones. Filtro por estatus. Modal de alta/edición. Toggle Activo/Inactivo no borra; solo oculta de los dropdowns.

**`/catalogos/empresas`** — Tabla: nombre, ciudad/estado, # de contactos (count), acciones. Click en una fila navega al detalle.

**`/catalogos/empresas/[id]`** — Detalle: datos de la empresa arriba, tabla de contactos (clientes) abajo con botón "+ Agregar contacto" que abre modal pre-asociado a esta empresa.

**`/catalogos/clientes`** — Tabla global: nombre, cargo, empresa, email, teléfono. Filtro por empresa. Útil para búsqueda transversal. El alta también disponible aquí (pidiendo seleccionar empresa) además de desde la página de detalle de empresa.

Mismo patrón visual que el resto de la app (`glass-card`, `data-table`, `modal-overlay`, `btn btn-primary`).

## Componente reutilizable: `<EntityCombobox>`

Reemplaza los `<input>` de texto libre actuales en los formularios de citas/obsequios.

**API:**

```ts
type Tipo = 'ejecutivo' | 'empresa' | 'cliente'

interface EntityComboboxProps {
  tipo: Tipo
  value: string | null      // id seleccionado
  onChange: (id: string) => void
  empresaId?: string        // requerido cuando tipo='cliente'; filtra contactos
  required?: boolean
  placeholder?: string
}
```

**Comportamiento:**

1. Click → despliega lista filtrable.
2. Usuario escribe → lista se filtra en cliente (o pide al endpoint si lista grande).
3. Match → click selecciona.
4. Sin match → aparece al final "+ Crear '<texto>' como nueva empresa/ejecutivo/cliente".
5. Click en crear → sub-modal con campos mínimos (nombre prellenado), Guardar persiste y selecciona automáticamente.

**Encadenamiento en formularios de citas/obsequios:**

- Primero se elige Empresa → al cambiar, se reinicia y filtra el dropdown de Cliente.
- Quick-create de Cliente desde ahí ya viene pre-asociado a la empresa elegida.
- Ejecutivo es independiente, sin encadenamiento. Solo muestra activos.

## API

Endpoints REST, mismo patrón que los existentes:

```
GET    /api/catalogos/ejecutivos?activo=true
POST   /api/catalogos/ejecutivos
PUT    /api/catalogos/ejecutivos        (body: { id, ...campos })
DELETE /api/catalogos/ejecutivos        (body: { id })

GET    /api/catalogos/empresas
GET    /api/catalogos/empresas/[id]     (incluye clientes)
POST   /api/catalogos/empresas
PUT    /api/catalogos/empresas
DELETE /api/catalogos/empresas

GET    /api/catalogos/clientes?empresaId=xxx
POST   /api/catalogos/clientes
PUT    /api/catalogos/clientes
DELETE /api/catalogos/clientes
```

DELETE devuelve 409 si Prisma lanza foreign key violation (con mensaje legible: "No se puede borrar: tiene N citas asociadas").

## Migración

Proyecto en setup, sin datos productivos:

1. Editar `prisma/schema.prisma` con los modelos nuevos y los cambios en los existentes.
2. `npx prisma migrate reset` (borra y recrea) → confirma destrucción de datos de prueba.
3. `npx prisma migrate dev --name add_catalogos` genera la migración nombrada.
4. **Sin columnas legacy.** Sin scripts de transformación. Clean slate.
5. Seeder opcional en `prisma/seed.ts` (comentado por defecto) con 2-3 ejecutivos y empresas de ejemplo.

## Impacto en código existente

**Páginas de citas/obsequios (3 archivos):**
- Reemplazar `<input>` de ejecutivo/empresa/cliente por `<EntityCombobox>`.
- En el handler de submit, enviar `ejecutivoId` y `clienteId` en lugar de los strings.
- En la tabla, mostrar `item.ejecutivo.nombre`, `item.cliente.nombre`, `item.cliente.empresa.nombre` (la API responde con relaciones incluidas).
- Filtro de ejecutivo deja de derivarse de `[...new Set(data.map(d => d.ejecutivo))]` y se alimenta de `GET /api/catalogos/ejecutivos?activo=true`.

**APIs existentes (3 archivos en `/app/api`):** ajustar `include: { ejecutivo: true, cliente: { include: { empresa: true } } }` en los GETs y aceptar `ejecutivoId`/`clienteId` en los POST/PUT.

**Analytics:** queries que agrupan por ejecutivo/empresa pasan a usar `ejecutivoId` y `cliente.empresaId` con join para resolver nombres. Esto deduplica automáticamente las variantes ortográficas anteriores.

## Orden de implementación

1. Schema + migración + endpoints de catálogos.
2. Páginas `/catalogos/ejecutivos`, `/catalogos/empresas`, `/catalogos/empresas/[id]`, `/catalogos/clientes` (CRUD completo).
3. Componente `<EntityCombobox>` con quick-create.
4. Integración en formularios de Visitas Comerciales, Obsequios, Citas Generadas (uno a la vez, con commit por módulo).
5. Ajuste de filtros y de queries de Analytics.
6. Sidebar: nueva sección "Catálogos".

Cada paso es independiente y dejable a medias sin romper lo previo (excepto el #1 que cambia el schema — ese es el corte duro).

## Riesgos / cosas a vigilar

- **`onDelete: Restrict`** puede sorprender a un usuario que intente borrar una empresa "vacía" pero con citas en historial. Mensaje claro en el toast.
- **Quick-create con campos mínimos** crea entidades incompletas. Aceptable: el usuario puede completar después desde el módulo de catálogos.
- **Dropdown que crece mucho** (cientos de empresas/clientes) — el componente debe pedir filtrado server-side si el catálogo crece. Por ahora el volumen esperado cabe sin problema en memoria del navegador y no requiere paginación.
- **Edición del nombre de un ejecutivo/empresa** se refleja en todas las citas históricas (porque solo guardamos ID). Es el comportamiento deseado, pero conviene tener en mente que "renombrar" propaga.
