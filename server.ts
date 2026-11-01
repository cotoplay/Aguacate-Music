import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { spawn } from 'child_process';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const YTDLP_PATH = path.resolve(__dirname, 'bin/yt-dlp');
const DOWNLOADS_DIR = path.resolve('/tmp', 'media-downloads');
const COOKIES_PATH = path.resolve('/tmp', 'youtube_cookies.txt');

if (!fs.existsSync(DOWNLOADS_DIR)) {
  fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
}

// Clean up old downloads every 30 minutes
setInterval(() => {
  try {
    const files = fs.readdirSync(DOWNLOADS_DIR);
    const now = Date.now();
    for (const file of files) {
      const filePath = path.join(DOWNLOADS_DIR, file);
      const stat = fs.statSync(filePath);
      // Remove files older than 45 minutes
      if (now - stat.mtimeMs > 45 * 60 * 1000) {
        fs.unlinkSync(filePath);
      }
    }
  } catch (err) {
    console.error('Error during cleanup:', err);
  }
}, 30 * 60 * 1000);

app.use(cors());
app.use(express.json());

// Health check endpoint for APK and uptime monitoring
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Aguacate Music Server',
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

interface Job {
  id: string;
  url: string;
  type: 'audio' | 'video';
  format: string;
  quality: string;
  title: string;
  artist?: string;
  album?: string;
  status: 'queued' | 'downloading' | 'converting' | 'completed' | 'error';
  progress: number;
  speed?: string;
  eta?: string;
  filePath?: string;
  fileName?: string;
  fileSize?: number;
  error?: string;
  createdAt: number;
}

const jobs = new Map<string, Job>();

function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function detectPlatform(url: string): 'youtube' | 'facebook' | 'other' {
  const lower = url.toLowerCase();
  if (lower.includes('youtube.com') || lower.includes('youtu.be') || lower.includes('music.youtube.com')) {
    return 'youtube';
  }
  if (
    lower.includes('facebook.com') ||
    lower.includes('fb.watch') ||
    lower.includes('fb.me') ||
    lower.includes('m.facebook.com') ||
    lower.includes('web.facebook.com')
  ) {
    return 'facebook';
  }
  return 'other';
}

function sanitizeFilename(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, '_').trim().slice(0, 100);
}

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    ytdlpAvailable: fs.existsSync(YTDLP_PATH),
    youtubeSessionActive: fs.existsSync(COOKIES_PATH) && fs.statSync(COOKIES_PATH).size > 0,
    timestamp: Date.now(),
  });
});

// 1.2. YouTube session and cookies management
app.get('/api/auth/youtube-session', (req, res) => {
  const active = fs.existsSync(COOKIES_PATH) && fs.statSync(COOKIES_PATH).size > 0;
  res.json({ active });
});

app.post('/api/auth/youtube-session', (req, res) => {
  const { cookies } = req.body;
  if (!cookies || typeof cookies !== 'string') {
    return res.status(400).json({ error: 'Debes proporcionar el texto de cookies o sesión de YouTube.' });
  }

  try {
    fs.writeFileSync(COOKIES_PATH, cookies.trim(), 'utf8');
    res.json({ success: true, message: 'Sesión de YouTube guardada exitosamente.' });
  } catch (err: any) {
    res.status(500).json({ error: 'No se pudo guardar la sesión de YouTube.' });
  }
});

app.delete('/api/auth/youtube-session', (req, res) => {
  try {
    if (fs.existsSync(COOKIES_PATH)) {
      fs.unlinkSync(COOKIES_PATH);
    }
    res.json({ success: true, message: 'Sesión de YouTube eliminada.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al eliminar la sesión.' });
  }
});

