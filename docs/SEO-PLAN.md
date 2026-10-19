# EnkeltFaktura — SEO & İçerik Yol Haritası

> Hazırlanma: 2026-10-19 · Alan: enkeltfaktura.com · Pazar: İsveç
> Kaynak: canlı site taraması, Search Console, PageSpeed, SERP araştırması

---

## 0. Başlangıç noktası (gerçek veri)

| Ölçüm | Durum |
|---|---|
| Sitemap'teki URL | **6** (ana sayfa, login, register, 3 yasal sayfa) |
| İçerik sayfası | **0** — blog yok, özellik sayfası yok, karşılaştırma yok |
| GSC arama verisi | 0 (property 19 Eki'de doğrulandı) |
| GA4 oturum | 0 (property 19 Eki'de kuruldu) |
| İndeks | Ana sayfa indekslenmiş, diğerleri sırada |
| PageSpeed | Masaüstü 99 · Mobil 80→~95 (düzeltmeler deploy bekliyor) |
| `llms.txt` | **Var ve kaliteli** — AI motorları için güçlü avantaj |

**Tek cümlelik teşhis:** Teknik altyapı iyi, içerik yok. Sıralanacak sayfa olmadığı için trafik de yok. Bütün iş içerikte.

---

## 1. Rakip analizi

### Pazar haritası

| Rakip | Konum | Fiyat | Zayıf noktası (bizim fırsatımız) |
|---|---|---|---|
| **Fortnox** | Pazar lideri, 500k+ müşteri, 500+ entegrasyon | Yüksek, modüler | Küçük işletme için ağır ve pahalı; kurulum karmaşık |
| **Bokio** | Muhasebe + fatura, eskiden ücretsiz | **2026'da ücretsiz paketi kaldırdı** | 🔥 En büyük fırsat — "Bokio gratis borttaget" göçü |
| **Zervant** | Sade fatura, 5 fatura/ay ücretsiz | 99,90 kr/ay | **Bizden pahalı** (79 kr). Bürolar için çok yetenekli değil |
| **Visma eEkonomi** | Kurumsal, köklü | Yüksek | Eski arayüz, egenföretagare'ye fazla |
| **SpeedLedger / Briox / Hogia** | Niş / banka ortaklıkları | Orta-yüksek | Düşük marka bilinirliği, zayıf içerik |

### Konumlandırma avantajlarımız

1. **Fiyat** — 79 kr/ay, Zervant'ın 99,90'ının altında. Doğrudan kıyas yapılabilir.
2. **Büro/konsult rol yapısı** — Zervant ve Bokio'da yok. Muhasebe büroları için gerçek bir boşluk.
3. **ROT/RUT otomatik** — zanaatkâr segmenti için belirleyici özellik.
4. **Bokio'nun ücretsizi kaldırması** — pazarın en taze ve en net göç dalgası.

### Bulduğum link ekosistemi (değerli)

İsveç'te fatura programı karşılaştırma siteleri var ve **aktif olarak sıralanıyorlar**:

- fakturapilot.se — "bästa fakturaprogrammet", "alternativ till Bokio"
- ekonomipiloten.se, bokforingsprogram24.se, contentskribent.se
- hittasystem.se, bygglog.se, startaenskildfirma.se

Bunlar genelde affiliate/karşılaştırma siteleri. **Listelerine girmek organik trafikten daha hızlı sonuç verir.** Aksiyon: her birine ürün bilgisi + affiliate teklifiyle ulaş.

---

## 2. Site mimarisi — hedef yapı

```
/                                 ana sayfa (var)
/funktioner/                      özellik hub'ı
  /fakturering                    fatura oluşturma
  /offert                         teklif → fatura akışı
  /rot-rut-avdrag                 ROT/RUT otomatik hesaplama
  /ocr-bankgiro                   OCR satırı + QR kod
  /kreditfaktura                  kredi faturası
  /betalningspaminnelse           ödeme hatırlatma
  /fakturamallar                  10+ şablon
/for/                             segment hub'ı  ← EN YÜKSEK ÖNCELİK
  /egenforetagare                 tek kişilik işletme
  /enskild-firma                  şahıs şirketi
  /redovisningsbyra               muhasebe bürosu (3 katmanlı rol yapımız)
  /redovisningskonsult            muhasebe danışmanı
  /hantverkare                    zanaatkâr (ROT/RUT)
  /elektriker · /snickare · /malare · /rormokare   meslek sayfaları
  /konsult · /frilansare · /frisor · /stadforetag
/jamfor/                          karşılaştırma hub'ı  ← EN HIZLI DÖNÜŞ
  /bokio-alternativ               🔥 öncelik 1
  /zervant-alternativ             🔥 öncelik 2
  /fortnox-alternativ
  /visma-alternativ
  /enkeltfaktura-vs-bokio
  /enkeltfaktura-vs-zervant
/priser                           fiyatlandırma (ayrı sayfa olmalı)
/blogg/                           blog
/hjalp/                           yardım merkezi / SSS
/ordlista/                        terim sözlüğü (GEO için güçlü)
```

**Kural:** Her sayfanın tek ve net bir arama amacı olmalı. Benzer iki sayfa açma — kanibalizasyon yaratır.

---

## 3. Blog içerik planı

### Yazım ilkeleri

- **Tek hedef sorgu + 2-3 yan sorgu** per yazı
- **Cevabı ilk 100 kelimede ver** (AI alıntıları ve öne çıkan snippet için kritik)
- Her yazıda **tablo veya sayısal örnek** — alıntılanabilirliği artırır
- Rakamları **yıl etiketiyle** yaz ("2026 için ROT %30") — tazelik sinyali
- Her yazı sonunda ilgili özellik/segment sayfasına **iç link**

### Faz 1 — Temel (ilk 8 yazı, hafta 1-8)

| # | Başlık | Hedef sorgu | Amaç |
|---|---|---|---|
| 1 | ROT-avdrag på faktura 2026 — komplett guide för hantverkare | rot avdrag faktura | Bilgi → /for/hantverkare |
| 2 | RUT-avdrag 2026: så fakturerar du rätt | rut avdrag faktura | Bilgi |
| 3 | Vad är OCR-nummer på en faktura? Så fungerar betalraden | ocr nummer faktura | Bilgi → /funktioner/ocr-bankgiro |
| 4 | Fakturakrav 2026: vad måste stå på en faktura enligt lag | fakturakrav / vad ska en faktura innehålla | **Yüksek hacim**, evergreen |
| 5 | Kreditfaktura — när och hur du gör en rättelse | kreditfaktura | Bilgi → /funktioner/kreditfaktura |
| 6 | Betalningspåminnelse och dröjsmålsränta: reglerna 2026 | betalningspåminnelse ränta | Bilgi |
| 7 | Hur fakturerar man som enskild firma? Steg för steg | fakturera enskild firma | **Ticari niyet yüksek** |
| 8 | F-skatt och fakturering — vad du behöver veta | f-skatt fakturera | Bilgi |

### Faz 2 — Karşılaştırma & göç (hafta 9-16)

| # | Başlık | Neden |
|---|---|---|
| 9 | Bokio tog bort gratisplanen — 5 alternativ 2026 | 🔥 Taze göç dalgası, en yüksek dönüşüm |
| 10 | Zervant vs EnkeltFaktura: ärlig jämförelse | Fiyat avantajımız net |
| 11 | Bästa fakturaprogrammet för enskild firma 2026 | Ana ticari sorgu |
| 12 | Fakturaprogram för redovisningsbyrå — vad du bör kräva | Büro segmenti, rakipsiz |
| 13 | Gratis fakturaprogram: vad kostar "gratis" egentligen? | Karşıt-pozisyon içeriği |
| 14 | Byta fakturaprogram — checklista så du inte tappar data | Göç niyeti |

### Faz 3 — Meslek odaklı (hafta 17-28)

Her meslek için aynı şablon: *"Fakturering för [meslek] — ROT/RUT, priser och mallar"*

elektriker · snickare · målare · rörmokare · byggföretag · städföretag · frisör · konsult · fotograf · frilansare

> Bu sayfalar hem blog hem landing görevi görür. Meslek adı + "fakturering" sorguları düşük rekabetli ve yüksek niyetlidir.

### Faz 4 — Otorite (ay 7-12)

- Yıllık güncellenen referans sayfaları: "Fakturaregler 2027", "ROT/RUT-tak 2027"
- Sektör anketi / özgün veri ("İsveç'te egenföretagare'lerin ortalama ödeme süresi") — **link mıknatısı**
- Skatteverket kural değişikliklerinde hızlı içerik

---

## 4. Büyük şehirlere yönelik sayfalar — dürüst değerlendirme

**Önce uyarı:** EnkeltFaktura ulusal bir SaaS, yerel bir hizmet değil. "fakturaprogram Stockholm" gibi sorguların **gerçek arama hacmi yok denecek kadar az** ve 20 şehir için aynı metnin kopyalanması Google'ın *doorway pages* tanımına girer. Bu, index bloat ve kalite cezası riski taşır — fayda değil zarar getirir.

### Bunun yerine işe yarayacak üç yaklaşım

**A) Şehir × meslek kombinasyonu — sadece gerçek içerikle**

`/for/hantverkare/stockholm` gibi sayfalar **ancak** her birinde özgün içerik varsa anlamlı:
- O şehre özgü ROT/RUT istatistiği
- Yerel bölge/kommun bilgisi
- O şehirdeki gerçek müşteri vakası

Özgün içerik üretemeyeceğin şehir için **sayfa açma.** 5 iyi sayfa, 50 kötü sayfadan iyidir.

**Öncelik sırası:** Stockholm → Göteborg → Malmö → Uppsala → Västerås → Örebro → Linköping → Helsingborg

**B) Partner dizini — ama sadece kendi müşterilerinle, ve daha sonra**

