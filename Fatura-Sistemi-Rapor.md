# İsveç Muhasebeciler İçin Faturalama Sistemi — Ürün ve Özellik Raporu

> Bu rapor, İsveç'teki muhasebecilerin (redovisningskonsult / bokföringsbyrå) kendi müşterileri adına fatura kesebileceği bir SaaS platformu için hazırlandı. Senin verdiğin özelliklere ek olarak Fortnox, Visma eEkonomi, Bokio, Zervant ve Stripe gibi piyasadaki çözümlerin sunduğu özellikler ile İsveç'e özgü yasal zorunluluklar da dahil edildi.

---

## 1. Önce en kritik nokta: Bu bir "çok kiracılı" (multi-tenant) sistem

Senin tarif ettiğin yapı aslında üç katmanlı bir model:

```
MUHASEBECİ (platform aboneliği sahibi)
   └── KLİENT FİRMA(LAR) — muhasebecinin hizmet verdiği şirketler
         └── MÜŞTERİLER — klient firmanın faturalandırdığı taraflar
               └── FATURALAR
```

Bu ayrım çok önemli çünkü **fatura, muhasebecinin değil, klient firmanın adına kesilir.** Yani her faturanın üstünde klient firmanın org-numarası, moms numarası, F-skatt bilgisi ve banka/Bankgiro bilgisi olmak zorunda — muhasebecininki değil. Sistemin veri modeli ve fiyatlandırması bu üç katmana göre kurulmalı.

