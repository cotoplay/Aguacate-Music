export interface AudioQuality {
  label: string;
  format: 'mp3' | 'm4a' | 'flac' | 'wav';
  quality: string;
  sizeEst: number; // in MB
}

export interface VideoQuality {
  label: string;
  quality: string;
  format: string;
  note: string;
}

export interface MediaInfo {
  id: string;
  title: string;
  uploader: string;
  duration: number;
  durationFormatted: string;
  thumbnail: string | null;
  viewCount: number | null;
  uploadDate: string | null;
  platform: 'youtube' | 'facebook' | 'other';
  originalUrl: string;
  hasVideo: boolean;
  audioQualities: AudioQuality[];
  videoQualities: VideoQuality[];
}

export interface ActiveJob {
  id: string;
  status: 'queued' | 'downloading' | 'converting' | 'completed' | 'error';
  progress: number;
  speed?: string;
  eta?: string;
  fileName?: string;
  fileSize?: number;
  error?: string;
  downloadUrl?: string | null;
  title: string;
  type: 'audio' | 'video';
  format: string;
  quality: string;
  platform: 'youtube' | 'facebook' | 'other';
  thumbnail?: string | null;
  timestamp: number;
}

export interface HistoryItem {
  id: string;
  title: string;
  uploader: string;
  type: 'audio' | 'video';
  format: string;
  quality: string;
  fileSize?: number;
  thumbnail?: string | null;
  originalUrl: string;
  downloadUrl?: string;
  timestamp: number;
  durationFormatted: string;
}

export interface SearchResultItem {
  id: string;
  title: string;
  uploader: string;
  duration: number;
  durationFormatted: string;
  thumbnail: string;
  viewCount: number | null;
  url: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  plan: string;
  isLoggedIn: boolean;
  downloadCount: number;
  joinedDate: string;
}


