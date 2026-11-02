/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { YouTubeDownloader } from './components/YouTubeDownloader';
import { FacebookDownloader } from './components/FacebookDownloader';
import { BatchQueue } from './components/BatchQueue';
import { DownloadHistory } from './components/DownloadHistory';
import { HelpFaqModal } from './components/HelpFaqModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { SongSearch } from './components/SongSearch';
import { AccountView } from './components/AccountView';
import { AuthModal } from './components/AuthModal';
import { AndroidApkModal } from './components/AndroidApkModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ActiveJob, HistoryItem } from './types';
import { apiUrl } from './config/api';
import { Music, Video, Sparkles, CheckCircle2, ShieldCheck, ArrowRight, Zap, Headphones, Search, Lock, Smartphone } from 'lucide-react';

const HERO_IMAGE = '/src/assets/images/hero_soundwave_visual_1793222533023.jpg';

function MainApp() {
  const [activeTab, setActiveTab] = useState<'search' | 'youtube' | 'facebook' | 'queue' | 'history' | 'account'>('search');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { incrementDownloads } = useAuth();

  // Active queue jobs
  const [jobs, setJobs] = useState<ActiveJob[]>([]);

  // Persistent download history
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const stored = localStorage.getItem('mediarip_history');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('mediarip_history', JSON.stringify(history));
    } catch (e) {
      console.warn('Failed to save history to localStorage', e);
    }
  }, [history]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleStartDownload = async (params: {
    url: string;
    type: 'audio' | 'video';
    format: string;
    quality: string;
    title: string;
    artist?: string;
    album?: string;
    trimStart?: number;
    trimEnd?: number;
    thumbnail?: string | null;
  }) => {
    showToast(`Iniciando descarga de "${params.title}"...`);

    try {
      const res = await fetch(apiUrl('/api/jobs/create'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al iniciar la tarea de descarga');
      }

      const newJob: ActiveJob = {
        id: data.jobId,
        status: 'downloading',
        progress: 10,
        speed: 'Conectando...',
        title: params.title,
        type: params.type,
        format: params.format,
        quality: params.quality,
        platform: params.url.includes('facebook') ? 'facebook' : 'youtube',
        thumbnail: params.thumbnail,
        timestamp: Date.now(),
      };

      setJobs((prev) => [newJob, ...prev]);
      setActiveTab('queue');
    } catch (err: any) {
      showToast(`Error: ${err.message || 'No se pudo crear la tarea'}`);
    }
  };

  const handleAddToQueue = async (params: {
    url: string;
    type: 'audio' | 'video';
    format: string;
    quality: string;
    title: string;
    thumbnail?: string | null;
  }) => {
    try {
      const res = await fetch(apiUrl('/api/jobs/create'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al encolar la tarea');
      }

      const newJob: ActiveJob = {
        id: data.jobId,
        status: 'downloading',
        progress: 10,
        title: params.title,
        type: params.type,
        format: params.format,
        quality: params.quality,
        platform: params.url.includes('facebook') ? 'facebook' : 'youtube',
        thumbnail: params.thumbnail,
        timestamp: Date.now(),
      };

      setJobs((prev) => [newJob, ...prev]);
      showToast(`"${params.title}" añadida a la cola de descargas.`);
    } catch (err: any) {
      showToast(`Error: ${err.message || 'No se pudo añadir'}`);
    }
  };

  const handleUpdateJob = (updatedJob: ActiveJob) => {
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id === updatedJob.id) {
          // If transitioning to completed, automatically add to history and trigger download if not already in history
          if (updatedJob.status === 'completed' && j.status !== 'completed') {
            const historyEntry: HistoryItem = {
              id: updatedJob.id,
              title: updatedJob.title,
              uploader: updatedJob.platform === 'facebook' ? 'Facebook Video' : 'YouTube Artist',
              type: updatedJob.type,
              format: updatedJob.format,
              quality: updatedJob.quality,
              fileSize: updatedJob.fileSize,
              thumbnail: updatedJob.thumbnail,
              originalUrl: updatedJob.downloadUrl || '',
              downloadUrl: updatedJob.downloadUrl || undefined,
              timestamp: Date.now(),
              durationFormatted: '0:00',
            };

            setHistory((h) => [historyEntry, ...h.filter((x) => x.id !== updatedJob.id)]);
            incrementDownloads();

            // Trigger auto-download in browser
            if (updatedJob.downloadUrl) {
              const a = document.createElement('a');
              a.href = updatedJob.downloadUrl;
              a.download = updatedJob.fileName || 'media';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              showToast(`Descarga de "${updatedJob.title}" lista en tu navegador.`);
            }
          }
          return updatedJob;
        }
        return j;
      })
    );
  };

  const handleRemoveJob = (id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  const handleClearCompletedJobs = () => {
    setJobs((prev) => prev.filter((j) => j.status !== 'completed'));
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('mediarip_history');
    } catch {
      // Ignored
    }
  };

  const handleRemoveHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleReDownload = (item: HistoryItem) => {
    handleStartDownload({
      url: item.originalUrl,
      type: item.type,
      format: item.format,
      quality: item.quality,
      title: item.title,
      thumbnail: item.thumbnail,
    });
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans">
      {/* Navbar adhering to Top Bar Contract */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        queueCount={jobs.filter((j) => j.status !== 'completed').length}
        historyCount={history.length}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenApkModal={() => setIsApkModalOpen(true)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8">
        {/* PWA Install Banner for Cellphones & Tablets */}
        <PWAInstallBanner onOpenApkModal={() => setIsApkModalOpen(true)} />

        {/* Tab Content Panels */}
        {activeTab === 'search' && (
          <SongSearch
            onStartDownload={handleStartDownload}
            onAddToQueue={handleAddToQueue}
          />
        )}

        {activeTab === 'youtube' && (
          <YouTubeDownloader
            onStartDownload={handleStartDownload}
            onAddToQueue={handleAddToQueue}
          />
        )}

        {activeTab === 'facebook' && (
          <FacebookDownloader
            onStartDownload={handleStartDownload}
            onAddToQueue={handleAddToQueue}
          />
        )}

        {activeTab === 'queue' && (
          <BatchQueue
            jobs={jobs}
            onUpdateJob={handleUpdateJob}
            onRemoveJob={handleRemoveJob}
            onClearCompleted={handleClearCompletedJobs}
          />
        )}

        {activeTab === 'history' && (
          <DownloadHistory
            history={history}
            onClearHistory={handleClearHistory}
            onRemoveItem={handleRemoveHistoryItem}
            onReDownload={handleReDownload}
          />
        )}

        {activeTab === 'account' && (
          <AccountView
            onGoToSearch={() => setActiveTab('search')}
            downloadCount={history.length}
            onOpenApkModal={() => setIsApkModalOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="hidden md:block border-t border-slate-800/80 bg-[#0c111c] py-8 mt-16 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">🥑 Aguacate Music</span>
            <span aria-hidden="true">·</span>
            <span>Descargador de audio de YouTube y videos de Facebook</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('account')}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              Apartado de Sesión & Cuenta
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsApkModalOpen(true)}
              className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors cursor-pointer flex items-center gap-1"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Descargar APK Android</span>
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsHelpOpen(true)}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              Instrucciones & Preguntas Frecuentes
            </button>
            <span aria-hidden="true">·</span>
            <span className="text-slate-400">Uso personal y educativo</span>
          </div>
        </div>
      </footer>

      {/* Fixed Bottom Tab Bar for Mobile Cellphones */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        queueCount={jobs.filter((j) => j.status !== 'completed').length}
        historyCount={history.length}
      />

      {/* Help & FAQ Modal */}
      <HelpFaqModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Android APK Modal & Cloud Build Guide */}
      <AndroidApkModal isOpen={isApkModalOpen} onClose={() => setIsApkModalOpen(false)} />

      {/* Auth Modal for Login & Registration */}
      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