// 1.5. Search songs endpoint
app.get('/api/search', async (req, res) => {
  const query = ((req.query.q as string) || '').trim();
  const limit = Math.min(25, Math.max(1, parseInt(req.query.limit as string) || 12));

  if (!query) {
    return res.status(400).json({ error: 'Debes ingresar un término de búsqueda' });
  }

  try {
    const args = [
      `ytsearch${limit}:${query}`,
      '--dump-single-json',
      '--no-warnings',
      '--flat-playlist',
      '--no-check-certificates',
    ];

    if (fs.existsSync(COOKIES_PATH) && fs.statSync(COOKIES_PATH).size > 0) {
      args.push('--cookies', COOKIES_PATH);
    }

    const child = spawn(YTDLP_PATH, args);
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (d) => (stdout += d.toString()));
    child.stderr.on('data', (d) => (stderr += d.toString()));

    child.on('close', (code) => {
      if (code !== 0 || !stdout) {
        console.warn('yt-dlp search error:', stderr);
        return res.status(500).json({ error: 'Error al buscar canciones.', details: stderr.slice(-200) });
      }

      try {
        const data = JSON.parse(stdout);
        const rawEntries = data.entries || [];

        const results = rawEntries
          .filter((item: any) => item && (item.id || item.url))
          .map((item: any) => {
            const videoId = item.id || (item.url ? item.url.split('v=')[1] : '');
            const durationSec = typeof item.duration === 'number' ? item.duration : 0;

            let thumbnail = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
            if (item.thumbnails && item.thumbnails.length > 0) {
              thumbnail = item.thumbnails[item.thumbnails.length - 1].url || thumbnail;
            }

            return {
              id: videoId,
              title: item.title || 'Canción',
              uploader: item.channel || item.uploader || 'Artista Desconocido',
              duration: durationSec,
              durationFormatted: formatDuration(durationSec),
              thumbnail,
              viewCount: item.view_count || null,
              url: item.url && item.url.startsWith('http') ? item.url : `https://www.youtube.com/watch?v=${videoId}`,
            };
          });

        return res.json({ results });
      } catch (parseErr) {
        console.error('Error parsing search results:', parseErr);
        return res.status(500).json({ error: 'Error procesando los resultados de búsqueda' });
      }
    });
  } catch (err: any) {
    console.error('Fatal search error:', err);
    return res.status(500).json({ error: 'Error interno al buscar' });
  }
});

// 2. Extract media metadata
app.post('/api/info', async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Debes proporcionar una URL válida' });
  }

  const cleanUrl = url.trim();
  const platform = detectPlatform(cleanUrl);

  try {
    const args = [
      '--dump-single-json',
      '--no-warnings',
      '--no-playlist',
      '--no-check-certificates',
      '--js-runtimes', 'node:/usr/local/bin/node',
    ];

    if (fs.existsSync(COOKIES_PATH) && fs.statSync(COOKIES_PATH).size > 0) {
      args.push('--cookies', COOKIES_PATH);
    }

    args.push(cleanUrl);

    const child = spawn(YTDLP_PATH, args);
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code !== 0 || !stdout) {
        console.warn('yt-dlp extract error:', stderr);
        // If standard yt-dlp fails (e.g. geo/cookie or network), check if it's facebook or youtube
        let errorMsg = 'No se pudo obtener información del enlace.';
        if (stderr.includes('Video unavailable') || stderr.includes('Private video')) {
          errorMsg = 'El video es privado o no está disponible públicamente.';
        } else if (stderr.includes('Sign in to confirm')) {
          errorMsg = 'El contenido requiere inicio de sesión en la plataforma original.';
        } else if (stderr.includes('Incomplete YouTube ID')) {
          errorMsg = 'El enlace de YouTube no tiene un formato válido.';
        }

        return res.status(422).json({
          error: errorMsg,
          details: stderr.slice(-300),
          platform,
        });
      }

      try {
        const info = JSON.parse(stdout);
        const durationSec = info.duration || 0;

        // Parse available formats
        const formats = info.formats || [];
        const hasVideo = formats.some((f: any) => f.vcodec && f.vcodec !== 'none');
        
        // Find highest resolution
        let maxResolution = '1080p';
        if (info.height) {
          maxResolution = `${info.height}p`;
        }

        const responsePayload = {
          id: info.id || String(Date.now()),
          title: info.title || 'Audio / Video Descargado',
          uploader: info.uploader || info.channel || info.artist || 'Desconocido',
          duration: durationSec,
          durationFormatted: formatDuration(durationSec),
          thumbnail: info.thumbnail || (info.thumbnails && info.thumbnails.length ? info.thumbnails[info.thumbnails.length - 1].url : null),
          viewCount: info.view_count || null,
          uploadDate: info.upload_date || null,
          platform: platform,
          originalUrl: cleanUrl,
          hasVideo,
          audioQualities: [
            { label: 'MP3 - 320 kbps (Máxima Calidad)', format: 'mp3', quality: '320k', sizeEst: Math.round((durationSec * 320) / 8 / 1024) },
            { label: 'MP3 - 192 kbps (Estándar Recomendado)', format: 'mp3', quality: '192k', sizeEst: Math.round((durationSec * 192) / 8 / 1024) },
            { label: 'MP3 - 128 kbps (Ahorro de Espacio)', format: 'mp3', quality: '128k', sizeEst: Math.round((durationSec * 128) / 8 / 1024) },
            { label: 'M4A / AAC (Audio Original)', format: 'm4a', quality: 'source', sizeEst: Math.round((durationSec * 160) / 8 / 1024) },
            { label: 'FLAC (Hi-Fi Sin Pérdida)', format: 'flac', quality: 'lossless', sizeEst: Math.round((durationSec * 900) / 8 / 1024) },
            { label: 'WAV (Audio de Estudio)', format: 'wav', quality: 'uncompressed', sizeEst: Math.round((durationSec * 1411) / 8 / 1024) },
          ],
          videoQualities: [
            { label: 'HD 1080p (Full HD MP4)', quality: '1080', format: 'mp4', note: 'Máxima nitidez' },
            { label: 'HD 720p (HD MP4)', quality: '720', format: 'mp4', note: 'Calidad recomendada' },
            { label: 'SD 480p / 360p (Estándar MP4)', quality: '480', format: 'mp4', note: 'Menor peso' },
            { label: 'Extraer Solo Audio (MP3 320 kbps)', quality: '320k', format: 'mp3', note: 'Música/Voz' },
          ],
        };

        return res.json(responsePayload);
      } catch (parseErr) {
        console.error('Error parsing yt-dlp JSON:', parseErr);
        return res.status(500).json({ error: 'Error procesando los datos de la fuente.' });
      }
    });
  } catch (err: any) {
    console.error('Fatal extraction error:', err);
    return res.status(500).json({ error: 'Error al contactar con el extractor de medios.' });
  }
});

