// Yedekleme/geri yükleme paylaşılan tipleri (düz modül — "use server" değil).
// Hem sunucu action'ları hem istemci bileşeni güvenle import eder.

export type BackupCounts = {
  companies: number;
  customers: number;
  articles: number;
  invoices: number;
  lines: number;
  payments: number;
};

export type StoredBackup = {
  id: string;
  filename: string;
  storage_path: string;
  size_bytes: number | null;
  counts: BackupCounts;
  has_logos: boolean;
  created_at: string;
};
