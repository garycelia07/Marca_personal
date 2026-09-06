import Image from "next/image";
import Link from "next/link";
import { PageIntro, SectionLabel, SiteShell } from "@/components/site-shell";

const projects = [
  { category: "Inmobiliario", title: "Casa Nómada", text: "Espacios residenciales pensados para habitar con calma y construir valor a largo plazo.", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85" },
  { category: "Financiero", title: "Círculo Capital", text: "Educación y conversación para dejar de improvisar con el dinero.", image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=85" },
  { category: "Digital", title: "Mapa de Futuro", text: "Un sistema práctico para transformar metas difusas en próximos pasos.", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=85" },
];

export default function Proyectos() { return <SiteShell><PageIntro eyebrow="Proyectos / 03" title="Ideas con destino." description="Cada proyecto es una hipótesis puesta a prueba: cómo vivir mejor, aprender más y hacer que el capital trabaje a favor de una vida con sentido." /><section className="mx-auto max-w-[1440px] space-y-px bg-[var(--line)] px-5 pb-20 sm:px-8 lg:px-12 lg:pb-28">{projects.map((project, index) => <article key={project.title} className={`grid gap-0 bg-[var(--background)] md:grid-cols-2 ${index % 2 ? "md:[&>*:first-child]:order-2" : ""}`}><div className="relative min-h-[320px] overflow-hidden sm:min-h-[420px]"><Image src={project.image} alt={project.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition duration-700 hover:scale-105" /></div><div className="flex flex-col justify-between p-8 sm:p-12 lg:p-16"><div><SectionLabel number={`0${index + 1}`}>{project.category}</SectionLabel><h2 className="display-font mt-20 text-5xl leading-none sm:text-7xl">{project.title}</h2></div><div className="mt-12"><p className="max-w-sm text-[var(--ink-soft)] leading-7">{project.text}</p><Link href="/iniciar-sesion" className="editorial-link mt-8 text-sm font-semibold">Conocer el proyecto</Link></div></div></article>)}</section></SiteShell>; }
