import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fff7df_0%,#f3ead5_42%,#e6dcc3_100%)] px-6 py-10 text-slate-950">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <article className="overflow-hidden rounded-[2.25rem] border border-white/70 bg-white/85 shadow-[0_30px_90px_rgba(103,74,20,0.14)] backdrop-blur">
          <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="relative p-8 md:p-12">
              <div className="absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.28),transparent_65%)]" />
              <div className="relative">
                <p className="inline-flex rounded-full border border-amber-300 bg-amber-50 px-4 py-1 text-xs font-semibold tracking-[0.22em] text-amber-900 uppercase">
                  Sistema Empresarial
                </p>
                <h1 className="mt-6 max-w-4xl font-serif text-4xl leading-tight md:text-6xl">
                  Empecemos creando la empresa dentro del sistema.
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-8 text-slate-700 md:text-lg">
                  Este primer paso nos permite registrar la informacion principal de la
                  empresa para luego continuar con usuarios, sucursales, productos,
                  clientes y toda la operacion del sistema.
                </p>
                <p className="mt-4 text-sm font-medium tracking-[0.12em] text-amber-800 uppercase">
                  Actualizado el 8 de agosto de 2026
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/empresas/nueva"
                    className="rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
                  >
                    Crear una empresa
                  </Link>
                  <Link
                    href="/ingresar"
                    className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400"
                  >
                    Ingresar
                  </Link>
                </div>
              </div>
            </div>

            <aside className="bg-slate-950 p-8 text-white md:p-10">
              <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
                <p className="text-xs font-semibold tracking-[0.22em] text-amber-300 uppercase">
                  Primer bloque
                </p>
                <h2 className="mt-4 font-serif text-3xl leading-tight">
                  Datos base de la empresa para comenzar bien.
                </h2>
                <ul className="mt-6 space-y-4 text-sm leading-7 text-slate-200">
                  <li>Ingreso de RUC.</li>
                  <li>Registro de razon social.</li>
                  <li>Descripcion general de la empresa.</li>
                  <li>Creacion de contrasena inicial para ingresar al panel.</li>
                </ul>
              </div>
            </aside>
          </div>
        </article>
      </section>
    </main>
  );
}
