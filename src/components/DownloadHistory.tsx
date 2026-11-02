import React, { useState } from 'react';
import {
  History,
  Trash2,
  Download,
  Copy,
  Check,
  Music,
  Film,
  ExternalLink,
} from 'lucide-react';
import { HistoryItem } from '../types';

interface DownloadHistoryProps {
  history: HistoryItem[];
  onClearHistory: () => void;
  onRemoveItem: (id: string) => void;
  onReDownload: (item: HistoryItem) => void;
}

export const DownloadHistory: React.FC<DownloadHistoryProps> = ({
  history,
  onClearHistory,
  onRemoveItem,
  onReDownload,
}) => {
  const [filter, setFilter] = useState<'all' | 'youtube' | 'facebook'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredHistory = history.filter((item) => {
    if (filter === 'youtube') return item.type === 'audio' || item.originalUrl.includes('youtu');
    if (filter === 'facebook') return item.type === 'video' || item.originalUrl.includes('facebook');
    return true;
  });

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold mb-1">
            <History className="w-4 h-4" />
            <span>Registro Local</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Historial de Descargas</h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Archivos convertidos guardados localmente en tu navegador.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filter === 'all'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos ({history.length})
            </button>
            <button
              onClick={() => setFilter('youtube')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filter === 'youtube'
                  ? 'bg-rose-500/20 text-rose-300 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              YouTube
            </button>
            <button
              onClick={() => setFilter('facebook')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filter === 'facebook'
                  ? 'bg-blue-500/20 text-blue-300 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Facebook
            </button>
          </div>

          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="p-2 text-slate-400 hover:text-rose-400 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
              title="Borrar todo el historial"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="bg-[#121927] border border-slate-800 rounded-2xl p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-500 mx-auto mb-4">
            <History className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-200">No hay registros en el historial</h3>
          <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
            Las descargas que completes se guardarán aquí para que puedas acceder al enlace o descargarlas nuevamente.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredHistory.map((item) => {
            const isAudio = item.type === 'audio';

            return (
              <div
                key={item.id}
                className="bg-[#121927] border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-3 hover:border-slate-700/80 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-lg object-cover border border-slate-700/60 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                      {isAudio ? <Music className="w-5 h-5" /> : <Film className="w-5 h-5" />}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-slate-100 truncate">{item.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="uppercase font-mono font-medium text-slate-300">
                        {item.format}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{item.quality}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums text-slate-500">
                        {formatDate(item.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleCopy(item.id, item.originalUrl)}
                    className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Copiar enlace original"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => onReDownload(item)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Volver a descargar"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onRemoveItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Eliminar del historial"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