// 3. Create download job with progress tracking
app.post('/api/jobs/create', (req, res) => {
  const {
    url,
    type = 'audio',
    format = 'mp3',
    quality = '320k',
    title = 'media',
    artist = '',
    album = '',
    trimStart,
    trimEnd,
  } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'Falta la URL de descarga' });
  }

  const jobId = 'job_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
  const cleanTitle = sanitizeFilename(title || 'download');
  const ext = format === 'source' ? 'm4a' : format;
  const fileName = `${cleanTitle}.${ext}`;
  const outputTemplate = path.join(DOWNLOADS_DIR, `${jobId}.%(ext)s`);

  const job: Job = {
    id: jobId,
    url,
    type,
    format,
    quality,
    title: cleanTitle,
    artist,
    album,
    status: 'queued',
    progress: 5,
    fileName,
    createdAt: Date.now(),
  };

  jobs.set(jobId, job);

  // Build command args
  const args: string[] = [
    '--no-playlist',
    '--no-warnings',
    '--no-check-certificates',
    '--ffmpeg-location', '/usr/bin/ffmpeg',
    '--js-runtimes', 'node:/usr/local/bin/node',
    '-o', outputTemplate,
  ];

  if (fs.existsSync(COOKIES_PATH) && fs.statSync(COOKIES_PATH).size > 0) {
    args.push('--cookies', COOKIES_PATH);
  }

  if (type === 'audio') {
    args.push('-x');
    if (['mp3', 'm4a', 'flac', 'wav', 'opus'].includes(format)) {
      args.push('--audio-format', format);
      if (format === 'mp3') {
        const qMap: Record<string, string> = { '320k': '0', '192k': '2', '128k': '5' };
        args.push('--audio-quality', qMap[quality] || '0');
      }
    } else {
      args.push('--audio-format', 'mp3');
    }

    // Embed thumbnail as album art if mp3 or m4a
    if (format === 'mp3' || format === 'm4a') {
      args.push('--embed-thumbnail');
      args.push('--add-metadata');
    }
  } else {
    // Video: robust selector compatible with YouTube and Facebook
    if (quality === '1080') {
      args.push('-f', 'bestvideo[height<=1080]+bestaudio/best[height<=1080]/bestvideo+bestaudio/best');
    } else if (quality === '720') {
      args.push('-f', 'bestvideo[height<=720]+bestaudio/best[height<=720]/best[height<=720]/best');
    } else if (quality === '480') {
      args.push('-f', 'bestvideo[height<=480]+bestaudio/best[height<=480]/best');
    } else {
      args.push('-f', 'bestvideo+bestaudio/best');
    }
    args.push('--merge-output-format', 'mp4');
  }

  // Handle trim cleanly via yt-dlp download sections
  if (trimStart !== undefined && trimEnd !== undefined && trimEnd > trimStart) {
    args.push('--download-sections', `*${trimStart}-${trimEnd}`);
  }

  args.push(url);

  console.log('Spawning yt-dlp for job', jobId, 'with args:', args.join(' '));
  const child = spawn(YTDLP_PATH, args);

  job.status = 'downloading';
  job.progress = 15;

  let stderrOutput = '';

  child.stdout.on('data', (data) => {
    const text = data.toString();
    const match = text.match(/\[download\]\s+([\d.]+)%\s+of\s+~?([\w.]+)\s+at\s+([\w./]+)\s+ETA\s+([\d:]+)/i);
    if (match) {
      const pct = parseFloat(match[1]);
      job.progress = Math.min(90, Math.max(15, Math.round(pct * 0.85)));
      job.speed = match[3];
      job.eta = match[4];
    } else if (text.includes('[ExtractAudio]') || text.includes('[Merger]') || text.includes('[EmbedThumbnail]')) {
      job.status = 'converting';
      job.progress = 92;
      job.speed = 'Codificando con FFmpeg...';
    }
  });

  child.stderr.on('data', (data) => {
    const text = data.toString();
    stderrOutput += text;
    if (text.includes('[download]') || text.includes('[ffmpeg]')) {
      const match = text.match(/([\d.]+)%/);
      if (match) {
        job.progress = Math.min(90, Math.round(parseFloat(match[1]) * 0.85));
      }
    }
  });

  child.on('close', (code) => {
    if (code !== 0) {
      console.error('yt-dlp exited with code', code, 'stderr:', stderrOutput);
      let errorDesc = 'Hubo un error al procesar el archivo.';
      if (stderrOutput.includes('Video unavailable') || stderrOutput.includes('Private video')) {
        errorDesc = 'El contenido es privado o no está disponible públicamente.';
      } else if (stderrOutput.includes('Sign in to confirm')) {
        errorDesc = 'El contenido requiere inicio de sesión en la plataforma original.';
      } else if (stderrOutput.includes('Requested format is not available')) {
        errorDesc = 'El formato solicitado no está disponible para este video.';
      } else {
        const errLine = stderrOutput.split('\n').find((l) => l.includes('ERROR:'));
        if (errLine) {
          errorDesc = errLine.replace(/^ERROR:\s*(\[[^\]]+\])?\s*/, '').trim().slice(0, 140);
        }
      }
      job.status = 'error';
      job.error = errorDesc;
      return;
    }

    // Locate the finished media file in DOWNLOADS_DIR matching jobId
    try {
      const files = fs.readdirSync(DOWNLOADS_DIR);
      const mediaExtensions = ['.mp3', '.m4a', '.flac', '.wav', '.opus', '.mp4', '.webm', '.mkv'];

      // Filter out thumbnails (.webp, .png, .jpg) and partial files
      const matchingMediaFiles = files.filter(
        (f) =>
          f.startsWith(jobId) &&
          mediaExtensions.some((extSuffix) => f.toLowerCase().endsWith(extSuffix)) &&
          !f.includes('.part') &&
          !f.includes('.temp')
      );

      // Find the file with the expected extension or first media file
      const finalFile =
        matchingMediaFiles.find((f) => f.toLowerCase().endsWith('.' + ext)) ||
        matchingMediaFiles[0];

      if (finalFile) {
        const fullPath = path.join(DOWNLOADS_DIR, finalFile);
        const stat = fs.statSync(fullPath);
        job.filePath = fullPath;
        job.fileSize = stat.size;
        job.status = 'completed';
        job.progress = 100;
        job.eta = 'Listo';

        // Clean up leftover thumbnail files for this job
        files.forEach((f) => {
          if (
            f.startsWith(jobId) &&
            (f.endsWith('.webp') || f.endsWith('.png') || f.endsWith('.jpg'))
          ) {
            try {
              fs.unlinkSync(path.join(DOWNLOADS_DIR, f));
            } catch {
              // Ignore
            }
          }
        });
      } else {
        job.status = 'error';
        job.error = 'No se encontró el archivo multimedia generado.';
      }
    } catch (err: any) {
      job.status = 'error';
      job.error = err.message || 'Error al verificar archivo final';
    }
  });

  return res.json({ jobId, status: 'queued' });
});

