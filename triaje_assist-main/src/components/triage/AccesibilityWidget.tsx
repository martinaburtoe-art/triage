// src/components/triage/AccessibilityWidget.tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Accessibility, Type, Contrast, X } from "lucide-react";

export function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  // EFECTOS EN EL SISTEMA:
  // Al cambiar estos estados, aplicamos clases al "html" de la página
  // para que Tailwind CSS o tu CSS global cambien la apariencia de toda la app.
  useEffect(() => {
    if (largeText) {
      document.documentElement.style.fontSize = "120%"; // Aumenta el texto base un 20%
    } else {
      document.documentElement.style.fontSize = "100%";
    }
  }, [largeText]);

  useEffect(() => {
    if (highContrast) {
      // Agrega una clase para que puedas definir colores oscuros en tu CSS
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [highContrast]);

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col-reverse items-start gap-4">
      {/* Botón Flotante Principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full bg-indigo-600 text-white shadow-xl flex items-center justify-center hover:bg-indigo-700 transition-all hover:scale-105"
        aria-label="Opciones de accesibilidad"
      >
        <Accessibility className="h-7 w-7" />
      </button>

      {/* Menú Desplegable (Animado) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="bg-white/90 backdrop-blur-md border border-slate-200 p-4 rounded-2xl shadow-2xl w-64 origin-bottom-left"
          >
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
              <h3 className="font-bold text-slate-700">Accesibilidad</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Opción 1: Texto Grande */}
              <button
                onClick={() => setLargeText(!largeText)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  largeText
                    ? "bg-indigo-100 border-indigo-300 text-indigo-800"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Type className="h-5 w-5" />
                <span className="text-sm font-semibold">Texto más grande</span>
              </button>

              {/* Opción 2: Alto Contraste */}
              <button
                onClick={() => setHighContrast(!highContrast)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  highContrast
                    ? "bg-slate-800 border-slate-900 text-white"
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Contrast className="h-5 w-5" />
                <span className="text-sm font-semibold">Alto Contraste</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
