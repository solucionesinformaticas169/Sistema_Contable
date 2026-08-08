import Link from "next/link";
import { LoginForm } from "./login-form";

type IngresarPageProps = {
  searchParams: Promise<{
    ruc?: string;
    creada?: string;
  }>;
};

export default async function IngresarPage({ searchParams }: IngresarPageProps) {
  const params = await searchParams;
  const defaultRuc = params.ruc || "";
  const creada = params.creada === "1";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fff7df_0%,#f3ead5_42%,#e6dcc3_100%)] px-6 py-10 text-slate-950">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-amber-800 uppercase">
              Acceso empresarial
            </p>
            <h1 className="mt-2 font-serif text-4xl">Ingreso al sistema</h1>
          </div>
          <Link
            href="/"
            className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400"
          >
            Volver al inicio
          </Link>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <LoginForm defaultRuc={defaultRuc} creada={creada} />

          <aside className="rounded-[2rem] border border-slate-200 bg-slate-950 p-7 text-white shadow-[0_25px_70px_rgba(15,23,42,0.22)]">
            <p className="text-xs font-semibold tracking-[0.22em] text-amber-300 uppercase">
              Siguiente paso
            </p>
            <h3 className="mt-3 font-serif text-3xl">Entrada segura al panel.</h3>
            <div className="mt-6 space-y-4 text-sm leading-7 text-slate-200">
              <p>Ingresa con el RUC registrado de la empresa.</p>
              <p>Usa la contrasena inicial creada durante el registro.</p>
              <p>Una vez validado el acceso, el sistema te dirige al panel administrativo.</p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
