"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginEmpresaAction } from "./actions";

type LoginFormProps = {
  defaultRuc: string;
  creada: boolean;
};

const initialLoginState = {
  error: null,
};

export function LoginForm({ defaultRuc, creada }: LoginFormProps) {
  const [state, formAction] = useActionState(loginEmpresaAction, initialLoginState);

  return (
    <form
      action={formAction}
      className="rounded-[2rem] border border-white/70 bg-white/92 p-7 shadow-[0_18px_45px_rgba(103,74,20,0.10)]"
    >
      <div className="space-y-2">
        <p className="text-xs font-semibold tracking-[0.2em] text-amber-800 uppercase">
          Acceso al sistema
        </p>
        <h2 className="font-serif text-3xl text-slate-950">Ingresar</h2>
        <p className="text-sm leading-7 text-slate-600">
          Usa el RUC de la empresa o la identificacion del usuario junto con la contrasena para entrar al panel.
        </p>
      </div>

      {creada ? (
        <div className="mt-6 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Empresa creada correctamente. Ahora inicia sesion para continuar.
        </div>
      ) : null}

      <div className="mt-8 space-y-5">
        <div className="space-y-2">
          <label
            className="text-sm font-medium text-slate-700"
            htmlFor="login-access-id"
          >
            RUC o identificacion
          </label>
          <input
            id="login-access-id"
            name="accessId"
            defaultValue={defaultRuc}
            placeholder="0999999999001 o 0104919477001"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500"
          />
        </div>

        <div className="space-y-2">
          <label
            className="text-sm font-medium text-slate-700"
            htmlFor="login-password"
          >
            Contrasena
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            placeholder="Ingresa tu contrasena"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-500"
          />
        </div>
      </div>

      {state.error ? (
        <div className="mt-6 rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.error}
        </div>
      ) : null}

      <div className="mt-8">
        <LoginButton />
      </div>
    </form>
  );
}

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-amber-200"
    >
      {pending ? "Validando..." : "Ingresar al sistema"}
    </button>
  );
}
