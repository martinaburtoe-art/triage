import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Activity, Hospital, Settings } from "lucide-react";
import { WelcomeStep } from "@/components/triage/WelcomeStep";
import { ProfileStep } from "@/components/triage/ProfileStep";
import { SymptomsStep } from "@/components/triage/SymptomsStep";
import { VitalsStep, type VitalsData } from "@/components/triage/VitalsStep";
import { ResultStep } from "@/components/triage/ResultStep";
import { StepIndicator } from "@/components/triage/StepIndicator";
import type { Patient } from "@/lib/patients";
import { ConfigModal } from "@/components/triage/ConfigModal";
import { AccessibilityWidget } from "@/components/triage/AccesibilityWidget";
import { KioskEngine } from "@/components/triage/KioskEngine";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Triaje IA · Categorización Automática de Pacientes" },
      {
        name: "description",
        content:
          "Módulo clínico de triaje automatizado con sensores Raspberry Pi 5. Categorización Manchester C1-C5 en tiempo real.",
      },
    ],
  }),
  component: Index,
});

type SymptomData = { symptoms: string[]; description: string; pain: number };

function Index() {
  const [step, setStep] = useState(0);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [symptoms, setSymptoms] = useState<SymptomData | null>(null);
  const [vitals, setVitals] = useState<VitalsData | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const [moduleName, setModuleName] = useState(
    localStorage.getItem("moduleName") || "Hospital Demo · Box 01",
  );

  useEffect(() => {
    const handleStorageChange = () => {
      setModuleName(localStorage.getItem("moduleName") || "Hospital Demo · Box 01");
    };
    window.addEventListener("kiosk-update", handleStorageChange);
    return () => window.removeEventListener("kiosk-update", handleStorageChange);
  }, []);

  const reset = () => {
    setStep(0);
    setPatient(null);
    setSymptoms(null);
    setVitals(null);
  };

  const labels = ["Identidad", "Perfil", "Síntomas", "Signos vitales", "Resultado"];

  return (
    //Encabezado con el logo de la plataforma
    <main className="min-h-screen w-full">
      <KioskEngine /> {/* Engine para el modo quiosco */}
      {/* Top bar */}
      <header className="w-full px-4 sm:px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-clinical print:hidden">
            <Activity className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <div>
            {/*Texto del Encabezado*/}
            <p className="text-sm font-bold text-foreground leading-tight">Triaje</p>
            <p className="text-[10px] text-muted-foreground leading-tight">
              Sistema Clínico Automatizado
            </p>
          </div>
        </div>
        {/*Información del Box*/}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card/60 backdrop-blur px-3 py-1.5 rounded-full border border-border">
            <Hospital className="h-3.5 w-3.5 text-primary" />
            <div className="block font-bold text-foreground">
              {moduleName}{" "}
              {/*Se implementa el uso de localStorage para que se muestre el nombre del módulo*/}
            </div>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="p-1.5 rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            title="Configuración"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </header>
      <div className="px-4 sm:px-6 pt-4 pb-12 flex flex-col items-center">
        {step > 0 && step < 4 && <StepIndicator current={step} steps={labels} />}

        <AnimatePresence mode="wait">
          {step === 0 && (
            <WelcomeStep
              key="welcome"
              onSubmit={(p) => {
                setPatient(p);
                setStep(1);
              }}
            />
          )}
          {step === 1 && patient && (
            <ProfileStep key="profile" paciente={patient} onContinue={() => setStep(2)} />
          )}
          {step === 2 && (
            <SymptomsStep
              key="symptoms"
              onSubmit={(d) => {
                setSymptoms(d);
                setStep(3);
              }}
            />
          )}
          {step === 3 && (
            <VitalsStep
              key="vitals"
              onComplete={(v) => {
                setVitals(v);
                setStep(4);
              }}
            />
          )}
          {step === 4 && patient && symptoms && vitals && (
            <ResultStep
              key="result"
              rut={patient.rut}
              symptoms={symptoms}
              vitals={vitals}
              onRestart={reset}
            />
          )}
        </AnimatePresence>
      </div>
      {/* Modal de Configuración */}
      {showSettings && <ConfigModal onClose={() => setShowSettings(false)} />}
      {/* Widget de Accesibilidad */}
      <AccessibilityWidget />
    </main>
  );
}
