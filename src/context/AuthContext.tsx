import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserProfile } from '../types';
import { apiUrl } from '../config/api';

interface AuthContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  isAuthModalOpen: boolean;
  authPromptMessage: string | null;
  openAuthModal: (pendingAction?: () => void, promptMessage?: string) => void;
  closeAuthModal: () => void;
  loginWithEmail: (email: string, password?: string) => Promise<boolean>;
  registerWithEmail: (name: string, email: string, password?: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  loginAsGuest: () => Promise<boolean>;
  logout: () => void;
  incrementDownloads: () => void;
  youtubeSessionActive: boolean;
  checkYouTubeSession: () => Promise<void>;
  saveYouTubeSession: (cookies: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  removeYouTubeSession: () => Promise<void>;
  requireAuth: (action: () => void, promptMessage?: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'aguacate_user_profile';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authPromptMessage, setAuthPromptMessage] = useState<string | null>(null);
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);
  const [youtubeSessionActive, setYoutubeSessionActive] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Failed to persist user profile to localStorage', e);
    }
  }, [user]);

  // Check YouTube backend session
  const checkYouTubeSession = async () => {
    try {
      const res = await fetch(apiUrl('/api/auth/youtube-session'));
      if (res.ok) {
        const data = await res.json();
        setYoutubeSessionActive(Boolean(data.active));
      }
    } catch {
      // Backend may be starting or offline
    }
  };

  useEffect(() => {
    checkYouTubeSession();

    const handleUrlChange = () => {
      checkYouTubeSession();
    };
    window.addEventListener('aguacate_api_url_changed', handleUrlChange);
    return () => {
      window.removeEventListener('aguacate_api_url_changed', handleUrlChange);
    };
  }, []);

  const openAuthModal = (pendingAction?: () => void, promptMessage?: string) => {
    if (pendingAction) {
      setPendingCallback(() => pendingAction);
    } else {
      setPendingCallback(null);
    }
    setAuthPromptMessage(
      promptMessage ||
        'Inicia sesión gratis en Aguacate Music para desbloquear descargas ilimitadas de canciones y videos en máxima calidad.'
    );
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthPromptMessage(null);
    setPendingCallback(null);
  };

  const executePending = () => {
    if (pendingCallback) {
      setTimeout(() => {
        try {
          pendingCallback();
        } catch (err) {
          console.error('Error executing pending download after login:', err);
        }
        setPendingCallback(null);
      }, 300);
    }
  };

  const loginWithEmail = async (email: string, password?: string): Promise<boolean> => {
    try {
      const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al iniciar sesión');

      setUser(data.user);
      setIsAuthModalOpen(false);
      executePending();
      return true;
    } catch {
      // Fallback local account creation if offline
      const name = email.split('@')[0];
      const fallbackUser: UserProfile = {
        id: 'usr_' + Date.now(),
        name: name.charAt(0).toUpperCase() + name.slice(1),
        email,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
        plan: 'Aguacate VIP (Ilimitado)',
        isLoggedIn: true,
        downloadCount: 0,
        joinedDate: new Date().toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
      };
      setUser(fallbackUser);
      setIsAuthModalOpen(false);
      executePending();
      return true;
    }
  };

  const registerWithEmail = async (name: string, email: string, password?: string): Promise<boolean> => {
    try {
      const res = await fetch(apiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al registrar usuario');

      setUser(data.user);
      setIsAuthModalOpen(false);
      executePending();
      return true;
    } catch {
      const fallbackUser: UserProfile = {
        id: 'usr_' + Date.now(),
        name: name.trim() || 'Melómano',
        email,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
        plan: 'Aguacate VIP (Ilimitado)',
        isLoggedIn: true,
        downloadCount: 0,
        joinedDate: new Date().toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
      };
      setUser(fallbackUser);
      setIsAuthModalOpen(false);
      executePending();
      return true;
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'google',
          name: 'Melómano Aguacate',
          email: 'usuario.aguacate@gmail.com',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
      } else {
        throw new Error('API error');
      }
    } catch {
      setUser({
        id: 'usr_google_123',
        name: 'Melómano Aguacate',
        email: 'usuario.aguacate@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        plan: 'Aguacate VIP (Ilimitado)',
        isLoggedIn: true,
        downloadCount: 0,
        joinedDate: new Date().toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
      });
    }

    setIsAuthModalOpen(false);
    executePending();
    return true;
  };

  const loginAsGuest = async (): Promise<boolean> => {
    try {
      const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'guest' }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
      } else {
        throw new Error('API error');
      }
    } catch {
      setUser({
        id: 'usr_guest_' + Date.now(),
        name: 'Invitado Aguacate',
        email: 'invitado@aguacate.music',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        plan: 'Acceso Rápido',
        isLoggedIn: true,
        downloadCount: 0,
        joinedDate: new Date().toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
      });
    }

    setIsAuthModalOpen(false);
    executePending();
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const incrementDownloads = () => {
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        downloadCount: (prev.downloadCount || 0) + 1,
      };
    });
  };

  const saveYouTubeSession = async (cookies: string) => {
    try {
      const res = await fetch(apiUrl('/api/auth/youtube-session'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cookies }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al guardar la sesión.');
      setYoutubeSessionActive(true);
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al guardar sesión' };
    }
  };

  const removeYouTubeSession = async () => {
    try {
      await fetch(apiUrl('/api/auth/youtube-session'), { method: 'DELETE' });
      setYoutubeSessionActive(false);
    } catch {
      // Ignored
    }
  };

  /**
   * Gates any download action.
   * If user is logged in, runs the action and returns true.
   * If not, saves action as pending and displays AuthModal.
   */
  const requireAuth = (action: () => void, promptMessage?: string): boolean => {
    if (user && user.isLoggedIn) {
      action();
      return true;
    }
    openAuthModal(action, promptMessage);
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: Boolean(user?.isLoggedIn),
        isAuthModalOpen,
        authPromptMessage,
        openAuthModal,
        closeAuthModal,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        loginAsGuest,
        logout,
        incrementDownloads,
        youtubeSessionActive,
        checkYouTubeSession,
        saveYouTubeSession,
        removeYouTubeSession,
        requireAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
