import { useState } from "react";
import { Link, useRouteError, isRouteErrorResponse } from "react-router";
import CampScene from "./CampScene";
import NodeCatchGame from "./game/NodeCatchGame";
import "./ErrorPage.scss";

interface ErrorCopy {
  code: string;
  title: string;
  subtitle: string;
}

function resolveCopy(error: unknown): ErrorCopy {
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return {
        code: "404",
        title: "Te perdiste en el bosque",
        subtitle:
          "Esta ruta no aparece en nuestro mapa. La fogata sigue encendida en el inicio.",
      };
    }
    return {
      code: String(error.status),
      title: "Se desvió el sendero",
      subtitle: error.statusText || "No pudimos llevarte a donde querías ir.",
    };
  }
  return {
    code: "500",
    title: "Se apagó la fogata",
    subtitle: "Algo se quemó de nuestro lado. Vuelve a intentarlo en un momento.",
  };
}

export default function ErrorPage() {
  const error = useRouteError();
  const copy = resolveCopy(error);
  const [gameOpen, setGameOpen] = useState(false);

  if (import.meta.env.DEV) {
    console.error("ErrorPage capturó:", error);
  }

  return (
    <main className="error-page">
      <div className="error-content">
        <p className="error-code">{copy.code}</p>
        <h1 className="error-title">{copy.title}</h1>
        <p className="error-subtitle">{copy.subtitle}</p>

        <div className="error-scene">
          <CampScene />
          <button
            type="button"
            className="error-firefly"
            aria-label="Easter egg: jugar un minijuego"
            title="¿Qué es esa lucecita?"
            onClick={() => setGameOpen(true)}
          />
        </div>

        <div className="error-actions">
          <Link to="/" className="error-btn error-btn-primary">
            Volver al inicio
          </Link>
          <button
            type="button"
            className="error-btn error-btn-ghost"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      </div>

      {gameOpen && <NodeCatchGame onClose={() => setGameOpen(false)} />}
    </main>
  );
}
