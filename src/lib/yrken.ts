/**
 * Yrkessidor under /for/[yrke].
 *
 * VIKTIGT: varje yrke maste ha eget, verkligt innehall – egna fakturarader,
 * egna utmaningar och egna fragor. Kopiera INTE en post och byt bara namn.
 * Tunna, nastan identiska sidor rankar inte och riskerar att klassas som
 * doorway pages. Hellre 15 riktiga sidor an 85 tomma.
 */

export type Avdrag = "rot" | "rut" | null;
export type KategoriId = "bygg" | "hem" | "halsa" | "kreativt" | "konsult";

/** Visningsordning pa hubbsidan /for. */
export const kategorier: { id: KategoriId; namn: string; ingress: string }[] = [
  { id: "bygg", namn: "Bygg & hantverk", ingress: "ROT-avdrag räknas ut automatiskt på arbetskostnaden." },
  { id: "hem", namn: "Hem & trädgård", ingress: "RUT-avdrag med 50 procent på arbetet." },
  { id: "halsa", namn: "Skönhet & hälsa", ingress: "Återkommande fakturor, klippkort och företagsavtal." },
  { id: "kreativt", namn: "Kreativt & digitalt", ingress: "Projekt, delbetalningar, licenser och utlägg." },
  { id: "konsult", namn: "Konsult & rådgivning", ingress: "Timmar, fast pris och specifikation som kunden kräver." },
];

export type Yrke = {
  slug: string;
  /** Plural, som i "Fakturaprogram för snickare". */
  namn: string;
  /** Singular bestamd form, som i "Som snickaren ...". Anvands i brodtext. */
  singular: string;
  avdrag: Avdrag;
  kategori: KategoriId;
  /** Metabeskrivning, max ~155 tecken. */
  meta: string;
  /** Ingress – ska beskriva yrkets faktiska fakturavardag, inte produkten. */
  lead: string;
  /** Typiska rader pa en faktura i yrket. Detta ar det mest yrkesspecifika. */
  fakturarader: string[];
  /** Konkreta problem i yrkets fakturering. */
  utmaningar: { t: string; d: string }[];
  /** Yrkesspecifika fragor (utover de gemensamma ROT/RUT-fragorna). */
  faq: { q: string; a: string }[];
  relaterade: string[];
};

