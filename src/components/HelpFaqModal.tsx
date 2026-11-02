import React from 'react';
import { X, HelpCircle, Youtube, Facebook, ShieldCheck, Music, Smartphone, Laptop } from 'lucide-react';

interface HelpFaqModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpFaqModal: React.FC<HelpFaqModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#121927] border border-slate-800 rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-rose-400 text-sm font-semibold">
          <HelpCircle className="w-4 h-4" />
          <span>Guía Rápida & Preguntas Frecuentes</span>
        </div>

        <h3 className="text-xl font-bold text-white">¿Cómo descargar música y videos?</h3>

        <div className="space-y-5 text-sm text-slate-300">
          {/* YouTube Guide */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center gap-2 font-semibold text-rose-400">
              <Youtube className="w-4 h-4" />
              <span>Para Música de YouTube:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-xs sm:text-sm text-slate-300">
              <li>Abre YouTube o YouTube Music en tu teléfono o computadora.</li>
              <li>Busca la canción o video deseado.</li>
              <li>Haz clic en <strong>Compartir</strong> y luego en <strong>Copiar enlace</strong>.</li>
              <li>Pega el enlace en Aguacate Music, selecciona la calidad deseada (ej: <strong>MP3 320 kbps</strong>) y pulsa <strong>Descargar</strong>.</li>
            </ol>
          </div>

          {/* Facebook Guide */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center gap-2 font-semibold text-blue-400">
              <Facebook className="w-4 h-4" />
              <span>Para Videos y Reels de Facebook:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-xs sm:text-sm text-slate-300">
              <li>En la app de Facebook, pulsa el botón <strong>Compartir</strong> en la parte inferior del video o Reel.</li>
              <li>Selecciona <strong>Copiar enlace</strong> (o <em>Más opciones &gt; Copiar</em>).</li>
              <li>Pega el enlace en la pestaña de <strong>Facebook Videos</strong> de Aguacate Music.</li>
              <li>Elige la resolución (1080p, 720p o Solo Audio MP3) y pulsa <strong>Descargar</strong>.</li>
            </ol>
            <p className="text-xs text-amber-300/80 mt-1">
              * Nota: El video debe estar configurado como <strong>Público</strong> por el autor en Facebook. Los videos de grupos privados requieren permisos de cuenta.
            </p>
          </div>

          {/* Quality FAQs */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center gap-2 font-semibold text-emerald-400">
              <Music className="w-4 h-4" />
              <span>¿Qué calidad de audio debo elegir?</span>
            </div>
            <ul className="space-y-1 text-xs text-slate-300">
              <li>
                <strong className="text-white">MP3 320 kbps:</strong> Máxima calidad y riqueza acústica. Recomendado para amantes de la música, auriculares y altavoces.
              </li>
              <li>
                <strong className="text-white">MP3 192 kbps:</strong> Excelente equilibrio entre calidad cristalina y peso reducido.
              </li>
              <li>
                <strong className="text-white">M4A / AAC:</strong> Formato nativo sin recompresión, ideal para dispositivos Apple.
              </li>
              <li>
                <strong className="text-white">FLAC / WAV:</strong> Audio de estudio sin pérdida (lossless).
              </li>
            </ul>
          </div>

          {/* Privacy Note */}
          <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              Procesamiento local y seguro mediante FFmpeg. Los archivos no se comparten con terceros.
            </span>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm rounded-xl transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
