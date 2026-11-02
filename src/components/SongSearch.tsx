import React, { useState } from 'react';
import {
  Search,
  Download,
  Music,
  Play,
  Pause,
  Clock,
  Eye,
  Check,
  Sparkles,
  Layers,
  ChevronDown,
  Volume2,
  X,
  Clipboard,
  AlertCircle,
  FileAudio,
  Lock,
  LogIn,
  ShieldCheck,
} from 'lucide-react';
import { SearchResultItem } from '../types';
import { AudioPlayer } from './AudioPlayer';
import { useAuth } from '../context/AuthContext';
import { apiUrl } from '../config/api';

interface SongSearchProps {
  onStartDownload: (params: {
    url: string;
    type: 'audio' | 'video';
    format: string;
    quality: string;
    title: string;
    artist?: string;
    thumbnail?: string | null;
  }) => void;
  onAddToQueue: (params: {
    url: string;
    type: 'audio' | 'video';
    format: string;
    quality: string;
    title: string;
    thumbnail?: string | null;
  }) => void;
}

const TRENDING_SEARCHES = [
  'Bad Bunny',
  'Coldplay Viva La Vida',
  'Karol G',
  'Salsa Romántica Mix',
  'Synthwave 80s Chill',
  'Piano Clásico Relajante',
  'Lofi Girl Beats',
];