Senin "eklediği müşteri kadar ödeme yapacak" fikrin de burada netleşiyor: ücretlendirme **klient firma sayısına** mı yoksa **fatura kesilen son müşteri sayısına** mı bağlı olacak? (Bölüm 7'de ikisini de ele aldım — muhasebeci pazarında genelde *klient firma sayısı* üzerinden ücretlendirme standarttır.)

---

## 2. İsveç'e özgü ZORUNLU özellikler (bunlar olmazsa sistem kullanılamaz)

Bu kısım piyasa araştırmasının en değerli çıktısı. Genel bir faturalama sistemi yapsan bile, İsveç'te yasal olarak geçerli fatura kesebilmek için aşağıdakiler şart:

### 2.1. Faturada zorunlu olması gereken alanlar (faktura krav)
İsveç Vergi Dairesi (Skatteverket) için her faturada bulunması gerekenler:
- Satıcının (klient firma) yasal adı ve adresi
- Satıcının organisationsnummer'i (org-numarası)
- Satıcının moms numarası (momsregistreringsnummer — `SE` + 10 hane + `01` formatında)
- Müşterinin adı ve adresi (gerekiyorsa müşterinin moms numarası — AB içi satış veya ters vergi durumunda zorunlu)
- Fatura tarihi
- **Sıralı (kesintisiz artan) fatura numarası** — bu yasal bir zorunluluk, atlamalı numara olamaz
- Mal/hizmetin açık tanımı (genel ifade değil, ne yapıldığı net yazılmalı)
- KDV (moms) tutarı **mutlaka SEK cinsinden** gösterilmeli
- Vade / ödeme koşulları
- "Godkänd för F-skatt" ibaresi (aşağıda açıklıyorum)

### 2.2. "Godkänd för F-skatt" ibaresi — atlanırsa ciddi sonuç doğuran nokta
Eğer faturada bu ibare yoksa, ödemeyi yapan taraf yasal olarak **brüt tutarın %30'unu ön vergi (preliminärskatt) olarak kesip Skatteverket'e yatırmak zorunda kalır** ve ayrıca işveren katkı payı (~%31,42) sorumluluğu doğar. Yani sistem, her klient firma için F-skatt durumunu kaydetmeli ve uygunsa bu ibareyi faturaya otomatik basmalı.

### 2.3. Moms (KDV) yönetimi
- Çoklu KDV oranı desteği: %25 (standart), %12, %6, %0
- Satır bazında otomatik KDV hesaplama
- KDV özet raporu (moms-deklaration için)
- **Ters vergi mekanizması (omvänd skattskyldighet)** — özellikle inşaat sektöründe zorunlu
- Yabancı para birimiyle kesilen faturada bile KDV tutarının SEK karşılığı + kullanılan kur gösterilmeli

### 2.4. ROT / RUT indirimi (avdrag) — ev hizmetleri için kritik
İnşaat, tadilat, temizlik gibi hizmet veren klient firmaların müşterileri için çok önemli:
- **ROT (inşaat/tadilat):** işçilik maliyetinin %30'u, müşteri başına yıllık tavan 50 000 SEK
- **RUT (ev hizmetleri):** işçilik maliyetinin %50'si, yıllık tavan 25 000 SEK
- Fatura satırında işçilik maliyeti ayrı işaretlenmeli, indirim otomatik hesaplanmalı
- Faturada müşterinin ödeyeceği "düşülmüş" tutar net görünmeli
- Hizmet açıklaması çok spesifik olmalı (ne, nerede, ne zaman yapıldı — yoksa Skatteverket talebi reddeder)
- Müşteri ödemeyi yaptıktan **sonra**, klient firma indirilen kısmı Skatteverket'ten talep eder → sistemin bu talebi (begäran om utbetalning) oluşturması büyük artı

### 2.5. Ödeme altyapısı
- **OCR referans numarası** üretimi (SS 61 41 14 standardı, modulus 10 kontrol hanesi) — İsveç'te ödemenin doğru faturayla eşleşmesi için kullanılır
- **Bankgiro / PlusGiro** numarası faturada gösterimi (İsveç'te IBAN değil bunlar standart)
- **Swish** ile ödeme bilgisi/QR
- IBAN/BIC (yurt dışı ödemeler için)

### 2.6. E-fatura (e-faktura) ve Peppol
- Kamuya kesilen faturalarda (B2G) **e-fatura zorunlu** — Peppol BIS Billing 3.0 / EN 16931 standardı
- B2B'de şu an gönüllü ama yakında zorunlu olması bekleniyor (EU "ViDA" düzenlemesi; İsveç 2027 sonuna kadar değerlendiriyor) — sistemi baştan Peppol uyumlu tasarlamak ileride büyük avantaj
- "Ja tack till e-faktura" tüketici e-fatura kaydı entegrasyonu

### 2.7. Arşivleme ve muhasebe entegrasyonu
- **7 yıl saklama zorunluluğu** (Bokföringslagen) — gönderilen/alınan tüm faturalar, bütünlük ve erişilebilirlik garantili şekilde
- **SIE dosya formatı** export — İsveç'te muhasebe verisinin standart değişim formatı; muhasebeci sisteminin olmazsa olmazı
- Skatteverket üzerinden F-skatt / org-numarası doğrulama

---

## 3. Senin listelediğin özellikler (gözden geçirilmiş hali)

| Senin maddesi | Notum / iyileştirme |
|---|---|
| Giriş ekranı + üyelik zorunluluğu | ✓ Ayrıca **BankID** ile giriş güçlü öneri (İsveç'te standart güven aracı). E-posta/şifre + 2FA da olmalı. |
| Müşteri/klient sayısına göre artan ücret | ✓ Bölüm 7'ye bak — kademeli model mantıklı ama "müşteri" mi "klient firma" mı netleştirilmeli. |
| Müşteri ekleme ekranı | ✓ Klient firma ekleme + o firmanın son müşterilerini ekleme ayrımı olmalı. |
| Fatura kesme ekranı | ✓ Ürün/hizmet kataloğu, KDV, ROT/RUT, OCR otomatik gelmeli. |
| Faturaların yıl/ay olarak saklanması + akıllı arama | ✓ Tam metin arama: müşteri adı, tutar, fatura no, OCR, tarih aralığı, durum (ödendi/açık/gecikmiş). |
| Kriterlere göre raporlama (aylık / tarih aralığı) | ✓ Bölüm 6'da rapor modülünü genişlettim. |

---

## 4. Piyasadaki çözümlerin sunduğu, sende eksik olan özellikler

Fortnox (İsveç pazar lideri), Visma eEkonomi, Bokio (Visma'ya ait), Zervant ve Stripe Invoicing incelendi. Senin listende olmayıp eklenmesi gereken yaygın özellikler:

**Belge ve satış akışı**
- Teklif / fiyat teklifi (offert) → sipariş → fatura dönüşümü
- **Tekrarlayan / abonelik faturaları** (återkommande fakturor) — otomatik aylık kesim
- **Kredi faturası / iade faturası** (kreditfaktura)
- Taslak fatura ve fatura kopyalama
- Birden çok fatura şablonu, logo ve marka özelleştirme

**Ödeme ve tahsilat**
- Otomatik **ödeme hatırlatması** (påminnelse) ve gecikme faizi (dröjsmålsränta)
- İcra/tahsilat (inkasso) entegrasyonu
- Faktoring entegrasyonu (faturayı satıp peşin nakit alma)
- Banka entegrasyonu ile **otomatik ödeme eşleştirme/mutabakat** (OCR sayesinde)
- Kısmi ödeme takibi

**Veri ve otomasyon**
- Ürün/hizmet (artikel) kataloğu
- Müşteri kayıt defteri / mini CRM
- **Zaman takibi → faturaya dönüştürme** (saatlik çalışan hizmet firmaları için)
- Masraf/gider takibi ve makbuz fotoğrafı
- Yapay zekâ destekli kategorilendirme (Bokio'nun öne çıktığı alan)

**Erişim ve platform**
- Mobil uygulama (fatura kesme + masraf çekme)
- Çok kullanıcılı, **rol bazlı yetkilendirme** (muhasebeci / asistan / klient firma kendi görüntüler)
- E-posta ile PDF fatura gönderimi + "fatura görüntülendi" takibi
- API ve üçüncü taraf entegrasyonları
- Pano (dashboard) ve KPI'lar: ciro, açık alacaklar, gecikmiş faturalar

---

## 5. Önerilen özellik listesi — Modüllere ve önceliğe göre

### MVP (ilk sürüm — bunlar olmadan piyasaya çıkamaz)
1. Üyelik + giriş (e-posta/şifre, 2FA; mümkünse BankID)
2. Klient firma yönetimi (org-no, moms-no, F-skatt, logo, Bankgiro/Swish, adres)
3. Klient firma değiştirici (üst menüde aktif firmayı seç)
4. Müşteri (son müşteri) kayıt defteri
5. Ürün/hizmet kataloğu
6. Fatura kesme: çoklu KDV, OCR üretimi, F-skatt ibaresi, sıralı numara, PDF
7. Fatura listesi: yıl/ay arşivi + akıllı arama + durum takibi
8. E-posta ile gönderim
9. Temel raporlama (aylık ciro, KDV özeti, açık/gecikmiş)
10. 7 yıl arşiv + temel SIE export
11. Abonelik/ücretlendirme ve fatura limiti mantığı

### Faz 2 (rekabet için gerekli)
- ROT/RUT indirimi ve Skatteverket ödeme talebi
- Tekrarlayan faturalar + otomatik hatırlatma/gecikme faizi
- Kredi faturası, teklif (offert) akışı
- Banka entegrasyonu + otomatik ödeme eşleştirme
- Ters vergi (omvänd skattskyldighet)
- Rol bazlı yetkilendirme, klient firma kendi paneli

### Faz 3 (farklılaşma)
- Peppol / e-faktura tam entegrasyonu
- Mobil uygulama
- Zaman & masraf takibi
- Faktoring / inkasso entegrasyonu
- Yapay zekâ destekli arama, kategorilendirme ve rapor özeti

---

## 6. Raporlama modülü (senin istediğin kısmın genişletilmiş hali)

Seçilebilir kriterler: tarih aralığı / belirli ay-yıl, klient firma, son müşteri, fatura durumu (ödendi / açık / gecikmiş), KDV oranı, ROT-RUT'lu/RUT'suz, para birimi.

Üretilebilecek raporlar:
- **Ciro raporu** (aylık / çeyreklik / yıllık, karşılaştırmalı)
- **KDV (moms) raporu** — beyanname için oran bazında dökümü
- **Alacak yaşlandırma** (kundreskontra) — vadesi geçenler kaç gün gecikmiş
- Klient firma bazında performans
- Son müşteri bazında ciro (en çok kazandıran müşteriler)
- ROT/RUT indirim özeti (Skatteverket talepleri)
- Çıktı formatları: ekran, PDF, Excel, SIE

---

## 7. Fiyatlandırma modeli

Senin önerin (klient/müşteri sayısına göre artan kademe) sağlam. Muhasebeci pazarında en yaygın model **yönetilen klient firma sayısına** göre kademelendirmedir. Birkaç seçenek:

**Seçenek A — Klient firma sayısına göre (önerilen)**
| Kademe | Klient firma | Aylık ücret (örnek) |
|---|---|---|
| Başlangıç | 5'e kadar | 500 kr |
| Büyüme | 10'a kadar | 1 000 kr |
| Profesyonel | 25'e kadar | 2 000 kr |
| Sınırsız/kurumsal | 25+ | Teklif bazlı |

**Seçenek B — Kesilen fatura adedine göre** (düşük hacimli kullanıcıyı korur ama gelir öngörülemez)

**Seçenek C — Karma:** sabit taban ücret + klient firma başına ek + belli sayıdan sonra fatura başına küçük ücret

Dikkat edilecekler:
- **Ücretsiz deneme / freemium** girişi (Bokio'nun büyüme stratejisi buydu) — örn. 1 klient firma ve ayda 5 fatura ücretsiz
- Yıllık ödemede indirim
- Ek modüller (Peppol, banka entegrasyonu, mobil) için opsiyonel paketleme
- Limit aşımında ne olacağı net olmalı (engelle mi, otomatik üst kademeye mi geç)

---

## 8. Veri modeli taslağı (basitleştirilmiş)

```
User (muhasebeci)
  - id, ad, e-posta, şifre_hash, rol, abonelik_kademesi

ClientCompany (klient firma)
  - id, user_id (sahip muhasebeci)
  - ad, org_no, moms_no, f_skatt_durumu
  - adres, logo, bankgiro, plusgiro, swish, iban

Customer (son müşteri)
  - id, client_company_id
  - ad, tip (şirket/birey), org_no/personnummer, moms_no, adres, e-posta

Article (ürün/hizmet)
  - id, client_company_id, ad, açıklama, birim_fiyat, kdv_orani, rot_rut_uygun_mu

Invoice (fatura)
  - id, client_company_id, customer_id
  - fatura_no (sıralı), tarih, vade
  - durum (taslak/gönderildi/ödendi/gecikmiş/kredi)
  - para_birimi, kur, ocr_no
  - rot_rut_tipi, indirim_tutari
  - toplam_haric_kdv, kdv_tutari, toplam_dahil_kdv, odenecek_tutar

InvoiceLine (fatura satırı)
  - id, invoice_id, açıklama, miktar, birim_fiyat, kdv_orani
  - iscilik_mi (ROT/RUT için)

Payment (ödeme)
  - id, invoice_id, tarih, tutar, yöntem (bankgiro/swish), eşleşme_durumu
```

---

## 9. Teknik ve güvenlik notları

- **GDPR:** Personnummer ve müşteri verisi işlendiği için açık rıza, veri saklama/silme politikası, AB içinde barındırma (tercihen İsveç/AB veri merkezi) şart.
- **BankID** entegrasyonu güçlü güven sinyali ve İsveç'te neredeyse standart.
- **Yedekleme ve değişmezlik:** 7 yıllık arşiv için faturaların değiştirilemez (immutable) saklanması — kesilmiş fatura sonradan değiştirilemez, sadece kredi faturasıyla düzeltilir.
- **Sıralı numara bütünlüğü:** fatura numaraları atlamasız ve geri alınamaz olmalı (yasal denetim için).
- Çok kiracılı mimaride **veri izolasyonu**: bir muhasebecinin klient verisi başka muhasebeciye sızmamalı.

---

## 10. Önerilen yol haritası

1. **Karar ver:** Sadece faturalama mı, yoksa ileride muhasefe/defter tutma da mı? (Tam muhasebe çok daha büyük bir iş — başta faturalamaya odaklan, SIE export ile Fortnox/Visma'ya köprü kur.)
2. MVP'yi (Bölüm 5) çıkar, küçük bir muhasebe bürosuyla pilot yap.
3. ROT/RUT ve banka eşleştirmeyi ekle (en çok talep gören özellikler).
4. Peppol/e-fatura ile geleceğe hazırlan.

---

## 11. Senin netleştirmen gereken açık kararlar

- Ücretlendirme **klient firma** sayısına mı, **son müşteri** sayısına mı, yoksa **fatura adedine** mi bağlı?
- Hedef kullanıcı tek tek serbest muhasebeci mi, yoksa çok kullanıcılı muhasebe büroları mı?
- B2B mi, B2C (özel kişilere fatura — ROT/RUT burada devreye girer) mi, yoksa ikisi de mi?
- Sadece fatura mı, yoksa zaman içinde tam muhasefe paketi mi hedefliyorsun?
- Başta sadece İsveç mi, yoksa Nordik/AB geneli mi? (Çok ülkeli olursan KDV ve format mantığı esnek tasarlanmalı.)

---

*Kaynaklar: Skatteverket, DIGG, Bolagsverket yayınları; Fortnox, Visma eEkonomi, Bokio, Zervant ve Stripe Invoicing ürün/dokümantasyonları; İsveç fatura, F-skatt, ROT/RUT, OCR/Bankgiro ve e-faktura uyumluluk kaynakları (Haziran 2026 itibarıyla).*
