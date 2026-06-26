// src/components/triage/SymptomsStep.tsx
import { motion } from "framer-motion";
import { ArrowRight, MessageSquare, Brain } from "lucide-react";
import { useSymptomsLogic, COMMON_SYMPTOMS, type SymptomsData } from "@/hooks/useSymptomsLogic";

interface Props {
  onSubmit: (data: SymptomsData) => void;
}

export function SymptomsStep({ onSubmit }: Props) {
  // 1. Conectamos la vista con nuestra lógica extraída
  const {
    selectedSymptoms,
    textDescription,
    painLevel,
    canContinue,
    setTextDescription,
    setPainLevel,
    toggleSymptom,
    handleSubmit,
  } = useSymptomsLogic({ onSubmit });

  // 2. Renderizamos el diseño visual
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-3xl space-y-6"
    >
      <div className="glass-strong rounded-3xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center shadow-clinical">
            <Brain className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">¿Qué te trae hoy?</h2>
            <p className="text-sm text-muted-foreground">Cuéntanos brevemente qué sientes</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-foreground/80 mb-3">
            Síntomas frecuentes (selecciona los que apliquen)
          </p>
          <div className="flex flex-wrap gap-2">
            {COMMON_SYMPTOMS.map((s) => {
              const active = selectedSymptoms.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSymptom(s)}
                  className={`px-4 py-2.5 rounded-full text-sm font-medium border-2 transition-all ${
                    active
                      ? "gradient-primary text-primary-foreground border-transparent shadow-clinical scale-105"
                      : "bg-secondary/60 text-foreground/80 border-border hover:border-primary/40 hover:bg-secondary"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6">
          <label className="text-sm font-medium text-foreground/80 mb-2 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            Descripción adicional (opcional)
          </label>
          <textarea
            rows={4}
            value={textDescription}
            onChange={(e) => setTextDescription(e.target.value)}
            placeholder="Ej: Comenzó hace 2 horas, dolor punzante en el lado derecho..."
            className="w-full px-4 py-3 rounded-2xl bg-secondary/60 border-2 border-input focus:border-primary focus:ring-4 focus:ring-primary/15 outline-none transition-all resize-none"
          />
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-foreground/80">Nivel de dolor</label>
            <span className="text-2xl font-bold text-gradient">
              {painLevel}
              <span className="text-sm text-muted-foreground">/10</span>
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={10}
            value={painLevel}
            onChange={(e) => setPainLevel(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Sin dolor</span>
            <span>Leve</span>
            <span>Moderado</span>
            <span>Severo</span>
            <span>Insoportable</span>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canContinue}
          className="w-full mt-8 gradient-primary text-primary-foreground font-semibold py-4 rounded-2xl shadow-clinical hover:shadow-glow transition-all flex items-center justify-center gap-2 group disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continuar a signos vitales
          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}
