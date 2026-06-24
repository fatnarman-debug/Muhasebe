import Link from "next/link";

const features = [
  { title: "Rol Hiyerarşisi", desc: "Süper Admin, Dükkan Yetkilisi ve Muhasebeci — üç katmanlı erişim kontrolü." },
  { title: "Müşteri Atama", desc: "Her müşteriyi istediğiniz muhasebeciye atayın, dilediğiniz zaman değiştirin." },
  { title: "10+ Fatura Şablonu", desc: "Klasik ve modern tasarımlar — müşteri oluşturulurken bir kez seçilir, sonrası otomatik." },
  { title: "PDF İndir & E-posta", desc: "Önizleme, PDF indirme, düzenleme veya direkt e-posta gönderimi." },
  { title: "Güvenli Erişim", desc: "Her muhasebeci yalnızca kendi müşterilerini görür. Veri izolasyonu tam anlamıyla uygulanır." },
  { title: "Taslak Yönetimi", desc: "Taslak faturalarda Önizleme ve Düzenle aktif. Gönderildikten sonra tüm seçenekler açılır." },
];

const steps = [
  { step: "01", title: "Kaydolun", desc: "Dükkan hesabınızı oluşturun, birkaç saniye." },
  { step: "02", title: "Muhasebeci ekleyin", desc: "E-posta ve benzersiz kodlarını belirleyin." },
  { step: "03", title: "Müşteri atayın", desc: "Her müşteriyi uygun muhasebeciye bağlayın." },
  { step: "04", title: "Fatura kestirin", desc: "Muhasebeciler şablona göre fatura oluşturup gönderir." },
];

