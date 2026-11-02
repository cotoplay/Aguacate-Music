import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  X,
  Download,
  Copy,
  Check,
  Server,
  Cloud,
  ExternalLink,
  ShieldAlert,
  Zap,
  HelpCircle,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Github,
  Terminal,
} from 'lucide-react';
import { getApiBaseUrl, setApiBaseUrl, testApiConnection } from '../config/api';

interface AndroidApkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidApkModal: React.FC<AndroidApkModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);
  const [backendUrl, setBackendUrlInput] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string; latency?: number } | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setBackendUrlInput(getApiBaseUrl());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const handleSaveAndTest = async () => {
    setTestingConnection(true);
    setTestResult(null);

    // Save configuration
    setApiBaseUrl(backendUrl);

    // Perform health test
    const result = await testApiConnection(backendUrl);
    setTestResult(result);
    setTestingConnection(false);
  };

  const gitWorkflowYaml = `name: Compilar APK Android (Aguacate Music)

on:
  push:
    branches: [ main, master ]
  workflow_dispatch:

jobs:
  build-apk:
    name: Generar APK Android con Capacitor
    runs-on: ubuntu-latest

    steps:
      - name: 1. Clonar repositorio
        uses: actions/checkout@v4

      - name: 2. Configurar Java JDK 17
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: 3. Configurar Android SDK
        uses: android-actions/setup-android@v3

      - name: 4. Configurar Node.js 20
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: 5. Instalar dependencias
        run: npm install --legacy-peer-deps

      - name: 6. Compilar frontend Vite
        run: npm run build

      - name: 7. Inicializar o sincronizar Capacitor Android
        run: |
          if [ ! -d "android" ]; then
            npx cap add android
          else
            npx cap sync android
          fi

      - name: 8. Otorgar permisos a Gradle
        run: cd android && chmod +x gradlew

      - name: 9. Compilar APK Debug
        run: cd android && ./gradlew assembleDebug --stacktrace

      - name: 10. Subir APK como artefacto
        uses: actions/upload-artifact@v4
        with:
          name: AguacateMusic-debug-apk
          path: android/app/build/outputs/apk/debug/app-debug.apk
          retention-days: 14`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#101726] border-t sm:border border-slate-700/80 rounded-t-3xl sm:rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-[#0c121e] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-green-500 to-amber-500 flex items-center justify-center text-xl shadow-md shadow-emerald-950/60">
              🥑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Instalar APK Android en tu Celular
                </h3>
                <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Capacitor
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Guía completa paso a paso para compilar y descargar tu APK desde Android
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Step Pills */}
        <div className="px-4 sm:px-6 pt-4 pb-2 flex gap-2 border-b border-slate-800/80 overflow-x-auto no-scrollbar">
          {[
            { id: 1, label: '1. Arquitectura & Servidor' },
            { id: 2, label: '2. GitHub Actions' },
            { id: 3, label: '3. Compilar en la Nube' },
            { id: 4, label: '4. Instalar en Celular' },
          ].map((step) => (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeStep === step.id
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-slate-800'
              }`}
            >
              {step.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1 text-slate-300 text-xs sm:text-sm">
          {/* STEP 1: Architecture & Server Configuration */}
          {activeStep === 1 && (
            <div className="space-y-4">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Server className="w-4 h-4" />
                  <h4>¿Cómo funciona Aguacate Music en Android?</h4>
                </div>
                <p className="text-slate-300 leading-relaxed text-xs">
                  Tu aplicación tiene dos partes esenciales:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                    <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                      📱 1. La App APK (Frontend)
                    </span>
                    <p className="text-slate-400 text-[11px] mt-1">
                      Construida con React, Vite y Capacitor. Se instala en tu Android y proporciona la interfaz, búsqueda y reproductor.
                    </p>
                  </div>
                  <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3">
                    <span className="font-bold text-white flex items-center gap-1.5 text-xs">
                      🖥️ 2. El Servidor (<code className="text-rose-400">server.ts</code>)
                    </span>
                    <p className="text-slate-400 text-[11px] mt-1">
                      Ejecuta Node.js con <strong>yt-dlp</strong> y <strong>FFmpeg</strong> para descargar y convertir audio a 320 kbps. Android no permite correr binarios pesados de Linux dentro del APK, por lo que requiere una URL de backend.
                    </p>
                  </div>
                </div>
              </div>

              {/* Server URL Input & Connection Check */}
              <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-white text-xs flex items-center gap-1.5">
                    <Cloud className="w-4 h-4 text-rose-400" />
                    <span>URL del Servidor Backend para el APK</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    (VITE_API_BASE_URL)
                  </span>
                </div>

                <p className="text-slate-400 text-[11px]">
                  Introduce la dirección pública donde corre tu servidor (por ejemplo en Render, Railway, VPS o tu hosting). Si lo dejas vacío, usará la URL actual donde esté alojada la app.
                </p>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={backendUrl}
                    onChange={(e) => setBackendUrlInput(e.target.value)}
                    placeholder="https://mi-servidor-aguacate.onrender.com"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                  <button
                    onClick={handleSaveAndTest}
                    disabled={testingConnection}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {testingConnection ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Activity className="w-4 h-4" />
                    )}
                    <span>Guardar y Probar</span>
                  </button>
                </div>

                {testResult && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                      testResult.ok
                        ? 'bg-emerald-950/70 border-emerald-800 text-emerald-200'
                        : 'bg-red-950/70 border-red-800 text-red-200'
                    }`}
                  >
                    {testResult.ok ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setActiveStep(2)}
                  className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Siguiente: Ver Archivo de GitHub Actions →
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: GitHub Actions Workflow */}
          {activeStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <Github className="w-4 h-4 text-rose-400" />
                    <span>Archivo de Compilación Automática</span>
                  </h4>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Ubicado en: <code className="text-slate-200 font-mono">.github/workflows/build-apk.yml</code>
                  </p>
                </div>

                <button
                  onClick={() => copyToClipboard(gitWorkflowYaml, 'workflow')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedSection === 'workflow' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copiar YAML</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 font-mono text-[11px] text-slate-300 max-h-64 overflow-y-auto leading-relaxed">
                <pre>{gitWorkflowYaml}</pre>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-xs text-slate-400">
                💡 Este archivo ya está creado en tu proyecto. Cuando subas tu código a GitHub, este archivo le indicará a los servidores de GitHub que compilen el APK de Android de forma gratuita.
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setActiveStep(1)}
                  className="text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  ← Volver a Arquitectura
                </button>
                <button
                  onClick={() => setActiveStep(3)}
                  className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Siguiente: Cómo Compilar en la Nube →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: How to Build in Cloud from Mobile */}
          {activeStep === 3 && (
            <div className="space-y-4">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Cloud className="w-4 h-4 text-emerald-400" />
                <span>Instrucciones desde tu Celular Android</span>
              </h4>

              <div className="space-y-3">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-white text-xs">Crea un Repositorio en GitHub</p>
                    <p className="text-slate-400 text-xs">
                      Entra desde Chrome en tu celular a <strong>github.com/new</strong> y crea un nuevo repositorio (puede ser público o privado).
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-white text-xs">Sube los Archivos del Proyecto</p>
                    <p className="text-slate-400 text-xs">
                      Descomprime tu archivo ZIP en tu celular o sube los archivos directamente desde GitHub Web (botón <em>"Add file"</em> → <em>"Upload files"</em>) o usando una app como <strong>Termux</strong> con los comandos estándar de git:
                    </p>
                    <div className="mt-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400 flex items-center justify-between">
                      <span>git push origin main</span>
                      <button
                        onClick={() => copyToClipboard('git init && git add . && git commit -m "Aguacate Music APK" && git branch -M main && git push -u origin main', 'gitcmd')}
                        className="text-slate-400 hover:text-white"
                        title="Copiar comandos git"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-white text-xs">Elige la Pestaña "Actions" en GitHub</p>
                    <p className="text-slate-400 text-xs">
                      En la barra superior de tu repositorio, toca en <strong>"Actions"</strong>. Verás que el flujo <em>"Compilar APK Android (Aguacate Music)"</em> comienza a ejecutarse automáticamente. Tarda entre 2 y 4 minutos.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setActiveStep(2)}
                  className="text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  ← Ver YAML
                </button>
                <button
                  onClick={() => setActiveStep(4)}
                  className="bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Siguiente: Descargar e Instalar APK →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Download and Install on Android */}
          {activeStep === 4 && (
            <div className="space-y-4">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-rose-400" />
                <span>Descarga e Instalación en tu Celular</span>
              </h4>

              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-xs">Paso A: Descargar el Artefacto</h5>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Cuando la acción termine en GitHub, pulsa sobre la ejecución completada (con tilde verde). En la parte inferior bajo la sección <strong>"Artifacts"</strong>, pulsa sobre <strong>"AguacateMusic-debug-apk"</strong>. Se descargará a tu carpeta de Descargas.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2 border-t border-slate-800/80">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-xs">Paso B: Extraer e Instalar</h5>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Abre la app <em>"Archivos"</em> o <em>"Mis Archivos"</em> de tu teléfono Android. Abre el ZIP descargado y toca en <strong>app-debug.apk</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2 border-t border-slate-800/80">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-bold text-xs">
                    ⚠️
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-xs">Paso C: Permitir instalación de fuentes desconocidas</h5>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Android te mostrará una advertencia de seguridad porque el APK es compilado por ti mismo en GitHub y no proviene de Google Play. Toca en <strong>"Configuración"</strong> y activa <strong>"Permitir desde esta fuente"</strong>, luego presiona <strong>"Instalar"</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Instant Alternative: PWA Install */}
              <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-green-950/40 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                    ¿Quieres usarla ya mismo sin compilar?
                  </span>
                  <p className="text-xs text-white font-medium mt-0.5">
                    También puedes instalar la versión Web App (PWA) con un solo toque desde el navegador.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
                >
                  Usar Versión Web
                </button>
              </div>

              <div className="flex justify-start">
                <button
                  onClick={() => setActiveStep(3)}
                  className="text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  ← Ver pasos en GitHub
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0c121e] flex items-center justify-between gap-3 text-xs">
          <span className="text-slate-400 hidden sm:inline">
            Aguacate Music para Android · Capacitor 8.6
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Entendido, cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
