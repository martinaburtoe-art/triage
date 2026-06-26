// src/components/triage/ProfileStep.tsx
import { motion } from "framer-motion";
import { User, Calendar, Heart, CheckCircle2, ArrowRight } from "lucide-react";
import { useProfileLogic } from "@/hooks/useProfileLogic";
import { type Patient } from "@/lib/patients";

interface Props {
  paciente: Patient; // ¡Solución al error rojo! Ahora espera el objeto completo
  onContinue: () => void;
}

export function ProfileStep({ paciente, onContinue }: Props) {
  // 1. Conectamos la vista con nuestra lógica extraída
  const { patientInfo, evaluationSteps, handleContinue } = useProfileLogic({
    paciente,
    onContinue,
  });

  // 2. Renderizamos el diseño visual usando los datos reales
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-3xl space-y-6"
    >
      <div className="glass-strong rounded-3xl p-8">
        <div className="flex items-center gap-2 text-sm text-success mb-4">
          <CheckCircle2 className="h-4 w-4" />
          <span className="font-medium">Identidad verificada</span>
        </div>

        <div className="flex items-center gap-5">
          <div className="h-20 w-20 rounded-2xl gradient-primary flex items-center justify-center shadow-glow shrink-0">
            <User className="h-10 w-10 text-primary-foreground" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            {/* Usamos el nombre y rut real del paciente encontrado */}
            <h2 className="text-2xl font-bold text-foreground truncate">{patientInfo.nombre}</h2>
            <p className="text-sm text-muted-foreground font-mono">{patientInfo.rut}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-6">
          {/* Usamos la edad, sexo y previsión reales */}
          <InfoCard icon={Calendar} label="Edad" value={`${patientInfo.edad} años`} />
          <InfoCard icon={User} label="Sexo" value={patientInfo.sexo} />
          <InfoCard icon={Heart} label="Previsión" value={patientInfo.prevision} />
        </div>
      </div>

      <div className="glass rounded-3xl p-8">
        <h3 className="text-lg font-semibold text-foreground mb-1">Cómo funciona la evaluación</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Tres pasos rápidos. Tiempo estimado: 3 minutos.
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          {evaluationSteps.map((s, i) => (
            <div
              key={i}
              className="relative bg-secondary/50 rounded-2xl p-5 border border-border/50"
            >
              <div className="absolute -top-3 -left-3 h-8 w-8 rounded-full gradient-primary text-primary-foreground text-sm font-bold flex items-center justify-center shadow-clinical">
                {i + 1}
              </div>
              <s.icon className="h-7 w-7 text-primary mb-3" strokeWidth={2} />
              <p className="font-semibold text-foreground text-sm">{s.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
            </div>
          ))}
        </div>

        <button
          onClick={handleContinue}
          className="w-full mt-6 gradient-primary text-primary-foreground font-semibold py-4 rounded-2xl shadow-clinical hover:shadow-glow transition-all flex items-center justify-center gap-2 group"
        >
          Continuar a sintomatología
          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}

// Este pequeño componente visual se queda aquí porque es solo diseño (UI)
function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-secondary/60 rounded-xl p-3 border border-border/50">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="font-semibold text-foreground text-sm">{value}</p>
    </div>
  );
}
