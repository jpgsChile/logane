"use client";

import { type ReactNode } from "react";

export function Providers(props: { children: ReactNode }) {
  // Simplificamos el provider para evitar conflictos con listeners del SDK externo
  return <>{props.children}</>;
}
