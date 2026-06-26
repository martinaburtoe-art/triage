// src/components/triage/KioskEngine.tsx
import { useEffect } from "react";

export function KioskEngine() {
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    // Función que lee la configuración y aplica las reglas
    const applyKioskRules = () => {
      const isNavLocked = localStorage.getItem("lockNav") === "true";
      const isAutoReset = localStorage.getItem("autoReset") !== "false";
      const timeoutSeconds = Number(localStorage.getItem("resetTimeout")) || 60;

      // 1. BLOQUEAR NAVEGACIÓN (Evita click derecho y teclas de regreso)
      document.oncontextmenu = isNavLocked ? (e) => e.preventDefault() : null;

      window.onkeydown = (e) => {
        if (!isNavLocked) return;
        // Prevenir F5 (Actualizar), Ctrl+R, y Alt+Flecha Izquierda (Atrás)
        if (e.key === "F5" || (e.ctrlKey && e.key === "r") || (e.altKey && e.key === "ArrowLeft")) {
          e.preventDefault();
        }
      };

      // 2. REINICIO AUTOMÁTICO (Inactividad)
      // En lugar de borrar y crear un setTimeout miles de veces por segundo
      // (lo cual consume muchísima batería y CPU), guardamos la última vez
      // que hubo actividad y revisamos cada segundo si el tiempo expiró.
      let lastActivityTime = Date.now();

      const updateActivityTime = () => {
        lastActivityTime = Date.now();
      };

      // Escuchamos si el usuario interactúa con la pantalla (con passive: true para mejor rendimiento)
      const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
      events.forEach((evt) => window.addEventListener(evt, updateActivityTime, { passive: true }));

      // Revisamos periódicamente si pasó el tiempo de inactividad
      if (isAutoReset) {
        timeoutId = setInterval(() => {
          if (Date.now() - lastActivityTime > timeoutSeconds * 1000) {
            // Si pasa el tiempo, recargamos la página para limpiar todo (modo seguro para Kioscos)
            window.location.replace("/");
          }
        }, 1000);
      }

      // Limpieza (Por si el componente se desmonta)
      return () => {
        events.forEach((evt) => window.removeEventListener(evt, updateActivityTime));
        clearInterval(timeoutId);
      };
    };

    // Ejecutar reglas al iniciar
    let cleanup = applyKioskRules();

    // Escuchar si alguien cambió la configuración en el menú para actualizar las reglas en vivo
    const handleUpdate = () => {
      if (cleanup) cleanup();
      cleanup = applyKioskRules();
    };
    window.addEventListener("kiosk-update", handleUpdate);

    return () => {
      if (cleanup) cleanup();
      window.removeEventListener("kiosk-update", handleUpdate);
      document.oncontextmenu = null;
      window.onkeydown = null;
    };
  }, []);

  return null; // Este componente es invisible
}
