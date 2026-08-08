ALTER TABLE "empresas"
ADD COLUMN "formatoFacturaPath" TEXT NOT NULL DEFAULT '',
ADD COLUMN "formatoRetencionPath" TEXT NOT NULL DEFAULT '',
ADD COLUMN "formatoGuiaRemisionPath" TEXT NOT NULL DEFAULT '',
ADD COLUMN "formatoNotaCreditoPath" TEXT NOT NULL DEFAULT '';
