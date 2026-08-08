"use client";

import Link from "next/link";
import { type ReactNode, useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import {
  saveParametrosSmtpAction,
  type SaveParametrosSmtpState,
} from "./parametros-smtp-actions";

type ParametrosSmtpPanelProps = {
  empresa: {
    id: number;
    smtpServidor: string;
    smtpUsuario: string;
    smtpCorreoRemitente: string;
    smtpPuerto: string;
    smtpClave: string;
  };
  isEditing: boolean;
};

type FormValues = ParametrosSmtpPanelProps["empresa"] & {
  smtpClaveVerificacion: string;
};

const smtpDefaults = {
  smtpServidor: "smtp.zeptomail.com",
  smtpUsuario: "emailapikey",
  smtpCorreoRemitente: "noresponder@perseo.ec",
  smtpPuerto: "587",
  smtpClave: "ClaveCorreo123",
} as const;

export function ParametrosSmtpPanel({
  empresa,
  isEditing,
}: ParametrosSmtpPanelProps) {
  const [values, setValues] = useState<FormValues>({
    ...empresa,
    smtpClaveVerificacion: empresa.smtpClave || "",
  });
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [state, formAction] = useActionState<SaveParametrosSmtpState, FormData>(
    saveParametrosSmtpAction,
    {
      error: null,
      success: null,
    },
  );

  useEffect(() => {
    setValues({
      ...empresa,
      smtpClaveVerificacion: empresa.smtpClave || "",
    });
    setValidationMessage(null);
    setValidationError(null);
  }, [empresa]);

  function updateField<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function applyDefaults() {
    if (!isEditing) {
      return;
    }

    setValues((current) => ({
      ...current,
      smtpServidor: smtpDefaults.smtpServidor,
      smtpUsuario: smtpDefaults.smtpUsuario,
      smtpCorreoRemitente: smtpDefaults.smtpCorreoRemitente,
      smtpPuerto: smtpDefaults.smtpPuerto,
      smtpClave: smtpDefaults.smtpClave,
      smtpClaveVerificacion: smtpDefaults.smtpClave,
    }));
    setValidationError(null);
    setValidationMessage(
      "Se cargaron los parametros SMTP predeterminados, incluida la contrasena.",
    );
  }

  function validateFields() {
    const servidor = values.smtpServidor.trim();
    const usuario = values.smtpUsuario.trim();
    const remitente = values.smtpCorreoRemitente.trim();
    const puerto = values.smtpPuerto.trim();
    const clave = values.smtpClave.trim();
    const claveVerificacion = values.smtpClaveVerificacion.trim();

    if (!servidor || !usuario || !remitente || !puerto) {
      setValidationMessage(null);
      setValidationError("Completa todos los campos SMTP antes de validar.");
      return;
    }

    if (isEditing) {
      if (!clave || !claveVerificacion) {
        setValidationMessage(null);
        setValidationError(
          "Completa la contrasena y la verificacion antes de validar.",
        );
        return;
      }

      if (clave !== claveVerificacion) {
        setValidationMessage(null);
        setValidationError("La contrasena SMTP y su verificacion no coinciden.");
        return;
      }
    }

    setValidationError(null);
    setValidationMessage(
      "Configuracion SMTP valida a nivel de formulario. Ya puedes guardar.",
    );
  }

  const fieldClassName = isEditing
    ? "h-10 w-full border border-[#c8d4e3] bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[#1677c9]"
    : "h-10 w-full cursor-not-allowed border border-slate-200 bg-slate-100 px-3 text-sm text-slate-500";

  return (
    <div className="rounded-sm border border-slate-300 bg-white p-3 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
      <form action={formAction}>
        <input type="hidden" name="empresaId" value={empresa.id} />

        <div className="flex flex-wrap items-center gap-2 pb-4">
          <SaveToolbarButton enabled={isEditing} />
          <Link
            href={`/panel?empresaId=${empresa.id}&seccion=parametros-smtp&edit=1`}
            className="inline-flex items-center rounded-sm bg-[#60b95c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#50a64c]"
          >
            Modificar
          </Link>
          <Link
            href={`/panel?empresaId=${empresa.id}&seccion=parametros-smtp`}
            className="inline-flex items-center rounded-sm bg-[#30404d] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#24323d]"
          >
            Menu
          </Link>
          <Link
            href={`/panel?empresaId=${empresa.id}&seccion=parametros-smtp&vista=formatos-fisicos`}
            className="inline-flex items-center rounded-sm bg-[#f49b16] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#e18b0d]"
          >
            Cargar Formatos Fisicos
          </Link>
        </div>

        {state.error ? (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {state.error}
          </div>
        ) : null}

        {state.success ? (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {state.success}
          </div>
        ) : null}

        {validationError ? (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {validationError}
          </div>
        ) : null}

        {validationMessage ? (
          <div className="mb-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
            {validationMessage}
          </div>
        ) : null}

        <div
          className={`mb-6 flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${
            isEditing
              ? "border-amber-200 bg-amber-50 text-amber-800"
              : "border-slate-200 bg-slate-50 text-slate-600"
          }`}
        >
          <span>
            {isEditing
              ? "Modo edicion activo. Ya puedes cambiar los parametros SMTP y guardar."
              : "Modo lectura. Pulsa Modificar para habilitar los campos y el boton Guardar."}
          </span>
        </div>

        <div className="grid gap-10 xl:grid-cols-[640px_180px]">
          <div className="space-y-4">
            <FieldRow label="Servidor SMTP:">
              <input
                name="smtpServidor"
                value={values.smtpServidor}
                disabled={!isEditing}
                onChange={(event) => updateField("smtpServidor", event.target.value)}
                className={fieldClassName}
              />
            </FieldRow>

            <FieldRow label="Usuario:">
              <input
                name="smtpUsuario"
                value={values.smtpUsuario}
                disabled={!isEditing}
                onChange={(event) => updateField("smtpUsuario", event.target.value)}
                className={fieldClassName}
              />
            </FieldRow>

            <FieldRow label="Correo Remitente:">
              <input
                name="smtpCorreoRemitente"
                value={values.smtpCorreoRemitente}
                disabled={!isEditing}
                onChange={(event) =>
                  updateField("smtpCorreoRemitente", event.target.value)
                }
                className={fieldClassName}
              />
            </FieldRow>

            <div className="grid grid-cols-[140px_1fr_122px] items-start gap-4">
              <label className="pt-2 text-[15px] text-slate-700">Puerto SMTP</label>
              <input
                name="smtpPuerto"
                value={values.smtpPuerto}
                disabled={!isEditing}
                onChange={(event) => updateField("smtpPuerto", event.target.value)}
                className={fieldClassName}
              />
              <button
                type="button"
                onClick={applyDefaults}
                className={`rounded-sm px-3 py-4 text-center text-sm font-semibold text-white transition ${
                  isEditing
                    ? "bg-[#82c3ff] hover:bg-[#74b6f2]"
                    : "cursor-not-allowed bg-[#cfe2f7] text-white/90"
                }`}
              >
                SMTP
                <br />
                Predeterminado
                </button>
            </div>

            {isEditing ? (
              <>
                <FieldRow label="Contrasena:">
                  <input
                    name="smtpClave"
                    type="text"
                    placeholder="Clave Correo"
                    value={values.smtpClave}
                    disabled={!isEditing}
                    onChange={(event) => updateField("smtpClave", event.target.value)}
                    className={fieldClassName}
                  />
                </FieldRow>

                <FieldRow label="Verificar Contrasena:">
                  <input
                    name="smtpClaveVerificacion"
                    type="text"
                    placeholder={smtpDefaults.smtpClave}
                    value={values.smtpClaveVerificacion}
                    disabled={!isEditing}
                    onChange={(event) =>
                      updateField("smtpClaveVerificacion", event.target.value)
                    }
                    className={fieldClassName}
                  />
                </FieldRow>
              </>
            ) : null}
          </div>

          <div className="pt-[206px]">
            <button
              type="button"
              onClick={validateFields}
              className={`w-full rounded-sm px-4 py-3 text-sm font-semibold text-white transition ${
                isEditing
                  ? "bg-[#18b208] hover:bg-[#149807]"
                  : "cursor-not-allowed bg-[#94d98d] text-white/90"
              }`}
            >
              Validar
            </button>
          </div>
        </div>

        {isEditing ? (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            La contrasena y su verificacion deben quedar iguales para guardar.
          </div>
        ) : null}
      </form>
    </div>
  );
}

function FieldRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[140px_1fr] items-center gap-4">
      <label className="text-[15px] text-slate-700">{label}</label>
      {children}
    </div>
  );
}

function SaveToolbarButton({ enabled }: { enabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={!enabled || pending}
      className={`inline-flex items-center rounded-sm px-4 py-2 text-sm font-semibold text-white transition ${
        enabled && !pending
          ? "bg-[#82c3ff] hover:bg-[#74b6f2]"
          : "cursor-not-allowed bg-[#cfe2f7] text-white/90"
      }`}
    >
      {pending ? "Guardando..." : "Guardar"}
    </button>
  );
}
