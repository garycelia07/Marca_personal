"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCourse, type Course, type Lesson, type Module } from "@/lib/api/courses";
import { materialFileUrl, materialDownloadUrl, type Material } from "@/lib/api/materials";
import { createLead } from "@/lib/api/leads";
import { publicBackendOrigin } from "@/lib/site";
import { getMyProgress, markLessonDone } from "@/lib/api/progress";
import { RatingSection } from "@/components/rating-section";

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

const ALL_LESSON_RE = /\.(mp4|webm|m4v|ogv|ogg)(\?|#|$)/i;

function sortModules(modules: Module[] | undefined): Module[] {
  return [...(modules ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

function flatLessons(course: Course): Lesson[] {
  return sortModules(course.modules).flatMap((m) => [...(m.lessons ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
}

type SectionId = "cursos" | "materiales" | "progreso";
type NavTab = { id: SectionId; label: string; icon: string };

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
      {/* Barra lateral */}
      <aside className="border-b hairline bg-[var(--paper)] lg:min-h-screen lg:border-b-0 lg:border-r lg:flex lg:flex-col">
        <div className="flex items-center gap-3 px-5 py-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--forest)] font-bold text-[var(--background)]">
            {initials(user.fullName)}
          </span>
          <div className="min-w-0">
            <p className="display-font text-base leading-tight">{user.fullName}</p>
            <p className="text-xs text-[var(--ink-soft)]">Estudiante</p>
          </div>
        </div>

        <nav className="flex gap-2 overflow-x-auto px-5 pb-4 lg:flex-col lg:gap-1 lg:overflow-visible">
          {NAV_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setSection(tab.id);
                if (tab.id !== "cursos") {
                  setOpenCourseId(null);
                  setPlaying(null);
                }
              }}
              className={`flex shrink-0 items-center gap-3 rounded-full px-4 py-2.5 text-sm lg:rounded-xl ${
                section === tab.id
                  ? "bg-[var(--forest)] font-semibold text-[var(--background)]"
                  : "text-[var(--ink-soft)] hover:bg-[var(--lime)] hover:text-[var(--forest)]"
              }`}
            >
              <span aria-hidden="true">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="border-t hairline px-5 py-4 lg:mt-auto">
          <button
            type="button"
            onClick={() => { void handleLogout(); }}
            className="flex w-full items-center justify-center gap-2 rounded-full border hairline px-4 py-2.5 text-sm font-semibold text-[var(--danger)] transition hover:bg-[var(--danger)] hover:text-white"
          >
            ⏻ Cerrar sesión
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
          <p className="text-sm text-[var(--ink-soft)]">Bienvenido de nuevo 👋</p>
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
                onExit={closeCourse}
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
  { id: "cursos", label: "Mis cursos", icon: "🎓" },
  { id: "materiales", label: "Materiales", icon: "📎" },
  { id: "progreso", label: "Mi progreso", icon: "📈" },
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

function coverFallback(title: string, withPad: number): string {
  // Colores elegantes basados en el hash del título para cursos sin portada.
  const palette = ["#1f1a17", "#233a2b", "#8a6a06", "#3f3aa8", "#512030"];
  let h = 0;
  for (let i = 0; i < title.length; i += 1) h = (h * 31 + title.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}

function CourseThumb({ img, title }: { img?: string | null; title: string }) {
  const bg = coverFallback(title, 0);
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
      <button type="button" onClick={onBack} className="editorial-link text-sm font-semibold">
        ← Volver a mis cursos
      </button>
      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Contenido del curso</p>
          <h2 className="display-font mt-2 text-3xl leading-tight sm:text-4xl">{headline}</h2>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">
            {lessons.length} lecciones · {doneCount} vistas · {pct}% completado
          </p>
        </div>
      </div>

      <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-[var(--line)]">
        <div className="h-full rounded-full bg-[var(--copper)] transition-all" style={{ width: `${pct}%` }} />
      </div>

      {lessons.length === 0 ? (
        <p className="mt-10 rounded-2xl border hairline bg-[var(--paper)] px-6 py-12 text-center text-sm text-[var(--ink-soft)]">
          Este curso aún no tiene lecciones publicadas.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {lessons.map((lesson) => (
            <button
              key={lesson.id}
              type="button"
              onClick={() => onPlay(lesson)}
              className="group flex flex-col overflow-hidden rounded-2xl border hairline bg-[var(--paper)] text-left transition hover:-translate-y-1 hover:border-[var(--copper)] hover:shadow-xl"
            >
              <div className="relative aspect-video overflow-hidden bg-[#171713]">
                <CourseThumb img={youtubeThumb(lesson.videoUrl)} title={lesson.title} />
                <span className="absolute inset-0 flex items-center justify-center bg-black/25 transition group-hover:bg-black/10">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-full pl-0.5 transition ${
                    progress.includes(lesson.id)
                      ? "bg-[var(--forest)] text-[var(--background)]"
                      : "bg-[var(--copper)] text-[var(--forest-deep)]"
                  }`}>
                    {progress.includes(lesson.id) ? "✓" : "▶"}
                  </span>
                </span>
                {progress.includes(lesson.id) && (
                  <span className="absolute right-2 top-2 rounded-full bg-[var(--copper)] px-2 py-0.5 text-[10px] font-bold text-[var(--forest-deep)]">
                    ✓ Visto
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-1 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--copper)]">
                  Lección #{lesson.order}
                </p>
                <h3 className="line-clamp-2 text-sm font-semibold">{lesson.title}</h3>
              </div>
            </button>
          ))}
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
  onExit: () => void; // vuelve a "mis cursos"
};

function PlayerView({ course, lesson, src, all, progress, onToggle, onEnded, onBack, onExit }: PlayerViewProps) {
  const [full, setFull] = useState(false);
  const index = all.findIndex((l) => l.id === lesson.id);
  const prevLesson = index > 0 ? all[index - 1] : null;
  const nextLesson = index >= 0 && index < all.length - 1 ? all[index + 1] : null;
  const done = progress.includes(lesson.id);

  return (
    <div className={full ? "fixed inset-0 z-[70] flex flex-col bg-[#000]" : "flex flex-col"}>
      <div className={`${full ? "flex-1 overflow-hidden" : ""} bg-[#000] ${full ? "" : "aspect-video w-full overflow-hidden rounded-2xl border hairline"}`}>
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
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
            <button type="button" onClick={onBack} className="editorial-link text-sm font-semibold">
              ← Volver a las lecciones
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
          className={`rounded-full px-5 py-2 text-sm font-semibold ${done ? "border border-[var(--forest)] text-[var(--forest)]" : "bg-[var(--forest)] text-[var(--background)]"}`}
        >
          {done ? "✓ Marcar como no visto" : "Marcar como visto"}
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
          className="rounded-full border hairline px-5 py-2 text-sm transition hover:border-[var(--copper)] hover:text-[var(--copper)]"
        >
          ← Anterior
        </button>
      ) : null}
      {nextLesson ? (
        <button
          type="button"
          onClick={() => onEnded(nextLesson)}
          className="rounded-full border hairline px-5 py-2 text-sm transition hover:border-[var(--copper)] hover:text-[var(--copper)]"
        >
          Siguiente →
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
            {mine.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onOpen(c.id)}
                className="group flex flex-col overflow-hidden rounded-2xl border hairline bg-[var(--paper)] text-left transition hover:-translate-y-1 hover:border-[var(--copper)] hover:shadow-xl"
              >
                <div className="relative aspect-video overflow-hidden">
                  <CourseThumb img={c.coverImageUrl} title={c.title} />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition group-hover:bg-black/5">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--copper)] pl-0.5 text-[var(--forest-deep)]">▶</span>
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="display-font text-xl leading-tight">{c.title}</h3>
                  {(() => {
                    const s = statBy.get(c.id);
                    return (
                      <p className="mt-2 text-xs text-[var(--ink-soft)]">
                        {s?.total ? `${s.total} leccion${s.total === 1 ? "" : "es"} · ` : `${c.lessons} leccion${c.lessons === 1 ? "" : "es"} · `}
                        {s && s.total ? `${s.pct}% visto` : "0% por ahora"}
                      </p>
                    );
                  })()}
                  <span className="mt-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--copper)]">
                    Continuar <span>→</span>
                  </span>
                </div>
              </button>
            ))}
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
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--ink-soft)]">🔒 Cerrado</p>
                  <h3 className="display-font mt-2 text-xl leading-tight">{c.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-[var(--ink-soft)]">{c.description ?? ""}</p>
                  <button
                    type="button"
                    onClick={() => onBuy(c.id)}
                    className="mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-[var(--copper)] px-5 py-2.5 text-sm font-bold text-[var(--forest-deep)] transition hover:brightness-105"
                  >
                    🔓 Inscribirme
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
          Deja tus datos o usa <button type="button" onClick={() => { setAuto(true); applyMine(); }} className="font-semibold underline">📋 autocompletar con mi perfil</button>. El equipo te contactará para coordinar el pago y activar el acceso.
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
                        <span aria-hidden="true" className="text-2xl">{isPdf ? "📄" : "🖼️"}</span>
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
                          <a href={materialDownloadUrl(material.id)} aria-label={`Descargar ${material.title}`} className="rounded-full border hairline px-4 py-2 text-xs font-semibold text-[var(--copper)] transition hover:border-[var(--copper)]">
                            ⬇ Descargar
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
        <p className="truncate text-sm font-semibold">📄 {material.title || material.fileName || "Documento"}</p>
        <div className="flex items-center gap-3">
          <a
            href={materialDownloadUrl(material.id)}
            className="rounded-full bg-[var(--copper)] px-5 py-2 text-sm font-bold text-[var(--forest-deep)] transition hover:brightness-105"
          >
            ⬇ Descargar PDF
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
        <StatCard label="Cursos activos" value={mine.length} icon="🎓" />
        <StatCard label="Videos totales" value={stats.reduce((n, s) => n + s.total, 0)} icon="🎬" />
        <StatCard label="Videos vistos" value={totalWatched} icon="✅" />
        <StatCard label="% Completado" value={`${globalPct}%`} icon="📊" />
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
        <div className="rounded-xl border hairline bg-[var(--lime)] p-5 text-sm leading-6 text-[var(--forest-deep)]">
          💡 Marca como <strong>visto</strong> cada video al terminar para llevar tu gráfica al día.
        </div>
        <div className="rounded-xl border hairline bg-[var(--lime)] p-5 text-sm leading-6 text-[var(--forest-deep)]">
          🎯 {totalWatched === 0 ? "Reproduce tu primera lección para empezar a medir tu avance." : globalPct >= 100 ? "¡Lo completaste! Felicitaciones." : `Llevas ${globalPct}% de tu plan. Sigue así.`}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="rounded-xl border hairline bg-[var(--paper)] p-5">
      <p className="eyebrow">{icon ? `${icon} ` : ""}{label}</p><p className="display-font mt-3 text-4xl leading-none">{value}</p>
    </div>
  );
}
