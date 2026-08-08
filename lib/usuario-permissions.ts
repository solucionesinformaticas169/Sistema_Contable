import { buildPermissionKey, permissionCatalog } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export async function ensurePrimaryUsuarioPermissions(empresaId: number) {
  const primaryUsuario = await prisma.usuario.findFirst({
    where: { empresaId },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    select: { id: true },
  });

  if (!primaryUsuario) {
    return;
  }

  const permissionsCount = await prisma.usuarioPermiso.count({
    where: { usuarioId: primaryUsuario.id },
  });

  if (permissionsCount > 0) {
    return;
  }

  await prisma.usuarioPermiso.createMany({
    data: permissionCatalog.flatMap((group) =>
      group.pages.map((page) => ({
        usuarioId: primaryUsuario.id,
        paginaKey: buildPermissionKey(group.category, page),
        categoria: group.category,
        pagina: page,
        visualizar: true,
        agregar: true,
        modificar: true,
        eliminar: true,
        verCosto: true,
      })),
    ),
  });
}
