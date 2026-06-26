// src/components/triage/ResultStep.tsx
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { CheckCircle2, AlertTriangle, Clock, RefreshCw, Printer } from "lucide-react";
import { useResultLogic, type TriageResult } from "@/hooks/useResultLogic";
import type { VitalsData } from "./VitalsStep";
import type { SymptomsData } from "@/hooks/useSymptomsLogic";
import { cn } from "@/lib/utils";

interface Props {
  rut: string;
  symptoms: SymptomsData;
  vitals: VitalsData;
  onRestart: () => void;
}

export function ResultStep({ rut, symptoms, vitals, onRestart }: Props) {
  const { result, ticketId, qrPayload, isCritical, handlePrint } = useResultLogic({
    rut,
    symptoms,
    vitals,
  });

  // Agrupamos los datos en arreglos para dibujarlos más eficientemente
  const idData = [
    { k: "RUT", v: rut },
    { k: "Ticket", v: ticketId },
  ];
  const vitalsData = [
    { k: "SPO₂", v: `${vitals.spo2.toFixed(0)} %` },
    { k: "FC", v: `${vitals.bpm.toFixed(0)} BPM` },
    { k: "Temp", v: `${vitals.temp.toFixed(1)} °C` },
    { k: "PA", v: `${vitals.systolic.toFixed(0)}/${vitals.diastolic.toFixed(0)}` },
  ];

  return (
    <>
      <PrintTicket rut={rut} ticketId={ticketId} result={result} qrPayload={qrPayload} />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        className="w-full max-w-4xl space-y-6 print:hidden"
      >
        {/* Hero categoría */}
        <div
          className={cn(
            "relative rounded-3xl p-8 md:p-10 text-white overflow-hidden bg-gradient-to-br shadow-clinical",
            result.bgClass,
          )}
        >
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex flex-col md:flex-row items-center gap-6">
            <div className="h-20 w-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              {isCritical ? (
                <AlertTriangle className="h-10 w-10" />
              ) : (
                <CheckCircle2 className="h-10 w-10" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm uppercase tracking-widest opacity-80">Categoría asignada</p>
              <h2 className="text-4xl md:text-5xl font-bold mt-1">{result.label}</h2>
              <p className="mt-2 text-white/90">{result.description}</p>
              <div className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur rounded-full px-4 py-1.5 text-sm font-medium">
                <Clock className="h-4 w-4" /> {result.waitTime}
              </div>
            </div>
          </div>
        </div>

        {/* Grid de información */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 glass-strong rounded-3xl p-6 md:p-8 space-y-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">Resumen clínico</h3>

            <Section title="Identificación">
              {idData.map((d) => (
                <Row key={d.k} k={d.k} v={d.v} />
              ))}
            </Section>

            <Section title="Sintomatología">
              {symptoms.symptoms.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {symptoms.symptoms.map((s) => (
                    <span
                      key={s}
                      className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Sin síntomas seleccionados</p>
              )}
              <Row k="Dolor" v={`${symptoms.pain}/10`} />
              {symptoms.description && (
                <p className="text-sm text-muted-foreground italic">"{symptoms.description}"</p>
              )}
            </Section>

            <Section title="Signos vitales">
              <div className="grid grid-cols-2 gap-2">
                {vitalsData.map((d) => (
                  <Row key={d.k} k={d.k} v={d.v} />
                ))}
              </div>
            </Section>
          </div>

          {/* Módulo QR */}
          <div className="glass-strong rounded-3xl p-6 flex flex-col items-center text-center">
            <p className="text-sm font-medium text-foreground/80">Su turno digital</p>
            <p className="text-3xl font-bold text-gradient mt-1">{ticketId}</p>
            <div className="mt-4 p-4 bg-white rounded-2xl shadow-clinical">
              <QRCodeSVG value={qrPayload} size={160} level="M" />
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Escanee este código en espera o muéstrelo al personal.
            </p>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 glass-strong rounded-2xl py-3.5 font-semibold hover:bg-secondary flex items-center justify-center gap-2"
          >
            <Printer className="h-5 w-5" /> Imprimir comprobante
          </button>
          <button
            onClick={onRestart}
            className="flex-1 gradient-primary text-primary-foreground font-semibold py-3.5 rounded-2xl shadow-clinical hover:shadow-glow flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-5 w-5" /> Nueva evaluación
          </button>
        </div>
      </motion.div>
    </>
  );
}

// ----------------------------------------------------------------------
// Componentes UI Auxiliares (Sintaxis acortada)
// ----------------------------------------------------------------------

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-4">
    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
      {title}
    </p>
    <div className="space-y-1.5">{children}</div>
  </div>
);

const Row = ({ k, v }: { k: string; v: string }) => (
  <div className="flex justify-between items-center text-sm bg-secondary/50 rounded-lg px-3 py-2">
    <span className="text-muted-foreground">{k}</span>
    <span className="font-semibold text-foreground tabular-nums">{v}</span>
  </div>
);

// TICKET TÉRMICO (Simplificamos la fecha en una sola línea)
function PrintTicket({
  rut,
  ticketId,
  result,
  qrPayload,
}: {
  rut: string;
  ticketId: string;
  result: TriageResult;
  qrPayload: string;
}) {
  const dateTime = new Date().toLocaleString("es-CL", { dateStyle: "short", timeStyle: "short" });

  return (
    <div className="hidden print:block w-full max-w-[80mm] mx-auto p-4 bg-white text-black font-mono">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold font-sans uppercase">Hospital Demo</h2>
        <p className="text-sm">Triaje Inteligente IA</p>
        <p className="text-xs mt-1 border-b border-black pb-2">Fecha: {dateTime}</p>
      </div>

      <div className="text-center mb-6 border-b border-black pb-4">
        <p className="text-xs uppercase tracking-widest mb-1">Su Turno Digital</p>
        <h1 className="text-5xl font-bold my-2">{ticketId}</h1>
      </div>

      <div className="mb-6 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-xs uppercase">Categoría:</span>
          <span className="font-bold">{result.label}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-xs uppercase">Espera Est.:</span>
          <span>{result.waitTime}</span>
        </div>
        <div className="flex justify-between text-sm border-t border-dashed border-gray-400 pt-2 mt-2">
          <span className="text-xs uppercase">RUT Paciente:</span>
          <span>{rut}</span>
        </div>
      </div>

      <div className="flex flex-col items-center border-t border-black pt-4 mb-4">
        <QRCodeSVG value={qrPayload} size={140} level="M" fgColor="#000000" />
      </div>

      <div className="text-center mt-4 border-t border-black pt-2">
        <p className="text-[10px] leading-tight">
          Escanee este código en el módulo
          <br />
          de espera o muéstrelo al personal.
        </p>
      </div>
    </div>
  );
}
