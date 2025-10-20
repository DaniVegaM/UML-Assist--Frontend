import { Link } from "react-router";

const SEQUENCE_DIAGRAM_FEATURES = [
  { icon: "✓", text: "Notación estándar UML 2.x" },
  { icon: "✓", text: "Coherencia de mensajes" },
  { icon: "✓", text: "Edición rápida en el lienzo" },
  { icon: "✓", text: "Validación de lifelines" }
];

const ACTIVITY_DIAGRAM_FEATURES = [
  { icon: "✓", text: "Comprobación de flujo/terminales" },
  { icon: "✓", text: "Nombres claros de acciones" },
  { icon: "✓", text: "Detección de patrones confusos" },
  { icon: "✓", text: "Validación de bifurcaciones" }
];

const HOW_IT_WORKS_STEPS = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
    t: "Modela en el lienzo",
    d: "Arrastra elementos y edita propiedades. Mantienes control total."
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    t: "Análisis contextual",
    d: "El cliente envía el estado del diagrama a la API para evaluar reglas."
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    t: "Recomendaciones",
    d: "Recibe sugerencias accionables (nombrado, secuencia, legibilidad)."
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    t: "Aprende haciendo",
    d: "Mejora tu diagrama sin depender de generación automática."
  },
];

const FAQ_ITEMS = [
  {
    q: "¿La plataforma genera los diagramas por mí?",
    a: "No. UML-Assist es una herramienta de asistencia, no de generación automática. Tú construyes tus diagramas manualmente con total libertad creativa, y la plataforma te ofrece recomendaciones opcionales basadas en reglas UML y buenas prácticas. Las recomendaciones son tuyas para aceptar o rechazar.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    q: "¿Qué diagramas soporta actualmente?",
    a: "En esta etapa, la plataforma soporta diagramas de secuencia y diagramas de actividades. El diseño de la arquitectura contempla la posibilidad de extender el soporte a otros tipos de diagramas UML en el futuro.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  },
  {
    q: "¿Es realmente gratuito?",
    a: "Sí, completamente. UML-Assist es un proyecto de código abierto desarrollado como Trabajo Terminal en ESCOM-IPN. No hay costos ocultos, suscripciones ni limitaciones de uso. Nuestro objetivo es democratizar el acceso a herramientas de modelado UML de calidad.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    q: "¿Necesito experiencia previa en UML?",
    a: "No necesariamente. La plataforma está diseñada tanto para principiantes como para usuarios experimentados. Las recomendaciones contextuales te ayudan a aprender mientras practicas, y puedes mejorar gradualmente tu comprensión de UML sin sentirte abrumado.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
      </svg>
    )
  },
  {
    q: "¿Cómo funciona la IA en la plataforma?",
    a: "La IA analiza el contexto de tu diagrama (elementos, relaciones, estructura) y evalúa su coherencia contra reglas UML establecidas. Luego genera recomendaciones específicas sobre notación, claridad y mejores prácticas. No reemplaza tu trabajo, sino que lo complementa.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    q: "¿Puedo colaborar con otros usuarios?",
    a: "En la versión actual, el enfoque está en el modelado individual con asistencia de IA. Sin embargo, como proyecto de código abierto, puedes contribuir al desarrollo de nuevas funcionalidades, incluyendo colaboración en tiempo real, en nuestro repositorio de GitHub.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  }
];

interface BlockProps {
  title: string;
  children: React.ReactNode;
}

function Block({ title, children }: BlockProps) {
  return (
    <section className="w-full dark:bg-zinc-800 bg-white p-8 md:p-12 rounded-2xl shadow-lg border border-zinc-200/60 dark:border-zinc-700/60 hover:shadow-xl transition-all duration-300">
      <h2 className="text-xl md:text-2xl font-black uppercase dark:text-white bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">{title}</h2>
      <div className="mt-4 text-sm md:text-base text-zinc-700 dark:text-zinc-100/90">{children}</div>
    </section>
  );
}

export default function HomePage() {

  return (
    <main className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 my-8 space-y-12">
      <section className="relative overflow-hidden dark:bg-zinc-800 bg-white p-8 md:p-16 rounded-3xl shadow-2xl border border-zinc-200/60 dark:border-zinc-700/60">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10" />

        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap gap-3 pt-4 justify-center md:justify-start -mb-4">
              <span className="inline-flex items-center gap-2 text-xs font-black uppercase px-4 py-2 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Código abierto
              </span>
              <span className="inline-flex items-center gap-2 text-xs font-black uppercase px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Asistencia con IA
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black leading-tight dark:text-white text-center md:text-left">
              Crea y Perfecciona tus{" "}
              <span className="uppercase text-sky-600 md:text-6xl">
                Diagramas UML
              </span>{" "}
              con ayuda inteligente
            </h1>

            <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-100/90 leading-relaxed text-center md:text-left">
              UML-Assist te <strong className="text-sky-600 dark:text-sky-400">guía paso a paso</strong> mientras construyes{" "}
              <strong>diagramas de secuencia</strong> y <strong>de actividades</strong>, ofreciendo{" "}
              <strong className="text-sky-600 dark:text-sky-400">recomendaciones inteligentes</strong> de notación y coherencia.{" "}
              <span className="italic">Construye mientras aprendes.</span>
            </p>

            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <Link
                to="/crear-cuenta"
                className="group relative inline-flex items-center gap-2 bg-sky-600 text-white px-8 py-4 rounded-full text-base font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <span>Comenzar ahora</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                to="/iniciar-sesion"
                className="inline-flex items-center gap-2 border-2 border-sky-600 text-sky-600 dark:text-sky-400 dark:border-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 px-8 py-4 rounded-full text-base font-bold transition-all duration-300"
              >
                Iniciar sesión
              </Link>
            </div>
          </div>

          <div>
            <p className="text-center">Ejemplo de diagrama aquí</p>
          </div>
        </div>
      </section>

      <Block title="Objetivo de la plataforma">
        <div className="space-y-4">
          <p className="text-lg leading-relaxed">
            Desarrollar una <strong className="text-sky-600 dark:text-sky-400">aplicación web</strong> que asista la construcción de diagramas UML de{" "}
            <strong className="text-sky-600 dark:text-sky-400 uppercase font-black">secuencia</strong> y{" "}
            <strong className="text-sky-600 dark:text-sky-400 uppercase font-black">actividades</strong>, con recomendaciones contextualizadas basadas en reglas y buenas prácticas.
          </p>

          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border border-red-200 dark:border-red-800">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-red-700 dark:text-red-300">Reducir errores</h4>
                <p className="text-sm text-red-600 dark:text-red-400">Minimiza errores frecuentes en el modelado UML</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-green-700 dark:text-green-300">Elevar calidad</h4>
                <p className="text-sm text-green-600 dark:text-green-400">Mejora la calidad del modelado con buenas prácticas</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h4 className="font-bold text-blue-700 dark:text-blue-300">Aprendizaje guiado</h4>
                <p className="text-sm text-blue-600 dark:text-blue-400">Aprende sin perder tu autonomía creativa</p>
              </div>
            </div>
          </div>
        </div>
      </Block>

      <Block title="Tipos de diagramas soportados">
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="group p-6 rounded-2xl border-2 border-sky-200/60 dark:border-sky-700/60 bg-white dark:bg-zinc-800 hover:border-sky-400 dark:hover:border-sky-500 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-sky-600 flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
                </svg>
              </div>
              <h3 className="font-black text-xl dark:text-white">Diagrama de Secuencia</h3>
            </div>

            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Modela <strong>interacciones temporales</strong> entre actores y objetos. Validación de lifelines, mensajes síncronos/asíncronos y consistencia con casos de uso.
            </p>

            <div className="mt-5 space-y-2">
              {SEQUENCE_DIAGRAM_FEATURES.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs font-bold">
                    {item.icon}
                  </span>
                  <span className="text-zinc-700 dark:text-zinc-200">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="group p-6 rounded-2xl border-2 border-sky-200/60 dark:border-sky-700/60 bg-white dark:bg-zinc-800 hover:border-sky-400 dark:hover:border-sky-500 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-sky-600 flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="font-black text-xl dark:text-white">Diagrama de Actividades</h3>
            </div>

            <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Representa <strong>flujos de control y datos</strong>, decisiones, concurrencia y estados. Recomendaciones para bifurcaciones, uniones y legibilidad.
            </p>

            <div className="mt-5 space-y-2">
              {ACTIVITY_DIAGRAM_FEATURES.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs font-bold">
                    {item.icon}
                  </span>
                  <span className="text-zinc-700 dark:text-zinc-200">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Block>

      <Block title="¿Cómo funciona?">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS_STEPS.map((s, i) => (
            <div
              key={i}
              className="group p-6 rounded-2xl border-2 border-sky-200/60 dark:border-sky-700/60 bg-white dark:bg-zinc-800 hover:border-sky-400 dark:hover:border-sky-500 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
            >
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-sky-600 text-white mb-4 group-hover:scale-110 transition-transform duration-300">
                {s.icon}
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 text-sm font-black">
                  {i + 1}
                </span>
                <h4 className="font-black text-lg dark:text-white">
                  {s.t}
                </h4>
              </div>

              <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 p-6 rounded-2xl bg-sky-50 dark:bg-sky-900/20 border-2 border-sky-200 dark:border-sky-800">
          <h3 className="text-center font-bold text-sky-900 dark:text-sky-100 mb-4">Flujo de trabajo</h3>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-zinc-800 border-2 border-sky-200 dark:border-sky-700 shadow-sm">
              <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-semibold text-sm dark:text-white">Usuario</span>
            </div>

            <svg className="w-8 h-8 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>

            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-zinc-800 border-2 border-sky-200 dark:border-sky-700 shadow-sm">
              <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              <span className="font-semibold text-sm dark:text-white">Lienzo</span>
            </div>

            <svg className="w-8 h-8 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>

            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-zinc-800 border-2 border-sky-200 dark:border-sky-700 shadow-sm">
              <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="font-semibold text-sm dark:text-white">IA</span>
            </div>

            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>

            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 text-white border-2 border-emerald-500 shadow-md">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <span className="font-semibold text-sm">Recomendaciones</span>
            </div>
          </div>
        </div>
      </Block>

      <Block title="Código abierto y accesible">
        <div className="space-y-6">
          <div className="flex items-start gap-4 p-6 rounded-2xl bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-2 border-emerald-200 dark:border-emerald-800">
            <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-black text-xl text-emerald-700 dark:text-emerald-300 mb-2">Software Libre y Colaborativo</h3>
              <p className="text-zinc-700 dark:text-zinc-200 leading-relaxed">
                Proyecto de <strong className="text-emerald-600 dark:text-emerald-400">código abierto</strong> desarrollado por estudiantes del IPN-ESCOM para maximizar el acceso y la colaboración. Nuestra misión es reducir costos de adopción y ofrecer una alternativa educativa de calidad para modelado UML.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-white dark:bg-zinc-800/50 border-2 border-sky-200/60 dark:border-sky-700/60 hover:border-sky-400 dark:hover:border-sky-600 transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-sky-600 text-white mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                </svg>
              </div>
              <h4 className="font-bold dark:text-white mb-2">Para estudiantes</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-300">Herramienta educativa gratuita para aprender UML</p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-zinc-800/50 border-2 border-sky-200/60 dark:border-sky-700/60 hover:border-sky-400 dark:hover:border-sky-600 transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-sky-600 text-white mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="font-bold dark:text-white mb-2">Colaborativo</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-300">Contribuye al proyecto y mejora la herramienta</p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-zinc-800/50 border-2 border-sky-200/60 dark:border-sky-700/60 hover:border-sky-400 dark:hover:border-sky-600 transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-sky-600 text-white mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-bold dark:text-white mb-2">Sin costo</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-300">Acceso completo sin suscripciones ni pagos</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <a
              href="https://github.com/DaniVegaM/UML-Assist--Frontend"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 text-white hover:from-gray-900 hover:to-black dark:hover:from-gray-600 dark:hover:to-gray-700 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>Ver en GitHub</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            <Link
              to="/docs"
              className="inline-flex items-center justify-center gap-2 border-2 border-sky-600 text-sky-600 dark:text-sky-400 dark:border-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Ver documentación
            </Link>
          </div>
        </div>
      </Block>

      <Block title="Preguntas frecuentes">
        <div className="grid gap-4 md:grid-cols-2">
          {FAQ_ITEMS.map((faq, i) => (
            <details key={i} className="group rounded-2xl border-2 border-sky-200/60 dark:border-sky-700/60 overflow-hidden hover:border-sky-400 dark:hover:border-sky-600 transition-all duration-300 bg-white dark:bg-zinc-800">
              <summary className="cursor-pointer p-6 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-all duration-300 list-none">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-lg group-open:scale-110 transition-transform duration-300">
                    {faq.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-base lg:text-lg dark:text-white flex items-center justify-between">
                      <span className="pr-2">{faq.q}</span>
                      <svg className="flex-shrink-0 w-6 h-6 text-zinc-400 group-open:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </h3>
                  </div>
                </div>
              </summary>
              <div className="px-6 pb-6 pt-2 border-t border-sky-200 dark:border-sky-700">
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed pl-16">
                  {faq.a}
                </p>
              </div>
            </details>
          ))}
        </div>

        <div className="mt-8 p-8 rounded-2xl bg-sky-600 text-white">
          <div className="text-center">
            <h3 className="text-2xl md:text-3xl font-black mb-3">¿Listo para mejorar tus diagramas UML?</h3>
            <p className="text-sky-100 mb-6 max-w-2xl mx-auto">
              Únete a la comunidad de estudiantes y profesionales que están mejorando sus habilidades de modelado con asistencia inteligente.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/crear-cuenta"
                className="inline-flex items-center gap-2 bg-white text-sky-600 hover:bg-sky-50 px-8 py-4 rounded-full text-base font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <span>Crear cuenta gratis</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                to="/iniciar-sesion"
                className="inline-flex items-center gap-2 border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-full text-base font-bold transition-all duration-300"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </div>
      </Block>
    </main>
  );
}
