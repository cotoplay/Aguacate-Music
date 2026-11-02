import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Smartphone, Download, X, Share } from 'lucide-react';

interface PWAInstallBannerProps {
  onOpenApkModal?: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ onOpenApkModal }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // If already running in standalone app mode or dismissed by user, do not show
  if (isInstalled || isDismissed) {
    return null;
  }

  // If not installable and not on iOS, but onOpenApkModal is available, we can still show APK option on mobile or fall back
  if (!isInstallable && !isIOS && !onOpenApkModal) {
    return null;
  }

  const handleInstallClick = () => {
    if (isIOS) {
      setShowIOSModal(true);
    } else {
      install();
    }
  };

  return (
    <>
      <div className="bg-gradient-to-r from-rose-950/60 via-slate-900 to-blue-950/60 border border-slate-700/60 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-lg shrink-0">
            🥑
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-white truncate">
              Instalar Aguacate Music en tu Celular
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-300 truncate">
              Descarga música y videos rápidamente desde tu pantalla de inicio.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onOpenApkModal && (
            <button
              onClick={onOpenApkModal}
              className="px-3 py-2 bg-emerald-700/80 hover:bg-emerald-600 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap border border-emerald-500/40"
              title="Ver guía y configuración para APK Android"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>APK Android</span>
            </button>
          )}

          {(isInstallable || isIOS) && (
            <button
              onClick={handleInstallClick}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isIOS ? 'Instalar en iPhone' : 'Instalar App'}</span>
            </button>
          )}

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
            title="Descartar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Safari Guide Modal / Bottom Sheet */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-[#121927] border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative">
            {/* Grab handle for bottom sheet */}
            <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto sm:hidden" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
                <Smartphone className="w-4 h-4" />
                <span>Instalar en iPhone o iPad</span>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-base font-bold text-white">
              Añade MediaRip a tu Pantalla de Inicio
            </h3>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Share className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold text-white">1. Pulsa Compartir</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Toca el botón de Compartir en la barra inferior de Safari.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800">
                <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 font-bold text-sm">
                  +
                </div>
                <div>
                  <p className="font-semibold text-white">2. Selecciona &quot;Añadir a pantalla de inicio&quot;</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Desplázate hacia abajo en el menú de Safari y elige esa opción.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded-xl transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
};