export const yrken: Yrke[] = [
  /* ───────── ROT – bygg & hantverk ───────── */
  {
    slug: "snickare",
    namn: "snickare",
    singular: "snickaren",
    kategori: "bygg",
    avdrag: "rot",
    meta: "Fakturaprogram för snickare med automatiskt ROT-avdrag. Dela arbete och material, skicka offert som blir faktura. 14 dagar gratis.",
    lead: "Som snickare blandas arbete och material på nästan varje faktura – och det är bara arbetet som ger ROT-avdrag. Håller du ihop dem på samma rad blir avdraget fel och Skatteverket kan avslå begäran.",
    fakturarader: ["Arbetstid snickeri (tim)", "Virke och byggmaterial", "Spik, skruv och förbrukning", "Bortforsling av byggavfall", "Framkörning"],
    utmaningar: [
      { t: "Material och arbete på samma rad", d: "Skriver du \"Montering inkl. virke\" vet varken du eller Skatteverket vad avdraget ska räknas på. Håll raderna isär från början." },
      { t: "Offerten ändras under jobbet", d: "Kunden lägger till en vägg. Utan att uppdatera underlaget stämmer inte slutfakturan mot offerten – och diskussionen hamnar hos dig." },
      { t: "Fakturan skrivs på kvällen", d: "Jobbet blir klart klockan tre, fakturan skrivs halv nio. Varje dag du väntar är en dag längre till betalning." },
    ],
    faq: [
      { q: "Ger bortforsling av byggavfall ROT-avdrag?", a: "Nej. Bortforsling, deponiavgifter och transport räknas inte som ROT-berättigat arbete. Det är själva arbetet på bostaden som ger avdrag – ta upp bortforsling som en egen rad utan avdrag." },
      { q: "Kan jag fakturera löpande under ett långt bygge?", a: "Ja, och det är ofta klokt vid större jobb. Dela upp i delfakturor allt eftersom moment blir klara. Varje faktura får sitt eget ROT-underlag, så kunden kan begära avdrag löpande." },
      { q: "Vad gäller om kunderna är två som äger bostaden tillsammans?", a: "Taket är personligt, så två ägare har varsitt. Det betyder upp till 100 000 kronor i ROT-avdrag för ett och samma kök- eller badrumsjobb, i stället för 50 000. Fördela då fakturan på båda personerna – står hela beloppet på en av dem går den andres utrymme förlorat." },
    ],
    relaterade: ["malare", "plattsattare", "golvlaggare"],
  },
  {
    slug: "elektriker",
    namn: "elektriker",
    singular: "elektrikern",
    kategori: "bygg",
    avdrag: "rot",
    meta: "Fakturaprogram för elektriker med ROT-avdrag som räknas ut automatiskt. Separera arbete och materiel, fakturera från bilen. Testa gratis.",
    lead: "Elinstallationer går ofta fort men har mycket materiel: kabel, dosor, centraler, brytare. Avdraget gäller bara arbetet, och felposterad materiel är den vanligaste orsaken till att ett ROT-underlag inte godkänns.",
    fakturarader: ["Arbetstid elinstallation (tim)", "Kabel och förläggningsmateriel", "Centraler, automatsäkringar och jordfelsbrytare", "Uttag, brytare och dosor", "Felsökning (tim)"],
    utmaningar: [
      { t: "Mycket materiel per jobb", d: "Ett enkelt uttagsbyte kan ha tio materielrader. Utan tydlig uppdelning blir ROT-underlaget en gissning." },
      { t: "Jour och akutjobb", d: "Utryckning kvällstid faktureras med annan timtaxa. Blandas de ihop med ordinarie tid blir både avdrag och fakturan otydlig." },
      { t: "Många små jobb på en dag", d: "Fem kunder, fem fakturor. Skrivs de i efterhand hamnar fel adress eller fel timmar på fel kund." },
    ],
    faq: [
      { q: "Ger felsökning ROT-avdrag?", a: "Ja, felsökning och reparation av elinstallationer i bostaden är ROT-berättigat arbete. Det är arbetstiden som ger avdrag – den materiel som byts ut gör det inte." },
      { q: "Hur fakturerar jag utryckning utanför ordinarie tid?", a: "Lägg utryckningen som en egen rad med sin egen timtaxa, skild från ordinarie arbetstid. Båda raderna är arbetskostnad och ger ROT-avdrag, men kunden ser tydligt vad som är vad." },
    ],
    relaterade: ["rormokare", "snickare", "vvs-montor"],
  },
  {
    slug: "malare",
    namn: "målare",
    singular: "målaren",
    kategori: "bygg",
    avdrag: "rot",
    meta: "Fakturaprogram för målare med automatiskt ROT-avdrag. Håll färg och arbete isär, skicka offert och faktura från mobilen. 14 dagar gratis.",
    lead: "Måleri är arbetsintensivt – ofta är arbetskostnaden den största delen av fakturan. Det gör ROT-avdraget extra värt för kunden, och extra viktigt att det räknas rätt.",
    fakturarader: ["Målningsarbete (tim eller kvm)", "Färg och grundfärg", "Spackel och slipmaterial", "Täckmaterial och maskeringstejp", "Uppställning av ställning"],
    utmaningar: [
      { t: "Pris per kvadratmeter", d: "Många målare prissätter per kvm, inte per timme. Underlaget måste ändå visa vad som är arbete för att ROT-avdraget ska bli rätt." },
      { t: "Färgen köps åt kunden", d: "Lägger du ut för färg ska den faktureras vidare – men utan avdrag. Blandas den in i arbetspriset blir avdraget för högt." },
      { t: "Offert långt före jobbet", d: "Målarjobb bokas ofta månader i förväg. Är offerten från 2025 kan den ha räknats med 50 % ROT – nu gäller 30 %." },
    ],
    faq: [
      { q: "Ger tapetsering ROT-avdrag?", a: "Ja, tapetsering i bostaden räknas som ROT-berättigat arbete. Som alltid gäller avdraget bara arbetskostnaden – tapeten och limmet gör det inte." },
      { q: "Hur gör jag när jag prissätter per kvadratmeter?", a: "Ange kvadratmeterpriset som arbetskostnad på en egen rad och materialet separat. Avdraget räknas på arbetsraden oavsett om den är satt per timme eller per kvm." },
    ],
    relaterade: ["snickare", "golvlaggare", "plattsattare"],
  },
  {
    slug: "rormokare",
    namn: "rörmokare",
    singular: "rörmokaren",
    kategori: "bygg",
    avdrag: "rot",
    meta: "Fakturaprogram för rörmokare och VVS med ROT-avdrag automatiskt. Separera arbete och material, fakturera direkt efter jobbet.",
    lead: "VVS-jobb är ofta akuta och sällan planerade. Ett läckage ska åtgärdas idag – men fakturan med rätt ROT-underlag ska ändå bli korrekt, även när den skrivs i bilen på väg till nästa kund.",
    fakturarader: ["Arbetstid VVS (tim)", "Rör, kopplingar och fittings", "Blandare, WC och sanitetsporslin", "Utryckning och framkörning", "Jourtillägg"],
    utmaningar: [
      { t: "Akutjobb utan offert", d: "Vid läckage finns ingen offert att utgå från. Allt måste dokumenteras på plats, annars blir fakturan en efterhandskonstruktion." },
      { t: "Dyra enskilda produkter", d: "En blandare kan kosta mer än arbetstiden. Hamnar den i arbetsraden blir ROT-avdraget felaktigt högt – och underlaget underkänt." },
      { t: "Framkörning räknas inte", d: "Resor och framkörning ger inget ROT-avdrag, men faktureras ändå. De måste ligga på egen rad." },
    ],
    faq: [
      { q: "Ger stambyte ROT-avdrag?", a: "Ja, stambyte i en bostad som du äger är ROT-berättigat. I en bostadsrätt gäller avdraget bara arbete inom lägenheten – arbete i föreningens gemensamma stammar bekostas av föreningen och ger inte kunden avdrag." },
      { q: "Ger jourutryckning på helgen ROT-avdrag?", a: "Arbetstiden ger avdrag, även med jourtillägg. Själva framkörningen och resan gör det inte – lägg den som en separat rad utan avdrag." },
    ],
    relaterade: ["elektriker", "plattsattare", "snickare"],
  },
  {
    slug: "plattsattare",
    namn: "plattsättare",
    singular: "plattsättaren",
    kategori: "bygg",
    avdrag: "rot",
    meta: "Fakturaprogram för plattsättare med ROT-avdrag automatiskt. Håll kakel och arbete isär på fakturan. Offert till faktura med ett klick.",
    lead: "Badrumsrenovering är ett av de vanligaste ROT-jobben – och ett av de dyraste. Kunden räknar med avdraget redan i offerten, så underlaget måste hålla hela vägen fram till Skatteverket.",
    fakturarader: ["Plattsättningsarbete (tim eller kvm)", "Kakel och klinker", "Fix, fog och tätskikt", "Rivning av befintligt ytskikt", "Containerhyra och bortforsling"],
    utmaningar: [
      { t: "Stora belopp, stort avdrag", d: "Ett badrum kan slå i ROT-taket på 50 000 kr. Når kunden taket faller resten tillbaka på kunden – fråga innan jobbet börjar." },
      { t: "Tätskikt kräver dokumentation", d: "Våtrumsintyg och branschregler ska följa jobbet. Fakturan är ofta det underlag kunden sparar – gör den tydlig." },
      { t: "Rivning och nybygge blandas", d: "Rivning är arbete och ger avdrag. Container och deponi gör det inte, trots att de ofta dyker upp på samma faktura." },
    ],
    faq: [
      { q: "Ger rivning av gammalt badrum ROT-avdrag?", a: "Ja, rivningsarbetet är ROT-berättigat eftersom det är arbete på bostaden. Containerhyra, deponiavgift och bortforsling ger däremot inget avdrag och ska redovisas separat." },
      { q: "Vad händer om kundens ROT-tak tar slut mitt i jobbet?", a: "Taket är personligt och gäller per kalenderår. Räcker det inte till betalar kunden hela arbetskostnaden för den överskjutande delen. Vid större badrum är det klokt att stämma av utrymmet med kunden innan start, och att dokumentera svaret." },
    ],
    relaterade: ["rormokare", "golvlaggare", "malare"],
  },
  {
    slug: "golvlaggare",
    namn: "golvläggare",
    singular: "golvläggaren",
    kategori: "bygg",
    avdrag: "rot",
    meta: "Fakturaprogram för golvläggare med automatiskt ROT-avdrag. Separera golvmaterial och läggning på fakturan. Testa gratis i 14 dagar.",
    lead: "Golvläggning prissätts nästan alltid per kvadratmeter, och materialet står ofta för mer än halva fakturan. Just därför är uppdelningen mellan material och arbete avgörande för att ROT-avdraget ska bli rätt.",
    fakturarader: ["Läggningsarbete (kvm)", "Parkett, vinyl eller laminat", "Underlagsmaterial och foam", "Golvlister och trösklar", "Rivning av befintligt golv"],
    utmaningar: [
      { t: "Kvadratmeterpris som inkluderar allt", d: "Ett pris \"inklusive material\" omöjliggör ett korrekt ROT-underlag. Avdraget måste kunna räknas på enbart arbetet." },
      { t: "Spill och överblivet material", d: "Beställt material som inte går åt ska ändå faktureras. Det hör hemma på materialraden, inte i arbetet." },
      { t: "Underarbete tar oväntat tid", d: "Ett ojämnt undergolv kräver spackling som inte fanns i offerten. Ändringen måste nå fakturan, annars äter den din marginal." },
    ],
    faq: [
      { q: "Ger slipning av befintligt trägolv ROT-avdrag?", a: "Ja, golvslipning och ytbehandling i bostaden är ROT-berättigat arbete. Lack, olja och slipmaterial räknas som material och ger inget avdrag." },
      { q: "Hur redovisar jag spillmaterial?", a: "Fakturera det som material på materialraden. Spill ger aldrig ROT-avdrag, eftersom avdraget bara gäller arbetskostnaden." },
    ],
    relaterade: ["plattsattare", "snickare", "malare"],
  },

  {
    slug: "murare",
    namn: "murare",
    singular: "muraren",
    kategori: "bygg",
    avdrag: "rot",
    meta: "Fakturaprogram för murare med automatiskt ROT-avdrag. Håll tegel, bruk och arbete isär på fakturan. Offert som blir faktura. 14 dagar gratis.",
    lead: "Murningsjobb har tung materialandel – tegel, bruk och puts väger ofta mer än arbetstiden i kronor. Just därför blir ROT-underlaget fel så fort material och arbete hamnar på samma rad.",
    fakturarader: ["Murningsarbete (tim)", "Tegel, block och sten", "Bruk, puts och cement", "Ställning och uppställning", "Bortforsling av rivningsmassa"],
    utmaningar: [
      { t: "Material kan överstiga arbetet", d: "Ett fasadjobb kan ha mer tegel än timmar i kronor räknat. Hamnar materialet i arbetsraden blir avdraget långt för högt och underlaget underkänns." },
      { t: "Väder stoppar jobbet", d: "Bruk härdar inte i minusgrader. Jobb som drar ut över månadsskiften gör att delfakturor behövs – och att kundens avdragsår kan flyttas." },
      { t: "Skorsten eller fasad", d: "Arbete på bostaden ger avdrag. Mur i trädgården eller fristående konstruktioner gör det normalt inte. Gränsen ska synas redan i offerten." },
    ],
    faq: [
      { q: "Ger skorstensrenovering ROT-avdrag?", a: "Ja, renovering av skorsten på bostaden räknas som ROT-berättigat arbete. Som alltid gäller avdraget bara arbetskostnaden – tegel, bruk och insatsrör är material och ger inget avdrag." },
      { q: "Ger murning av trädgårdsmur avdrag?", a: "Normalt inte. ROT gäller arbete på bostaden, och en fristående mur eller stödmur i trädgården räknas vanligtvis inte dit. Är du osäker på ett enskilt jobb, stäm av med Skatteverket innan du lovar kunden avdrag." },
    ],
    relaterade: ["plattsattare", "takmontor", "snickare"],
  },
  {
    slug: "takmontor",
    namn: "takmontörer",
    singular: "takmontören",
    kategori: "bygg",
    avdrag: "rot",
    meta: "Fakturaprogram för takläggare och takmontörer. ROT räknas på arbetet – inte på pannor, plåt eller ställning. Offert, faktura och påminnelser.",
    lead: "Vid ett takbyte utgör arbetet ofta 40–60 procent av totalpriset. Resten är pannor, plåt, papp och ställning – som inte ger något avdrag alls. Kunden räknar nästan alltid med ROT redan i offerten, så uppdelningen måste hålla hela vägen.",
    fakturarader: ["Takläggningsarbete (tim eller kvm)", "Takpannor, plåt och papp", "Läkt, underlagsduk och beslag", "Ställning: montering och demontering", "Ställningshyra (ingen avdragsrätt)"],
    utmaningar: [
      { t: "Ställning: montering ja, hyra nej", d: "Att montera och demontera ställningen är arbete och ger avdrag. Själva hyran av ställningsmaterialet gör det inte. Två rader, inte en." },
      { t: "Stora belopp slår i taket", d: "Ett takbyte kan ensamt fylla kundens ROT-tak på 50 000 kr. Är kunderna två ägare finns dubbelt utrymme – men bara om fakturan fördelas på båda." },
      { t: "Vädret flyttar jobbet", d: "Ett jobb som skjuts från december till januari byter avdragsår för kunden, eftersom betalningsdatumet styr. Det kan avgöra om avdraget ryms eller inte." },
    ],
    faq: [
      { q: "Ger byggställning ROT-avdrag vid takbyte?", a: "Arbetet med att montera och demontera ställningen ger avdrag, eftersom det är arbete. Hyran av själva ställningsmaterialet ger inget avdrag. Dela därför upp dem på separata rader – annars blir hela posten ifrågasatt." },
      { q: "Hur stor del av ett takbyte ger avdrag?", a: "Bara arbetskostnaden, som vid takbyten ofta ligger runt 40–60 procent av totalpriset. Pannor, plåt, papp, läkt och ställningshyra ger inget avdrag. Andelen varierar med takets typ och materialval, så räkna på det enskilda jobbet i stället för att utgå från en tumregel." },
    ],
    relaterade: ["stallningsbyggare", "murare", "snickare"],
  },
  {
    slug: "glasmastare",
    namn: "glasmästare",
    singular: "glasmästaren",
    kategori: "bygg",
    avdrag: "rot",
    meta: "Fakturaprogram för glasmästare. ROT på arbetet vid fönsterbyte – och tydlig hantering när jobbet är ett försäkringsärende. Testa gratis.",
    lead: "Glasmästeri rör sig mellan två helt olika fakturor: planerade fönsterbyten där kunden vill ha ROT, och akuta glasskador som går via försäkringsbolaget. De ska inte faktureras likadant – och de får inte blandas ihop.",
    fakturarader: ["Glasmästeriarbete (tim)", "Isolerglas, energiglas eller säkerhetsglas", "Karm, beslag och tätlister", "Utryckning vid akut skada", "Försäkringsärende: självrisk"],
    utmaningar: [
      { t: "Försäkring och ROT går inte ihop", d: "Får kunden ersättning från försäkringsbolaget för samma arbete kan ROT-avdrag inte användas för den delen. Blandas de ihop blir det återkrav." },
      { t: "Akutjobb utan offert", d: "En krossad ruta ska åtgärdas samma dag. Allt måste dokumenteras på plats, annars blir fakturan en efterhandskonstruktion." },
      { t: "Glaset kostar mer än timmen", d: "Energiglas och säkerhetsglas är dyra poster. Hamnar de i arbetsraden blir avdraget felaktigt högt." },
    ],
    faq: [
      { q: "Kan kunden få ROT-avdrag när försäkringen betalar?", a: "Nej, inte för den del som försäkringen ersätter. ROT-avdrag kan inte kombineras med försäkringsersättning för samma arbete. Är en del av jobbet utanför försäkringen – till exempel ett uppgraderat glas kunden själv väljer – kan den delen hanteras separat. Håll de två delarna isär på fakturan." },
      { q: "Ger fönsterbyte ROT-avdrag?", a: "Ja, arbetet med att byta fönster i bostaden är ROT-berättigat. Själva fönstret, glaset och karmen är material och ger inget avdrag. Vid fasta priser per fönster måste arbetsdelen framgå separat för att avdraget ska kunna räknas." },
    ],
    relaterade: ["snickare", "malare", "takmontor"],
  },
  {
    slug: "stallningsbyggare",
    namn: "ställningsbyggare",
    singular: "ställningsbyggaren",
    kategori: "bygg",
    avdrag: "rot",
    meta: "Fakturaprogram för ställningsbyggare. Montering och demontering ger ROT-avdrag – hyran gör det inte. Separera raderna automatiskt.",
    lead: "Ställningsbranschen har en gräns som är lätt att missa på fakturan: arbetet med att montera och demontera ställningen ger ROT-avdrag, men hyran av materialet gör det inte. Står allt på en rad blir hela posten ifrågasatt.",
    fakturarader: ["Montering av ställning (tim)", "Demontering (tim)", "Ställningshyra per vecka (ingen avdragsrätt)", "Väderskydd och inplastning", "Transport och etablering"],
    utmaningar: [
      { t: "Hyra och arbete på samma rad", d: "Den vanligaste orsaken till underkänt underlag i branschen. Hyran är inte arbete och ger aldrig avdrag, hur länge ställningen än står." },
      { t: "Hyrestiden är rörlig", d: "Jobbet drar ut, ställningen står kvar. Löpande hyresdebitering måste framgå tydligt, annars blir slutfakturan en överraskning." },
      { t: "Du är underentreprenör", d: "Står ställningen åt en takläggare är det ofta den entreprenören som fakturerar kunden. Då är ditt ROT-underlag deras problem – men dina rader måste ändå vara korrekta." },
    ],
    faq: [
      { q: "Ger byggställning ROT-avdrag?", a: "Arbetet med montering och demontering ger ROT-avdrag med 30 procent, eftersom det är arbete utfört på bostaden. Hyran av ställningsmaterialet ger inget avdrag. Redovisa dem därför alltid på separata rader på fakturan." },
      { q: "Hur fakturerar jag när hyrestiden förlängs?", a: "Ange hyran som en egen rad med antal veckor och veckopris, så räknas summan ut automatiskt när perioden ändras. Vid långa jobb är det ofta tydligare att delfakturera hyran löpande än att lägga hela beloppet på slutfakturan." },
    ],
    relaterade: ["takmontor", "malare", "murare"],
  },

  /* ───────── RUT – hem & trädgård ───────── */
  {
    slug: "tradgardsmastare",
    namn: "trädgårdsmästare",
    singular: "trädgårdsmästaren",
    kategori: "hem",
    avdrag: "rut",
    meta: "Fakturaprogram för trädgårdsmästare med RUT-avdrag automatiskt. 50 % på arbetet, växter separat. Fakturera direkt från trädgården.",
    lead: "Trädgårdsarbete ger RUT-avdrag på 50 procent av arbetskostnaden – dubbelt så mycket som ROT. Men gränsen mot vad som räknas är snävare än många tror, och växter ger aldrig avdrag.",
    fakturarader: ["Trädgårdsarbete (tim)", "Häckklippning och beskärning", "Växter, jord och gödsel", "Bortforsling av trädgårdsavfall", "Maskinhyra"],
    utmaningar: [
      { t: "RUT eller inget avdrag alls", d: "Häckklippning och ogräsrensning ger RUT. Anläggning av ny trädgård gör det normalt inte. Gränsen måste synas redan i offerten." },
      { t: "Säsongsarbete i korta pass", d: "Två timmar här, tre där. Många små jobb blir många små fakturor – skrivs de i klump i efterhand blir det fel." },
      { t: "Växter är inte arbete", d: "Plantor, jord och gödsel är material och ger aldrig avdrag, hur mycket arbete som än ingår i planteringen." },
    ],
    faq: [
      { q: "Vilket trädgårdsarbete ger RUT-avdrag?", a: "Löpande skötsel ger RUT: häckklippning, gräsklippning, ogräsrensning, beskärning, krattning och snöskottning. Nyanläggning, till exempel att anlägga en helt ny gräsmatta eller stenläggning, räknas normalt inte som RUT-berättigat." },
      { q: "Ger bortforsling av trädgårdsavfall RUT-avdrag?", a: "Själva arbetet med att samla ihop avfallet ger avdrag, men transport och deponiavgift gör det inte. Dela upp dem på separata rader så blir underlaget korrekt." },
    ],
    relaterade: ["snickare", "malare"],
  },

  /* ───────── Skönhet & hälsa ───────── */
  {
    slug: "frisor",
    namn: "frisörer",
    singular: "frisören",
    kategori: "halsa",
    avdrag: null,
    meta: "Fakturaprogram för frisörer och salonger. Fakturera företagskunder, hyr stol eller driv eget – offert, faktura och påminnelser på svenska.",
    lead: "De flesta klippningar betalas i kassan, men inte alla. Stolshyra, företagskunder, bröllop och fotojobb ska faktureras – och då behövs en riktig faktura med F-skatt och korrekt moms, inte ett kvitto.",
    fakturarader: ["Klippning och styling", "Färgning och behandling", "Stolshyra (per månad)", "Uppdrag på plats, t.ex. bröllop", "Produkter"],
    utmaningar: [
      { t: "Stolshyra varje månad", d: "Hyr du ut stolar ska samma faktura ut varje månad till samma personer. Skrivs den för hand varje gång är det bara en tidsfråga innan en glöms bort." },
      { t: "Företagskunder vill ha faktura", d: "Reklamfotografering, film och event betalar sällan kontant. De kräver faktura med organisationsnummer och betalningsvillkor." },
      { t: "Moms på tjänst och produkt", d: "Behandling och hårvårdsprodukter har båda 25 % moms, men ska ändå redovisas tydligt var för sig på fakturan." },
    ],
    faq: [
      { q: "Ger frisörtjänster RUT-avdrag?", a: "Nej. Hårvård och skönhetsbehandlingar omfattas inte av RUT-avdraget. RUT gäller hushållsnära tjänster som städning, trädgårdsarbete och barnpassning – inte personlig skönhetsvård." },
      { q: "Hur fakturerar jag stolshyra?", a: "Skapa fakturan en gång och använd den som mall varje månad. Lägg hyran som en egen rad med fast belopp och ange tydlig period, till exempel \"Stolshyra mars 2026\"." },
    ],
    relaterade: ["massor", "personlig-tranare"],
  },
  {
    slug: "massor",
    namn: "massörer",
    singular: "massören",
    kategori: "halsa",
    avdrag: null,
    meta: "Fakturaprogram för massörer. Fakturera friskvård, företagsavtal och klippkort – med F-skatt, rätt moms och påminnelser. Testa gratis.",
    lead: "Massage säljs sällan styckvis till privatpersoner som vill ha faktura – men desto oftare som friskvård till företag. Då krävs faktura med organisationsnummer, och ofta ett avtal som löper varje månad.",
    fakturarader: ["Massagebehandling (per tillfälle)", "Klippkort, t.ex. 10 behandlingar", "Friskvårdsavtal företag (per månad)", "Massage på arbetsplats", "Reseersättning"],
    utmaningar: [
      { t: "Friskvårdsbidrag kräver rätt underlag", d: "Kunden ska kunna använda fakturan mot sitt friskvårdsbidrag. Saknas behandlingstyp eller datum får kunden problem – och ringer dig." },
      { t: "Klippkort betalas i förskott", d: "Tio behandlingar betalas nu men utförs under ett halvår. Fakturan ska visa vad som ingår och under vilken period." },
      { t: "Företagsavtal återkommer", d: "Samma företag, samma belopp, varje månad. Det är arbete som inte borde göras om från början varje gång." },
    ],
    faq: [
      { q: "Ger massage RUT-avdrag?", a: "Nej. Massage och kroppsbehandlingar omfattas inte av RUT. Däremot kan massage vara avdragsgill friskvård för kundens arbetsgivare, vilket kräver att fakturan tydligt anger behandling och datum." },
      { q: "Är massage momsbefriad?", a: "Det beror på. Massage som ges av legitimerad vårdpersonal som sjukvård kan vara momsfri, medan friskvårdsmassage normalt har 25 procent moms. Stäm av din verksamhet med Skatteverket – reglerna skiljer sig åt." },
    ],
    relaterade: ["frisor", "personlig-tranare"],
  },
  {
    slug: "personlig-tranare",
    namn: "personliga tränare",
    singular: "tränaren",
    kategori: "halsa",
    avdrag: null,
    meta: "Fakturaprogram för personliga tränare. Fakturera PT-paket, onlinecoaching och företagsavtal med återkommande fakturor och påminnelser.",
    lead: "PT-branschen bygger på paket och abonnemang: tio pass, tre månaders coachning, ett företagsavtal. Det betyder återkommande fakturor till samma personer – och en betalningsuppföljning som annars äter kvällarna.",
    fakturarader: ["PT-pass (styck)", "Träningspaket, t.ex. 10 pass", "Onlinecoaching (per månad)", "Kostrådgivning", "Företagsavtal personalträning"],
    utmaningar: [
      { t: "Paket som sträcker sig över månader", d: "Tio pass betalda i januari, sista passet i maj. Fakturan måste visa vad som ingår och gälla som underlag hela perioden." },
      { t: "Kunder som glömmer betala", d: "Privatkunder betalar sällan sent av ovilja, utan för att fakturan försvinner i inkorgen. En påminnelse löser det – om den går att skicka på tio sekunder." },
      { t: "Friskvårdsbidrag", d: "Många kunder vill använda sitt friskvårdsbidrag. Det kräver en faktura med tydlig beskrivning, inte ett Swish-kvitto." },
    ],
    faq: [
      { q: "Kan kunden använda friskvårdsbidrag för PT?", a: "Ofta ja – personlig träning räknas normalt som friskvård. Kunden behöver en faktura eller ett kvitto som visar vad tjänsten avser, datum och ditt företags uppgifter. Ange därför alltid behandlingstyp och period tydligt." },
      { q: "Hur fakturerar jag ett träningspaket?", a: "Fakturera hela paketet som en rad med antal pass angivet, till exempel \"Träningspaket 10 pass, giltigt t.o.m. 2026-06-30\". Då ser både du och kunden vad som är betalt och hur länge det gäller." },
    ],
    relaterade: ["massor", "frisor"],
  },

  /* ───────── Kreativa & digitala ───────── */
  {
    slug: "fotograf",
    namn: "fotografer",
    singular: "fotografen",
    kategori: "kreativt",
    avdrag: null,
    meta: "Fakturaprogram för fotografer. Offert, förskott och slutfaktura för bröllop, porträtt och företagsuppdrag – med nyttjanderätt på fakturan.",
    lead: "Fotografjobb bokas långt i förväg och betalas i omgångar: boknings­avgift nu, resten efter leverans. Dessutom säljer du inte bara tid utan också rätten att använda bilderna – och det ska framgå av fakturan.",
    fakturarader: ["Fotografering (tim eller paket)", "Efterbearbetning och retusch", "Bokningsavgift / förskott", "Nyttjanderätt och licens", "Resa och logi"],
    utmaningar: [
      { t: "Förskott och slutfaktura", d: "Bokningsavgiften betalas kanske ett år före bröllopet. Slutfakturan måste dra av den – annars fakturerar du dubbelt." },
      { t: "Nyttjanderätt är inte tid", d: "Ett företag som ska använda bilderna i reklam betalar för licensen, inte bara för timmarna. Står det inte på fakturan uppstår diskussionen i efterhand." },
      { t: "Lång väg från jobb till betalning", d: "Fotografering i juni, leverans i juli, betalning i augusti. Utan påminnelser blir det lätt september." },
    ],
    faq: [
      { q: "Hur fakturerar jag bokningsavgift och slutbetalning?", a: "Skicka en första faktura på bokningsavgiften när avtalet skrivs. När jobbet är levererat skickar du slutfakturan på totalbeloppet med en avdragsrad för den redan betalda avgiften, så att det framgår vad som återstår." },
      { q: "Vilken moms gäller för fotografering?", a: "Fotografiska tjänster har normalt 25 procent moms. Försäljning av konstverk i form av fotografier kan i vissa fall ha reducerad moms – de reglerna är snäva, så stäm av din verksamhet med Skatteverket." },
    ],
    relaterade: ["webbdesigner", "oversattare", "konsult"],
  },
  {
    slug: "webbdesigner",
    namn: "webbdesigners",
    singular: "webbdesignern",
    kategori: "kreativt",
    avdrag: null,
    meta: "Fakturaprogram för webbdesigners och frilansutvecklare. Fakturera projekt, löpande timmar och förvaltning – med offert som blir faktura.",
    lead: "Webbprojekt har en tydlig början men sällan ett tydligt slut. Scope växer, förvaltning tillkommer, och det som började som ett fast pris blir löpande timmar. Fakturan måste följa med i den rörelsen.",
    fakturarader: ["Design och UX (tim)", "Utveckling (tim)", "Fast projektpris, delbetalning", "Löpande förvaltning (per månad)", "Domän, hosting och licenser"],
    utmaningar: [
      { t: "Scope creep", d: "\"Kan vi bara lägga till en sida till?\" Utan att det syns på fakturan blir tilläggen gratis arbete." },
      { t: "Fast pris i delbetalningar", d: "Ett projekt på 80 000 kr faktureras sällan i ett svep. Delfakturorna måste hänga ihop så att slutsumman stämmer." },
      { t: "Utlägg för kundens räkning", d: "Domäner, licenser och plugins köps i ditt namn men är kundens kostnad. De ska vidarefaktureras, inte döljas i timpriset." },
    ],
    faq: [
      { q: "Hur fakturerar jag ett projekt i delbetalningar?", a: "Dela upp projektet i tydliga moment – till exempel 40 procent vid start, 40 procent vid designgodkännande och 20 procent vid leverans. Skapa en faktura per moment och hänvisa till offerten, så ser kunden hela bilden." },
      { q: "Ska jag fakturera hosting och domäner vidare?", a: "Ja, om du köper dem för kundens räkning. Lägg dem som egna rader med samma belopp du betalat, eller med ditt påslag om det framgår av avtalet. Att gömma dem i timpriset gör det svårt för kunden att se vad som är löpande kostnader." },
    ],
    relaterade: ["fotograf", "konsult", "oversattare"],
  },
  {
    slug: "oversattare",
    namn: "översättare",
    singular: "översättaren",
    kategori: "kreativt",
    avdrag: null,
    meta: "Fakturaprogram för översättare och tolkar. Fakturera per ord, rad eller timme – till svenska och utländska kunder, med rätt moms.",
    lead: "Översättare fakturerar sällan i timmar. Det blir ord, rader eller tecken – och ofta till kunder i andra länder, där momsreglerna ser helt annorlunda ut än för en svensk kund.",
    fakturarader: ["Översättning (per ord)", "Granskning och korrektur (tim)", "Tolkning (per timme)", "Expressavgift", "Minimidebitering"],
    utmaningar: [
      { t: "Utländska kunder och moms", d: "En kund i ett annat EU-land med giltigt VAT-nummer faktureras utan svensk moms – men det kräver rätt text på fakturan." },
      { t: "Prissättning per ord", d: "Ett pris på 1,20 kr/ord och 4 300 ord ska bli rätt summa utan handräkning – och synas tydligt för kunden." },
      { t: "Många små uppdrag", d: "Fem texter på en vecka till samma byrå. Antingen fem fakturor eller en samlad – men aldrig fem glömda." },
    ],
    faq: [
      { q: "Hur fakturerar jag en kund i ett annat EU-land?", a: "Säljer du till ett företag i ett annat EU-land med giltigt VAT-nummer fakturerar du normalt utan svensk moms enligt reglerna om omvänd betalningsskyldighet. Fakturan ska då innehålla både ditt och kundens VAT-nummer och en hänvisning till att omvänd betalningsskyldighet gäller. Kontrollera alltid kundens VAT-nummer innan du skickar." },
      { q: "Hur sätter jag upp en faktura per ord?", a: "Ange antalet ord som antal och ordpriset som styckpris, så räknas summan ut automatiskt. Kunden ser både volymen och priset per enhet, vilket minskar frågorna i efterhand." },
    ],
    relaterade: ["webbdesigner", "konsult", "fotograf"],
  },

  /* ───────── Konsult & rådgivning ───────── */
  {
    slug: "konsult",
    namn: "konsulter",
    singular: "konsulten",
    kategori: "konsult",
    avdrag: null,
    meta: "Fakturaprogram för konsulter och frilansare. Fakturera löpande timmar, fast pris och utlägg – med F-skatt och påminnelser. Testa gratis.",
    lead: "Konsultfakturering ser enkel ut: timmar gånger timpris. I praktiken tillkommer utlägg, resor, olika timpriser för olika uppdrag och kunder som vill ha specifikation ner på dagnivå.",
    fakturarader: ["Konsultarvode (tim)", "Fast pris per uppdrag", "Resetid", "Utlägg, t.ex. resa och logi", "Milersättning"],
    utmaningar: [
      { t: "Timmar som ska specificeras", d: "Större kunder vill se datum, antal timmar och vad som gjordes. En faktura med bara \"Konsultarvode 42 tim\" skickas tillbaka." },
      { t: "Utlägg utan påslag", d: "Resa och logi faktureras vidare utan vinst. De hör hemma på egna rader, så att både du och kunden ser vad som är arvode och vad som är kostnad." },
      { t: "Långa betalningsvillkor", d: "Stora bolag betalar på 30 eller 60 dagar. Utan påminnelser blir det ofta längre än så." },
    ],
    faq: [
      { q: "Hur detaljerad ska en konsultfaktura vara?", a: "Fakturan måste enligt lag innehålla uppgift om tjänstens omfattning och art. Ange därför alltid vad uppdraget avser, antal timmar och period. Många kunder kräver dessutom en tidsspecifikation – att lägga den på egna rader från början sparar en runda fram och tillbaka." },
      { q: "Behöver jag F-skatt för att fakturera som konsult?", a: "Som egenföretagare behöver du F-skatt eller FA-skatt för att kunden inte ska behöva göra skatteavdrag och betala arbetsgivaravgifter. Ange alltid att du innehar F-skattsedel på fakturan – det är det kunden kontrollerar först." },
    ],
    relaterade: ["redovisningskonsult", "webbdesigner", "oversattare"],
  },
  {
    slug: "redovisningskonsult",
    namn: "redovisningskonsulter",
    singular: "redovisningskonsulten",
    kategori: "konsult",
    avdrag: null,
    meta: "Fakturaprogram för redovisningskonsulter. Fakturera flera kunder, löpande bokföring och bokslut – med roller och kunduppdelning för byrån.",
    lead: "Som redovisningskonsult fakturerar du inte bara för egen räkning – du hanterar ofta fakturering åt dina kunder också. Det kräver att kunderna hålls strikt åtskilda, både i underlag och i behörigheter.",
    fakturarader: ["Löpande bokföring (per månad)", "Bokslut och årsredovisning", "Deklaration", "Lönehantering (per anställd)", "Rådgivning (tim)"],
    utmaningar: [
      { t: "Många kunder, samma månadsrutin", d: "Trettio kunder ska faktureras den sista varje månad. Görs det manuellt tar det en hel dag – varje månad." },
      { t: "Kunduppgifter får inte blandas", d: "Fel uppgift på fel kundfaktura är inte bara pinsamt, det är ett förtroendeproblem i en bransch som lever på förtroende." },
      { t: "Säsongstoppar", d: "Bokslut och deklaration klumpar ihop sig. När arbetsbelastningen är som högst är fakturering det första som skjuts upp." },
    ],
    faq: [
      { q: "Kan flera konsulter arbeta i samma konto?", a: "Ja. Med byråplanen bjuder du in flera konsulter, tilldelar kunder och styr behörigheter i tre nivåer. Varje konsult ser bara sina egna tilldelade kunder, medan byråansvarig har full överblick." },
      { q: "Kan jag fakturera åt mina kunder?", a: "Ja. Som tilldelad konsult skapar och skickar du fakturor i kundens namn, med kundens företagsuppgifter, bankgiro och fakturamall. Numreringen följer kundens egen serie." },
    ],
    relaterade: ["konsult", "webbdesigner"],
  },
];

export const yrkeSlugs = yrken.map((y) => y.slug);
export const getYrke = (slug: string) => yrken.find((y) => y.slug === slug);
