import React from 'react';
import { Music, Video, ListOrdered, History, HelpCircle, Search, User, LogIn, Check, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  activeTab: 'search' | 'youtube' | 'facebook' | 'queue' | 'history' | 'account';
  setActiveTab: (tab: 'search' | 'youtube' | 'facebook' | 'queue' | 'history' | 'account') => void;
  queueCount: number;
  historyCount: number;
  onOpenHelp: () => void;
  onOpenApkModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  queueCount,
  historyCount,
  onOpenHelp,
  onOpenApkModal,
}) => {
  const { user, isLoggedIn, openAuthModal } = useAuth();

  return (
    <header className="border-b border-slate-800/80 bg-[#0c111c]/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => setActiveTab('search')}
          className="text-lg font-bold tracking-tight text-white hover:text-emerald-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 text-left cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 via-green-500 to-amber-500 flex items-center justify-center text-white shadow-sm shadow-emerald-950/50">
            <span className="text-base select-none">🥑</span>
          </div>
          <span className="bg-gradient-to-r from-emerald-300 via-white to-green-300 bg-clip-text text-transparent font-extrabold">
            Aguacate Music
          </span>
        </button>

        {/* Zone 2: Concise single-line nav links */}
        <nav className="hidden lg:flex items-center gap-1 sm:gap-2 text-sm font-medium">
          <button
            onClick={() => setActiveTab('search')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer ${
              activeTab === 'search'
                ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Buscar Canciones</span>
          </button>

          <button
            onClick={() => setActiveTab('youtube')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer ${
              activeTab === 'youtube'
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Por Enlace YouTube</span>
          </button>

          <button
            onClick={() => setActiveTab('facebook')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer ${
              activeTab === 'facebook'
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>Facebook Videos</span>
          </button>

          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer ${
              activeTab === 'queue'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            <span>Descargas</span>
            {queueCount > 0 && (
              <span className="text-xs font-mono font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded">
                {queueCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Historial</span>
            {historyCount > 0 && (
              <span className="text-xs font-mono text-slate-500">
                ({historyCount})
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('account')}
            className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer ${
              activeTab === 'account'
                ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Mi Cuenta</span>
          </button>
        </nav>

        {/* Zone 3: Account & Help Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {onOpenApkModal && (
            <button
              onClick={onOpenApkModal}
              className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Descargar o compilar APK para celulares Android"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>APK Android</span>
            </button>
          )}

          <button
            onClick={onOpenHelp}
            className="hidden sm:flex px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 rounded-lg transition-colors whitespace-nowrap shrink-0 items-center gap-1.5 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>Ayuda</span>
          </button>

          {/* Account Profile / Login Button */}
          {isLoggedIn && user ? (
            <button
              onClick={() => setActiveTab('account')}
              className={`min-h-[38px] px-3 py-1.5 rounded-xl border transition-all flex items-center gap-2 text-xs cursor-pointer ${
                activeTab === 'account'
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-white'
                  : 'bg-slate-800/90 hover:bg-slate-700 border-slate-700 text-slate-200'
              }`}
              title="Ver mi perfil y sesión"
            >
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-6 h-6 rounded-lg object-cover bg-slate-900 border border-emerald-500/40"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://api.dicebear.com/7.x/bottts/svg?seed=aguacate';
                  }}
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-slate-900" />
              </div>
              <span className="font-semibold max-w-[100px] truncate hidden sm:inline">
                {user.name}
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold uppercase hidden md:inline">
                VIP
              </span>
            </button>
          ) : (
            <button
              onClick={() => openAuthModal()}
              className="min-h-[38px] px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-950/40 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Iniciar Sesión</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
