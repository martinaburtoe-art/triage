# Configuración Dinámica de IP e Integración en Raspberry Pi Linux

Este plan propone hacer que la dirección IP de la Raspberry Pi (Bridge Server) sea configurable directamente desde el panel de administración (en lugar de estar fija como `192.168.1.103`).

Esto permitirá:

1. **Desarrollo cómodo en Windows**: Escribir la IP de tu Raspberry Pi (ej. `192.168.1.103`) desde la interfaz para pruebas.
2. **Empaquetado listo para la Raspberry Pi**: Configurar la dirección como `localhost` o `127.0.0.1` de forma que, al correr de manera local dentro de la Raspberry Pi, la app se conecte automáticamente al script puente Python en el mismo hardware.

---

## Cambios Propuestos

### Componentes y Lógica

---

#### [MODIFY] [useConfigLogic.ts](file:///c:/Users/rurzu/OneDrive%20-%20Universidad%20Aut%C3%B3noma%20de%20Chile/Documentos/Programaci%C3%B3n/ai-triage-assist-main/src/hooks/useConfigLogic.ts)

Añadir el estado `rpiIp` leído desde y guardado en `localStorage`, inicializándolo en `localhost` por defecto.

```typescript
// Agregar a la lógica de configuración:
const [rpiIp, setRpiIp] = useState(() => localStorage.getItem("rpi_ip") || "localhost");

const handleSetRpiIp = (ip: string) => {
  setRpiIp(ip);
  localStorage.setItem("rpi_ip", ip);
  window.dispatchEvent(new Event("kiosk-update"));
};

// Retornar en el objeto:
return {
  ...rpiIp,
  setRpiIp: handleSetRpiIp,
};
```

---

#### [MODIFY] [ConfigModal.tsx](file:///c:/Users/rurzu/OneDrive%20-%20Universidad%20Aut%C3%B3noma%20de%20Chile/Documentos/Programaci%C3%B3n/ai-triage-assist-main/src/components/triage/ConfigModal.tsx)

Añadir una fila de configuración en la interfaz para poder cambiar la IP de la Raspberry Pi de manera visual.

```tsx
// Dentro de ConfigModal.tsx, bajo "Identidad del Tótem" o "Hardware Local":
<div className="space-y-2">
  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-2">
    Dirección IP del Servidor Puente (Raspberry Pi)
  </h3>
  <div className="relative">
    <Monitor className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
    <input
      type="text"
      value={rpiIp}
      onChange={(e) => setRpiIp(e.target.value)}
      placeholder="localhost (si se ejecuta en la misma RPi)"
      className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-slate-700 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
    />
  </div>
</div>
```

---

#### [MODIFY] [useVitalsLogic.ts](file:///c:/Users/rurzu/OneDrive%20-%20Universidad%20Aut%C3%B3noma%20de%20Chile/Documentos/Programaci%C3%B3n/ai-triage-assist-main/src/hooks/useVitalsLogic.ts)

Eliminar la variable estática `RPI_IP` global y leer el valor dinámicamente de `localStorage` en el hook `useEffect` al intentar conectarse al WebSocket.

```typescript
// Dentro de useEffect (MODE === "real")
const rpiIp = localStorage.getItem("rpi_ip") || "localhost";
const wsUrl = `ws://${rpiIp}:8080`;

// Cambiar la instanciación:
ws = new WebSocket(wsUrl);
```

---

## Plan de Compilación para Raspberry Pi (Linux)

Dado que no es posible compilar directamente un archivo ejecutable de Linux desde un host Windows (debido a las dependencias del kit de desarrollo de C, WebView2 y GTK en Linux), el procedimiento estándar para empaquetar para la Raspberry Pi es:

1. **Instalar dependencias de compilación en la Raspberry Pi** (ejecutar en la terminal de la RPi):
   ```bash
   sudo apt update
   sudo apt install -y build-essential curl wget libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
   ```
2. **Instalar Node.js y Rust en la Raspberry Pi**:
   - Rust: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
3. **Copiar tu carpeta de código fuente** a la Raspberry Pi.
4. **Instalar y Compilar** en la Raspberry Pi:
   ```bash
   npm install
   npm run build
   npx tauri build
   ```
   _Esto generará un paquete ejecutable `.deb` nativo para Linux ARM (arquitectura de la Raspberry Pi)._

---

## Plan de Verificación

### Pruebas Automatizadas

- Compilar la aplicación React localmente: `npm run build`.
- Verificar con linter: `npm run lint`.

### Verificación Manual

1. Abrir la configuración en la app, ingresar el PIN `1234`.
2. Modificar la IP de la RPi a `127.0.0.1` o `localhost` y guardar.
3. Verificar en la pestaña de Signos Vitales que intente conectar al WebSocket local (`ws://localhost:8080`).
