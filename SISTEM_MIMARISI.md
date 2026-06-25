# Muhasebe SaaS Sistem Mimarisi

## Hiyerarşi Seviyeleri

### 1. Super Admin
- **Sayı:** 1 kişi
- **Görev:** Tüm sistemi yönetir, muhasebe dükkanları ve yetkilileri kontrol eder

### 2. Muhasebe Dükkanı Yetkılısı
- **Sayı:** Her muhasebe dükkanı için 1 yetkili
- **Görevler:**
  - Muhasebe dükkanının tüm yönetimini üstlenir
  - Altında çalışan muhasebecileri atayabilir
  - Yeni müşterileri oluşturabilir
  - Müşterileri muhasebecilere atayabilir
  - Her muhasebecı için **benzersiz kod** oluşturur
  - Muhasebeciler için **e-posta ve şifre** oluşturur
  - Şifre sıfırlama işlemlerini yapabilir
  - Muhasebecileri silebilir (SİLİNEN muhasebeciye ait müşteriler BAŞKASINA atanabilir)
  - Müşterileri istediği zaman muhasebeciler arasında yeniden atayabilir
  - Muhasebecileri istediği zaman değiştirebilir

### 3. Muhasebeci
- **Sayı:** Her dükkanın altında birden fazla olabilir
- **Giriş Bilgileri:** 
  - E-posta (yetkili tarafından oluşturulur)
  - Şifre (yetkili tarafından oluşturulur)
  - Kod (yetkili tarafından oluşturulan benzersiz kod)
- **Görevler:**
  - Kendisine atanan müşterilere fatura kesebilir
  - Kendisine atanan müşterilere teklif (offert) faturası kesebilir
  - Yalnızca kendisine atanan müşterileri görebilir ve işlem yapabilir

## Kritik Kurallar

1. **Muhasebecı Silinmesi Durumu:** 
   - Silinecek muhasebeciye ait tüm müşteriler başka bir muhasebeciye atanabilir olmalı
   - Müşteri veri kaybı olmayacak şekilde transfer mekanizması kurulmalı

2. **Müşteri Atama:**
   - Yetkili, müşterileri dilediği muhasebeciye atayabilir
   - Müşteri ataması değiştirilebilir

3. **Erişim Kontrolü:**
   - Muhasebecı: Sadece kendi müşterilerini görebilir
   - Yetkili: Tüm müşteri ve muhasebecileri görebilir
   - Super Admin: Tüm sistemi görebilir

## Rol Özeti Tablosu

| Rol | Erişim Seviyesi | Müşteri Yönetimi | Muhasebeci Yönetimi | Fatura Kesme |
|-----|-----------------|------------------|-------------------|--------------|
| Super Admin | Sistem Geneli | Tüm müşteriler | Tüm yetkilileri yönet | Evet |
| Dükkan Yetkılısı | Kendi Dükkanı | Kendi müşteriler | Muhasebecileri yönet | Evet |
| Muhasebeci | Kendine Atananlar | Görüntüle | - | Evet (kendi müşteriler) |

## Akış Diagramı

```
Super Admin (1)
    │
    ├── Muhasebe Dükkanı 1 (Yetkili)
    │   ├── Muhasebeci A → Müşteri 1, 2, 3
    │   ├── Muhasebeci B → Müşteri 4, 5
    │   └── Muhasebeci C → Müşteri 6
    │
    ├── Muhasebe Dükkanı 2 (Yetkili)
    │   ├── Muhasebeci D → Müşteri 7, 8
    │   └── Muhasebeci E → Müşteri 9
    │
    └── Muhasebe Dükkanı 3 (Yetkili)
        └── Muhasebeci F → Müşteri 10, 11, 12
```

---

## Fatura Şablonları (Invoice Templates)

### Özellik
- İlk müşteri bilgileri girilirken **fatura şablonu seçimi** zorunlu
- En az **10 adet önceden tasarlanmış şablon** vardır
- **2 stil kategorisi:**
  - **Klasik Tarzı** (5+ şablon) - Profesyonel, minimalist, kurumsal
  - **Modern Tarzı** (5+ şablon) - Renkli, dinamik, tasarım odaklı

### Seçim ve Saklama
- Müşteri oluşturulurken şablon seçilir
- Seçilen şablon `client_companies` tablosunda `invoice_template` alanında saklanır
- **Sonraki tüm faturalar aynı şablonu kullanır** (otomatik)
- Müşteri ayarlarından istediği zaman değiştirebilir

### Şablon Örnekleri
- **Klasik:** Standart, Minimal, Profesyonel, Corporate, Clean
- **Modern:** Colorful, Gradient, Bold, Tech, Creative

---

## Fatura İşlemleri (Invoice Operations)

### Fatura Oluşturulduktan Sonra Kullanılabilir Seçenekler

1. **Önizleme (Preview)**
   - Fatırayı tarayıcıda görüntüle
   - Gönderilmeden önce kontrol et

2. **PDF Olarak İndir**
   - Faturayı PDF formatında bilgisayara indir
   - Otomatik ad: `Fatura-001-2026.pdf` vb.

3. **Düzenle (Edit)**
   - Halihazırda oluşturulmuş faturayı değiştir
   - Müşteri bilgileri, hizmetler, fiyatlar güncellenebilir
   - Versiyon kontrolü: "Düzenleme #1", "Düzenleme #2"

4. **E-mail ile Gönder**
   - Müşterinin kayıtlı e-postasına otomatik gönder
   - Template: Seçilen şablon uygulanmış PDF
   - İçerik: Saygı dileri + PDF eki + Ödeme bilgileri

### İşlem Akışı
```
Fatura Oluştur
    ↓
[Önizleme] [PDF İndir] [Düzenle] [E-mail Gönder]
    ↓
Müşteriye Ulaş
```

### Teknik Detaylar
- Tüm işlemler fatura kaydetildikten sonra aktif
- Taslak faturalarda: Sadece [Önizleme] ve [Düzenle] aktif
- Gönderilen faturalarda: Tüm dört seçenek aktif
- E-mail gönderimi: Resend API kullanılır
- PDF oluşturma: @react-pdf/renderer v4.5.1

---

**Kayıt Tarihi:** 24 Haziran 2026