> ⚠️ **Düzeltme (2026-10-19):** Bu bölümde önce "şehir bazlı genel muhasebe bürosu rehberi" önermiştim. Bu **yanlış bir öneriydi**, geri alıyorum.
>
> Gerekçe: `redovisningsbyrå Stockholm` arayan kişi **muhasebeci tutmak** istiyor, fatura yazılımı aramıyor. Arama amacı ürünle uyuşmuyor — sıralansak bile dönüşmeyen trafik gelir ve ziyaretçiyi listelediğimiz bürolara yönlendirmiş oluruz. Bize maliyetli, başkasına faydalı bir sayfa olur.

Doğru biçim: **genel rehber değil, sadece EnkeltFaktura kullanan büroların partner dizini.**

```
/partner/                      partner hub
/partner/[buro-adi]            her partner için sayfa
```

Neden bu işe yarar:
- Rakip tanıtımı değil — **ödeyen müşteriye verilen bir avantaj** ("firmanı listeleyelim, müşteri gönderelim")
- Büronun bizi seçmesi için somut sebep (satış argümanı)
- Her partner kendi sitesinden link verir → gerçek backlink
- Listelenen herkes zaten bizim tarafımızda

**Koşul:** Ancak yeterli büro müşterisi olduktan sonra anlamlı. **Faz 3-4 işi, bugünün işi değil.**

