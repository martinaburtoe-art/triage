// src/hooks/useResultLogic.ts
import { useMemo, useState, useEffect } from "react";
import { type VitalsData } from "@/components/triage/VitalsStep";
import { type SymptomsData } from "@/hooks/useSymptomsLogic";

// Exportamos la interfaz para que la vista sepa qué colores y textos usar
export interface TriageResult {
  category: 1 | 2 | 3 | 4 | 5;
  label: string;
  color: string;
  bgClass: string;
  waitTime: string;
  description: string;
}

interface UseResultLogicProps {
  rut: string;
  symptoms: SymptomsData;
  vitals: VitalsData;
}

export function useResultLogic({ rut, symptoms, vitals }: UseResultLogicProps) {
  // ALGORITMO MÉDICO DE CATEGORIZACIÓN
  // Usamos useMemo para garantizar que el resultado de triage no se recalcule
  // en cada renderizado (lo que es ineficiente y podría causar bugs si se re-renderiza).
  const result = useMemo(() => {
    const critical = [
      "Pérdida de conciencia",
      "Dolor de pecho",
      "Dificultad respiratoria",
      "Sangrado",
    ];
    const hasCritical = symptoms.symptoms.some((s) => critical.includes(s));

    let cat: 1 | 2 | 3 | 4 | 5 = 5;

    if (
      vitals.spo2 < 90 ||
      vitals.bpm > 130 ||
      vitals.bpm < 40 ||
      vitals.temp >= 40 ||
      vitals.systolic > 180 ||
      vitals.systolic < 80
    ) {
      cat = 1;
    } else if (
      hasCritical ||
      vitals.spo2 < 94 ||
      vitals.temp >= 39 ||
      symptoms.pain >= 8 ||
      vitals.systolic > 160
    ) {
      cat = 2;
    } else if (
      vitals.temp >= 38 ||
      symptoms.pain >= 6 ||
      vitals.bpm > 110 ||
      symptoms.symptoms.length >= 4
    ) {
      cat = 3;
    } else if (symptoms.pain >= 3 || symptoms.symptoms.length >= 1) {
      cat = 4;
    } else {
      cat = 5;
    }

    const map: Record<number, TriageResult> = {
      1: {
        category: 1,
        label: "C1 · Resucitación",
        color: "var(--triage-c1)",
        bgClass: "from-[oklch(0.6_0.24_27)] to-[oklch(0.5_0.22_25)]",
        waitTime: "Atención inmediata",
        description: "Riesgo vital. Atención médica de inmediato.",
      },
      2: {
        category: 2,
        label: "C2 · Emergencia",
        color: "var(--triage-c2)",
        bgClass: "from-[oklch(0.7_0.19_50)] to-[oklch(0.62_0.18_45)]",
        waitTime: "Atención < 15 min",
        description: "Condición grave. Requiere atención prioritaria.",
      },
      3: {
        category: 3,
        label: "C3 · Urgente",
        color: "var(--triage-c3)",
        bgClass: "from-[oklch(0.82_0.16_95)] to-[oklch(0.74_0.16_85)]",
        waitTime: "Atención < 60 min",
        description: "Condición urgente que puede deteriorarse.",
      },
      4: {
        category: 4,
        label: "C4 · Menos urgente",
        color: "var(--triage-c4)",
        bgClass: "from-[oklch(0.7_0.17_150)] to-[oklch(0.6_0.16_150)]",
        waitTime: "Atención < 2 horas",
        description: "Condición estable, prioridad estándar.",
      },
      5: {
        category: 5,
        label: "C5 · No urgente",
        color: "var(--triage-c5)",
        bgClass: "from-[oklch(0.65_0.14_240)] to-[oklch(0.55_0.14_240)]",
        waitTime: "Atención < 4 horas",
        description: "Sin signos de gravedad. Atención no prioritaria.",
      },
    };
    return map[cat];
  }, [vitals, symptoms]);

  // Generamos un ticket único para el paciente.
  // Usamos useState para asegurar que el ticket no cambie misteriosamente
  // si el componente se re-renderiza.
  const [ticketId] = useState(() => `T-${Math.floor(Math.random() * 9000 + 1000)}`);

  // Preparamos los datos que irán dentro del código QR
  // Usamos useMemo para recalcular el payload del QR SOLO si el rut, ticketId o result cambian.
  const qrPayload = useMemo(
    () =>
      JSON.stringify({
        rut,
        ticket: ticketId,
        cat: result.category,
        t: Date.now(),
      }),
    [rut, ticketId, result.category],
  );

  const isCritical = result.category <= 2;

  const handlePrint = () => {
    window.print();
  };

  return {
    result,
    ticketId,
    qrPayload,
    isCritical,
    handlePrint,
  };
}
