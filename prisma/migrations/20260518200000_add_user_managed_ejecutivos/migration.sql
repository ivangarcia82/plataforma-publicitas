-- Allow users to be managers for additional ejecutivos (read-only visibility)
ALTER TABLE "User"
  ADD COLUMN "managedEjecutivoIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
