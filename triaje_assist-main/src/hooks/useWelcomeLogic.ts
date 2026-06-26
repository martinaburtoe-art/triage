// src/hooks/useWelcomeLogic.ts
import { useState, useEffect, useRef } from "react";
import { formatRut, validateRut } from "@/lib/rut";
import { patientDatabase, type Patient } from "@/lib/patients";

interface UseWelcomeLogicProps {
  onSubmit: (paciente: Patient) => void;
}

export function useWelcomeLogic({ onSubmit }: UseWelcomeLogicProps) {
  const [rut, setRut] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [patientNotFound, setPatientNotFound] = useState(false);

  // Usamos una referencia para saber si el componente sigue montado en pantalla.
  // Esto previene un "Memory Leak" o errores de React al intentar actualizar
  // el estado de un componente que el usuario ya abandonó.
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Validaciones
  const isValid = validateRut(rut);

  // Manejadores de eventos (Handlers)
  const handleRutChange = (value: string) => {
    setRut(formatRut(value));
    setPatientNotFound(false); // Limpiamos el error al escribir
  };

  const handleBlur = () => {
    setTouched(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setPatientNotFound(false);

    if (!isValid) return;

    setLoading(true);

    // Mantenemos el retraso para el efecto visual de búsqueda en el tótem
    setTimeout(() => {
      // Verificamos si el usuario no cerró la página antes de que termine el timeout
      if (!isMounted.current) return;

      // 1. Limpiamos los puntos del RUT
      const rutLimpio = rut.replace(/\./g, "");

      // 2. Buscamos usando el RUT limpio
      const pacienteEncontrado = patientDatabase.find((p) => p.rut === rutLimpio);

      // 3. Tomamos una decisión
      if (pacienteEncontrado) {
        onSubmit(pacienteEncontrado);
      } else {
        setLoading(false);
        setPatientNotFound(true);
      }
    }, 900);
  };

  // Entregamos todo listo para que la vista lo use
  return {
    rut,
    touched,
    loading,
    patientNotFound,
    isValid,
    handleRutChange,
    handleBlur,
    handleSubmit,
  };
}
