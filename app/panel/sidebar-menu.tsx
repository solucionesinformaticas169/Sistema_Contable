"use client";

import Link from "next/link";
import { useState } from "react";

type MenuItem = {
  id: string;
  label: string;
};

type SidebarMenuProps = {
  administrationItems: MenuItem[];
  salesItems: MenuItem[];
  secondarySections: string[];
  seccionActual: string;
  empresaId?: number;
};

export function SidebarMenu({
  administrationItems,
  salesItems,
  secondarySections,
  seccionActual,
  empresaId,
}: SidebarMenuProps) {
  const [administrationOpen, setAdministrationOpen] = useState(false);
  const [salesOpen, setSalesOpen] = useState(false);

  return (
    <div className="px-4 py-4">
      <div className="rounded-sm border border-slate-300 bg-white shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
        <button
          type="button"
          onClick={() => setAdministrationOpen((current) => !current)}
          className="flex w-full items-center justify-between px-5 py-4 text-left"
        >
          <span className="text-[15px] font-semibold text-slate-900">
            Administracion
          </span>
          <span className="text-sm text-slate-500">
            {administrationOpen ? "v" : ">"}
          </span>
        </button>

        {administrationOpen ? (
          <div className="border-t border-slate-300 px-3 py-3">
            <div className="space-y-1">
              {administrationItems.map((item) => {
                const isActive = item.id === seccionActual;

                return (
                  <Link
                    key={item.id}
                    href={`/panel?${new URLSearchParams({
                      seccion: item.id,
                      ...(empresaId ? { empresaId: String(empresaId) } : {}),
                    }).toString()}`}
                    className={`flex w-full items-center gap-3 px-2 py-2 text-left text-[15px] transition ${
                      isActive
                        ? "bg-[#d9eaf8] text-[#8a5a15]"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-sm border border-[#c9d7ea] bg-[#edf4fb] text-[11px] font-semibold text-[#5c82b8]">
                      []
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-3 rounded-sm border border-slate-300 bg-white shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
        <button
          type="button"
          onClick={() => setSalesOpen((current) => !current)}
          className="flex w-full items-center justify-between px-5 py-4 text-left"
        >
          <span className="text-[15px] font-semibold text-slate-900">
            Ventas
          </span>
          <span className="text-sm text-slate-500">{salesOpen ? "v" : ">"}</span>
        </button>

        {salesOpen ? (
          <div className="border-t border-slate-300 px-3 py-3">
            <div className="space-y-1">
              {salesItems.map((item) => {
                const isActive = item.id === seccionActual;

                return (
                  <Link
                    key={item.id}
                    href={`/panel?${new URLSearchParams({
                      seccion: item.id,
                      ...(empresaId ? { empresaId: String(empresaId) } : {}),
                    }).toString()}`}
                    className={`flex w-full items-center gap-3 px-2 py-2 text-left text-[15px] transition ${
                      isActive
                        ? "bg-[#d9eaf8] text-[#8a5a15]"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-sm border border-[#e8d6af] bg-[#fff6de] text-[11px] font-semibold text-[#b07a20]">
                      []
                    </span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-3 space-y-1 px-1">
        {secondarySections.map((item) => (
          <button
            key={item}
            type="button"
            className="flex w-full items-center justify-between rounded-sm px-4 py-3 text-left text-[15px] font-medium text-slate-700 transition hover:bg-white"
          >
            <span>{item}</span>
            <span className="text-xs text-slate-400">{">"}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
