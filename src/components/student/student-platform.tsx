"use client";

import { useEffect, useState, type ReactNode, type SVGProps } from "react";
import { useRouter } from "next/navigation";
import { getCourse, type Course, type Lesson, type Module } from "@/lib/api/courses";
import { materialFileUrl, materialDownloadUrl, type Material } from "@/lib/api/materials";
import { createLead } from "@/lib/api/leads";
import { publicBackendOrigin } from "@/lib/site";
import { getMyProgress, markLessonDone } from "@/lib/api/progress";
import { RatingSection } from "@/components/rating-section";
import { BookIcon, AttachmentIcon, ChartIcon, UsersIcon } from "@/components/admin/admin-icons";

export type StudentUser = { id: string; email: string; fullName: string };
export type CatCourse = { id: string; title: string; description?: string; coverImageUrl?: string | null; lessons: number };

const LS_KEY = "mp-student-progress-v1";

function readDone(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function lessonVideoUrl(course: Course, lesson: Lesson): string {
  if (lesson.videoUrl && lesson.videoUrl.trim()) return lesson.videoUrl.trim();
  return `${publicBackendOrigin()}/api/v1/courses/lessons/${lesson.id}/video`;
}

function youtubeThumb(url?: string): string | null {
  if (!url) return null;
  const m = /(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/.exec(url.trim());
  return m ? `https://i.ytimg.com/vi/${m[1]}/hqdefault.jpg` : null;
}

function sortModules(modules: Module[] | undefined): Module[] {
  return [...(modules ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

function flatLessons(course: Course): Lesson[] {
  return sortModules(course.modules).flatMap((m) => [...(m.lessons ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
}

type SectionId = "cursos" | "materiales" | "progreso";
type NavIcon = typeof BookIcon;
type NavTab = { id: SectionId; label: string; icon: NavIcon };

function MenuIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function StudentPlatform({
  user,
  myCourseIds,
  cat,
  materialsByCourse,
}: {
  user: StudentUser;
  myCourseIds: string[];
  cat: CatCourse[];
  materialsByCourse: Record<string, Material[]>;
}) {
  const [section, setSection] = useState<SectionId>("cursos");
  const [menuOpen, setMenuOpen] = useState(false);
  const [progress, setProgress] = useState<string[]>(() => readDone());
  const [courseLoading, setCourseLoading] = useState<Record<string, Course | undefined>>({});
  const [buying, setBuying] = useState<string | null>(null);
  const [openCourseId, setOpenCourseId] = useState<string | null>(null);
  const [playing, setPlaying] = useState<Lesson | null>(null);
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST", cache: "no-store" });
    } finally {
      try {
        window.localStorage.removeItem("aurea_user");
        window.localStorage.removeItem("aurea_access_token");
      } catch {
        /* ignorar */
      }
      router.push("/iniciar-sesion");
      router.refresh();
    }
  }

  const mine = cat.filter((c) => myCourseIds.includes(c.id));
  const mineIds = mine.map((c) => c.id);
  const locked = cat.filter((c) => !mineIds.includes(c.id));

  // Precarga el detalle (módulos/lecciones) de cada curso propio para poder
  // contar avance y mostrar métricas sin obligar a abrirlo primero.
  // Sincroniza el visto guardado en el backend (entre dispositivos) con la UI.
  useEffect(() => {
    let cancelled = false;
    void getMyProgress()
      .then((remote) => {
        if (cancelled || remote.length === 0) return;
        setProgress((prev) => {
          const merged = [...new Set([...prev, ...remote])];
          try {
            window.localStorage.setItem(LS_KEY, JSON.stringify(merged));
          } catch {
            /* ignorar */
          }
          return merged;
        });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await Promise.all(
        mineIds.map(async (id) => {
          if (cancelled || courseLoading[id]) return;
          try {
            const detail = await getCourse(id);
            if (!cancelled) setCourseLoading((m) => ({ ...m, [id]: detail }));
          } catch {
            /* sin detalle */
          }
        }),
      );
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mineStats = mine.map((c) => {
    const detail = courseLoading[c.id];
    const lessons = detail ? flatLessons(detail) : [];
    const done = lessons.filter((l) => progress.includes(l.id)).length;
    return { course: c, total: lessons.length, done, pct: lessons.length ? Math.round((done / lessons.length) * 100) : 0 };
  });

  function toggleProgress(lessonId: string) {
    setProgress((prev) => {
      const next = prev.includes(lessonId) ? prev.filter((id) => id !== lessonId) : [...prev, lessonId];
      try {
        window.localStorage.setItem(LS_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }

  async function openCourse(courseId: string) {
    setOpenCourseId(courseId);
    setPlaying(null);
    if (courseLoading[courseId]) return;
    setSection("cursos");
    try {
      const detail = await getCourse(courseId);
      setCourseLoading((m) => ({ ...m, [courseId]: detail }));
    } catch {
      const stub = cat.find((c) => c.id === courseId);
      setCourseLoading((m) => ({
        ...m,
        [courseId]: { id: courseId, title: stub?.title ?? "Curso", slug: courseId } as Course,
      }));
    }
  }

  function closeCourse() {
    setOpenCourseId(null);
    setPlaying(null);
  }

  function buyCourse(courseId: string) {
    setBuying(courseId);
  }

  function stopBuying() {
    setBuying(null);
  }

  const openCourseDetail = openCourseId ? courseLoading[openCourseId] : undefined;
  const detailLessons = openCourseDetail ? flatLessons(openCourseDetail) : [];
  const playingUrl = playing && openCourseDetail ? lessonVideoUrl(openCourseDetail, playing) : null;

  return (
    <div className="min-h-screen bg-[var(--background)] lg:grid lg:grid-cols-[300px_1fr]">
      {/* Barra superior (solo móvil) con botón de menú */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b hairline bg-[var(--paper)] px-4 py-3 lg:hidden">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--forest)] font-bold text-[var(--background)]">
            {initials(user.fullName)}
          </span>
          <div className="min-w-0">
            <p className="display-font truncate text-base leading-tight">{user.fullName}</p>
            <p className="text-xs text-[var(--ink-soft)]">Estudiante</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          className="flex h-10 w-10 items-center justify-center rounded-full border hairline text-[var(--forest)] transition hover:border-[var(--copper)] hover:text-[var(--copper)]"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Overlay para cerrar el menú en móvil */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Barra lateral: drawer deslizante en móvil, columna fija en escritorio */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[84vw] transform-gpu flex-col overflow-y-auto border-r hairline bg-[var(--paper)] shadow-2xl transition-transform duration-300 ease-out lg:static lg:z-auto lg:w-auto lg:max-w-none lg:translate-x-0 lg:overflow-visible lg:shadow-none lg:min-h-screen lg:justify-start ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center gap-3 border-b hairline px-5 py-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--forest)] font-bold text-[var(--background)]">
            {initials(user.fullName)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="display-font text-base leading-tight">{user.fullName}</p>
            <p className="text-xs text-[var(--ink-soft)]">Estudiante</p>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Cerrar menú"
            className="flex h-9 w-9 items-center justify-center rounded-full border hairline text-[var(--ink-soft)] transition hover:border-[var(--copper)] hover:text-[var(--copper)] lg:hidden"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-3 py-4">
          {NAV_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setSection(tab.id);
                setMenuOpen(false);
                if (tab.id !== "cursos") {
                  setOpenCourseId(null);
                  setPlaying(null);
                }
              }}
              className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm ${
                section === tab.id
                  ? "bg-[var(--forest)] font-semibold text-[var(--background)]"
                  : "text-[var(--ink-soft)] hover:bg-[var(--lime)] hover:text-[var(--forest)]"
              }`}
            >
              <span aria-hidden="true" className={`h-[18px] w-[18px] shrink-0 ${section === tab.id ? "text-[var(--background)]" : "text-[var(--copper)]"}`}>
                <tab.icon />
              </span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto border-t hairline px-5 py-4">
          <button
            type="button"
            onClick={() => { void handleLogout(); }}
            className="flex w-full items-center justify-center gap-2 rounded-full border hairline px-4 py-2.5 text-sm font-semibold text-[var(--danger)] transition hover:bg-[var(--danger)] hover:text-white"
          >
            <LogoutIcon className="h-5 w-5 shrink-0" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Panel principal */}
      <main className="px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-3 border-b hairline pb-6">
          <div>
            <p className="eyebrow">Panel estudiantil</p>
            <h1 className="display-font mt-2 text-4xl leading-none sm:text-5xl">
              {sectionHeading(section)}
            </h1>
          </div>
          <p className="text-sm text-[var(--ink-soft)]">Bienvenido de nuevo</p>
        </header>

        {section === "cursos" ? (
          openCourseId && openCourseDetail ? (
            !playing ? (
              <CourseGrid
                course={openCourseDetail}
                detail={openCourseDetail}
                playing={playing}
                progress={progress}
                onPlay={(lesson) => setPlaying(lesson)}
                onToggle={toggleProgress}
                onBack={closeCourse}
              />
            ) : (
              <PlayerView
                course={openCourseDetail}
                lesson={playing}
                src={playingUrl ?? ""}
                all={detailLessons}
                progress={progress}
                onToggle={toggleProgress}
                onEnded={(l) => setPlaying(l)}
                onBack={() => setPlaying(null)}
              />
            )
          ) : (
            <CoursesOverview
              mine={mine}
              stats={mineStats}
              locked={locked}
              buying={buying}
              user={user}
              onOpen={openCourse}
              onBuy={buyCourse}
              onCloseBuy={stopBuying}
            />
          )
        ) : null}

        {section === "materiales" ? (
          <MaterialsOverview mine={mine} materialsByCourse={materialsByCourse} />
        ) : null}

        {section === "progreso" ? (
          <ProgressOverview mine={mine} stats={mineStats} totalWatched={progress.length} />
        ) : null}
      </main>
    </div>
  );
}

const NAV_TABS: NavTab[] = [
  { id: "cursos", label: "Mis cursos", icon: BookIcon },
  { id: "materiales", label: "Materiales", icon: AttachmentIcon },
  { id: "progreso", label: "Mi progreso", icon: ChartIcon },
];

function initials(fullName: string): string {
  return (fullName || "A")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function sectionHeading(section: SectionId): string {
  if (section === "cursos") return "Mis cursos";
  if (section === "materiales") return "Materiales";
  return "Mi progreso";
}

function coverFallback(title: string): string {
  // Colores elegantes basados en el hash del título para cursos sin portada.
  const palette = ["#1f1a17", "#233a2b", "#8a6a06", "#3f3aa8", "#512030"];
  let h = 0;
  for (let i = 0; i < title.length; i += 1) h = (h * 31 + title.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}

function PlayIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8 5.5v13a9 9 0 0 1 7 2v-3a9 9 0 0 0-4 10l1.8 3.6.7-3.6l1.1 6.1.7-6.1" />
    </svg>
  );
}

function ArrowRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 12h8l4 4h7M15.5 12l-4-4" />
    </svg>
  );
}

function ArrowLeftIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 12h-8l-4 4h-7M8.5 12l4-4" />
    </svg>
  );
}

function PadlockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="7" y="9" width="10" height="11" rx="2" />
      <path d="M9 9v-5H15v5" />
      <path d="M12 13v4" />
    </svg>
  );
}

function MonitorIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M9.5 5.5v3.5l3.5 0M13 9l-3.5 0" />
    </svg>
  );
}

function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8 6l3.2 3.2h6.3M17.2 9.2l-5.2 5.2" />
    </svg>
  );
}

function DownloadIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12.5 3v6M11.5 6V9.3a3 3 0 0 1-1.5 1.6M11.5 9.6l3 5M14.5 14.6l1.8-4.5" />
    </svg>
  );
}

function FileIcon({ pdf, ...props }: { pdf?: boolean } & SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 5v16h8" />
      {pdf ? <path d="M9 9h6M10 12h4M9.5 15h5" /> : <circle cx="13" cy="12" r="2.6" />}
    </svg>
  );
}

function LogoutIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="9" y="4" width="8" height="14.5" rx="1.2" />
      <path d="M6.5 12h4M10.5 12l-3 3h-3M6.5 12l1.5-1.5" />
    </svg>
  );
}

function LightbulbIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="11" r="6.5" />
      <path d="M9.5 17.5h5M11 17.5v-3.5" />
    </svg>
  );
}

function TargetIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
    </svg>
  );
}

function CourseThumb({ img, title }: { img?: string | null; title: string }) {
  const bg = coverFallback(title);
  return (
    <span className="relative block h-full w-full overflow-hidden bg-[#171713]">
      {img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img} alt={title} loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <span
          className="flex h-full w-full items-center justify-center"
          style={{ backgroundColor: bg }}
        >
          <span className="display-font text-3xl text-white/40">{title.slice(0, 2).toUpperCase()}</span>
        </span>
      )}
    </span>
  );
}

function LessonThumb({ src, title }: { src: string; title: string }) {
  const thumb = youtubeThumb(src);
  if (thumb) {
    return <CourseThumb img={thumb} title={title} />;
  }

  return (
    <span className="relative block h-full w-full overflow-hidden bg-black">
      <video
        src={src}
        muted
        playsInline
        preload="metadata"
        className="h-full w-full object-cover"
        aria-label={`Vista previa del video: ${title}`}
      />
    </span>
  );
}

type CourseGridProps = {
  course: Course;
  detail: Course;
  playing: Lesson | null;
  progress: string[];
  onPlay: (lesson: Lesson) => void;
  onToggle: (lessonId: string) => void;
  onBack: () => void;
};

function CourseGrid({ course, detail, progress, onPlay, onBack }: CourseGridProps) {
  const headline = detail.title || course.title;
  const lessons = flatLessons(detail);
  const doneCount = lessons.filter((l) => progress.includes(l.id)).length;
  const pct = lessons.length ? Math.round((doneCount / lessons.length) * 100) : 0;

  return (
    <div>
      <button type="button" onClick={onBack} className="editorial-link inline-flex items-center gap-2 text-sm font-semibold">
        <ArrowLeftIcon className="h-4 w-4" />
        Volver a mis cursos
      </button>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="eyebrow">Contenido del curso</p>
          <h2 className="display-font mt-2 text-3xl leading-tight sm:text-4xl">{headline}</h2>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-[var(--ink-soft)]">
            <span className="inline-flex items-center gap-1.5"><MonitorIcon className="h-3.5 w-3.5" />{lessons.length} lecciones</span>
            <span aria-hidden="true" className="text-[var(--copper)]">·</span>
            <span className="inline-flex items-center gap-1.5"><CheckIcon className="h-3.5 w-3.5" />{doneCount} vistas</span>
          </div>
        </div>
        <div className="rounded-full border hairline bg-[var(--paper)] px-4 py-2 text-sm font-bold">
          <span className="text-[var(--copper)]">{pct}%</span>
          <span className="text-[var(--ink-soft)]"> completado</span>
        </div>
      </div>

      <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-[var(--line)]">
        <div className="h-full rounded-full bg-gradient-to-r from-[var(--copper)] to-[var(--forest)] shadow-sm transition-all" style={{ width: `${pct}%` }} />
      </div>

      {lessons.length === 0 ? (
        <p className="mt-10 rounded-2xl border hairline bg-[var(--paper)] px-6 py-12 text-center text-sm text-[var(--ink-soft)]">
          Este curso aún no tiene lecciones publicadas.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {lessons.map((lesson) => {
            const viewed = progress.includes(lesson.id);
            const previewSrc = lessonVideoUrl(course, lesson);
            return (
              <button
                key={lesson.id}
                type="button"
                onClick={() => onPlay(lesson)}
                className="group flex flex-col overflow-hidden rounded-2xl border hairline bg-[var(--paper)] text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[var(--copper)] hover:shadow-2xl"
              >
                <div className="relative aspect-video overflow-hidden bg-[#171713]">
                  <LessonThumb src={previewSrc} title={lesson.title} />
                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                  <span className="absolute inset-0 flex items-center justify-center transition group-hover:bg-black/10">
                    <span className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition ${
                      viewed
                        ? "border-[var(--forest)] bg-[var(--forest)] text-[var(--background)] group-hover:scale-110"
                        : "border-white/60 bg-white/15 backdrop-blur-sm text-white group-hover:scale-110 group-hover:bg-[var(--copper)] group-hover:text-[var(--forest-deep)]"
                    }`}>
                      {viewed ? <CheckIcon className="h-6 w-6" /> : <PlayIcon className="h-6 w-6" />}
                    </span>
                  </span>
                  {viewed ? (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--forest)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[var(--background)]">
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--lime)]" />
                      Visto
                    </span>
                  ) : (
                    <span className="absolute right-3 top-3 rounded-full border border-white/50 bg-black/40 px-2.5 py-1 text-[10px] font-bold text-white">
                      #{lesson.order}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col border-t hairline p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--copper)]">Lección</p>
                  <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug">{lesson.title}</h3>
                  <span className={`mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em] transition ${
                    viewed ? "text-[var(--forest)]" : "text-[var(--copper)] group-hover:gap-2.5"
                  }`}>
                    {viewed ? "Repasar" : "Reproducir"}
                    <ArrowRightIcon className="h-3.5 w-3.5" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
      <RatingSection courseId={course.id} courseTitle={course.title || detail.title} canRate />
    </div>
  );
}

type PlayerViewProps = {
  course: Course;
  lesson: Lesson;
  src: string;
  all: Lesson[];
  progress: string[];
  onToggle: (lessonId: string) => void;
  onEnded: (next: Lesson) => void;
  onBack: () => void; // vuelve a la grilla de lecciones
};

function PlayerView({ course, lesson, src, all, progress, onToggle, onEnded, onBack }: PlayerViewProps) {
  const [full, setFull] = useState(false);
  const index = all.findIndex((l) => l.id === lesson.id);
  const prevLesson = index > 0 ? all[index - 1] : null;
  const nextLesson = index >= 0 && index < all.length - 1 ? all[index + 1] : null;
  const done = progress.includes(lesson.id);

  return (
    <div className={full ? "fixed inset-0 z-[70] flex flex-col bg-[#000]" : "flex flex-col"}>
      <div className={`${full ? "flex-1 overflow-hidden" : ""} bg-[#000] ${full ? "" : "aspect-video w-full overflow-hidden rounded-2xl border hairline"}`}>
        <video
          key={src}
          src={src}
          controls
          autoPlay
          playsInline
          preload="metadata"
          controlsList="nodownload"
          className="h-full w-full"
          onEnded={() => {
            if (!progress.includes(lesson.id)) {
              onToggle(lesson.id); // suma al llegar al final (no lo desmarca)
            }
            void markLessonDone(lesson.id); // solo al terminar: persiste en el backend
            if (nextLesson) onEnded(nextLesson);
          }}
        >
          Tu navegador no puede reproducir este video.
        </video>
      </div>

      {!full && (
        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <button type="button" onClick={onBack} className="editorial-link inline-flex items-center gap-2 text-sm font-semibold">
              <ArrowLeftIcon className="h-4 w-4" />
              Volver a las lecciones
            </button>
            <p className="eyebrow mt-4">Lección #{lesson.order}</p>
            <h2 className="display-font mt-2 text-3xl leading-tight">{lesson.title}</h2>
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--ink-soft)]">
              {course.title}
            </p>
            {lesson.description ? (
              <p className="mt-3 max-w-2xl whitespace-pre-line text-sm leading-6 text-[var(--ink-soft)]">
                {lesson.description}
              </p>
            ) : null}
          </div>
        </div>
      )}

      <div className={`flex flex-wrap items-center gap-3 ${full ? "mt-4 px-5 py-3 text-white" : "mt-6"}`}>
        <button
          type="button"
          onClick={() => onToggle(lesson.id)}
          className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition ${done ? "border border-[var(--forest)] text-[var(--forest)]" : "bg-[var(--forest)] text-[var(--background)]"}`}
        >
          <CheckIcon className="h-4 w-4" />
          {done ? "Marcar como no visto" : "Marcar como visto"}
        </button>
        <button
          type="button"
          onClick={() => setFull((v) => !v)}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition ${full ? "border border-white/30 text-white hover:bg-white/10" : "border hairline hover:border-[var(--copper)] hover:text-[var(--copper)]"}`}
        >
          {full ? "⤡ Salir de pantalla completa" : "⤢ Pantalla completa"}
        </button>
        {playerNavi(prevLesson, nextLesson, done, course, onEnded)}
      </div>
    </div>
  );
}

function playerNavi(
  prevLesson: Lesson | null,
  nextLesson: Lesson | null,
  _done: boolean,
  _course: Course,
  onEnded: (lesson: Lesson) => void,
) {
  return (
    <>
      {prevLesson ? (
        <button
          type="button"
          onClick={() => onEnded(prevLesson)}
          className="inline-flex items-center gap-2 rounded-full border hairline px-5 py-2 text-sm transition hover:border-[var(--copper)] hover:text-[var(--copper)]"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Anterior
        </button>
      ) : null}
      {nextLesson ? (
        <button
          type="button"
          onClick={() => onEnded(nextLesson)}
          className="inline-flex items-center gap-2 rounded-full border hairline px-5 py-2 text-sm transition hover:border-[var(--copper)] hover:text-[var(--copper)]"
        >
          Siguiente
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      ) : null}
    </>
  );
}

type MineStat = { course: CatCourse; total: number; done: number; pct: number };

type CoursesOverviewProps = {
  mine: CatCourse[];
  stats: MineStat[];
  locked: CatCourse[];
  buying: string | null;
  user: StudentUser;
  onOpen: (courseId: string) => void;
  onBuy: (courseId: string) => void;
  onCloseBuy: () => void;
};

function CoursesOverview({ mine, stats, locked, buying, user, onOpen, onBuy, onCloseBuy }: CoursesOverviewProps) {
  const statBy = new Map<string, MineStat>();
  for (const s of stats) statBy.set(s.course.id, s);
  return (
    <div>
      <section className="mb-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">En curso</p>
            <h2 className="display-font mt-2 text-3xl leading-tight">Cursos con acceso</h2>
          </div>
          <p className="text-sm text-[var(--ink-soft)]">{mine.length} curso{mine.length === 1 ? "" : "s"}</p>
        </div>

        {mine.length === 0 ? (
          <div className="mt-6 rounded-2xl border hairline bg-[var(--paper)] p-10 text-center text-sm text-[var(--ink-soft)]">
            Aún no tienes cursos activos. Mira el catálogo de abajo para empezar.
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {mine.map((c) => {
              const s = statBy.get(c.id);
              const total = s?.total ?? c.lessons;
              const done = s?.done ?? 0;
              const pct = s && s.total ? s.pct : 0;
              const started = pct > 0;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onOpen(c.id)}
                  className="group flex flex-col overflow-hidden rounded-2xl border hairline bg-[var(--paper)] text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[var(--copper)] hover:shadow-2xl"
                >
                  <div className="relative aspect-video overflow-hidden bg-[#171713]">
                    <CourseThumb img={c.coverImageUrl} title={c.title} />
                    {/* Gradiente inferior para la legibilidad */}
                    <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                    {/* Badge de estado */}
                    <span className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${
                      started ? "bg-[var(--forest)] text-[var(--background)]" : "border border-white/50 bg-black/40 text-white"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${started ? "bg-[var(--lime)]" : "bg-white/80"}`} />
                      {started ? "En progreso" : "Comenzar"}
                    </span>
                    {/* Porcentaje en esquina */}
                    <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
                      <ChartIcon className="h-3 w-3" />
                      {pct}%
                    </span>
                    {/* Anillo de reproducción */}
                    <span className="absolute inset-0 flex items-center justify-center transition group-hover:bg-black/10">
                      <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/60 bg-white/15 backdrop-blur-sm transition group-hover:scale-110 group-hover:bg-[var(--copper)]">
                        <PlayIcon className="h-7 w-7 text-white transition group-hover:text-[var(--forest-deep)]" />
                      </span>
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col border-t hairline p-5">
                    <h3 className="display-font text-lg leading-tight line-clamp-1">{c.title}</h3>
                    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[var(--ink-soft)]">
                      <MonitorIcon className="h-3.5 w-3.5 shrink-0" />
                      {total} leccion{total === 1 ? "" : "es"}
                    </p>

                    <div className="mt-4 flex items-center justify-between text-[11px] font-semibold">
                      <span className="text-[var(--ink-soft)]">{done}/{total} vistas</span>
                      <span className="text-[var(--copper)]">{pct}% completado</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[var(--line)]">
                      <span
                        className="block h-full rounded-full bg-gradient-to-r from-[var(--copper)] to-[var(--forest)] transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <span className="mt-4 inline-flex w-full items-center justify-between text-xs font-bold uppercase tracking-[0.14em] text-[var(--copper)] transition group-hover:gap-3 group-hover:text-[var(--forest)]">
                      Continuar
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--copper)]/10">
                        <ArrowRightIcon className="h-4 w-4" />
                      </span>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Catálogo</p>
            <h2 className="display-font mt-2 text-3xl leading-tight">Otros cursos</h2>
          </div>
          <p className="text-sm text-[var(--ink-soft)]">Bloqueados por ahora · compra para desbloquear</p>
        </div>

        {locked.length === 0 ? (
          <div className="mt-6 rounded-2xl border hairline bg-[var(--paper)] p-10 text-center text-sm text-[var(--ink-soft)]">
            No hay más cursos disponibles por ahora.
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {locked.map((c) => (
              <article key={c.id} className="flex flex-col overflow-hidden rounded-2xl border hairline bg-[var(--paper)]">
                <div className="relative aspect-video overflow-hidden">
                  <CourseThumb img={c.coverImageUrl} title={c.title} />
                  <span className="absolute inset-0 flex items-center justify-center bg-[#171713]/45">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/10 p-3 text-white backdrop-blur-sm"><svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M12 2a4 4 0 0 0-4 4v2H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-2V6a4 4 0 0 0-4-4Zm-2 6V6a2 2 0 1 1 4 0v2h-4Zm2 5.5a1.5 1.5 0 0 0-1 2.8V17l2 .6V16.3a1.5 1.5 0 0 0-1-2.3Z" /></svg></span>
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                    <PadlockIcon className="h-3.5 w-3.5" /> Cerrado
                  </p>
                  <h3 className="display-font mt-2 text-xl leading-tight">{c.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-[var(--ink-soft)]">{c.description ?? ""}</p>
                  <button
                    type="button"
                    onClick={() => onBuy(c.id)}
                    className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-[var(--copper)] px-5 py-2.5 text-sm font-bold text-[var(--forest-deep)] transition hover:brightness-105"
                  >
                    <UsersIcon className="h-4 w-4" />
                    Inscribirme
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {buying ? (
        <BuyModal
          title={locked.find((c) => c.id === buying)?.title ?? buying}
          user={user}
          onClose={onCloseBuy}
        />
      ) : null}
    </div>
  );
}

function BuyModal({ title, user, onClose }: { title: string; user: StudentUser; onClose: () => void }) {
  const [auto, setAuto] = useState(true);
  const [name, setName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");

  function applyMine() {
    setName(user.fullName);
    setEmail(user.email);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (sending) return;
    setSending(true);
    setStatus("idle");
    try {
      await createLead({
        name: name.trim(),
        email: email.trim(),
        channel: "CONTACT_FORM",
        message: `Comprar nuevo curso: ${title}`,
      });
      setStatus("ok");
    } catch {
      setStatus("error");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={`Inscribirme a ${title}`}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl border hairline bg-[var(--paper)] p-6 sm:p-8">
        <button type="button" onClick={onClose} aria-label="Cerrar" className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border hairline text-sm font-bold hover:border-[var(--copper)] hover:text-[var(--copper)]">✕</button>
        <p className="eyebrow">Compra de curso</p>
        <h3 className="display-font mt-2 text-2xl leading-tight">Inscribirme · {title}</h3>
        <p className="mt-2 text-xs text-[var(--ink-soft)]">
          Deja tus datos o usa <button type="button" onClick={() => { setAuto(true); applyMine(); }} className="inline-flex items-center gap-1.5 font-semibold underline"><UsersIcon className="h-4 w-4" /> autocompletar con mi perfil</button>. El equipo te contactará para coordinar el pago y activar el acceso.
        </p>

        {status === "ok" ? (
          <p role="status" aria-live="polite" className="mt-6 rounded-xl border border-[var(--forest)] bg-[var(--lime)] px-5 py-4 text-sm font-semibold text-[var(--forest-deep)]">
            ✓ ¡Listo {user.fullName.split(" ")[0] || "amigo"}! Enviamos tu solicitud al administrador. Te contactaremos pronto.
          </p>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={submit} noValidate>
            <label className="block text-sm">
              <span className="font-semibold">Nombre</span>
              <input required value={name} onChange={(e) => { setAuto(false); setName(e.target.value); }} className="mt-1 w-full border-b border-[var(--forest)] bg-transparent py-2 outline-none" placeholder="María Gómez" />
            </label>
            <label className="block text-sm">
              <span className="font-semibold">Correo</span>
              <input required type="email" value={email} onChange={(e) => { setAuto(false); setEmail(e.target.value); }} className="mt-1 w-full border-b border-[var(--forest)] bg-transparent py-2 outline-none" placeholder="maria@correo.com" />
            </label>
            <label className="flex items-center gap-2 text-sm text-[var(--ink-soft)]">
              <input type="checkbox" checked={auto} onChange={(e) => { setAuto(e.target.checked); if (e.target.checked) applyMine(); }} className="size-4 accent-[var(--copper)]" />
              Usar mis datos de la cuenta
            </label>
            {status === "error" && <p role="alert" className="text-xs font-semibold text-[var(--danger)]">No se pudo enviar. Intenta de nuevo.</p>}
            <button disabled={sending} className="w-full rounded-full bg-[var(--forest)] px-6 py-3 text-sm font-bold text-[var(--background)] transition hover:bg-[var(--copper)] disabled:opacity-50">
              {sending ? "Enviando…" : "Enviar y avisar al administrador"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}


function MaterialsOverview({
  mine,
  materialsByCourse,
}: {
  mine: CatCourse[];
  materialsByCourse: Record<string, Material[]>;
}) {
  const [preview, setPreview] = useState<Material | null>(null);
  const withMaterials = mine.filter((c) => (materialsByCourse[c.id] ?? []).length > 0);
  const total = Object.values(materialsByCourse).reduce((n, list) => n + list.length, 0);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Archivos de tus cursos</p>
          <h2 className="display-font mt-2 text-3xl leading-tight">Materiales</h2>
        </div>
        <p className="text-sm text-[var(--ink-soft)]">{total} documento{total === 1 ? "" : "s"}</p>
      </div>

      {mine.length === 0 || withMaterials.length === 0 ? (
        <div className="mt-6 rounded-2xl border hairline bg-[var(--paper)] p-10 text-center text-sm text-[var(--ink-soft)]">
          Aún no hay materiales publicados para tus cursos.
        </div>
      ) : (
        <div className="mt-6 space-y-10">
          {mine.map((c) => {
            const list = materialsByCourse[c.id] ?? [];
            if (list.length === 0) return null;
            return (
              <div key={c.id}>
                <h3 className="display-font text-2xl">{c.title}</h3>
                <ul className="mt-4 space-y-3">
                  {list.map((material) => {
                    const isPdf = material.mimeType?.toLowerCase().includes("pdf");
                    return (
                      <li key={material.id} className="flex flex-wrap items-center gap-3 rounded-xl border hairline bg-[var(--paper)] p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--lime)] text-[var(--forest)]">
                          <span aria-hidden="true" className="flex h-5 w-5 items-center justify-center">
                            <FileIcon pdf={isPdf} className="h-6 w-6" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{material.title || material.fileName || "Documento"}</p>
                          {material.fileName ? <p className="truncate text-xs text-[var(--ink-soft)]">{material.fileName}</p> : null}
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setPreview(material)}
                            className="rounded-full border hairline px-4 py-2 text-xs font-semibold text-[var(--copper)] transition hover:border-[var(--copper)]"
                          >
                            Ver
                          </button>
                          <a href={materialDownloadUrl(material.id)} aria-label={`Descargar ${material.title}`} className="inline-flex items-center gap-1.5 rounded-full border hairline px-4 py-2 text-xs font-semibold text-[var(--copper)] transition hover:border-[var(--copper)]">
                            <DownloadIcon className="h-3.5 w-3.5" />
                            Descargar
                          </a>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      {preview ? (
        <MaterialPreview
          material={preview}
          src={materialFileUrl(preview.id)}
          onClose={() => setPreview(null)}
        />
      ) : null}
    </div>
  );
}

function MaterialPreview({ material, src, onClose }: { material: Material; src: string; onClose: () => void }) {
  const isPdf = material.mimeType?.toLowerCase().includes("pdf");
  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col bg-[#171713]/90 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`Vista previa de ${material.title}`}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-white">
        <p className="flex items-center gap-2 truncate text-sm font-semibold">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center text-[var(--copper)]"><FileIcon pdf={isPdf} className="h-5 w-5" /></span>
          {material.title || material.fileName || "Documento"}
        </p>
        <div className="flex items-center gap-3">
          <a
            href={materialDownloadUrl(material.id)}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--copper)] px-5 py-2 text-sm font-bold text-[var(--forest-deep)] transition hover:brightness-105"
          >
            <DownloadIcon className="h-4 w-4" />
            Descargar PDF
          </a>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 text-white transition hover:bg-white/10"
          >
            ✕
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden rounded-xl border border-white/10 bg-white">
        {isPdf ? (
          <iframe src={src} title={`Vista previa de ${material.title}`} className="h-full w-full" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={material.title ?? "Material"} className="h-full w-full object-contain" />
        )}
      </div>
    </div>
  );
}



function ProgressOverview({
  mine,
  stats,
  totalWatched,
}: {
  mine: CatCourse[];
  stats: { course: CatCourse; total: number; done: number; pct: number }[];
  totalWatched: number;
}) {
  const totalLessons = stats.reduce((n, s) => n + s.total, 0);
  const globalPct = totalLessons ? Math.round((totalWatched / totalLessons) * 100) : 0;
  const byCourse = stats.length ? stats : [];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Rendimiento</p>
          <h2 className="display-font mt-2 text-3xl leading-tight">Tu progreso</h2>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Cursos activos" value={mine.length} icon={<BookIcon className="h-4 w-4" />} />
        <StatCard label="Videos totales" value={stats.reduce((n, s) => n + s.total, 0)} icon={<MonitorIcon className="h-4 w-4" />} />
        <StatCard label="Videos vistos" value={totalWatched} icon={<CheckIcon className="h-4 w-4" />} />
        <StatCard label="% Completado" value={`${globalPct}%`} icon={<ChartIcon className="h-4 w-4" />} />
      </div>

      <div className="mt-8 rounded-2xl border hairline bg-[var(--paper)] p-6 sm:p-8">
        <p className="eyebrow">Gráfica de rendimiento</p>
        <h3 className="display-font mt-2 text-2xl leading-tight">Avance por curso</h3>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">
          Porcentaje de lecciones vistas en cada curso inscrito.
        </p>

        {byCourse.length === 0 ? (
          <p className="mt-6 rounded-xl border hairline bg-[var(--lime)] px-5 py-6 text-center text-sm text-[var(--ink-soft)]">
            Aún no tienes cursos con lecciones para graficar.
          </p>
        ) : (
          <div className="mt-6 space-y-5">
            {byCourse.map((s) => (
              <div key={s.course.id}>
                <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold">{s.course.title}</span>
                  <span className="text-[var(--ink-soft)]">
                    {s.done}/{s.total} · {s.pct}%
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--line)]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--copper)] to-[var(--forest)] transition-all"
                    style={{ width: `${s.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="flex items-start gap-3 rounded-xl border hairline bg-[var(--lime)] p-5 text-sm leading-6 text-[var(--forest-deep)]">
          <span className="mt-0.5 shrink-0 text-[var(--copper)]"><LightbulbIcon className="h-5 w-5" /></span>
          <span>Marca como <strong>visto</strong> cada video al terminar para llevar tu gráfica al día.</span>
        </div>
        <div className="flex items-start gap-3 rounded-xl border hairline bg-[var(--lime)] p-5 text-sm leading-6 text-[var(--forest-deep)]">
          <span className="mt-0.5 shrink-0 text-[var(--copper)]"><TargetIcon className="h-5 w-5" /></span>
          <span>{totalWatched === 0 ? "Reproduce tu primera lección para empezar a medir tu avance." : globalPct >= 100 ? "¡Lo completaste! Felicitaciones." : `Llevas ${globalPct}% de tu plan. Sigue así.`}</span>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: ReactNode }) {
  return (
    <div className="rounded-xl border hairline bg-[var(--paper)] p-5 transition hover:border-[var(--copper)]">
      <p className="eyebrow flex items-center gap-2">{icon}{label}</p>
      <p className="display-font mt-3 text-4xl leading-none">{value}</p>
    </div>
  );
}
