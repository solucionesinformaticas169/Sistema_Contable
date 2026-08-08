ALTER TABLE "empresas"
ADD COLUMN "nombreDb" TEXT;

CREATE UNIQUE INDEX "empresas_nombreDb_key" ON "empresas"("nombreDb");
