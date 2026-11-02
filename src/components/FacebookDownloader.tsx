import React, { useState } from 'react';
import {
  Video,
  Search,
  Download,
  Check,
  AlertCircle,
  Eye,
  Film,
  Layers,
  Clipboard,
  X,
  Volume2,
  Share2,
  Tv,
  Lock,
  LogIn,
  ShieldCheck,
} from 'lucide-react';
import { MediaInfo } from '../types';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../config/api';

interface FacebookDownloaderProps {
  onStartDownload: (params: {
    url: string;
    type: 'video' | 'audio';
    format: string;
    quality: string;
    title: string;
    thumbnail?: string | null;
  }) => void;
  onAddToQueue: (params: {
    url: string;
    type: 'video' | 'audio';
    format: string;
    quality: string;
    title: string;
    thumbnail?: string | null;
  }) => void;
}

const FB_PRESET_DEMOS = [
  {
    label: 'Facebook Watch Sample',
    url: 'https://www.facebook.com/watch/?v=10153231379946729',
    desc: 'Video público de muestra de Facebook',
  },
  {
    label: 'Reel de Paisaje',
    url: 'https://www.facebook.com/reel/1179450389823438',
    desc: 'Facebook Reel de naturaleza',
  },
];

export const FacebookDownloader: React.FC<FacebookDownloaderProps> = ({
  onStartDownload,
  onAddToQueue,
}) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mediaInfo, setMediaInfo] = useState<MediaInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Selected options
  const [selectedQuality, setSelectedQuality] = useState<string>('1080');
  const [downloadType, setDownloadType] = useState<'video' | 'audio'>('video');

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
      }
    } catch {
      // Ignored
    }
  };

  const handleAnalyze = async (overrideUrl?: string) => {
    const targetUrl = (overrideUrl || url).trim();
    if (!targetUrl) {
      setError('Por favor introduce un enlace de video de Facebook.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setMediaInfo(null);

    try {
      const res = await fetch(apiUrl('/api/info'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo obtener el video de Facebook.');
      }

      setMediaInfo(data);
      setSelectedQuality('1080');
      setDownloadType('video');
    } catch (err: any) {
      console.error(err);
      setError(
        err.message ||
          'Asegúrate de que el video de Facebook sea público (Reel, Watch o publicación compartible).'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const { requireAuth, isLoggedIn, user, openAuthModal } = useAuth();

  const handleTriggerDownload = () => {
    if (!mediaInfo) return;

    const isAudioOnly = downloadType === 'audio';

    requireAuth(
      () => {
        onStartDownload({
          url: mediaInfo.originalUrl,
          type: isAudioOnly ? 'audio' : 'video',
          format: isAudioOnly ? 'mp3' : 'mp4',
          quality: selectedQuality,
          title: mediaInfo.title,
          thumbnail: mediaInfo.thumbnail,
        });
      },
      `Inicia sesión para descargar este video de Facebook en calidad ${selectedQuality}p.`
    );
  };

  const handleTriggerQueue = () => {
    if (!mediaInfo) return;

    const isAudioOnly = downloadType === 'audio';

    requireAuth(
      () => {
        onAddToQueue({
          url: mediaInfo.originalUrl,
          type: isAudioOnly ? 'audio' : 'video',
          format: isAudioOnly ? 'mp3' : 'mp4',
          quality: selectedQuality,
          title: mediaInfo.title,
          thumbnail: mediaInfo.thumbnail,
        });
      },
      `Inicia sesión para encolar este video de Facebook.`
    );
  };

  return (
    <div className="space-y-8">
      {/* Search & URL Input Box */}
      <div className="bg-[#121927] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold mb-2">
            <Video className="w-4 h-4" />
            <span>Extractor de Video & Reels de Facebook</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight text-balance">
            Descargar Videos de Facebook en Calidad HD y SD
          </h2>
          <p className="mt-2 text-slate-400 text-sm sm:text-base leading-relaxed">
            Guarda en tu dispositivo videos públicos de Facebook Watch, Reels, transmisiones y publicaciones en formato MP4 o extrae el audio en MP3.
          </p>
        </div>

        {/* Input bar */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              placeholder="Pega el enlace de Facebook aquí (ej: https://www.facebook.com/reel/... o fb.watch/...)"
              className="w-full pl-11 pr-24 py-3.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            />
            <div className="absolute inset-y-0 right-1 flex items-center gap-1 pr-1.5">
              {url && (
                <button
                  onClick={() => setUrl('')}
                  className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
                  title="Limpiar"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handlePaste}
                className="px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 rounded-md transition-colors flex items-center gap-1"
                title="Pegar del portapapeles"
              >
                <Clipboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pegar</span>
              </button>
            </div>
          </div>

          <button
            onClick={() => handleAnalyze()}
            disabled={isLoading || !url.trim()}
            className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-blue-950/50 flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Analizando...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Obtener Video</span>
              </>
            )}
          </button>
        </div>

        {/* Preset sample links - mobile swipeable */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 -mx-2 px-2 scrollbar-none">
          <span className="text-xs text-slate-500 whitespace-nowrap shrink-0">Pruebas:</span>
          {FB_PRESET_DEMOS.map((demo) => (
            <button
              key={demo.label}
              onClick={() => {
                setUrl(demo.url);
                handleAnalyze(demo.url);
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-blue-300 border border-slate-700/60 transition-colors whitespace-nowrap shrink-0 min-h-[36px] flex items-center"
            >
              {demo.label}
            </button>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 p-4 bg-blue-950/40 border border-blue-900/60 rounded-xl text-sm text-blue-300 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-200">No se pudo procesar el enlace de Facebook</p>
              <p className="mt-0.5 text-blue-300/80 text-xs sm:text-sm">{error}</p>
              <p className="mt-2 text-xs text-slate-400">
                Tip: Asegúrate de que el video sea público y que el enlace no provenga de un grupo cerrado o cuenta privada.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Media Details & Options Card */}
      {mediaInfo && (
        <div className="bg-[#121927] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Thumbnail / Poster */}
            <div className="relative w-full md:w-72 aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0 shadow-md">
              {mediaInfo.thumbnail ? (
                <img
                  src={mediaInfo.thumbnail}
                  alt={mediaInfo.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600">
                  <Film className="w-12 h-12" />
                </div>
              )}
              {mediaInfo.durationFormatted && (
                <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-xs text-white text-xs font-mono font-medium px-2 py-0.5 rounded">
                  {mediaInfo.durationFormatted}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
                <span className="text-blue-400 font-medium">Facebook</span>
                <span aria-hidden="true">·</span>
                <span>{mediaInfo.uploader || 'Página de Facebook'}</span>
                {mediaInfo.duration > 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{mediaInfo.durationFormatted}</span>
                  </>
                )}
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-slate-100 line-clamp-2 leading-snug">
                {mediaInfo.title || 'Video de Facebook'}
              </h3>

              {/* Video Preview Note */}
              <div className="mt-4 p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center gap-3">
                <Tv className="w-5 h-5 text-blue-400 shrink-0" />
                <div className="text-xs text-slate-300">
                  <span className="font-semibold text-slate-200">Video listo para procesar:</span> Formato contenedor MP4 estándar compatible con cualquier dispositivo (iPhone, Android, Windows, Mac y televisores).
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-6 space-y-6">
            {/* Quality and Format Selector */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-3">
                Selecciona Resolución y Formato
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {mediaInfo.videoQualities.map((item) => {
                  const isAudio = item.format === 'mp3';
                  const isSelected =
                    (isAudio && downloadType === 'audio') ||
                    (!isAudio && downloadType === 'video' && selectedQuality === item.quality);

                  return (
                    <button
                      key={`${item.format}-${item.quality}`}
                      onClick={() => {
                        if (isAudio) {
                          setDownloadType('audio');
                          setSelectedQuality('320k');
                        } else {
                          setDownloadType('video');
                          setSelectedQuality(item.quality);
                        }
                      }}
                      className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-blue-500/10 border-blue-500/80 text-white shadow-sm shadow-blue-950/30'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <div className="flex items-center gap-2">
                          {isAudio ? (
                            <Volume2 className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                          ) : (
                            <Film className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                          )}
                          <span className="font-bold text-sm">{item.label}</span>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-slate-700'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>

                      <p className="text-xs text-slate-400">{item.note}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleTriggerDownload}
                className="flex-1 py-3.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:from-blue-700 active:to-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-950/60 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-5 h-5" />
                <span>
                  {downloadType === 'audio'
                    ? 'Descargar Solo Audio MP3'
                    : `Descargar Video MP4 (${selectedQuality === '1080' ? 'Full HD' : selectedQuality === '720' ? 'HD' : 'SD'})`}
                </span>
              </button>

              <button
                onClick={handleTriggerQueue}
                className="py-3.5 px-6 bg-slate-800 hover:bg-slate-700 active:bg-slate-850 text-slate-200 hover:text-white font-semibold text-sm rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Layers className="w-4 h-4 text-slate-400" />
                <span>Añadir a la Cola</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guide & Advice */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <div className="bg-[#121927]/60 border border-slate-800/80 rounded-xl p-5">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
            <Film className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-200">Reels & Videos en HD</h4>
          <p className="mt-1 text-xs text-slate-400 leading-relaxed">
            Descarga en resolución nativa 1080p o 720p sin marcas de agua artificiales, ideal para archivar o compartir en WhatsApp y Telegram.
          </p>
        </div>

        <div className="bg-[#121927]/60 border border-slate-800/80 rounded-xl p-5">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
            <Volume2 className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-200">Extracción de Audio Directa</h4>
          <p className="mt-1 text-xs text-slate-400 leading-relaxed">
            Convierte clips de música, conferencias o podcasts de Facebook directamente a MP3 para escucharlos con la pantalla apagada.
          </p>
        </div>

        <div className="bg-[#121927]/60 border border-slate-800/80 rounded-xl p-5">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
            <Share2 className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-200">Todos los Enlaces de FB</h4>
          <p className="mt-1 text-xs text-slate-400 leading-relaxed">
            Compatible con enlaces cortos `fb.watch`, enlaces de app móvil `m.facebook.com` y publicaciones tradicionales de escritorio.
          </p>
        </div>
      </div>
    </div>
  );
};