// 4. Job status query
app.get('/api/jobs/:id', (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job) {
    return res.status(404).json({ error: 'Tarea no encontrada' });
  }

  res.json({
    id: job.id,
    status: job.status,
    progress: job.progress,
    speed: job.speed,
    eta: job.eta,
    fileName: job.fileName,
    fileSize: job.fileSize,
    error: job.error,
    downloadUrl: job.status === 'completed' ? `/api/downloads/${job.id}` : null,
  });
});

// 5. Download the completed file
app.get('/api/downloads/:id', (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job || !job.filePath || !fs.existsSync(job.filePath)) {
    return res.status(404).send('Archivo no encontrado o expiró.');
  }

  res.download(job.filePath, job.fileName || 'media.mp3', (err) => {
    if (err) {
      console.warn('Error during file download stream:', err);
    }
  });
});

// 6. Direct Stream preview endpoint
app.get('/api/preview-stream', (req, res) => {
  const url = req.query.url as string;
  const type = (req.query.type as string) || 'audio';
  if (!url) return res.status(400).send('URL requerida');

  const args = [
    '--no-warnings',
    '--no-playlist',
    '-g',
    '-f', type === 'audio' ? 'bestaudio[ext=m4a]/bestaudio/best' : 'best[ext=mp4]/best',
  ];

  if (fs.existsSync(COOKIES_PATH) && fs.statSync(COOKIES_PATH).size > 0) {
    args.push('--cookies', COOKIES_PATH);
  }

  args.push(url);

  const child = spawn(YTDLP_PATH, args);
  let stdout = '';
  child.stdout.on('data', (d) => (stdout += d.toString()));
  child.on('close', (code) => {
    if (code === 0 && stdout.trim()) {
      const streamUrl = stdout.trim().split('\n')[0];
      return res.redirect(streamUrl);
    }
    return res.status(404).send('No se pudo generar el stream directo.');
  });
});

