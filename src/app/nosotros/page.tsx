import Image from "next/image";
import Link from "next/link";
import { PageIntro, SectionLabel, SiteShell } from "@/components/site-shell";

const principles = [
  ["Claridad", "Traducimos lo complejo en decisiones que puedes sostener."],
  ["Criterio", "Invertir no es perseguir ruido; es construir convicción."],
  ["Comunidad", "El crecimiento se acelera cuando se comparte perspectiva."],
];

export default function Nosotros() {
  return (
    <SiteShell>
      <PageIntro eyebrow="Nosotros / 01" title="Crecer con raíz." description="Somos una plataforma de pensamiento y acción para quienes entienden el patrimonio como una herramienta de libertad, no como una cifra." />
      <section className="border-y hairline bg-[var(--paper)]"><div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[0.7fr_1.3fr] lg:px-12 lg:py-24"><SectionLabel number="01">Propósito</SectionLabel><div><p className="display-font max-w-4xl text-4xl leading-[1.05] sm:text-6xl">Hacer que más personas puedan tomar el volante de su futuro financiero.</p><p className="mt-10 max-w-2xl leading-7 text-[var(--ink-soft)]">Áurea reúne educación, acompañamiento e inversión para convertir la ambición en una práctica con dirección. Trabajamos desde la experiencia, con lenguaje humano y una mirada de largo plazo.</p><div className="relative mt-12 h-72 overflow-hidden rounded-2xl sm:h-96"><Image src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1400&q=85" alt="Personas conversando en una mesa de trabajo" fill sizes="(max-width: 1024px) 100vw, 70vw" className="object-cover" /></div></div></div></section>
      <section className="mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24"><div className="grid gap-5 lg:grid-cols-2"><article className="border hairline bg-[var(--background)] p-8 sm:p-12"><SectionLabel number="02">Misión</SectionLabel><h2 className="display-font mt-12 text-4xl leading-none sm:text-5xl">Convertir claridad en decisiones que transforman.</h2><p className="mt-8 max-w-lg leading-7 text-[var(--ink-soft)]">Acompañar a cada persona a ordenar sus ideas, fortalecer su criterio financiero y construir patrimonio con pasos concretos.</p></article><article className="border hairline bg-[var(--lime)] p-8 sm:p-12"><SectionLabel number="03">Visión</SectionLabel><h2 className="display-font mt-12 text-4xl leading-none sm:text-5xl">Una generación que lidera su futuro con libertad.</h2><p className="mt-8 max-w-lg leading-7 text-[var(--ink-soft)]">Imaginamos una comunidad donde invertir, aprender y crecer sean prácticas accesibles, conscientes y sostenibles.</p></article></div></section>
      <section className="mx-auto max-w-[1440px] px-5 pb-16 sm:px-8 lg:px-12 lg:pb-28"><div className="grid gap-px bg-[var(--line)] md:grid-cols-3">{principles.map(([title, text], index) => <article key={title} className="bg-[var(--background)] p-8 sm:p-10"><span className="eyebrow">0{index + 4}</span><h2 className="display-font mt-20 text-4xl">{title}</h2><p className="mt-5 text-sm leading-6 text-[var(--ink-soft)]">{text}</p></article>)}</div></section>
      <section className="bg-[var(--lime)]"><div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-5 py-16 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-12 lg:py-24"><p className="display-font max-w-2xl text-4xl leading-none sm:text-6xl">El futuro no se adivina. Se diseña.</p><Link href="/servicios" className="editorial-link font-semibold">Ver cómo podemos ayudarte</Link></div></section>
    </SiteShell>
  );
}
