ALTER TABLE "empresas"
ADD COLUMN "smtpServidor" TEXT NOT NULL DEFAULT 'smtp.zeptomail.com',
ADD COLUMN "smtpUsuario" TEXT NOT NULL DEFAULT 'emailapikey',
ADD COLUMN "smtpCorreoRemitente" TEXT NOT NULL DEFAULT 'noresponder@perseo.ec',
ADD COLUMN "smtpPuerto" TEXT NOT NULL DEFAULT '587';