// In-memory sessions store for demo & authentication tracking
const userSessions = new Map<string, any>();

// 7. Auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password, provider, name, avatar } = req.body;

  if (provider === 'google') {
    const user = {
      id: 'usr_g_' + Math.random().toString(36).substring(2, 9),
      name: name || 'Usuario de Google',
      email: email || 'usuario@gmail.com',
      avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      plan: 'Aguacate VIP (Ilimitado)',
      isLoggedIn: true,
      downloadCount: 0,
      joinedDate: new Date().toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
    };
    userSessions.set(user.id, user);
    return res.json({ success: true, user });
  }

  if (provider === 'guest') {
    const user = {
      id: 'usr_guest_' + Math.random().toString(36).substring(2, 9),
      name: 'Invitado Aguacate',
      email: 'invitado@aguacate.music',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      plan: 'Pase Rápido',
      isLoggedIn: true,
      downloadCount: 0,
      joinedDate: new Date().toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
    };
    userSessions.set(user.id, user);
    return res.json({ success: true, user });
  }

  // Standard email/password
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Por favor ingresa un correo electrónico válido.' });
  }

  const generatedName = email.split('@')[0].replace(/[._]/g, ' ');
  const user = {
    id: 'usr_' + Math.random().toString(36).substring(2, 9),
    name: generatedName.charAt(0).toUpperCase() + generatedName.slice(1),
    email,
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
    plan: 'Aguacate Pro',
    isLoggedIn: true,
    downloadCount: 0,
    joinedDate: new Date().toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
  };
  userSessions.set(user.id, user);
  return res.json({ success: true, user });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Por favor ingresa un correo electrónico válido.' });
  }

  const user = {
    id: 'usr_' + Math.random().toString(36).substring(2, 9),
    name: name?.trim() || 'Nuevo Usuario',
    email,
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
    plan: 'Aguacate VIP (Ilimitado)',
    isLoggedIn: true,
    downloadCount: 0,
    joinedDate: new Date().toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
  };
  userSessions.set(user.id, user);
  return res.json({ success: true, user });
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MediaRip server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