**C) Yerel iş ortaklığı sayfaları**

Büro partnerlerin oldukça her biri için ortak sayfa: `/partner/[büro-adı]`. Gerçek backlink + yerel sinyal.

### Net karar: şehir sayfaları şimdilik **yapılmayacak**

Üç seçeneği de değerlendirdikten sonra bugün için doğru cevap: **hiçbiri.**

| Seçenek | Karar | Neden |
|---|---|---|
| Şablonla 20-50 şehir sayfası | ❌ Asla | Doorway page riski, hacim yok |
| Şehir × meslek, gerçek içerikle | ⏸️ Ertelendi | İçerik eforu meslek sayfalarına gitsin, getirisi 10 kat |
| Partner dizini | ⏸️ Faz 3-4 | Önce büro müşterisi gerekiyor |

**Eforun gideceği yer:** `/for/hantverkare`, `/for/elektriker`, `/for/snickare` gibi **meslek sayfaları.** Coğrafya sorunu yok, arama amacı birebir uyuşuyor (fatura kesmek isteyen zanaatkâr), rekabet düşük ve ROT/RUT avantajımız tam burada konuşuyor.

> Kural: bir zanaatkâr "fakturaprogram" ararken yanına şehir yazmaz. Mesleğini yazar ya da hiçbir şey yazmaz. Sayfa yapısı da buna uymalı.

