"use client";

import React from "react";
import Image from "next/image";

export function Loading3DIcon() {
  return (
    <div className="flex flex-col items-center justify-center py-10 select-none text-white">

      {/* CONTENEDOR */}
      <div
        className="relative w-40 h-40 flex items-center justify-center"
        style={{ perspective: "1000px" }}
      >

        {/* Halo cálido para separar el loader del fondo negro */}
        <div className="
          absolute inset-5
          rounded-full
          bg-red-600/25
          blur-2xl
          animate-pulse
        " />
        <div className="
          absolute inset-10
          rounded-full
          bg-amber-300/20
          blur-xl
          animate-pulse
        " />

        {/* Anillo exterior luminoso */}
        <div className="
          absolute inset-2
          rounded-full
          border border-white/20
          shadow-[0_0_30px_rgba(248,113,113,0.25)]
        " />

        {/* Aro rojo animado */}
        <div
          className="
          absolute inset-0
          rounded-full
          border-2 border-transparent
          border-t-red-500 border-r-red-500/40
          animate-spin
          "
          style={{ animationDuration: "2.5s" }}
        />

        {/* Segundo aro para reforzar la sensación de profundidad */}
        <div
          className="absolute inset-5 rounded-full border border-amber-200/50 animate-[spin_4s_linear_infinite_reverse]"
        />

        {/* Balde flotando y rotando en 3D */}
        <div
          className="relative w-24 h-24 balde-spin"
          style={{ transformStyle: "preserve-3d" }}
        >
          <Image
            src="/logo_d4.png"
            alt="Balde de la marca"
            fill
            className="object-contain drop-shadow-[0_12px_18px_rgba(0,0,0,0.85)]"
            priority
          />
        </div>

        {/* Sombra de contacto que "respira" con el giro */}
        <div className="absolute -bottom-3 w-20 h-3 bg-red-950/80 rounded-full blur-md balde-shadow" />
      </div>

      {/* Texto */}
      <div className="mt-6 flex flex-col items-center">

        <span className="
          text-[11px]
          font-bold
          tracking-[0.35em]
          uppercase
          text-white/90
          drop-shadow-[0_0_10px_rgba(248,113,113,0.45)]
        ">
          Caramel Clothing
        </span>

        <div className="flex gap-1.5 mt-3 items-center">
          <div className="flex gap-1.5 animate-loadingSteps">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)]" />
            <div className="w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.9)]" />
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)]" />
          </div>
        </div>
      </div>
    </div>
  );
}