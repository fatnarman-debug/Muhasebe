# Proje Durum Özeti
**Son Güncelleme:** 24 Haziran 2026

---

## Çalışma Klasörü
```
/Users/fatnar/Desktop/Masaüstü - Fat MacBook Air/BUSINESS/Muhasebe /
```

## Yedek Klasör
```
/Users/fatnar/Desktop/Muhasebe/   (depot olarak durur)
```

## GitHub Repo
```
gh repo clone fatnarman-debug/Muhasebe
```

---

## Server Nasıl Çalıştırılır

```bash
cd "/Users/fatnar/Desktop/Masaüstü - Fat MacBook Air/BUSINESS/Muhasebe "

# Production (çalışıyor)
npm run build
npm start
# → http://localhost:3000

# Dev server (Node 26 ile sorunlu, production kullan)
npm run dev  # → http://localhost:3001
```

**Not:** Node 26.3.1 yüklü. Dev server Turbopack ile sorunlu.
Production build (`npm run build && npm start`) çalışıyor.

---

## Giriş Bilgileri

### Admin Paneli
- URL: http://localhost:3000/admin/login
- E-posta: fatnarman@gmail.com
- Şifre: 12345678qw.,ASXX

### Normal Kullanıcı (Supabase)
- URL: http://localhost:3000/auth/login
- Supabase'de kayıtlı kullanıcı gerekli

---

## Tamamlanan Özellikler

### Fatura Sistemi
- [x] Fatura oluşturma, düzenleme, silme
- [x] ROT/RUT Avdrag hesaplama
- [x] Grönt Avdrag (solar/energy_storage/ev_charger)
- [x] PDF oluşturma (@react-pdf/renderer)
- [x] E-mail gönderme (Resend API)
- [x] Gecikmiş fatura otomatik işaretleme
- [x] Fatura arama

### Teklif (Offert) Sistemi
- [x] Teklif oluşturma (OFF-0001 numaralandırma)
- [x] Teklif → Faturaya çevirme (tek tık)
- [x] Teklif durumları (draft/sent/accepted/rejected/converted)

### Tekrarlayan Fatura
- [x] Şablon oluşturma (monthly/quarterly/yearly)
- [x] Sayfa açıldığında otomatik fatura üretme

### Admin Paneli
- [x] Super Admin girişi (HMAC session token)
- [x] Genel Bakış dashboard
- [x] Kullanıcılar listesi
- [x] Şirketler listesi
- [x] Faturalar listesi
- [x] Plan Yönetimi

### Müşteri Yönetimi
- [x] Müşteri ekleme/düzenleme
- [x] İsim/org-no arama

---

## Yapılacaklar (Sonraki Oturum)

### Öncelikli
- [ ] **Fatura şablonları** - 10 adet klasik/modern şablon seçimi (müşteri oluşturulurken)
- [ ] **Fatura işlemleri** - Önizleme, PDF indir, Düzenle, E-mail gönder butonları
- [ ] **Sistem hiyerarşisi** - Dükkan Yetkılısı + Muhasebeci rolleri (SISTEM_MIMARISI.md'de detaylı)
- [ ] SQL migration çalıştır (quotes, recurring_invoices tabloları)

### İkincil
- [ ] Stripe entegrasyonu (plan zorlama)
- [ ] Raporlar sayfası (şu an "Snart" placeholder)
- [ ] Coolify deployment

---

## Mevcut Dosya Yapısı

```
src/
├── app/
│   ├── admin/
│   │   ├── login/page.tsx     ← Admin giriş sayfası
│   │   ├── users/             ← Kullanıcılar listesi
│   │   ├── companies/         ← Şirketler
│   │   ├── invoices/          ← Faturalar
│   │   ├── plans/             ← Plan yönetimi
│   │   ├── layout.tsx         ← Admin sidebar layout
│   │   └── page.tsx           ← Admin dashboard
│   ├── api/
│   │   ├── admin/login/       ← Admin giriş API
│   │   ├── admin/logout/      ← Admin çıkış API
│   │   └── quotes/[id]/convert/ ← Teklif→Fatura API
│   ├── auth/                  ← Kullanıcı giriş/kayıt
│   └── dashboard/             ← Ana dashboard
├── components/
│   ├── admin/                 ← Admin bileşenleri
│   ├── invoices/              ← Fatura formları + PDF
│   ├── quotes/                ← Teklif formları
│   └── recurring/             ← Tekrarlayan fatura
├── lib/
│   ├── admin-session.ts       ← HMAC session yönetimi
│   ├── deductions.ts          ← ROT/RUT/Grönt hesaplama
│   └── supabase/              ← Supabase istemcileri
└── middleware.ts              ← Auth koruma
```

---

## Önemli Notlar
- Klasör adında **sonda boşluk** var: `Muhasebe ` (dikkat!)
- Dev server Turbopack + Node 26 ile çöküyor → production build kullan
- `.env.local` dosyası git'e commit edilmemiş (güvenlik)
- Admin session cookie: `admin_token` (7 gün geçerli)