---

## 5. Teknik SEO yapılacaklar

### Yapısal veri (schema) — öncelikli

| Sayfa tipi | Schema | Not |
|---|---|---|
| Ana sayfa | `SoftwareApplication` + `Organization` | Fiyat, puan, özellik |
| Fiyatlar | `Product` + `Offer` | 79/299 kr, SEK |
| Blog yazıları | `Article` + `Author` | E-E-A-T için yazar şart |
| SSS | `FAQPage` | AI Overview'da öne çıkma şansı |
| Karşılaştırma | `FAQPage` + tablo | |
| Yardım | `HowTo` | Adım adım işlemler |

Ana sayfada zaten JSON-LD var (`page.tsx:130`) — genişletilmeli.

### Diğer teknik işler

- [ ] **`/priser` ayrı sayfa olsun** — şu an ana sayfada anchor, ayrı URL sıralanabilir
- [ ] **Sitemap otomatik üretim** — yeni blog yazıları otomatik girsin
- [ ] **Breadcrumb schema** + görsel breadcrumb (3+ seviye için)
- [ ] **İç linkleme kuralı** — her blog yazısı → 1 özellik + 1 segment sayfası
- [ ] **OG görseli** (`/og.png` metadata'da tanımlı ama **dosya yok** — şu an sosyal paylaşımlarda boş)
- [ ] **`NEXT_PUBLIC_SITE_URL`** hâlâ `ledgerflow.se` fallback'inde — canonical'ları bozuyor olabilir
- [ ] **hreflang** — sadece `sv-SE`, şimdilik tek dil
- [ ] Mobil LCP düzeltmesi deploy (hazır, bekliyor)

---

## 6. GEO — yapay zeka motorlarında çıkmak

Burada başlangıç noktan **rakiplerinden iyi**. `llms.txt` zaten var, `robots.txt` GPTBot'a izin veriyor.

### Yapılacaklar

- [ ] **AI tarayıcılarını genişlet** — `robots.txt`'e ekle: `ClaudeBot`, `anthropic-ai`, `PerplexityBot`, `Google-Extended`, `Bingbot`, `Applebot-Extended`, `CCBot`
- [ ] **`llms.txt`'i blog ile birlikte büyüt** — her yeni pillar sayfası oraya da girsin
- [ ] **Alıntılanabilir paragraflar** — her yazıda "X nedir?" sorusuna 40-60 kelimelik net, tek paragraflık cevap. AI motorları bunu birebir alıntılar.
- [ ] **Sayısal kesinlik** — "ROT 2026'da %30, kişi başı yıllık tavan 50 000 kr, ROT+RUT ortak tavan 75 000 kr". AI modelleri belirsiz ifade yerine kesin sayıyı alıntılar.
- [ ] **Terim sözlüğü** (`/ordlista/`) — OCR-nummer, bankgiro, F-skatt, kreditfaktura, dröjsmålsränta... Her terim ayrı URL. Sözlük sayfaları AI alıntılarında aşırı etkili.
- [ ] **Marka bahsi (brand mention)** — Reddit r/sweden, Flashback ekonomi, Facebook "Egenföretagare Sverige" grupları. AI modelleri bu kaynakları okuyor.

---

## 7. Link kurma (backlink)

| Taktik | Çaba | Etki | Not |
|---|---|---|---|
| Karşılaştırma sitelerine girmek | Düşük | **Yüksek** | Bölüm 1'deki 7 site — hemen başla |
| İsveç girişim dizinleri | Düşük | Orta | allabolag, startup-dizinleri |
| Muhasebe bürosu ortaklıkları | Orta | **Yüksek** | Hem link hem müşteri |
| Konuk yazı (ekonomi blogları) | Orta | Orta | |
| Özgün veri/araştırma yayını | Yüksek | **Çok yüksek** | Basın linki çeker |
| Ücretsiz araç (ROT hesaplayıcı) | Orta | **Yüksek** | Doğal link mıknatısı |

> **Hemen yapılabilir:** `/verktyg/rot-kalkylator` — ücretsiz ROT/RUT hesaplayıcı. Kodu zaten var (fatura motorunda). Hem link çeker hem üst huni trafiği getirir.

---

## 8. Faz planı

### Faz 1 — Temel (hafta 1-4)
- Mobil performans düzeltmesini deploy et, skoru doğrula
- `/priser` ayrı sayfa
- `/funktioner/*` 7 sayfa
- Schema: SoftwareApplication, Product, FAQPage
- OG görseli üret, `NEXT_PUBLIC_SITE_URL` düzelt
- Sitemap otomatik üretim

### Faz 2 — İçerik motoru (hafta 5-12)
- `/for/*` segment sayfaları (önce egenföretagare, redovisningsbyrå, hantverkare)
- Blog Faz 1 (8 yazı) — haftada 1
- `/jamfor/bokio-alternativ` ve `/jamfor/zervant-alternativ`
- Karşılaştırma sitelerine ulaşım kampanyası

### Faz 3 — Ölçekleme (hafta 13-24)
- Blog Faz 2 + 3 (meslek sayfaları)
- ROT hesaplayıcı aracı
- Terim sözlüğü
- Büro dizini (şehir bazlı, gerçek içerikle)
- Backlink kampanyası

### Faz 4 — Otorite (ay 7-12)
- Özgün araştırma/anket
- Yıllık güncellenen referans sayfaları
- PR ve basın
- Dönüşüm optimizasyonu

---

## 9. Hedefler

| Ölçüm | Şimdi | 3 ay | 6 ay | 12 ay |
|---|---|---|---|---|
| İndekslenen sayfa | 1 | 35 | 80 | 150 |
| GSC gösterim/ay | 0 | 3 000 | 20 000 | 80 000 |
| Organik tıklama/ay | 0 | 150 | 1 200 | 5 000 |
| İlk 10'daki sorgu | 0 | 10 | 60 | 200 |
| Organik kayıt/ay | 0 | 10 | 70 | 300 |

> Bu sayılar sektör dönüşüm oranlarından türetilmiş **tahmindir**, garanti değildir. Gerçek veri biriktikçe (haftalık rapor) düzeltilecek.

---

## 10. Dürüst risk notları

1. **Hiç veri yok.** Property 1 günlük. İlk 4-6 hafta sıralama beklemek gerçekçi değil; yeni alan adları için Google'ın değerlendirme süresi var.
2. **Anahtar kelime hacmi doğrulanmadı.** Google Ads Keyword Planner erişimi yok (Ads hesabı + developer token gerekiyor). Öneriler SERP yapısı ve pazar analizine dayanıyor, gerçek hacim verisine değil. İstersen Ads hesabı bağlayıp doğrularım.
3. **İçerik üretimi darboğaz.** Haftada 1 kaliteli İsveççe yazı ciddi iş. Bunu ben üretebilirim ama **İsveççe dil kalitesi ve vergi mevzuatı doğruluğu mutlaka bir insan tarafından kontrol edilmeli** — yanlış ROT bilgisi vermek itibar ve hukuki risk taşır.
4. **Şehir sayfalarına şablonla girmek zarar verir.** Bölüm 4'teki uyarıya dikkat.
