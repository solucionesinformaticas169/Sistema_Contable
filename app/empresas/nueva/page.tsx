import Link from "next/link";
import { EmpresaForm } from "./empresa-form";

export default function NuevaEmpresaPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#fff7df_0%,#f3ead5_42%,#e6dcc3_100%)] px-6 py-10 text-slate-950">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-amber-800 uppercase">
              Registro empresarial
            </p>
            <h1 className="mt-2 font-serif text-4xl">Crear empresa</h1>
          </div>
          <Link
            href="/"
            className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400"
          >
            Volver al inicio
          </Link>
        </div>

        <EmpresaForm />
      </section>
    </main>
  );
}
