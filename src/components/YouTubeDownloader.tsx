import React, { useState } from 'react';
import {
  Music,
  Search,
  Sparkles,
  Download,
  Scissors,
  Tag,
  Check,
  AlertCircle,
  Clock,
  Eye,
  Disc,
  Play,
  Layers,
  Clipboard,
  X,
  FileAudio,
  Lock,
  LogIn,
  ShieldCheck,
} from 'lucide-react';
import { MediaInfo, AudioQuality } from '../types';
import { AudioPlayer } from './AudioPlayer';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../config/api';

interface YouTubeDownloaderProps {
  onStartDownload: (params: {
    url: string;
    type: 'audio';
    format: string;
    quality: string;
    title: string;
    artist?: string;
    album?: string;
    trimStart?: number;
    trimEnd?: number;
    thumbnail?: string | null;
  }) => void;
  onAddToQueue: (params: {
    url: string;
    type: 'audio';
    format: string;
    quality: string;
    title: string;
    thumbnail?: string | null;
  }) => void;
}

const PRESET_DEMOS = [
  {
    label: 'Synthwave 80s',
    url: 'https://www.youtube.com/watch?v=4xDzrJKXOOY',
    desc: 'Música synthwave instrumental relajante',
  },
  {
    label: 'Chopin - Nocturne',
    url: 'https://www.youtube.com/watch?v=9E6b3swbnWg',
    desc: 'Piano clásico para relajación',
  },
  {
    label: 'Rick Astley - Classic',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    desc: 'Never Gonna Give You Up',
  },
  {
    label: 'Despacito',
    url: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    desc: 'Éxito latino internacional',
  },
];

