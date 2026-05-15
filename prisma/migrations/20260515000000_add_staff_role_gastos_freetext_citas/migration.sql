-- DropForeignKey on CitaGenerada to recreate as optional
ALTER TABLE "CitaGenerada" DROP CONSTRAINT IF EXISTS "CitaGenerada_clienteId_fkey";
ALTER TABLE "CitaGenerada" DROP CONSTRAINT IF EXISTS "CitaGenerada_ejecutivoId_fkey";

-- AlterTable CitaGenerada: nullable FKs + free-text fields
ALTER TABLE "CitaGenerada" ALTER COLUMN "clienteId" DROP NOT NULL;
ALTER TABLE "CitaGenerada" ALTER COLUMN "ejecutivoId" DROP NOT NULL;
ALTER TABLE "CitaGenerada" ADD COLUMN IF NOT EXISTS "empresaTexto" TEXT NOT NULL DEFAULT '';
ALTER TABLE "CitaGenerada" ADD COLUMN IF NOT EXISTS "contactoTexto" TEXT NOT NULL DEFAULT '';
ALTER TABLE "CitaGenerada" ADD COLUMN IF NOT EXISTS "ejecutivoTexto" TEXT NOT NULL DEFAULT '';

-- Re-add FKs as optional (RESTRICT preserved)
ALTER TABLE "CitaGenerada"
  ADD CONSTRAINT "CitaGenerada_clienteId_fkey"
  FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CitaGenerada"
  ADD CONSTRAINT "CitaGenerada_ejecutivoId_fkey"
  FOREIGN KEY ("ejecutivoId") REFERENCES "Ejecutivo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable StaffMember: contact + activo
ALTER TABLE "StaffMember" ADD COLUMN IF NOT EXISTS "email" TEXT NOT NULL DEFAULT '';
ALTER TABLE "StaffMember" ADD COLUMN IF NOT EXISTS "telefono" TEXT NOT NULL DEFAULT '';
ALTER TABLE "StaffMember" ADD COLUMN IF NOT EXISTS "activo" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable User: link to staff member
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "staffMemberId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "User_staffMemberId_key" ON "User"("staffMemberId");
ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_staffMemberId_fkey";
ALTER TABLE "User"
  ADD CONSTRAINT "User_staffMemberId_fkey"
  FOREIGN KEY ("staffMemberId") REFERENCES "StaffMember"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable GastoStaff
CREATE TABLE IF NOT EXISTS "GastoStaff" (
    "id" TEXT NOT NULL,
    "staffMemberId" TEXT NOT NULL,
    "fecha" TEXT NOT NULL,
    "categoria" TEXT NOT NULL DEFAULT 'Otro',
    "concepto" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "comprobanteUrl" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'Pendiente',
    "notasStaff" TEXT NOT NULL DEFAULT '',
    "notasAdmin" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GastoStaff_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "GastoStaff" DROP CONSTRAINT IF EXISTS "GastoStaff_staffMemberId_fkey";
ALTER TABLE "GastoStaff"
  ADD CONSTRAINT "GastoStaff_staffMemberId_fkey"
  FOREIGN KEY ("staffMemberId") REFERENCES "StaffMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
