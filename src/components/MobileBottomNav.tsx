import React from 'react';
import { Music, Video, ListOrdered, History, Search, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface MobileBottomNavProps {
  activeTab: 'search' | 'youtube' | 'facebook' | 'queue' | 'history' | 'account';
  setActiveTab: (tab: 'search' | 'youtube' | 'facebook' | 'queue' | 'history' | 'account') => void;
  queueCount: number;
  historyCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  queueCount,
  historyCount,
}) => {
  const { user, isLoggedIn } = useAuth();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c111c]/95 backdrop-blur-lg border-t border-slate-800/80 pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-6 items-center h-16 max-w-lg mx-auto px-0.5">
        {/* Tab 1: Buscar */}
        <button
          onClick={() => setActiveTab('search')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-all relative ${
            activeTab === 'search'
              ? 'text-rose-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Search className="w-5 h-5" />
            {activeTab === 'search' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-rose-500 rounded-full" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Buscar</span>
        </button>

        {/* Tab 2: YouTube por enlace */}
        <button
          onClick={() => setActiveTab('youtube')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-all relative ${
            activeTab === 'youtube'
              ? 'text-rose-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Music className="w-5 h-5" />
            {activeTab === 'youtube' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-rose-500 rounded-full" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Enlace</span>
        </button>

        {/* Tab 3: Facebook */}
        <button
          onClick={() => setActiveTab('facebook')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-all relative ${
            activeTab === 'facebook'
              ? 'text-blue-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Video className="w-5 h-5" />
            {activeTab === 'facebook' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Facebook</span>
        </button>

        {/* Tab 4: Cola */}
        <button
          onClick={() => setActiveTab('queue')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-all relative ${
            activeTab === 'queue'
              ? 'text-amber-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <ListOrdered className="w-5 h-5" />
            {queueCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-amber-500 text-slate-950 font-bold text-[9px] min-w-[15px] h-[15px] rounded-full flex items-center justify-center px-1">
                {queueCount}
              </span>
            )}
            {activeTab === 'queue' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-500 rounded-full" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Cola</span>
        </button>

        {/* Tab 5: Historial */}
        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-all relative ${
            activeTab === 'history'
              ? 'text-emerald-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <History className="w-5 h-5" />
            {historyCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-slate-800 text-slate-300 border border-slate-700 font-mono text-[9px] min-w-[15px] h-[15px] rounded-full flex items-center justify-center px-0.5">
                {historyCount}
              </span>
            )}
            {activeTab === 'history' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Historial</span>
        </button>

        {/* Tab 6: Cuenta / Sesión */}
        <button
          onClick={() => setActiveTab('account')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-all relative ${
            activeTab === 'account'
              ? 'text-purple-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            {isLoggedIn && user ? (
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-5 h-5 rounded-full object-cover border border-emerald-400"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://api.dicebear.com/7.x/bottts/svg?seed=aguacate';
                  }}
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 border border-[#0c111c]" />
              </div>
            ) : (
              <User className="w-5 h-5" />
            )}
            {activeTab === 'account' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-purple-500 rounded-full" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">
            {isLoggedIn ? 'Perfil' : 'Sesión'}
          </span>
        </button>
      </div>
    </nav>
  );
};