export const YouTubeDownloader: React.FC<YouTubeDownloaderProps> = ({
  onStartDownload,
  onAddToQueue,
}) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mediaInfo, setMediaInfo] = useState<MediaInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Download options
  const [selectedFormat, setSelectedFormat] = useState<'mp3' | 'm4a' | 'flac' | 'wav'>('mp3');
  const [selectedQuality, setSelectedQuality] = useState<string>('320k');

  // Custom tags
  const [showTagEditor, setShowTagEditor] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customArtist, setCustomArtist] = useState('');
  const [customAlbum, setCustomAlbum] = useState('');

  // Trimming
  const [enableTrim, setEnableTrim] = useState(false);
  const [trimStartMin, setTrimStartMin] = useState(0);
  const [trimStartSec, setTrimStartSec] = useState(0);
  const [trimEndMin, setTrimEndMin] = useState(0);
  const [trimEndSec, setTrimEndSec] = useState(0);

  // Audio preview stream URL
  const [previewStreamUrl, setPreviewStreamUrl] = useState<string | null>(null);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
      }
    } catch {
      // Clipboard access denied or unsupported
    }
  };

  const handleAnalyze = async (overrideUrl?: string) => {
    const targetUrl = (overrideUrl || url).trim();
    if (!targetUrl) {
      setError('Por favor introduce un enlace de YouTube válido.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setMediaInfo(null);
    setPreviewStreamUrl(null);

    try {
      const res = await fetch(apiUrl('/api/info'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo analizar el video de YouTube.');
      }

      setMediaInfo(data);
      setCustomTitle(data.title || '');
      setCustomArtist(data.uploader || '');
      setCustomAlbum('Single');

      // Set initial trim end to duration
      const totalSec = data.duration || 180;
      setTrimStartMin(0);
      setTrimStartSec(0);
      setTrimEndMin(Math.floor(totalSec / 60));
      setTrimEndSec(totalSec % 60);

      // Set preview stream url
      setPreviewStreamUrl(apiUrl(`/api/preview-stream?url=${encodeURIComponent(targetUrl)}&type=audio`));
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const { requireAuth, isLoggedIn, user, openAuthModal } = useAuth();

  const handleTriggerDownload = () => {
    if (!mediaInfo) return;

    const startTotalSec = trimStartMin * 60 + trimStartSec;
    const endTotalSec = trimEndMin * 60 + trimEndSec;

    requireAuth(
      () => {
        onStartDownload({
          url: mediaInfo.originalUrl,
          type: 'audio',
          format: selectedFormat,
          quality: selectedQuality,
          title: customTitle.trim() || mediaInfo.title,
          artist: customArtist.trim() || mediaInfo.uploader,
          album: customAlbum.trim() || undefined,
          trimStart: enableTrim ? startTotalSec : undefined,
          trimEnd: enableTrim && endTotalSec > startTotalSec ? endTotalSec : undefined,
          thumbnail: mediaInfo.thumbnail,
        });
      },
      `Inicia sesión para descargar "${customTitle.trim() || mediaInfo.title}" en MP3 320 kbps.`
    );
  };

  const handleTriggerQueue = () => {
    if (!mediaInfo) return;

    requireAuth(
      () => {
        onAddToQueue({
          url: mediaInfo.originalUrl,
          type: 'audio',
          format: selectedFormat,
          quality: selectedQuality,
          title: customTitle.trim() || mediaInfo.title,
          thumbnail: mediaInfo.thumbnail,
        });
      },
      `Inicia sesión para encolar "${customTitle.trim() || mediaInfo.title}".`
    );
  };

  return (
    <div className="space-y-8">
      {/* Search & URL Input Box */}
      <div className="bg-[#121927] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-rose-400 text-sm font-semibold mb-2">
            <Music className="w-4 h-4" />
            <span>Extractor de Audio y Música HD</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight text-balance">
            Descargar Música de YouTube en MP3 320 kbps
          </h2>
          <p className="mt-2 text-slate-400 text-sm sm:text-base leading-relaxed">
            Convierte cualquier canción, video musical, short o sesión en audio de alta fidelidad con carátula y etiquetas ID3 integradas.
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
              placeholder="Pega el enlace de YouTube aquí (ej: https://www.youtube.com/watch?v=...)"
              className="w-full pl-11 pr-24 py-3.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all"
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
            className="px-6 py-3.5 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Analizando...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Analizar Enlace</span>
              </>
            )}
          </button>
        </div>

        {/* Preset sample links - mobile swipeable carousel */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 -mx-2 px-2 scrollbar-none">
          <span className="text-xs text-slate-500 whitespace-nowrap shrink-0">Probar:</span>
          {PRESET_DEMOS.map((demo) => (
            <button
              key={demo.label}
              onClick={() => {
                setUrl(demo.url);
                handleAnalyze(demo.url);
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-rose-300 border border-slate-700/60 transition-colors whitespace-nowrap shrink-0 min-h-[36px] flex items-center"
            >
              {demo.label}
            </button>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 p-4 bg-rose-950/40 border border-rose-900/60 rounded-xl text-sm text-rose-300 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-200">No se pudo procesar el enlace</p>
              <p className="mt-0.5 text-rose-300/80 text-xs sm:text-sm">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Media Details & Options Card */}
      {mediaInfo && (
        <div className="bg-[#121927] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Thumbnail */}
            <div className="relative w-full md:w-64 aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0 shadow-md">
              {mediaInfo.thumbnail ? (
                <img
                  src={mediaInfo.thumbnail}
                  alt={mediaInfo.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600">
                  <Disc className="w-12 h-12" />
                </div>
              )}
              <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-xs text-white text-xs font-mono font-medium px-2 py-0.5 rounded">
                {mediaInfo.durationFormatted}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
                <span className="text-rose-400 font-medium">YouTube</span>
                <span aria-hidden="true">·</span>
                <span>{mediaInfo.uploader}</span>
                {mediaInfo.viewCount && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1 font-mono tabular-nums">
                      <Eye className="w-3.5 h-3.5" />
                      {mediaInfo.viewCount.toLocaleString()} vistas
                    </span>
                  </>
                )}
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-slate-100 line-clamp-2 leading-snug">
                {mediaInfo.title}
              </h3>

              {/* In-app Audio Preview Player */}
              {previewStreamUrl && (
                <div className="mt-4">
                  <AudioPlayer
                    streamUrl={previewStreamUrl}
                    title={mediaInfo.title}
                    artist={mediaInfo.uploader}
                    thumbnail={mediaInfo.thumbnail}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-6 space-y-6">
            {/* Audio Formats Selection */}
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-3">
                Selecciona Formato y Calidad de Audio
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {mediaInfo.audioQualities.map((item) => {
                  const isSelected =
                    selectedFormat === item.format &&
                    (item.format !== 'mp3' || selectedQuality === item.quality);

                  return (
                    <button
                      key={`${item.format}-${item.quality}`}
                      onClick={() => {
                        setSelectedFormat(item.format);
                        setSelectedQuality(item.quality);
                      }}
                      className={`text-left p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-rose-500/10 border-rose-500/80 text-white shadow-sm shadow-rose-950/30'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <FileAudio className={`w-4 h-4 ${isSelected ? 'text-rose-400' : 'text-slate-500'}`} />
                          <span className="font-semibold text-sm truncate">{item.label}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 font-mono tabular-nums">
                          Tamaño est.: ~{item.sizeEst} MB
                        </p>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ml-2 ${
                          isSelected
                            ? 'bg-rose-600 border-rose-600 text-white'
                            : 'border-slate-700'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Trimmer & Cutter Accordion */}
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setEnableTrim(!enableTrim)}
                  className="flex items-center gap-2 text-sm font-semibold text-slate-200 hover:text-white cursor-pointer"
                >
                  <Scissors className="w-4 h-4 text-amber-400" />
                  <span>Recortar fragmento de canción (Opcional)</span>
                </button>
                <input
                  type="checkbox"
                  checked={enableTrim}
                  onChange={(e) => setEnableTrim(e.target.checked)}
                  className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
                />
              </div>

              {enableTrim && (
                <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Punto de Inicio</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={trimStartMin}
                        onChange={(e) => setTrimStartMin(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-16 px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded text-sm text-center font-mono tabular-nums text-white"
                      />
                      <span className="text-slate-400 text-xs">min</span>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={trimStartSec}
                        onChange={(e) => setTrimStartSec(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                        className="w-16 px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded text-sm text-center font-mono tabular-nums text-white"
                      />
                      <span className="text-slate-400 text-xs">seg</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Punto de Fin</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        value={trimEndMin}
                        onChange={(e) => setTrimEndMin(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-16 px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded text-sm text-center font-mono tabular-nums text-white"
                      />
                      <span className="text-slate-400 text-xs">min</span>
                      <input
                        type="number"
                        min="0"
                        max="59"
                        value={trimEndSec}
                        onChange={(e) => setTrimEndSec(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                        className="w-16 px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded text-sm text-center font-mono tabular-nums text-white"
                      />
                      <span className="text-slate-400 text-xs">seg</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ID3 Tags Accordion */}
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-4">
              <button
                onClick={() => setShowTagEditor(!showTagEditor)}
                className="flex items-center justify-between w-full text-left text-sm font-semibold text-slate-200 hover:text-white cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-rose-400" />
                  <span>Personalizar Etiquetas ID3 & Metadatos (Opcional)</span>
                </div>
                <span className="text-xs text-slate-400">{showTagEditor ? 'Ocultar' : 'Editar'}</span>
              </button>

              {showTagEditor && (
                <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Título de la Canción</label>
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Artista / Intérprete</label>
                    <input
                      type="text"
                      value={customArtist}
                      onChange={(e) => setCustomArtist(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Álbum</label>
                    <input
                      type="text"
                      value={customAlbum}
                      onChange={(e) => setCustomAlbum(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleTriggerDownload}
                className="flex-1 py-3.5 px-6 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 active:from-rose-700 active:to-rose-800 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-rose-950/60 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-5 h-5" />
                <span>Descargar {selectedFormat.toUpperCase()} ({selectedQuality})</span>
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

      {/* Format & Quality Guide Infobox */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <div className="bg-[#121927]/60 border border-slate-800/80 rounded-xl p-5">
          <div className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center mb-3">
            <Sparkles className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-200">MP3 320 kbps Studio</h4>
          <p className="mt-1 text-xs text-slate-400 leading-relaxed">
            La máxima tasa de bits permitida para MP3. Ofrece claridad cristalina en auriculares, sistemas estéreo y altavoces de automóvil.
          </p>
        </div>

        <div className="bg-[#121927]/60 border border-slate-800/80 rounded-xl p-5">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3">
            <Disc className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-200">Carátulas & Tags ID3</h4>
          <p className="mt-1 text-xs text-slate-400 leading-relaxed">
            Incrustamos la carátula oficial del video directamente en el archivo MP3 para que se vea perfectamente en reproductores de iOS y Android.
          </p>
        </div>

        <div className="bg-[#121927]/60 border border-slate-800/80 rounded-xl p-5">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
            <Scissors className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-200">Recorte de Tonos de Llamada</h4>
          <p className="mt-1 text-xs text-slate-400 leading-relaxed">
            Ajusta los segundos exactos de entrada y salida para recortar el estribillo o coro y usarlo directamente como ringtone o alarma.
          </p>
        </div>
      </div>
    </div>
  );
};
