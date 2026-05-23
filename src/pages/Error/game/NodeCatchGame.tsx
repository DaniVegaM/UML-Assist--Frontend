import { useEffect, useRef } from "react";
import { useNodeCatchGame } from "./useNodeCatchGame";
import "./NodeCatchGame.scss";

interface Props {
  onClose: () => void;
}

const MAX_LIVES = 3;

export default function NodeCatchGame({ onClose }: Props) {
  const {
    phase,
    score,
    highScore,
    isNewRecord,
    lives,
    basketX,
    fallingNodes,
    popups,
    flash,
    basketWidth,
    nodeSize,
    start,
    moveBasketTo,
    moveBasketBy,
  } = useNodeCatchGame();
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (phase !== "playing") return;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        moveBasketBy(-7);
      }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        moveBasketBy(7);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, moveBasketBy, onClose]);

  const pointerToX = (clientX: number) => {
    const el = boardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    moveBasketTo(((clientX - rect.left) / rect.width) * 100);
  };

  const livesLeft = Math.max(0, lives);

  return (
    <div
      className="ncg-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Minijuego: Atrapa los nodos UML"
      onClick={onClose}
    >
      <div className="ncg-modal" onClick={(e) => e.stopPropagation()}>
        <header className="ncg-header">
          <div className="ncg-title">
            <span className="ncg-title-mark" aria-hidden="true">
              ◆
            </span>
            Atrapa los nodos UML
          </div>
          <button className="ncg-close" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </header>

        <div className="ncg-hud">
          <span className="ncg-pill">
            Puntos <strong>{score}</strong>
          </span>
          <span className="ncg-pill">
            Récord <strong>{highScore}</strong>
          </span>
          <span
            className="ncg-pill ncg-lives"
            aria-label={`Vidas: ${livesLeft}`}
          >
            <span className="ncg-lives-full">{"♥".repeat(livesLeft)}</span>
            <span className="ncg-lives-empty">
              {"♥".repeat(MAX_LIVES - livesLeft)}
            </span>
          </span>
        </div>

        <div
          className={`ncg-board${flash ? " ncg-board--hit" : ""}`}
          ref={boardRef}
          onMouseMove={(e) => phase === "playing" && pointerToX(e.clientX)}
          onTouchMove={(e) =>
            phase === "playing" && pointerToX(e.touches[0].clientX)
          }
        >
          <div className="ncg-ground" aria-hidden="true" />

          {fallingNodes.map((fn) => (
            <div
              key={fn.uid}
              className="ncg-node"
              style={{
                left: `${fn.x}%`,
                top: `${fn.y}%`,
                width: `${nodeSize}%`,
              }}
            >
              {fn.node.svg}
            </div>
          ))}

          {popups.map((p) => (
            <span
              key={p.uid}
              className={`ncg-popup ncg-popup--${p.kind}`}
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
            >
              {p.text}
            </span>
          ))}

          <div
            className={`ncg-basket${flash ? " ncg-basket--hit" : ""}`}
            style={{ left: `${basketX}%`, width: `${basketWidth}%` }}
            aria-hidden="true"
          />

          {flash && <div className="ncg-flash" aria-hidden="true" />}

          {phase !== "playing" && (
            <div className="ncg-screen">
              {phase === "idle" ? (
                <>
                  <p className="ncg-screen-title">
                    ¿Una partida junto a la fogata?
                  </p>
                  <p className="ncg-screen-sub">
                    Atrapa los nodos UML <strong>reales</strong>. ¡Cuidado! Hay
                    impostores que se camuflan entre ellos: si los atrapas,
                    pierdes una vida.
                  </p>
                </>
              ) : (
                <>
                  <p className="ncg-screen-title">¡Se apagó la fogata!</p>
                  {isNewRecord && (
                    <p className="ncg-badge">🏆 ¡Nuevo récord!</p>
                  )}
                  <p className="ncg-screen-sub">
                    Puntos: {score} · Récord: {highScore}
                  </p>
                </>
              )}
              <button className="ncg-play" onClick={start}>
                {phase === "idle" ? "Jugar" : "Reintentar"}
              </button>
              <p className="ncg-hint">
                Mueve la cesta con <kbd>←</kbd> <kbd>→</kbd> / <kbd>A</kbd>{" "}
                <kbd>D</kbd> o con el mouse
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
