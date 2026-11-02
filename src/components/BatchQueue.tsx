import React, { useEffect } from 'react';
import {
  ListOrdered,
  Download,
  AlertCircle,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Film,
  Music,
  Clock,
  Sparkles,
} from 'lucide-react';
import { ActiveJob } from '../types';
import { apiUrl } from '../config/api';

interface BatchQueueProps {
  jobs: ActiveJob[];
  onUpdateJob: (job: ActiveJob) => void;
  onRemoveJob: (id: string) => void;
  onClearCompleted: () => void;
}

export const BatchQueue: React.FC<BatchQueueProps> = ({
  jobs,
  onUpdateJob,
  onRemoveJob,
  onClearCompleted,
}) => {
  // Poll active jobs
  useEffect(() => {
    const activeJobs = jobs.filter(
      (j) => j.status === 'queued' || j.status === 'downloading' || j.status === 'converting'
    );

    if (activeJobs.length === 0) return;

    const interval = setInterval(async () => {
      for (const job of activeJobs) {
        try {
          const res = await fetch(apiUrl(`/api/jobs/${job.id}`));
          if (res.ok) {
            const data = await res.json();
            onUpdateJob({
              ...job,
              status: data.status,
              progress: data.progress,
              speed: data.speed,
              eta: data.eta,
              fileName: data.fileName,
              fileSize: data.fileSize,
              error: data.error,
              downloadUrl: data.downloadUrl ? apiUrl(data.downloadUrl) : undefined,
            });
          }
        } catch (err) {
          console.error('Failed to poll job status:', err);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [jobs, onUpdateJob]);

  const hasCompleted = jobs.some((j) => j.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold mb-1">
            <ListOrdered className="w-4 h-4" />
            <span>Gestor de Procesamiento</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Cola de Descargas y Conversiones</h2>
          <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
            Monitorea el progreso de descarga y transcodificación de FFmpeg en tiempo real.
          </p>
        </div>

        {hasCompleted && (
          <button
            onClick={onClearCompleted}
            className="self-start sm:self-auto px-3.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Limpiar completadas</span>
          </button>
        )}
      </div>

      {jobs.length === 0 ? (
        <div className="bg-[#121927] border border-slate-800 rounded-2xl p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-500 mx-auto mb-4">
            <ListOrdered className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-200">No hay descargas activas en la cola</h3>
          <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
            Analiza un enlace de YouTube o video de Facebook y pulsa &quot;Descargar&quot; o &quot;Añadir a la cola&quot; para iniciar la conversión.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => {
            const isCompleted = job.status === 'completed';
            const isError = job.status === 'error';
            const isAudio = job.type === 'audio';

            return (
              <div
                key={job.id}
                className="bg-[#121927] border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto flex-1">
                  {job.thumbnail ? (
                    <img
                      src={job.thumbnail}
                      alt={job.title}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-lg object-cover border border-slate-700/60 shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                      {isAudio ? <Music className="w-6 h-6" /> : <Film className="w-6 h-6" />}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-0.5">
                      <span className={job.platform === 'facebook' ? 'text-blue-400' : 'text-rose-400'}>
                        {job.platform === 'facebook' ? 'Facebook' : 'YouTube'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-slate-300 uppercase">{job.format}</span>
                      <span aria-hidden="true">·</span>
                      <span>{job.quality}</span>
                    </div>

                    <h4 className="text-sm font-semibold text-slate-100 truncate">{job.title}</h4>

                    {/* Progress details */}
                    {!isCompleted && !isError && (
                      <div className="mt-2 space-y-1.5">
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 rounded-full ${
                              job.status === 'converting' ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${job.progress}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-400 font-mono tabular-nums">
                          <span>
                            {job.status === 'converting'
                              ? 'Procesando formato con FFmpeg...'
                              : `Descargando: ${job.progress}%`}
                          </span>
                          <span>
                            {job.speed && `${job.speed} `}
                            {job.eta && `(ETA: ${job.eta})`}
                          </span>
                        </div>
                      </div>
                    )}

                    {isCompleted && (
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Conversión completada con éxito</span>
                        {job.fileSize && (
                          <span className="text-slate-500 font-mono tabular-nums">
                            ({(job.fileSize / 1024 / 1024).toFixed(1)} MB)
                          </span>
                        )}
                      </div>
                    )}

                    {isError && (
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-rose-400">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{job.error || 'Ocurrió un error en la conversión'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center w-full sm:w-auto justify-end">
                  {isCompleted && job.downloadUrl && (
                    <a
                      href={job.downloadUrl}
                      download={job.fileName || 'download'}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-emerald-950/40"
                    >
                      <Download className="w-4 h-4" />
                      <span>Guardar Archivo</span>
                    </a>
                  )}

                  <button
                    onClick={() => onRemoveJob(job.id)}
                    className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Eliminar de la lista"
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
