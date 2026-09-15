import type { Metadata } from "next";
import PresentacionClient from "./presentacion-client";

export const metadata: Metadata = {
  title: "BoliVibes · Presentación Estratégica para Cultura y Turismo",
  description:
    "Propuesta de valor e infraestructura digital de Smart Tourism para Santa Cruz de la Sierra — Reunión con Lic. Sarah Mansilla, Asesora de Cultura y Turismo.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function PresentacionSarahPage() {
  return <PresentacionClient />;
}
