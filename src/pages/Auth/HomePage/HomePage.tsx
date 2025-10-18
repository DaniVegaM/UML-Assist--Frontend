// src/pages/HomePage/HomePage.tsx
import { Link } from "react-router";

const Block: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section className="w-full dark:bg-zinc-800 bg-white p-8 md:p-12 rounded-lg shadow-md border border-zinc-200/60 dark:border-zinc-700/60">
    <h2 className="text-xl md:text-2xl font-black uppercase dark:text-white">{title}</h2>
    <div className="mt-4 text-sm md:text-base text-zinc-700 dark:text-zinc-100/90">{children}</div>
  </section>
);

export default function HomePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 my-8 space-y-8">
   
      <section className="flex flex-col gap-4 items-start dark:bg-zinc-800 bg-white p-8 md:p-12 rounded-lg shadow-md border border-zinc-200/60 dark:border-zinc-700/60">
        <p
          className="text-[11px] tracking-widest uppercase px-3 py-1 rounded-4xl
                    border border-gray-300 text-gray-700 bg-white/60 backdrop-blur-sm
                    dark:border-sky-600 dark:text-white dark:bg-zinc-900/40"
        >
          Plataforma abierta · Asistencia con IA
        </p>
        <h1 className="text-2xl md:text-4xl font-black leading-tight dark:text-white">
          Modela <span className="underline underline-offset-4 decoration-2">diagramas UML</span> con ayuda inteligente
        </h1>
        <p className="text-zinc-700 dark:text-zinc-100/90 max-w-3xl leading-relaxed" style={{ textAlign: "justify" }}>
          UML-Assist te guía mientras construyes <strong>diagramas de secuencia</strong> y <strong>de actividades</strong>,
          ofreciendo recomendaciones de notación y coherencia. Aprendes mejorando tu práctica.
        </p>
        

        {/* Placeholder — reemplazar luego por .webp con lazy-loading */}
        <div className="w-full mt-6">
          <div className="aspect-[16/9] w-full rounded-lg bg-zinc-100 dark:bg-zinc-700 grid place-items-center">
            <div className="text-center px-6">
              <p className="font-semibold dark:text-white">Vista previa del lienzo</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-300">Próximamente: imágenes .webp con loading="lazy"</p>
            </div>
          </div>
          {/*
            <img
              src="/assets/preview.webp"
              loading="lazy"
              alt="Lienzo de UML-Assist"
              className="rounded-lg"
              width={1280}
              height={720}
              decoding="async"
            />
          */}
        </div>
      </section>

      {/* OBJETIVO */}
      <Block title="Objetivo de la plataforma">
        Desarrollar una aplicación web que asista la construcción de diagramas UML de <strong>secuencia</strong> y
        <strong> actividades</strong>, con recomendaciones contextualizadas basadas en reglas y buenas prácticas.
        El objetivo es reducir errores frecuentes, elevar la calidad del modelado y apoyar el aprendizaje guiado sin
        interrumpir la autonomía del usuario.
      </Block>

      {/* TIPOS DE DIAGRAMAS */}
      <Block title="Tipos de diagramas">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="p-4 rounded-lg border border-zinc-200/60 dark:border-zinc-700/60">
            <h3 className="font-semibold dark:text-white">Diagrama de secuencia</h3>
            <p className="mt-2 text-sm">
              Interacciones a lo largo del tiempo entre actores/objetos. Validación de lifelines, mensajes
              síncronos/asíncronos y consistencia con casos de uso.
            </p>
            <ul className="mt-3 list-disc pl-5 text-sm">
              <li>Notación estándar</li>
              <li>Coherencia de mensajes</li>
              <li>Edición rápida en el lienzo</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg border border-zinc-200/60 dark:border-zinc-700/60">
            <h3 className="font-semibold dark:text-white">Diagrama de actividades</h3>
            <p className="mt-2 text-sm">
              Flujos de control y datos, decisiones, concurrencia y estados. Recomendaciones para bifurcaciones,
              uniones y legibilidad.
            </p>
            <ul className="mt-3 list-disc pl-5 text-sm">
              <li>Comprobación de flujo/terminales</li>
              <li>Nombres de acciones</li>
              <li>Detección de patrones confusos</li>
            </ul>
          </div>
        </div>
      </Block>

      {/* ¿CÓMO FUNCIONA? */}
      <Block title="¿Cómo funciona?">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { t: "Modela en el lienzo", d: "Arrastra elementos y edita propiedades. Mantienes control total." },
            { t: "Análisis contextual", d: "El cliente envía el estado del diagrama a la API para evaluar reglas." },
            { t: "Recomendaciones", d: "Recibe sugerencias accionables (nombrado, secuencia, legibilidad)." },
            { t: "Aprende haciendo", d: "Mejora tu diagrama sin depender de generación automática." },
          ].map((s, i) => (
            <div
              key={i}
              className="rounded-lg border border-zinc-200/60 dark:border-zinc-700/60 p-4"
            >
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold">
                {i + 1}
              </span>
              <h4 className="mt-2 font-semibold dark:text-white">{s.t}</h4>
              <p className="mt-1 text-sm">{s.d}</p>
            </div>
          ))}
        </div>
      </Block>

      {/* CÓDIGO ABIERTO */}
      <Block title="Código abierto y accesible">
        <p>
          Proyecto de <strong>software libre</strong> para maximizar el acceso y la colaboración. Nuestra misión es
          reducir costos de adopción y ofrecer una alternativa educativa de calidad para modelado UML.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <a
              href="https://github.com/tu-org/uml-assist"
              className="uppercase bg-sky-600 text-white hover:bg-sky-700 px-4 py-2 rounded-4xl text-sm font-bold transition-colors shadow-sm"
            >
            GitHub del proyecto
          </a>
           <a
              href="/docs"
              className="text-gray-700 hover:text-sky-600 dark:text-white dark:hover:text-sky-600 dark:hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
            Ver documentación
          </a>
        </div>
      </Block>

      {/* FAQ */}
      <Block title="Preguntas frecuentes">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="p-4 rounded-lg border border-zinc-200/60 dark:border-zinc-700/60">
            <h3 className="font-semibold dark:text-white">¿La plataforma genera los diagramas por mí?</h3>
            <p className="mt-2 text-sm">
              No. UML-Assist <em>asiste</em> mientras modelas. Las recomendaciones son opcionales y tú decides.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-zinc-200/60 dark:border-zinc-700/60">
            <h3 className="font-semibold dark:text-white">¿Qué diagramas soporta hoy?</h3>
            <p className="mt-2 text-sm">
              En esta etapa: <strong>secuencia</strong> y <strong>actividades</strong>. El diseño contempla extender otros tipos.
            </p>
          </div>
        </div>
      
      </Block>
    </main>
  );
}
