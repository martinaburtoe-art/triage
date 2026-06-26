// src/components/triage/ConfigModal.tsx
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  X,
  Lock,
  Monitor,
  Activity,
  Printer,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Edit3,
  Timer,
} from "lucide-react";
import { useConfigLogic } from "@/hooks/useConfigLogic";

interface Props {
  onClose: () => void;
}

export function ConfigModal({ onClose }: Props) {
  // 1. PRIMERO llamamos a nuestra lógica para tener las variables disponibles
  const {
    // Seguridad
    isAuthorized,
    enteredPin,
    pinError,
    handlePinInput,
    clearPin,
    // Identidad y Flujo
    moduleName,
    setModuleName,
    rpiIp,
    setRpiIp,
    autoReset,
    setResetTimeout,
    resetTimeout,
    toggleAutoReset,
    // Interfaz
    lockNav,
    fullScreen,
    vitalsMode,
    toggleLockNav,
    toggleFullScreen,
    toggleVitalsMode,
    // Hardware
    opticalSensorStatus,
    temperatureSensorStatus,
    printerStatus,
    handleTestPrint,
  } = useConfigLogic();

  // 2. SEGUNDO ponemos el escuchador del teclado, porque necesita leer las variables de arriba
  useEffect(() => {
    // Si ya estamos autorizados, apagamos el teclado para poder escribir texto.
    if (isAuthorized) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;

      if (/^[0-9]$/.test(key)) {
        handlePinInput(key);
      } else if (key === "Backspace" || key.toLowerCase() === "c") {
        clearPin();
      } else if (key === "Escape" || key.toLowerCase() === "x") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthorized, handlePinInput, clearPin, onClose]);

  // 3. TERCERO dibujamos la interfaz
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-[#e2e8f0] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <AnimatePresence mode="wait">
          {!isAuthorized ? (
            /* --- VISTA 1: TECLADO PIN --- */
            <motion.div
              key="pin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8"
            >
              <div className="text-center mb-8">
                <div className="h-16 w-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <Lock className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Acceso Restringido</h2>
                <p className="text-slate-500 text-sm mt-1">Ingrese el PIN de administración</p>
              </div>

              {/* Indicador de puntos del PIN */}
              <div className="flex justify-center gap-4 mb-8 h-6 items-center">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-4 w-4 rounded-full border-2 transition-all duration-200 ${
                      enteredPin.length > i
                        ? "bg-indigo-500 border-indigo-500 scale-125"
                        : "border-slate-300"
                    } ${pinError ? "bg-red-500 border-red-500 animate-bounce" : ""}`}
                  />
                ))}
              </div>

              {/* Teclado Numérico */}
              <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "X"].map((btn) => (
                  <button
                    key={btn}
                    onClick={() => {
                      if (btn === "C") clearPin();
                      else if (btn === "X") onClose();
                      else handlePinInput(btn);
                    }}
                    className={`h-16 rounded-2xl text-xl font-bold transition-all active:scale-95 ${
                      btn === "X"
                        ? "bg-slate-200 text-slate-500 hover:bg-slate-300"
                        : btn === "C"
                          ? "bg-slate-200 text-slate-700 hover:bg-slate-300"
                          : "bg-white text-slate-700 shadow-sm hover:bg-indigo-50 hover:text-indigo-600"
                    }`}
                  >
                    {btn === "X" ? <X className="mx-auto" /> : btn}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            /* --- VISTA 2: PANEL DE CONFIGURACIÓN --- */
            <motion.div
              key="admin"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col flex-1 overflow-hidden"
            >
              {/* Cabecera */}
              <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-300/50 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Administración</h2>
                    <p className="text-xs text-slate-500">Módulo de Triaje</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-300 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Contenido scrolleable */}
              <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                {/* Identificador del Módulo */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-2">
                    Identidad del Tótem
                  </h3>
                  <div className="relative">
                    <Edit3 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      value={moduleName}
                      onChange={(e) => setModuleName(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-700 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* IP de la Raspberry Pi */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-2">
                    Dirección IP de la Raspberry Pi (Bridge)
                  </h3>
                  <div className="relative">
                    <Monitor className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      value={rpiIp}
                      onChange={(e) => setRpiIp(e.target.value)}
                      placeholder="localhost o IP de la Raspberry Pi"
                      className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-700 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* SECCIÓN: Interfaz */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-2">
                    Interfaz
                  </h3>
                  <ToggleRow
                    icon={<Lock className="h-5 w-5 text-red-500" />}
                    iconBg="bg-red-100"
                    title="Bloquear Navegación"
                    description="Desactiva el botón de regreso"
                    isActive={lockNav}
                    onClick={toggleLockNav}
                    activeColor="bg-red-500"
                  />
                  <ToggleRow
                    icon={<Monitor className="h-5 w-5 text-slate-600" />}
                    iconBg="bg-slate-200"
                    title="Pantalla Completa"
                    description="Oculta barras del navegador"
                    isActive={fullScreen}
                    onClick={toggleFullScreen}
                    activeColor="bg-primary"
                  />
                </div>

                {/* SECCIÓN: Flujo del Paciente */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-2">
                    Flujo del Paciente
                  </h3>
                  <div className="bg-white/60 rounded-2xl border border-white/40 overflow-hidden transition-all">
                    <ToggleRow
                      icon={<Timer className="h-5 w-5 text-amber-500" />}
                      iconBg="bg-amber-100"
                      title="Reinicio Automático"
                      description="Vuelve al inicio por inactividad"
                      isActive={autoReset}
                      onClick={toggleAutoReset}
                      activeColor="bg-amber-500"
                      noBorder
                    />
                    {autoReset && (
                      <div className="px-4 pb-4 pt-1 flex gap-2 pl-[68px]">
                        {[30, 60, 90].map((time) => (
                          <button
                            key={time}
                            onClick={() => setResetTimeout(time as 30 | 60 | 90)}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                              resetTimeout === time
                                ? "bg-amber-100 border-amber-300 text-amber-700 shadow-sm"
                                : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                            }`}
                          >
                            {time}s
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* SECCIÓN: Hardware */}
                <div className="space-y-3 pt-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-2">
                    Hardware Local
                  </h3>

                  {/* Modo Simulación / Real */}
                  <ToggleRow
                    icon={<Activity className="h-5 w-5 text-indigo-500" />}
                    iconBg="bg-indigo-100"
                    title="Modo Simulación"
                    description="Genera signos vitales IA en lugar de usar los sensores físicos"
                    isActive={vitalsMode === "sim"}
                    onClick={toggleVitalsMode}
                    activeColor="bg-indigo-500"
                  />
                  <StatusRow
                    icon={<Activity className="h-5 w-5 text-blue-500" />}
                    title="Sensor Óptico (GPIO)"
                    status={opticalSensorStatus}
                  />
                  <StatusRow
                    icon={<Activity className="h-5 w-5 text-blue-500" />}
                    title="Sensor de Temperatura (IR)"
                    status={temperatureSensorStatus}
                  />
                  <StatusRow
                    icon={<Printer className="h-5 w-5 text-purple-500" />}
                    title="Impresora Térmica (USB)"
                    status={printerStatus}
                  />
                  <button
                    onClick={handleTestPrint}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-white text-slate-700 text-sm font-semibold shadow-sm hover:bg-slate-50 border border-slate-200 transition-all mt-2"
                  >
                    <FileText className="h-4 w-4" /> Imprimir ticket de prueba
                  </button>
                </div>
              </div>

              {/* Botón de Guardar (Fijo abajo) */}
              <div className="p-6 pt-4 border-t border-slate-300/50 bg-[#e2e8f0] shrink-0">
                <button
                  onClick={onClose}
                  className="w-full py-4 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-900 transition-all shadow-lg"
                >
                  Guardar y Salir
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Componentes UI Auxiliares
// ----------------------------------------------------------------------

interface ToggleRowProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  isActive: boolean;
  onClick: () => void;
  activeColor: string;
  noBorder?: boolean;
}

function ToggleRow({
  icon,
  iconBg,
  title,
  description,
  isActive,
  onClick,
  activeColor,
  noBorder = false,
}: ToggleRowProps) {
  return (
    <div
      className={`flex items-center justify-between p-3 ${noBorder ? "" : "bg-white/60 rounded-2xl border border-white/40"}`}
    >
      <div className="flex items-center gap-3">
        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-bold text-slate-700">{title}</p>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>
      <button
        onClick={onClick}
        className={`w-12 h-6 rounded-full p-1 transition-colors ${isActive ? activeColor : "bg-slate-300"}`}
      >
        <div
          className={`w-4 h-4 rounded-full bg-white transition-transform ${isActive ? "translate-x-6" : "translate-x-0"}`}
        />
      </button>
    </div>
  );
}

function StatusRow({
  icon,
  title,
  status,
}: {
  icon: React.ReactNode;
  title: string;
  status: "ok" | "error" | "paper_out";
}) {
  const getStatusDisplay = () => {
    switch (status) {
      case "ok":
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md">
            <CheckCircle2 className="h-3 w-3" /> Conectado
          </span>
        );
      case "paper_out":
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-md">
            <AlertTriangle className="h-3 w-3" /> Sin papel
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-md">
            <X className="h-3 w-3" /> Desconectado
          </span>
        );
    }
  };
  return (
    <div className="flex items-center justify-between p-3 bg-white/60 rounded-2xl border border-white/40">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
          {icon}
        </div>
        <p className="text-sm font-bold text-slate-700">{title}</p>
      </div>
      {getStatusDisplay()}
    </div>
  );
}
