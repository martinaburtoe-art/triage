// src/components/triage/WelcomeStep.tsx
import { motion } from "framer-motion";
import { Activity, ArrowRight, ShieldCheck, Loader2 } from "lucide-react";
import { type Patient } from "@/lib/patients";
import { useWelcomeLogic } from "@/hooks/useWelcomeLogic";

interface Props {
  onSubmit: (paciente: Patient) => void;
}

export function WelcomeStep({ onSubmit }: Props) {
  // 1. Conectamos la vista con nuestra lógica extraída
  const {
    rut,
    touched,
    loading,
    patientNotFound,
    isValid,
    handleRutChange,
    handleBlur,
    handleSubmit,
  } = useWelcomeLogic({ onSubmit });

  // 2. Renderizamos el diseño visual
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-xl"
    >
      <div className="flex flex-col items-center text-center mb-8">
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full gradient-primary blur-2xl opacity-40" />
          <div className="relative h-20 w-20 rounded-2xl gradient-primary flex items-center justify-center shadow-glow animate-pulse-ring">
            <Activity className="h-10 w-10 text-primary-foreground" strokeWidth={2.5} />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
          Triaje <span className="text-gradient">Inteligente</span>
        </h1>
        <p className="mt-3 text-base text-muted-foreground max-w-md">
          Sistema de categorización automática de pacientes. Ingrese su RUT para comenzar la
          evaluación.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-strong rounded-3xl p-8 space-y-6">
        <div className="space-y-2">
          <label
            htmlFor="rut"
            className="text-sm font-medium text-foreground/80 flex items-center gap-2"
          >
            <ShieldCheck className="h-4 w-4 text-primary" />
            RUT del paciente
          </label>
          <input
            id="rut"
            type="text"
            inputMode="text"
            placeholder="12.345.678-9"
            value={rut}
            onChange={(e) => handleRutChange(e.target.value)} // <--- Mucho más limpio
            onBlur={handleBlur} // <--- Mucho más limpio
            maxLength={12}
            className="w-full text-center text-3xl md:text-4xl font-semibold tracking-wider px-6 py-5 rounded-2xl bg-secondary/60 border-2 border-input focus:border-primary focus:ring-4 focus:ring-primary/15 outline-none transition-all"
            autoFocus
          />
          {touched && rut && !isValid && (
            <p className="text-sm text-destructive text-center">
              RUT inválido. Verifique el dígito verificador.
            </p>
          )}
          {patientNotFound && (
            <p className="text-sm text-destructive text-center font-medium mt-1">
              Paciente no encontrado en los registros médicos.
            </p>
          )}
          {!touched && (
            <p className="text-xs text-muted-foreground text-center">
              Formato automático con puntos y guion
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={!isValid || loading}
          className="w-full gradient-primary text-primary-foreground font-semibold text-lg py-4 rounded-2xl shadow-clinical hover:shadow-glow transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Verificando identidad...
            </>
          ) : (
            <>
              Comenzar Evaluación
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
          <ShieldCheck className="h-3.5 w-3.5" />
          Sus datos están protegidos bajo Ley 19.628
        </div>
      </form>
    </motion.div>
  );
}
