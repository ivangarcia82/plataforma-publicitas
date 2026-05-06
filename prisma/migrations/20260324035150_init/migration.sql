-- CreateTable
CREATE TABLE "CitaComercial" (
    "id" TEXT NOT NULL,
    "nombreCliente" TEXT NOT NULL,
    "empresa" TEXT NOT NULL,
    "ejecutivo" TEXT NOT NULL,
    "dia" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Tentativa',
    "horario" TEXT NOT NULL,
    "transporte" TEXT NOT NULL DEFAULT '',
    "notas" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CitaComercial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffMember" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'Staff',
    "diaAsignado" TEXT NOT NULL,
    "horarioEntrada" TEXT NOT NULL,
    "horarioSalida" TEXT NOT NULL,
    "horaComida" TEXT NOT NULL DEFAULT '',
    "seccion" TEXT NOT NULL DEFAULT '',
    "viaticoCantidad" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "viaticoStatus" TEXT NOT NULL DEFAULT 'Pendiente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Obsequio" (
    "id" TEXT NOT NULL,
    "fecha" TEXT NOT NULL,
    "nombreCliente" TEXT NOT NULL,
    "empresa" TEXT NOT NULL,
    "tipoCliente" TEXT NOT NULL DEFAULT 'Prospecto',
    "ejecutivo" TEXT NOT NULL,
    "observaciones" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Obsequio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CitaGenerada" (
    "id" TEXT NOT NULL,
    "fecha" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "empresa" TEXT NOT NULL,
    "ejecutivo" TEXT NOT NULL,
    "accion" TEXT NOT NULL DEFAULT 'Otro',
    "notas" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CitaGenerada_pkey" PRIMARY KEY ("id")
);
