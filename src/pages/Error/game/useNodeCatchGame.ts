import { useCallback, useEffect, useRef, useState } from "react";
import {
  randomValidNode,
  randomDecoyNode,
  type GameNode,
} from "./gameNodes";

const HIGH_SCORE_KEY = "uml-node-catch-highscore";

// Todas las coordenadas son porcentajes del tablero (0..100).
const BASKET_WIDTH = 18; // ancho de la cesta
const NODE_SIZE = 9; // ancho del nodo
const CATCH_LINE = 82; // altura donde la cesta atrapa (la boca de la cesta)
const BASE_SPEED = 22; // % por segundo
const BASE_SPAWN_MS = 1150;
const START_LIVES = 3;
const DECOY_CHANCE = 0.4;
const FLASH_MS = 380;
const POPUP_MS = 700;

export type Phase = "idle" | "playing" | "over";

export interface FallingNode {
  uid: number;
  node: GameNode;
  x: number; // centro 0..100
  y: number; // centro -8..110
  speed: number;
  resolved: boolean; // ya cruzó la línea de captura (no se vuelve a evaluar)
}

export interface Popup {
  uid: number;
  x: number;
  y: number;
  text: string;
  kind: "good" | "bad";
}

export interface NodeCatchGame {
  phase: Phase;
  score: number;
  highScore: number;
  isNewRecord: boolean;
  lives: number;
  basketX: number;
  fallingNodes: FallingNode[];
  popups: Popup[];
  flash: boolean;
  basketWidth: number;
  nodeSize: number;
  start: () => void;
  moveBasketTo: (x: number) => void;
  moveBasketBy: (dx: number) => void;
}