export const SongSearch: React.FC<SongSearchProps> = ({
  onStartDownload,
  onAddToQueue,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active in-line preview
  const [previewSong, setPreviewSong] = useState<SearchResultItem | null>(null);

  // Format selection popover per song ID
  const [activeFormatDropdownId, setActiveFormatDropdownId] = useState<string | null>(null);
  const [selectedFormats, setSelectedFormats] = useState<Record<string, { format: string; quality: string }>>({});

  const handleSearch = async (searchTerm?: string) => {
    const q = (searchTerm !== undefined ? searchTerm : query).trim();
    if (!q) return;

    if (searchTerm) {
      setQuery(searchTerm);
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    setPreviewSong(null);

    try {
      const res = await fetch(apiUrl(`/api/search?q=${encodeURIComponent(q)}&limit=15`));
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al buscar canciones.');
      }

      setResults(data.results || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'No se pudo conectar con el motor de búsqueda.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setQuery(text.trim());
        handleSearch(text.trim());
      }
    } catch {
      // Ignored
    }
  };

  const getSongFormat = (songId: string) => {
    return selectedFormats[songId] || { format: 'mp3', quality: '320k' };
  };

  const setSongFormat = (songId: string, format: string, quality: string) => {
    setSelectedFormats((prev) => ({
      ...prev,
      [songId]: { format, quality },
    }));
    setActiveFormatDropdownId(null);
  };

  const { requireAuth, isLoggedIn, user, openAuthModal } = useAuth();

  const handleDownloadSong = (song: SearchResultItem) => {
    const { format, quality } = getSongFormat(song.id);
    requireAuth(
      () => {
        onStartDownload({
          url: song.url,
          type: 'audio',
          format,
          quality,
          title: song.title,
          artist: song.uploader,
          thumbnail: song.thumbnail,
        });
      },
      `Inicia sesión para descargar "${song.title}" en MP3 320 kbps.`
    );
  };

  const handleQueueSong = (song: SearchResultItem) => {
    const { format, quality } = getSongFormat(song.id);
    requireAuth(
      () => {
        onAddToQueue({
          url: song.url,
          type: 'audio',
          format,
          quality,
          title: song.title,
          thumbnail: song.thumbnail,
        });
      },
      `Inicia sesión para añadir "${song.title}" a la cola de descargas.`
    );
    setActiveFormatDropdownId(null);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar Header */}
      <div className="bg-[#121927] border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl relative overflow-hidden">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-rose-400 text-xs sm:text-sm font-semibold mb-1.5">
            <Search className="w-4 h-4" />
            <span>Buscador Directo de Canciones</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
            Busca cualquier canción y descárgala en lista
          </h2>
          <p className="mt-1 text-slate-400 text-xs sm:text-sm leading-relaxed">
            Escribe el nombre del tema o artista. Aparecerán todas las opciones en lista con el botón de descarga directa en MP3 a su lado.
          </p>
        </div>

        {/* Input bar */}
        <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Escribe el nombre de la canción o artista (ej: Bad Bunny, Coldplay, Bachata...)"
              className="w-full pl-11 pr-24 py-3 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 transition-all"
            />
            <div className="absolute inset-y-0 right-1 flex items-center gap-1 pr-1.5">
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
                  title="Borrar"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handlePaste}
                className="px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 rounded-md transition-colors flex items-center gap-1"
                title="Pegar texto"
              >
                <Clipboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Pegar</span>
              </button>
            </div>
          </div>

          <button
            onClick={() => handleSearch()}
            disabled={isLoading || !query.trim()}
            className="min-h-[44px] px-6 py-3 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Buscando...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Buscar</span>
              </>
            )}
          </button>
        </div>

        {/* Trending Searches Carousel (mobile touch-friendly swipe) */}
        <div className="mt-3.5 flex items-center gap-2 overflow-x-auto pb-1 -mx-2 px-2 scrollbar-none">
          <span className="text-xs text-slate-500 whitespace-nowrap shrink-0">Tendencias:</span>
          {TRENDING_SEARCHES.map((item) => (
            <button
              key={item}
              onClick={() => handleSearch(item)}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-rose-300 border border-slate-700/60 transition-colors whitespace-nowrap shrink-0 min-h-[36px] flex items-center"
            >
              {item}
            </button>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-4 p-3.5 bg-rose-950/40 border border-rose-900/60 rounded-xl text-sm text-rose-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* In-line Preview Audio Player banner when active */}
      {previewSong && (
        <div className="bg-[#121927] border border-rose-500/30 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs text-rose-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <Volume2 className="w-4 h-4" />
              Vista Previa de Audio
            </span>
            <button
              onClick={() => setPreviewSong(null)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <AudioPlayer
            streamUrl={apiUrl(`/api/preview-stream?url=${encodeURIComponent(previewSong.url)}&type=audio`)}
            title={previewSong.title}
            artist={previewSong.uploader}
            thumbnail={previewSong.thumbnail}
          />
        </div>
      )}

      {/* Results List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className="bg-[#121927]/60 border border-slate-800/80 rounded-xl p-3.5 sm:p-4 flex items-center justify-between gap-4 animate-pulse"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-16 h-12 bg-slate-800 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-800 rounded w-3/4" />
                  <div className="h-3 bg-slate-800/60 rounded w-1/3" />
                </div>
              </div>
              <div className="w-28 h-9 bg-slate-800 rounded-xl shrink-0" />
            </div>
          ))}
        </div>
      ) : hasSearched && results.length === 0 ? (
        <div className="bg-[#121927] border border-slate-800 rounded-2xl p-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-500 mx-auto mb-3">
            <Music className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-200">No se encontraron resultados</h3>
          <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
            Prueba buscando con palabras clave diferentes o el nombre exacto del artista.
          </p>
        </div>
      ) : results.length > 0 ? (
        <div className="space-y-3">
          {/* Auth Banner */}
          {!isLoggedIn ? (
            <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-rose-950/70 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                    <span>Inicia sesión para descargar canciones sin límites</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                      Gratis
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Elige cualquier canción de la lista y descárgala en MP3 320 kbps iniciando sesión con 1 solo clic.
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  openAuthModal(
                    undefined,
                    'Inicia sesión para descargar todas las canciones que desees en alta fidelidad.'
                  )
                }
                className="min-h-[40px] px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0 whitespace-nowrap cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Iniciar Sesión</span>
              </button>
            </div>
          ) : (
            <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-xl px-4 py-2.5 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-300 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>
                  Sesión activa como <strong>{user?.name}</strong> · Descargas ilimitadas desbloqueadas
                </span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold uppercase hidden sm:inline">
                MP3 320k VIP
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1">
            <span>Resultados encontrados ({results.length}):</span>
            <span>Calidad por defecto: MP3 320 kbps</span>
          </div>

          {results.map((song, index) => {
            const currentFormat = getSongFormat(song.id);
            const isPlayingThis = previewSong?.id === song.id;
            const isDropdownOpen = activeFormatDropdownId === song.id;

            return (
              <div
                key={song.id}
                className="group bg-[#121927] hover:bg-[#161f31] border border-slate-800/90 hover:border-slate-700/90 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition-all shadow-sm relative"
              >
                {/* Left Side: Index + Thumbnail + Metadata */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Number */}
                  <span className="hidden sm:inline-block font-mono text-xs tabular-nums text-slate-500 w-5 shrink-0 text-right">
                    {(index + 1).toString().padStart(2, '0')}
                  </span>

                  {/* Thumbnail with overlay play trigger */}
                  <div
                    onClick={() => {
                      if (isPlayingThis) {
                        setPreviewSong(null);
                      } else {
                        setPreviewSong(song);
                      }
                    }}
                    className="relative w-16 sm:w-20 aspect-video rounded-lg overflow-hidden bg-slate-900 border border-slate-800 shrink-0 cursor-pointer shadow-xs group-hover:border-slate-700 transition-colors"
                    title="Escuchar vista previa"
                  >
                    <img
                      src={song.thumbnail}
                      alt={song.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
                      <div className="w-6 h-6 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-sm">
                        {isPlayingThis ? (
                          <Pause className="w-3 h-3 fill-current" />
                        ) : (
                          <Play className="w-3 h-3 fill-current ml-0.5" />
                        )}
                      </div>
                    </div>
                    {song.durationFormatted && (
                      <div className="absolute bottom-1 right-1 bg-black/80 text-[10px] font-mono text-white px-1 rounded">
                        {song.durationFormatted}
                      </div>
                    )}
                  </div>

                  {/* Title and Channel / Duration */}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-slate-100 group-hover:text-rose-300 transition-colors truncate">
                      {song.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="truncate">{song.uploader}</span>
                      {song.durationFormatted && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums text-slate-500">
                            {song.durationFormatted}
                          </span>
                        </>
                      )}
                      {song.viewCount && (
                        <>
                          <span aria-hidden="true" className="hidden sm:inline">·</span>
                          <span className="hidden sm:inline font-mono tabular-nums text-slate-500">
                            {song.viewCount.toLocaleString()} vistas
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: DOWNLOAD OPTIONS RIGHT NEXT TO EACH BAR */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center w-full sm:w-auto justify-end pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                  {/* Format selector button */}
                  <div className="relative">
                    <button
                      onClick={() =>
                        setActiveFormatDropdownId(isDropdownOpen ? null : song.id)
                      }
                      className="min-h-[40px] px-2.5 py-1.5 bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 hover:text-white rounded-lg border border-slate-700/80 text-xs font-mono font-medium transition-colors flex items-center gap-1 cursor-pointer"
                      title="Cambiar formato o calidad"
                    >
                      <span className="uppercase">{currentFormat.format}</span>
                      <span className="text-slate-400 text-[11px] font-sans">
                        {currentFormat.quality === '320k' ? '320k' : currentFormat.quality}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {/* Format Dropdown Menu */}
                    {isDropdownOpen && (
                      <div className="absolute right-0 bottom-full sm:bottom-auto sm:top-full mt-1 mb-1 z-30 bg-[#161f31] border border-slate-700 rounded-xl p-2 shadow-2xl w-48 space-y-1">
                        <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 border-b border-slate-700/60">
                          Selecciona Formato
                        </div>
                        <button
                          onClick={() => setSongFormat(song.id, 'mp3', '320k')}
                          className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-rose-600/20 hover:text-rose-300 text-slate-200 flex items-center justify-between"
                        >
                          <span>MP3 320 kbps (Máx)</span>
                          {currentFormat.format === 'mp3' && currentFormat.quality === '320k' && (
                            <Check className="w-3.5 h-3.5 text-rose-400" />
                          )}
                        </button>
                        <button
                          onClick={() => setSongFormat(song.id, 'mp3', '192k')}
                          className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-rose-600/20 hover:text-rose-300 text-slate-200 flex items-center justify-between"
                        >
                          <span>MP3 192 kbps</span>
                          {currentFormat.format === 'mp3' && currentFormat.quality === '192k' && (
                            <Check className="w-3.5 h-3.5 text-rose-400" />
                          )}
                        </button>
                        <button
                          onClick={() => setSongFormat(song.id, 'm4a', 'source')}
                          className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-rose-600/20 hover:text-rose-300 text-slate-200 flex items-center justify-between"
                        >
                          <span>M4A / AAC (Nativo)</span>
                          {currentFormat.format === 'm4a' && (
                            <Check className="w-3.5 h-3.5 text-rose-400" />
                          )}
                        </button>
                        <button
                          onClick={() => setSongFormat(song.id, 'flac', 'lossless')}
                          className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-rose-600/20 hover:text-rose-300 text-slate-200 flex items-center justify-between"
                        >
                          <span>FLAC (Sin Pérdida)</span>
                          {currentFormat.format === 'flac' && (
                            <Check className="w-3.5 h-3.5 text-rose-400" />
                          )}
                        </button>

                        <div className="pt-1 border-t border-slate-700/60">
                          <button
                            onClick={() => handleQueueSong(song)}
                            className="w-full text-left px-2 py-1.5 rounded-lg text-xs hover:bg-slate-700 text-amber-300 flex items-center gap-1.5"
                          >
                            <Layers className="w-3.5 h-3.5" />
                            <span>Añadir a la cola</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Main Download Button */}
                  <button
                    onClick={() => handleDownloadSong(song)}
                    className="min-h-[40px] px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 active:from-rose-700 active:to-rose-800 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-rose-950/50 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty / Initial State */
        <div className="bg-[#121927]/60 border border-slate-800/80 rounded-2xl p-8 sm:p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto mb-4 shadow-lg shadow-rose-950/30">
            <Music className="w-7 h-7" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white">
            Escribe una canción o artista para comenzar
          </h3>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Obtendrás al instante una lista ordenada con carátulas, duraciones y el botón directo de descarga en MP3 al lado de cada canción.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {['Cazzu', 'Bad Bunny Tití Me Preguntó', 'Quevedo', 'Feid', 'Rosalía'].map((s) => (
              <button
                key={s}
                onClick={() => handleSearch(s)}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              >
                🔍 {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
