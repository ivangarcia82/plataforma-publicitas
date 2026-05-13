-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'ejecutivo',
    "ejecutivoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_ejecutivoId_key" ON "User"("ejecutivoId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_ejecutivoId_fkey" FOREIGN KEY ("ejecutivoId") REFERENCES "Ejecutivo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
