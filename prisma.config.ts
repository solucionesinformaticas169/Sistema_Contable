import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: ".env.local" });

const prismaDatasourceUrl =
  process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!prismaDatasourceUrl) {
  throw new Error(
    "No se encontro DIRECT_URL ni DATABASE_URL para configurar Prisma.",
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: prismaDatasourceUrl,
  },
});
