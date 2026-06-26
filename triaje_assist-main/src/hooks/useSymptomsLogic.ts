// src/hooks/useSymptomsLogic.ts
import { useState } from "react";

// Definimos la estructura de los datos que enviaremos al final
export interface SymptomsData {
  symptoms: string[];
  description: string;
  pain: number;
}

interface UseSymptomsLogicProps {
  onSubmit: (data: SymptomsData) => void;
}

// Movemos la lista de síntomas comunes aquí (Datos/Lógica)
export const COMMON_SYMPTOMS = [
  "Dolor de cabeza",
  "Fiebre",
  "Dificultad respiratoria",
  "Dolor de pecho",
  "Náuseas / vómitos",
  "Mareos",
  "Dolor abdominal",
  "Tos persistente",
  "Sangrado",
  "Pérdida de conciencia",
  "Dolor lumbar",
  "Erupción cutánea",
];

export function useSymptomsLogic({ onSubmit }: UseSymptomsLogicProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [pain, setPain] = useState(3);

  // Lógica para agregar o quitar un síntoma de la lista
  const toggleSymptom = (symptom: string) => {
    setSelected(
      (prev) =>
        prev.includes(symptom)
          ? prev.filter((x) => x !== symptom) // Si ya está, lo quita
          : [...prev, symptom], // Si no está, lo agrega
    );
  };

  // Validación: ¿Puede avanzar al siguiente paso?
  const canContinue = selected.length > 0 || text.trim().length > 5;

  const handleSubmit = () => {
    onSubmit({ symptoms: selected, description: text, pain });
  };

  return {
    selectedSymptoms: selected,
    textDescription: text,
    painLevel: pain,
    canContinue,
    setTextDescription: setText,
    setPainLevel: setPain,
    toggleSymptom,
    handleSubmit,
  };
}