const plans = [
  {
    name: "Başlangıç", price: "Ücretsiz", period: "",
    features: ["2 muhasebeci", "25 müşteri", "Temel şablonlar", "PDF indirme"],
    cta: "Başlayın", highlight: false,
  },
  {
    name: "Profesyonel", price: "₺490", period: "/ay",
    features: ["Sınırsız muhasebeci", "Sınırsız müşteri", "10 şablon", "E-mail gönderim", "Öncelikli destek"],
    cta: "Ücretsiz Deneyin", highlight: true,
  },
  {
    name: "Kurumsal", price: "Görüşelim", period: "",
    features: ["Özel entegrasyon", "SLA garantisi", "Özel şablonlar", "Eğitim & onboarding"],
    cta: "İletişime Geçin", highlight: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-bold text-slate-900 text-lg">LedgerFlow</span>
          <div className="hidden md:flex items-center gap-7 text-sm text-slate-500">
            <a href="#ozellikler" className="hover:text-slate-900 transition-colors">Özellikler</a>
            <a href="#nasil-calisir" className="hover:text-slate-900 transition-colors">Nasıl Çalışır</a>
            <a href="#fiyatlar" className="hover:text-slate-900 transition-colors">Fiyatlar</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors hidden sm:block">
              Giriş Yap
            </Link>
            <Link href="/auth/register" className="bg-slate-950 hover:bg-slate-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              Ücretsiz Başla
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-100 px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
          Muhasebe büroları için tasarlandı
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-slate-950 leading-tight tracking-tight mb-6">
          Fatura işlerini<br />
          <span className="text-teal-700">hızlı bitirin.</span>
        </h1>
        <p className="text-xl text-slate-500 leading-relaxed mb-8 max-w-xl">
          Muhasebecilerinize müşteri atayın, fatura şablonları belirleyin, PDF gönderin. Hepsi tek panelden.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/auth/register" className="inline-flex items-center justify-center gap-2 bg-slate-950 hover:bg-slate-800 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors">
            Hemen Deneyin — Ücretsiz
          </Link>
          <Link href="/auth/login" className="inline-flex items-center justify-center gap-2 text-slate-700 border border-slate-200 hover:bg-slate-50 font-medium px-6 py-3.5 rounded-xl transition-colors">
            Giriş Yap
          </Link>
        </div>
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-sm">
          <div className="border-l-2 border-teal-700 pl-4">
            <div className="text-2xl font-black text-slate-900">10+</div>
            <div className="text-xs text-slate-400 mt-0.5">Fatura şablonu</div>
          </div>
          <div className="border-l-2 border-teal-700 pl-4">
            <div className="text-2xl font-black text-slate-900">3</div>
            <div className="text-xs text-slate-400 mt-0.5">Rol seviyesi</div>
          </div>
          <div className="border-l-2 border-teal-700 pl-4">
            <div className="text-2xl font-black text-slate-900">PDF</div>
            <div className="text-xs text-slate-400 mt-0.5">Anında çıktı</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="ozellikler" className="bg-slate-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Muhasebe büronuzu organize edin</h2>
          <p className="text-slate-500 text-lg mb-12 max-w-xl">Yetkili panelinden muhasebecilerinizi yönetin, müşteri atamalarını güncel tutun.</p>
          <div className="grid md:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="bg-white border border-slate-200 rounded-2xl p-6">
                <div className="w-2 h-2 rounded-full bg-teal-500 mb-4"></div>
                <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="nasil-calisir" className="py-24 max-w-6xl mx-auto px-6">
        <h2 className="text-4xl font-black text-slate-900 mb-14 tracking-tight">Nasıl çalışır?</h2>
        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((s) => (
            <div key={s.step}>
              <div className="text-5xl font-black text-slate-100 mb-3 leading-none select-none">{s.step}</div>
              <h3 className="font-bold text-slate-900 mb-1.5">{s.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="fiyatlar" className="bg-slate-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Şeffaf fiyatlandırma</h2>
          <p className="text-slate-500 text-lg mb-12">Büyüdükçe ölçeklendirin, kullanmadıkça ödemez.</p>
          <div className="grid md:grid-cols-3 gap-5 max-w-4xl">
            {plans.map((p) => (
              <div key={p.name} className={`rounded-2xl border p-7 ${p.highlight ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200"}`}>
                <div className={`text-xs font-semibold uppercase tracking-widest mb-3 ${p.highlight ? "text-teal-400" : "text-slate-400"}`}>{p.name}</div>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className={`text-3xl font-black ${p.highlight ? "text-white" : "text-slate-900"}`}>{p.price}</span>
                  {p.period && <span className="text-sm text-slate-400">{p.period}</span>}
                </div>
                <ul className="space-y-2.5 mb-7">
                  {p.features.map((f) => (
                    <li key={f} className={`text-sm flex items-start gap-2 ${p.highlight ? "text-slate-300" : "text-slate-600"}`}>
                      <span className="text-teal-500 font-bold mt-0.5">✓</span>{f}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/register"
                  className={`block text-center text-sm font-semibold py-2.5 rounded-xl transition-colors ${
                    p.highlight ? "bg-teal-600 hover:bg-teal-700 text-white" : "border border-slate-200 hover:bg-slate-50 text-slate-700"
                  }`}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 text-center">
        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Büronuzu dijitalleştirin</h2>
        <p className="text-slate-500 text-lg mb-8 max-w-sm mx-auto">Kurulum 5 dakika. Muhasebecileriniz yarın sabah sisteme girebilir.</p>
        <Link href="/auth/register" className="inline-flex items-center gap-2 bg-slate-950 hover:bg-slate-800 text-white font-semibold px-8 py-4 rounded-xl transition-colors text-base">
          Ücretsiz Hesap Oluşturun
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <span className="font-semibold text-slate-700">LedgerFlow</span>
          <span>© 2026 LedgerFlow. Tüm hakları saklıdır.</span>
          <div className="flex gap-5">
            <a href="#" className="hover:text-slate-700 transition-colors">Gizlilik</a>
            <a href="#" className="hover:text-slate-700 transition-colors">Kullanım Koşulları</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
