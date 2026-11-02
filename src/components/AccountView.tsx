import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  CheckCircle2,
  LogOut,
  Sparkles,
  Zap,
  Key,
  Music,
  Download,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Headphones,
  Check,
  Trash2,
  Lock,
  Mail,
  ArrowRight,
  Smartphone,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AccountViewProps {
  onGoToSearch: () => void;
  downloadCount: number;
  onOpenApkModal?: () => void;
}

export const AccountView: React.FC<AccountViewProps> = ({
  onGoToSearch,
  downloadCount,
  onOpenApkModal,
}) => {
  const {
    user,
    isLoggedIn,
    logout,
    loginWithGoogle,
    loginAsGuest,
    loginWithEmail,
    registerWithEmail,
    youtubeSessionActive,
    saveYouTubeSession,
    removeYouTubeSession,
  } = useAuth();

  // Local login form state if not logged in
  const [formMode, setFormMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // YouTube session cookies state
  const [cookiesInput, setCookiesInput] = useState('');
  const [isSavingCookies, setIsSavingCookies] = useState(false);
  const [cookieFeedback, setCookieFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [showCookiesHelp, setShowCookiesHelp] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      if (formMode === 'login') {
        if (!email.trim()) throw new Error('Ingresa tu correo electrónico.');
        await loginWithEmail(email, password);
      } else {
        if (!name.trim()) throw new Error('Ingresa tu nombre.');
        if (!email.trim()) throw new Error('Ingresa tu correo.');
        await registerWithEmail(name, email, password);
      }
    } catch (err: any) {
      setFormError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveCookies = async () => {
    if (!cookiesInput.trim()) {
      setCookieFeedback({ type: 'error', msg: 'Pega el texto de cookies en el campo antes de guardar.' });
      return;
    }

    setIsSavingCookies(true);
    setCookieFeedback(null);

    const res = await saveYouTubeSession(cookiesInput);
    setIsSavingCookies(false);

    if (res.success) {
      setCookieFeedback({ type: 'success', msg: '¡Sesión de YouTube guardada! Ahora puedes descargar canciones protegidas sin bloqueo de bot.' });
      setCookiesInput('');
    } else {
      setCookieFeedback({ type: 'error', msg: res.error || 'Error al guardar la sesión.' });
    }
  };

  const handleRemoveCookies = async () => {
    await removeYouTubeSession();
    setCookieFeedback({ type: 'success', msg: 'Sesión de YouTube desconectada correctamente.' });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* If Not Logged In */}
      {!isLoggedIn || !user ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Why Log In Banner */}
          <div className="lg:col-span-6 bg-gradient-to-br from-[#121927] to-[#0c121e] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-green-500 to-amber-500 flex items-center justify-center text-2xl shadow-lg shadow-emerald-950/50 mb-4">
              🥑
            </div>

            <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Acceso de Usuario Requerido</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              Inicia Sesión en Aguacate Music
            </h2>

            <p className="mt-3 text-slate-300 text-sm leading-relaxed">
              Para garantizar descargas de alta calidad sin interrupciones, inicia sesión de forma 100% gratuita. Al acceder desbloqueas de inmediato:
            </p>

            <div className="mt-6 space-y-3.5">
              <div className="flex items-start gap-3 bg-slate-900/60 border border-slate-800/80 rounded-xl p-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Headphones className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Descargas Ilimitadas de Música MP3</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Audio original a 320 kbps con carátula de álbum y metadatos incrustados.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-900/60 border border-slate-800/80 rounded-xl p-3">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Videos de Facebook en Full HD</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Reels, transmisiones públicas y clips en 1080p y 720p directamente a tu celular.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-900/60 border border-slate-800/80 rounded-xl p-3">
                <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Bypass Anti-Bot de YouTube</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Vincula tu sesión de YouTube para descargar pistas bloqueadas o de artistas Vevo.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: In-Page Auth Box */}
          <div className="lg:col-span-6 bg-[#111827] border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
            <div>
              <h3 className="text-lg font-bold text-white">
                {formMode === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta gratis'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Elige tu método favorito para habilitar las descargas al instante.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2.5">
              <button
                onClick={loginWithGoogle}
                className="w-full min-h-[44px] flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm rounded-xl px-4 py-2.5 transition-all shadow-sm cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Acceder con Google</span>
              </button>

              <button
                onClick={loginAsGuest}
                className="w-full min-h-[44px] flex items-center justify-center gap-2 bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs rounded-xl px-4 py-2.5 transition-all cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Acceso Rápido como Invitado</span>
              </button>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-[#111827] px-3 text-[11px] text-slate-400 uppercase tracking-wider font-semibold shrink-0">
                o con correo
              </span>
              <div className="border-t border-slate-800 w-full" />
            </div>

            {/* Toggle Tabs */}
            <div className="grid grid-cols-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setFormMode('login');
                  setFormError(null);
                }}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  formMode === 'login'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormMode('register');
                  setFormError(null);
                }}
                className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  formMode === 'register'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Registrarse
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-950/60 border border-red-800 text-red-200 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3">
              {formMode === 'register' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Tu Nombre
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej. Juan Pérez"
                      className="w-full min-h-[44px] pl-9 pr-3 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@ejemplo.com"
                    className="w-full min-h-[44px] pl-9 pr-3 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full min-h-[44px] pl-9 pr-3 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[44px] mt-2 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-sm rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 shadow-lg shadow-rose-950/50 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{formMode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* If Logged In: Full Profile & Session Management */
        <div className="space-y-6">
          {/* User Profile Card */}
          <div className="bg-[#121927] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-emerald-500/60 shadow-lg bg-slate-800"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://api.dicebear.com/7.x/bottts/svg?seed=aguacate';
                    }}
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-[#121927] flex items-center justify-center text-slate-950" title="Sesión activa">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      {user.name}
                    </h2>
                    <span className="text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {user.plan}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-1">{user.email}</p>

                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 flex-wrap">
                    <span>Miembro desde: {user.joinedDate}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-emerald-400 font-medium">
                      Descargas Desbloqueadas ✅
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={onGoToSearch}
                  className="flex-1 sm:flex-initial min-h-[44px] bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-rose-950/40 cursor-pointer"
                >
                  <Music className="w-4 h-4" />
                  <span>Buscar Canciones</span>
                </button>

                <button
                  onClick={logout}
                  className="min-h-[44px] px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Cerrar Sesión</span>
                </button>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6">
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
                <span className="text-xs text-slate-400">Descargas Realizadas</span>
                <p className="text-2xl font-extrabold text-white mt-1">
                  {downloadCount}
                </p>
                <span className="text-[10px] text-emerald-400 font-medium">Ilimitadas disponibles</span>
              </div>

              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
                <span className="text-xs text-slate-400">Calidad de Audio</span>
                <p className="text-xl font-extrabold text-rose-400 mt-1">
                  320 kbps
                </p>
                <span className="text-[10px] text-slate-400 font-medium">MP3, M4A, FLAC</span>
              </div>

              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
                <span className="text-xs text-slate-400">Calidad de Video</span>
                <p className="text-xl font-extrabold text-blue-400 mt-1">
                  1080p HD
                </p>
                <span className="text-[10px] text-slate-400 font-medium">Facebook & Reels</span>
              </div>

              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
                <span className="text-xs text-slate-400">Estado de Descargas</span>
                <p className="text-xl font-extrabold text-emerald-400 mt-1">
                  Activo
                </p>
                <span className="text-[10px] text-emerald-400/80 font-medium">Sin límite diario</span>
              </div>
            </div>
          </div>

          {/* Android APK Mobile Section */}
          <div className="bg-gradient-to-r from-[#121927] via-slate-900 to-[#12221b] border border-emerald-500/30 rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 text-2xl">
                📱
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">
                    Instalar Aplicación Android (.APK)
                  </h3>
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    Capacitor
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  Genera tu propio archivo APK instalable en la nube con GitHub Actions sin necesidad de una computadora. Incluye guía paso a paso y configuración de servidor.
                </p>
              </div>
            </div>

            {onOpenApkModal && (
              <button
                onClick={onOpenApkModal}
                className="w-full sm:w-auto min-h-[44px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-950/50 cursor-pointer shrink-0"
              >
                <Smartphone className="w-4 h-4" />
                <span>Ver Guía y Compilar APK</span>
              </button>
            )}
          </div>

          {/* YouTube Session Bypass Section */}
          <div className="bg-[#121927] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🥑</span>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    Vincular Sesión de YouTube para Canciones Protegidas
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                  YouTube en ocasiones bloquea descargas solicitando <em>"Sign in to confirm you're not a bot"</em> en videos musicales Vevo o con restricción de edad. Puedes vincular tu sesión aquí para saltarte cualquier restricción.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border ${
                    youtubeSessionActive
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      youtubeSessionActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                    }`}
                  />
                  <span>{youtubeSessionActive ? 'Sesión de YouTube Activa' : 'No Vinculada'}</span>
                </div>
              </div>
            </div>

            {/* Cookie Feedback alert */}
            {cookieFeedback && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
                  cookieFeedback.type === 'success'
                    ? 'bg-emerald-950/70 border border-emerald-800 text-emerald-200'
                    : 'bg-red-950/70 border border-red-800 text-red-200'
                }`}
              >
                {cookieFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                )}
                <span>{cookieFeedback.msg}</span>
              </div>
            )}

            {/* Cookies input box */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>Cookies / Token de sesión de YouTube (Formato Netscape o texto)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowCookiesHelp(!showCookiesHelp)}
                  className="text-[11px] text-rose-400 hover:text-rose-300 font-medium underline cursor-pointer"
                >
                  {showCookiesHelp ? 'Ocultar instrucciones' : '¿Cómo obtener mis cookies?'}
                </button>
              </div>

              {showCookiesHelp && (
                <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 text-xs text-slate-300 space-y-2">
                  <p className="font-semibold text-white">Guía rápida para exportar cookies de YouTube:</p>
                  <ol className="list-decimal pl-4 space-y-1 text-slate-400 text-[11px]">
                    <li>Instala en tu navegador una extensión gratuita como <em>"Get cookies.txt LOCALLY"</em> (Chrome/Firefox).</li>
                    <li>Abre youtube.com con tu cuenta iniciada.</li>
                    <li>Abre la extensión y haz clic en <strong>"Export"</strong> o <strong>"Copy"</strong>.</li>
                    <li>Pega el texto resultante en el cuadro de abajo y haz clic en <strong>"Guardar Sesión de YouTube"</strong>.</li>
                  </ol>
                  <p className="text-[10px] text-slate-400 italic">
                    Tus cookies se procesan de forma privada en el servidor de tu app para autenticar yt-dlp.
                  </p>
                </div>
              )}

              <textarea
                value={cookiesInput}
                onChange={(e) => setCookiesInput(e.target.value)}
                placeholder="# Netscape HTTP Cookie File&#10;.youtube.com&#9;TRUE&#9;/&#9;TRUE&#9;1780000000&#9;VISITOR_INFO1_LIVE&#9;..."
                rows={3}
                className="w-full text-xs font-mono bg-slate-900 border border-slate-700/90 rounded-2xl p-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-500 transition-colors"
              />

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={handleSaveCookies}
                  disabled={isSavingCookies || !cookiesInput.trim()}
                  className="min-h-[44px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSavingCookies ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  <span>Guardar Sesión de YouTube</span>
                </button>

                {youtubeSessionActive && (
                  <button
                    type="button"
                    onClick={handleRemoveCookies}
                    className="min-h-[44px] bg-slate-800 hover:bg-red-950/60 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-800 text-xs font-medium px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Desconectar Sesión Guardada</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
