type PrimaryUsuarioData = {
  identificacion: string;
  descripcion: string;
  email: string;
};

export function buildPrimaryUsuarioData(input: {
  ruc: string;
  razonSocial: string;
  correo: string;
}): PrimaryUsuarioData {
  return {
    identificacion: input.ruc,
    descripcion: input.razonSocial,
    email: input.correo,
  };
}
