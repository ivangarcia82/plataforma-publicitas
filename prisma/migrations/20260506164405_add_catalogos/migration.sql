/*
  Warnings:

  - You are about to drop the column `ejecutivo` on the `CitaComercial` table. All the data in the column will be lost.
  - You are about to drop the column `empresa` on the `CitaComercial` table. All the data in the column will be lost.
  - You are about to drop the column `nombreCliente` on the `CitaComercial` table. All the data in the column will be lost.
  - You are about to drop the column `ejecutivo` on the `CitaGenerada` table. All the data in the column will be lost.
  - You are about to drop the column `empresa` on the `CitaGenerada` table. All the data in the column will be lost.
  - You are about to drop the column `nombre` on the `CitaGenerada` table. All the data in the column will be lost.
  - You are about to drop the column `ejecutivo` on the `Obsequio` table. All the data in the column will be lost.
  - You are about to drop the column `empresa` on the `Obsequio` table. All the data in the column will be lost.
  - You are about to drop the column `nombreCliente` on the `Obsequio` table. All the data in the column will be lost.
  - Added the required column `clienteId` to the `CitaComercial` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ejecutivoId` to the `CitaComercial` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clienteId` to the `CitaGenerada` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ejecutivoId` to the `CitaGenerada` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clienteId` to the `Obsequio` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ejecutivoId` to the `Obsequio` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CitaComercial" DROP COLUMN "ejecutivo",
DROP COLUMN "empresa",
DROP COLUMN "nombreCliente",
ADD COLUMN     "clienteId" TEXT NOT NULL,
ADD COLUMN     "ejecutivoId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CitaGenerada" DROP COLUMN "ejecutivo",
DROP COLUMN "empresa",
DROP COLUMN "nombre",
ADD COLUMN     "clienteId" TEXT NOT NULL,
ADD COLUMN     "ejecutivoId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Obsequio" DROP COLUMN "ejecutivo",
DROP COLUMN "empresa",
DROP COLUMN "nombreCliente",
ADD COLUMN     "clienteId" TEXT NOT NULL,
ADD COLUMN     "ejecutivoId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Ejecutivo" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL DEFAULT '',
    "telefono" TEXT NOT NULL DEFAULT '',
    "cargo" TEXT NOT NULL DEFAULT '',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ejecutivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Empresa" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "ciudadEstado" TEXT NOT NULL DEFAULT '',
    "notas" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "cargo" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "telefono" TEXT NOT NULL DEFAULT '',
    "notas" TEXT NOT NULL DEFAULT '',
    "empresaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "empresa" TEXT NOT NULL DEFAULT '',
    "cargo" TEXT NOT NULL DEFAULT '',
    "rating" INTEGER NOT NULL DEFAULT 5,
    "texto" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "Empresa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CitaComercial" ADD CONSTRAINT "CitaComercial_ejecutivoId_fkey" FOREIGN KEY ("ejecutivoId") REFERENCES "Ejecutivo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CitaComercial" ADD CONSTRAINT "CitaComercial_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Obsequio" ADD CONSTRAINT "Obsequio_ejecutivoId_fkey" FOREIGN KEY ("ejecutivoId") REFERENCES "Ejecutivo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Obsequio" ADD CONSTRAINT "Obsequio_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CitaGenerada" ADD CONSTRAINT "CitaGenerada_ejecutivoId_fkey" FOREIGN KEY ("ejecutivoId") REFERENCES "Ejecutivo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CitaGenerada" ADD CONSTRAINT "CitaGenerada_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
