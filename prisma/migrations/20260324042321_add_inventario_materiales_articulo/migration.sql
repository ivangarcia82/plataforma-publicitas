-- AlterTable
ALTER TABLE "Obsequio" ADD COLUMN     "articulo" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "InventarioObsequio" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "stockTotal" INTEGER NOT NULL,
    "stockActual" INTEGER NOT NULL,
    "alertaMinimo" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InventarioObsequio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaterialDigital" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL DEFAULT '',
    "categoria" TEXT NOT NULL DEFAULT 'General',
    "url" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'pdf',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MaterialDigital_pkey" PRIMARY KEY ("id")
);
