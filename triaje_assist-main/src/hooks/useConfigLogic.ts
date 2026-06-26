// src/hooks/useConfigLogic.ts
import { useState } from "react";

export function useConfigLogic() {
  // 1. Autorización y Seguridad
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [enteredPin, setEnteredPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const MASTER_PIN = "1234";

  // 2. Estados leyendo la memoria (localStorage) para que no se borren al cerrar
  const [moduleName, setModuleName] = useState(
    () => localStorage.getItem("moduleName") || "Hospital Demo · Box 03",
  );
  const [lockNav, setLockNav] = useState(() => localStorage.getItem("lockNav") === "true");
  const [autoReset, setAutoReset] = useState(() => localStorage.getItem("autoReset") !== "false"); // True por defecto
  const [resetTimeout, setResetTimeout] = useState<30 | 60 | 90>(
    () => (Number(localStorage.getItem("resetTimeout")) as 30 | 60 | 90) || 60,
  );
  const [rpiIp, setRpiIp] = useState(() => localStorage.getItem("rpi_ip") || "localhost");
  const [vitalsMode, setVitalsMode] = useState<"real" | "sim">(
    () => (localStorage.getItem("vitalsMode") as "real" | "sim") || "real",
  );

  // Para la pantalla completa, leemos directamente el estado actual del navegador
  const [fullScreen, setFullScreen] = useState(() => document.fullscreenElement !== null);

  const [opticalSensorStatus] = useState<"ok" | "error">("ok");
  const [temperatureSensorStatus] = useState<"ok" | "error">("ok");
  const [printerStatus] = useState<"ok" | "paper_out" | "error">("ok");

  // --- Funciones que ahora sí hacen cosas reales ---

  const toggleFullScreen = () => {
    setFullScreen((prev) => {
      const newState = !prev;
      if (newState) {
        // Pide al navegador entrar en pantalla completa
        document.documentElement.requestFullscreen().catch(console.error);
      } else {
        // Sale de pantalla completa
        if (document.fullscreenElement) document.exitFullscreen();
      }
      return newState;
    });
  };

  const toggleLockNav = () => {
    setLockNav((prev) => {
      const newState = !prev;
      localStorage.setItem("lockNav", String(newState));
      // Avisamos al sistema que hubo un cambio
      window.dispatchEvent(new Event("kiosk-update"));
      return newState;
    });
  };

  const toggleVitalsMode = () => {
    setVitalsMode((prev) => {
      const newMode = prev === "real" ? "sim" : "real";
      localStorage.setItem("vitalsMode", newMode);
      window.dispatchEvent(new Event("kiosk-update"));
      return newMode;
    });
  };

  const toggleAutoReset = () => {
    setAutoReset((prev) => {
      const newState = !prev;
      localStorage.setItem("autoReset", String(newState));
      window.dispatchEvent(new Event("kiosk-update"));
      return newState;
    });
  };

  const handleSetResetTimeout = (time: 30 | 60 | 90) => {
    setResetTimeout(time);
    localStorage.setItem("resetTimeout", String(time));
    window.dispatchEvent(new Event("kiosk-update"));
  };

  // Función para guardar el nombre del módulo
  const handleSetModuleName = (name: string) => {
    setModuleName(name);
    localStorage.setItem("moduleName", name);
    window.dispatchEvent(new Event("kiosk-update"));
  };

  const handleSetRpiIp = (ip: string) => {
    setRpiIp(ip);
    localStorage.setItem("rpi_ip", ip);
    window.dispatchEvent(new Event("kiosk-update"));
  };

  const handlePinInput = (digit: string) => {
    setPinError(false);
    if (enteredPin.length < 4) {
      const newPin = enteredPin + digit;
      setEnteredPin(newPin);
      if (newPin === MASTER_PIN) {
        setTimeout(() => setIsAuthorized(true), 300);
      } else if (newPin.length === 4) {
        setTimeout(() => {
          setPinError(true);
          setEnteredPin("");
        }, 300);
      }
    }
  };

  return {
    isAuthorized,
    enteredPin,
    pinError,
    handlePinInput,
    clearPin: () => setEnteredPin(""),
    moduleName,
    setModuleName: handleSetModuleName,
    rpiIp,
    setRpiIp: handleSetRpiIp,
    autoReset,
    setResetTimeout: handleSetResetTimeout,
    resetTimeout,
    toggleAutoReset,
    lockNav,
    fullScreen,
    vitalsMode,
    toggleLockNav,
    toggleFullScreen,
    toggleVitalsMode,
    opticalSensorStatus,
    temperatureSensorStatus,
    printerStatus,
    handleTestPrint: () => window.print(),
  };
}
