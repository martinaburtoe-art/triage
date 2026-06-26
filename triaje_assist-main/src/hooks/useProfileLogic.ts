// src/hooks/useProfileLogic.ts
import { MessageSquare, Stethoscope, CheckCircle2 } from "lucide-react";
import { type Patient } from "@/lib/patients";

interface UseProfileLogicProps {
  paciente: Patient; // Ahora recibimos el paciente completo, ¡no solo el RUT!
  onContinue: () => void;
}

export function useProfileLogic({ paciente, onContinue }: UseProfileLogicProps) {
  // Definimos la información de los pasos que se mostrarán en la tarjeta inferior
  const steps = [
    { icon: MessageSquare, label: "Describe tus síntomas", desc: "Cuéntanos cómo te sientes" },
    { icon: Stethoscope, label: "Toma de signos vitales", desc: "Sensores ópticos automatizados" },
    { icon: CheckCircle2, label: "Resultado y categoría", desc: "Asignación de prioridad clínica" },
  ];

  // Si en el futuro necesitas hacer alguna validación antes de continuar (ej. revisar si el paciente tiene deudas),
  // este sería el lugar ideal para hacerlo en lugar de ponerlo en la vista.
  const handleContinue = () => {
    // Aquí podríamos agregar analíticas o logs antes de avanzar
    console.log(`Paciente ${paciente.nombre} avanza a sintomatología.`);
    onContinue();
  };

  // Entregamos los datos procesados a la vista
  return {
    patientInfo: paciente, // Pasamos la información real desde la base de datos
    evaluationSteps: steps,
    handleContinue,
  };
}