export function useNodeCatchGame(): NodeCatchGame {
  const [phase, setPhase] = useState<Phase>("idle");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(START_LIVES);
  const [basketX, setBasketX] = useState(50);
  const [fallingNodes, setFallingNodes] = useState<FallingNode[]>([]);
  const [popups, setPopups] = useState<Popup[]>([]);
  const [flash, setFlash] = useState(false);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const [highScore, setHighScore] = useState<number>(() => {
    const raw = localStorage.getItem(HIGH_SCORE_KEY);
    return raw ? parseInt(raw, 10) || 0 : 0;
  });

  const phaseRef = useRef(phase);
  const basketRef = useRef(basketX);
  const scoreRef = useRef(0);
  const livesRef = useRef(START_LIVES);
  const highScoreRef = useRef(highScore);
  const nodesRef = useRef<FallingNode[]>([]);
  const popupsRef = useRef<(Popup & { born: number })[]>([]);
  const uidRef = useRef(0);
  const popupUidRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef(0);
  const spawnAccRef = useRef(0);
  const flashUntilRef = useRef(0);
  const flashRef = useRef(false);

  const clampBasket = (x: number) =>
    Math.max(BASKET_WIDTH / 2, Math.min(100 - BASKET_WIDTH / 2, x));

  const endGame = useCallback(() => {
    phaseRef.current = "over";
    setPhase("over");
    const beat = scoreRef.current > highScoreRef.current;
    setIsNewRecord(beat && scoreRef.current > 0);
    if (beat) {
      highScoreRef.current = scoreRef.current;
      setHighScore(scoreRef.current);
      localStorage.setItem(HIGH_SCORE_KEY, String(scoreRef.current));
    }
  }, []);

  const spawn = useCallback(() => {
    const isDecoy = Math.random() < DECOY_CHANCE;
    const node = isDecoy ? randomDecoyNode() : randomValidNode();
    const difficulty = 1 + scoreRef.current / 220;
    nodesRef.current.push({
      uid: uidRef.current++,
      node,
      x: 6 + Math.random() * 88,
      y: -8,
      speed: BASE_SPEED * difficulty,
      resolved: false,
    });
  }, []);

  const frame = useCallback(
    (ts: number) => {
      if (phaseRef.current !== "playing") return;
      const dt = lastTsRef.current ? (ts - lastTsRef.current) / 1000 : 0;
      lastTsRef.current = ts;

      spawnAccRef.current += dt * 1000;
      const spawnInterval = Math.max(480, BASE_SPAWN_MS - scoreRef.current * 4);
      if (spawnAccRef.current >= spawnInterval) {
        spawnAccRef.current = 0;
        spawn();
      }

      const basket = basketRef.current;
      const reach = BASKET_WIDTH / 2 + NODE_SIZE / 2;
      const remaining: FallingNode[] = [];
      let scoreDelta = 0;
      let lifeDelta = 0;
      let addedPopup = false;

      for (const fn of nodesRef.current) {
        const y = fn.y + fn.speed * dt;

        // Evaluar exactamente una vez, al cruzar la línea de captura.
        if (!fn.resolved && y >= CATCH_LINE) {
          const caught = Math.abs(fn.x - basket) <= reach;
          if (caught) {
            if (fn.node.kind === "valid") {
              scoreDelta += 10;
              popupsRef.current.push({
                uid: popupUidRef.current++,
                x: fn.x,
                y: CATCH_LINE,
                text: "+10",
                kind: "good",
                born: ts,
              });
            } else {
              lifeDelta -= 1;
              flashUntilRef.current = ts + FLASH_MS;
              popupsRef.current.push({
                uid: popupUidRef.current++,
                x: fn.x,
                y: CATCH_LINE,
                text: "−1 ♥",
                kind: "bad",
                born: ts,
              });
            }
            addedPopup = true;
            continue; // atrapado: se consume
          }
          // No atrapado: sigue cayendo pero ya no se vuelve a evaluar.
          remaining.push({ ...fn, y, resolved: true });
          continue;
        }

        if (y > 112) continue; // salió del tablero: se descarta
        remaining.push({ ...fn, y });
      }

      nodesRef.current = remaining;

      // Expirar popups viejos.
      const beforeLen = popupsRef.current.length;
      popupsRef.current = popupsRef.current.filter((p) => ts - p.born < POPUP_MS);
      if (addedPopup || popupsRef.current.length !== beforeLen) {
        setPopups(
          popupsRef.current.map(({ uid, x, y, text, kind }) => ({
            uid,
            x,
            y,
            text,
            kind,
          })),
        );
      }

      if (scoreDelta) {
        scoreRef.current += scoreDelta;
        setScore(scoreRef.current);
      }
      if (lifeDelta) {
        livesRef.current += lifeDelta;
        setLives(livesRef.current);
      }
      setFallingNodes([...remaining]);

      // Flash al recibir un golpe.
      const f = ts < flashUntilRef.current;
      if (f !== flashRef.current) {
        flashRef.current = f;
        setFlash(f);
      }

      if (livesRef.current <= 0) {
        endGame();
        return;
      }
      rafRef.current = requestAnimationFrame(frame);
    },
    [spawn, endGame],
  );

  const start = useCallback(() => {
    nodesRef.current = [];
    popupsRef.current = [];
    uidRef.current = 0;
    popupUidRef.current = 0;
    scoreRef.current = 0;
    livesRef.current = START_LIVES;
    spawnAccRef.current = 0;
    lastTsRef.current = 0;
    flashUntilRef.current = 0;
    flashRef.current = false;
    setScore(0);
    setLives(START_LIVES);
    setFallingNodes([]);
    setPopups([]);
    setFlash(false);
    setIsNewRecord(false);
    setBasketX(50);
    basketRef.current = 50;
    phaseRef.current = "playing";
    setPhase("playing");
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(frame);
  }, [frame]);

  const moveBasketTo = useCallback((x: number) => {
    const clamped = clampBasket(x);
    basketRef.current = clamped;
    setBasketX(clamped);
  }, []);

  const moveBasketBy = useCallback(
    (dx: number) => {
      moveBasketTo(basketRef.current + dx);
    },
    [moveBasketTo],
  );

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  return {
    phase,
    score,
    highScore,
    isNewRecord,
    lives,
    basketX,
    fallingNodes,
    popups,
    flash,
    basketWidth: BASKET_WIDTH,
    nodeSize: NODE_SIZE,
    start,
    moveBasketTo,
    moveBasketBy,
  };
}
