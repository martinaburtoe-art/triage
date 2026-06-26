// src/components/triage/VitalsStep.tsx
import { motion } from "framer-motion";
import { Activity, Heart, Thermometer, Droplets, Hand, Cpu, CheckCircle2 } from "lucide-react";
import { useVitalsLogic } from "@/hooks/useVitalsLogic";

// Exportamos esta interfaz para que el hook y otros archivos puedan usarla
export interface VitalsData {
  spo2: number;
  bpm: number;
  temp: number;
  systolic: number;
  diastolic: number;
}

interface Props {
  onComplete: (v: VitalsData) => void;
}

export function VitalsStep({ onComplete }: Props) {
  // 1. Conectamos la vista con el "motor" del sensor simulado
  const { progress, spo2, bpm, temp, sys, dia, stable, handleProcessResults } = useVitalsLogic({
    onComplete,
  });

  // 2. Renderizamos el diseño visual
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-4xl space-y-6"
    >
      <div className="glass-strong rounded-3xl p-6 md:p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center shadow-clinical">
            <Cpu className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground">Captura de signos vitales</h2>
            <p className="text-sm text-muted-foreground">
              Sensor óptico Raspberry Pi 5 · Lectura en tiempo real
            </p>
          </div>
          {stable && (
            <span className="text-success flex items-center gap-1 text-sm font-medium">
              <CheckCircle2 className="h-5 w-5" /> Estable
            </span>
          )}
        </div>

        {/* Indicaciones */}
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-3 bg-accent/40 rounded-2xl p-3 border border-border/50">
            <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center">
              <Hand className="h-5 w-5 text-primary" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-foreground">Coloque su dedo</p>
              <p className="text-xs text-muted-foreground">en el sensor óptico</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-accent/40 rounded-2xl p-3 border border-border/50">
            <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-foreground">Mantenga el brazo quieto</p>
              <p className="text-xs text-muted-foreground">durante toda la medición</p>
            </div>
          </div>
        </div>

        {/* Progreso */}
        <div className="mt-5">
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span>{stable ? "Lectura completa" : "Capturando datos..."}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full gradient-primary transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Dashboard 4 indicadores */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <VitalCard
          color="oklch(0.6 0.18 240)"
          icon={<Droplets className="h-5 w-5" />}
          label="SPO₂"
          value={spo2.toFixed(0)}
          unit="%"
          stable={stable}
        >
          <WaveGraph color="oklch(0.6 0.18 240)" />
        </VitalCard>

        <VitalCard
          color="oklch(0.62 0.22 25)"
          icon={
            <Heart className={`h-5 w-5 ${stable ? "animate-heartbeat" : ""}`} fill="currentColor" />
          }
          label="Frecuencia cardíaca"
          value={bpm.toFixed(0)}
          unit="BPM"
          stable={stable}
        >
          <WaveGraph color="oklch(0.62 0.22 25)" ecg />
        </VitalCard>

        <VitalCard
          color="oklch(0.72 0.17 60)"
          icon={<Thermometer className="h-5 w-5" />}
          label="Temperatura"
          value={temp.toFixed(1)}
          unit="°C"
          stable={stable}
        >
          <ThermometerBar value={temp} />
        </VitalCard>

        <VitalCard
          color="oklch(0.6 0.15 290)"
          icon={<Activity className="h-5 w-5" />}
          label="Presión arterial"
          value={`${sys.toFixed(0)}/${dia.toFixed(0)}`}
          unit="mmHg"
          stable={stable}
        >
          <p className="text-[10px] text-muted-foreground italic">
            {stable ? "Calculado vía PTT" : "Calculando vía Pulse Transit Time..."}
          </p>
        </VitalCard>
      </div>

      <button
        onClick={handleProcessResults}
        disabled={!stable}
        className="w-full gradient-primary text-primary-foreground font-semibold py-4 rounded-2xl shadow-clinical hover:shadow-glow transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {stable ? "Procesar resultados →" : "Esperando lectura estable..."}
      </button>
    </motion.div>
  );
}

// ----------------------------------------------------------------------
// Componentes UI (Se mantienen aquí porque son 100% visuales y estáticos)
// ----------------------------------------------------------------------

function VitalCard({
  color,
  icon,
  label,
  value,
  unit,
  stable,
  children,
}: {
  color: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  stable: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="glass rounded-2xl p-5 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1" style={{ background: color }} />
      <div className="flex items-center justify-between text-muted-foreground">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide">
          <span style={{ color }}>{icon}</span>
          {label}
        </div>
        {!stable && <span className="h-2 w-2 rounded-full bg-warning animate-pulse" />}
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="text-4xl font-bold text-foreground tabular-nums">{value}</span>
        <span className="text-sm text-muted-foreground font-medium">{unit}</span>
      </div>
      <div className="mt-3 h-10 flex items-center">{children}</div>
    </div>
  );
}

function WaveGraph({ color, ecg = false }: { color: string; ecg?: boolean }) {
  const path = ecg
    ? "M0,20 L20,20 L25,20 L28,5 L32,35 L36,12 L40,20 L60,20 L65,20 L68,5 L72,35 L76,12 L80,20 L100,20 L105,20 L108,5 L112,35 L116,12 L120,20 L140,20 L145,20 L148,5 L152,35 L156,12 L160,20 L200,20"
    : "M0,20 Q10,5 20,20 T40,20 T60,20 T80,20 T100,20 T120,20 T140,20 T160,20 T180,20 T200,20";
  return (
    <svg viewBox="0 0 200 40" className="w-full h-full">
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray="200"
        className="animate-wave"
      />
    </svg>
  );
}

function ThermometerBar({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, ((value - 35) / 5) * 100));
  const color =
    value < 36
      ? "oklch(0.65 0.14 240)"
      : value < 37.5
        ? "oklch(0.7 0.17 150)"
        : value < 38.5
          ? "oklch(0.78 0.16 75)"
          : "oklch(0.6 0.22 25)";
  return (
    <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
      <div
        className="h-full transition-all duration-200"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}
