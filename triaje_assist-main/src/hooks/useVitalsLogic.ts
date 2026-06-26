// src/hooks/useVitalsLogic.ts
// ─────────────────────────────────────────────────────────────────────────────
// Conecta al bridge_server.py que corre en la Raspberry Pi 5.
// Cambia RPI_IP por la IP real de tu RPi (hostname -I en la terminal).
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from "react";
import { type VitalsData } from "@/components/triage/VitalsStep";

// ── Configuración ─────────────────────────────────────────────────────────────
const RPI_PORT = 8080;

// Obtenemos el modo desde localStorage al cargar el hook
const getMode = (): "real" | "sim" => {
  return (localStorage.getItem("vitalsMode") as "real" | "sim") || "real";
};

// ── Tipos ─────────────────────────────────────────────────────────────────────
export type WsStatus = "connecting" | "connected" | "error" | "sim";

interface SensorPayload {
  spo2: number;
  bpm: number;
  temp: number;
  sys: number;
  dia: number;
  isStable: boolean;
  progress: number;
  ts: number;
  error?: string;
}

interface UseVitalsLogicProps {
  onComplete: (v: VitalsData) => void;
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useVitalsLogic({ onComplete }: UseVitalsLogicProps) {
  const [progress, setProgress] = useState(0);
  const [spo2, setSpo2] = useState(0);
  const [bpm, setBpm] = useState(0);
  const [temp, setTemp] = useState(0);
  const [sys, setSys] = useState(0);
  const [dia, setDia] = useState(0);
  const [stable, setStable] = useState(false);

  // Leemos el modo actual una sola vez al montar
  const mode = useRef(getMode());
  const [wsStatus, setWsStatus] = useState<WsStatus>(mode.current === "sim" ? "sim" : "connecting");

  // Guarda la última lectura estable para pasarla a onComplete
  const snapshot = useRef({ spo2: 0, bpm: 0, temp: 0, sys: 0, dia: 0 });

  // ── MODO REAL: WebSocket a Raspberry Pi ────────────────────────────────────
  useEffect(() => {
    if (mode.current !== "real") return;

    const rpiIp = localStorage.getItem("rpi_ip") || "localhost";
    const wsUrl = `ws://${rpiIp}:${RPI_PORT}`;

    let ws: WebSocket;
    let retryTimer: ReturnType<typeof setTimeout>;
    let mounted = true;

    function connect() {
      if (!mounted) return;
      setWsStatus("connecting");
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        if (!mounted) return;
        console.log("[Vitals] Conectado →", wsUrl);
        setWsStatus("connected");
      };

      ws.onmessage = ({ data }) => {
        if (!mounted) return;
        try {
          const d: SensorPayload = JSON.parse(data);

          if (d.error) {
            console.error("[Vitals] Error del sensor:", d.error);
            setWsStatus("error");
            return;
          }

          const s2 = parseFloat(d.spo2.toFixed(1));
          const b = parseFloat(d.bpm.toFixed(0));
          const t = parseFloat(d.temp.toFixed(1));

          setSpo2(s2);
          setBpm(b);
          setTemp(t);
          setSys(d.sys);
          setDia(d.dia);
          setProgress(d.progress);

          // Guardar snapshot para handleProcessResults
          snapshot.current = { spo2: s2, bpm: b, temp: t, sys: d.sys, dia: d.dia };

          if (d.isStable) setStable(true);
        } catch (err) {
          console.error("[Vitals] JSON inválido:", err);
        }
      };

      ws.onerror = () => {
        if (!mounted) return;
        setWsStatus("error");
      };

      ws.onclose = () => {
        if (!mounted) return;
        console.warn("[Vitals] Conexión cerrada. Reintentando en 2s...");
        setWsStatus("error");
        retryTimer = setTimeout(connect, 2000);
      };
    }

    connect();

    return () => {
      mounted = false;
      clearTimeout(retryTimer);
      ws?.close();
    };
  }, []);

  // ── MODO SIMULACIÓN ────────────────────────────────────────────────────────
  useEffect(() => {
    if (mode.current !== "sim") return;

    // Valores objetivos (Hacia donde se estabilizarán los sensores)
    const targets = { spo2: 98, bpm: 75, temp: 36.8, sys: 120, dia: 80 };

    // Valores iniciales (Desde donde parten para hacer la transición fluida)
    let currentSpo2 = 88;
    let currentBpm = 60;
    let currentTemp = 35.5;
    let currentSys = 100;
    let currentDia = 65;

    let p = 0; // Progreso (0 a 100)

    const id = setInterval(() => {
      p += 1;
      setProgress(p);

      // Factor de suavizado (easing): A medida que p se acerca a 100, la diferencia se hace más chica
      const smoothing = 0.05; // Velocidad de interpolación

      // Jitter (Ruido aleatorio pequeño): A medida que se estabiliza, el ruido disminuye
      const noise = (amp: number) => (Math.random() - 0.5) * amp * Math.max(0.1, 1 - p / 100);

      // Interpolamos y agregamos ruido
      currentSpo2 += (targets.spo2 - currentSpo2) * smoothing + noise(1);
      currentBpm += (targets.bpm - currentBpm) * smoothing + noise(3);
      currentTemp += (targets.temp - currentTemp) * smoothing + noise(0.2);
      currentSys += (targets.sys - currentSys) * smoothing + noise(2);
      currentDia += (targets.dia - currentDia) * smoothing + noise(1.5);

      // Actualizamos estado de UI, manteniendo límites realistas
      const s2 = Math.max(0, Math.min(100, currentSpo2));
      const b = Math.max(0, currentBpm);
      const t = Math.max(0, currentTemp);
      const sy = Math.max(0, currentSys);
      const di = Math.max(0, currentDia);

      setSpo2(parseFloat(s2.toFixed(1)));
      setBpm(parseFloat(b.toFixed(0)));
      setTemp(parseFloat(t.toFixed(1)));
      setSys(parseFloat(sy.toFixed(0)));
      setDia(parseFloat(di.toFixed(0)));

      snapshot.current = {
        spo2: parseFloat(s2.toFixed(1)),
        bpm: parseFloat(b.toFixed(0)),
        temp: parseFloat(t.toFixed(1)),
        sys: parseFloat(sy.toFixed(0)),
        dia: parseFloat(di.toFixed(0)),
      };

      // Si terminamos, clavamos los valores exactos y estabilizamos
      if (p >= 100) {
        clearInterval(id);
        setSpo2(targets.spo2);
        setBpm(targets.bpm);
        setTemp(targets.temp);
        setSys(targets.sys);
        setDia(targets.dia);
        snapshot.current = targets;
        setStable(true);
      }
    }, 60);

    return () => clearInterval(id);
  }, []);

  // ── Acción al confirmar resultados ────────────────────────────────────────
  const handleProcessResults = useCallback(() => {
    const { spo2: s, bpm: b, temp: t, sys: sy, dia: di } = snapshot.current;
    onComplete({ spo2: s, bpm: b, temp: t, systolic: sy, diastolic: di });
  }, [onComplete]);

  return {
    progress,
    spo2,
    bpm,
    temp,
    sys,
    dia,
    stable,
    wsStatus, // úsalo en la UI para mostrar estado de conexión
    handleProcessResults,
  };
}
