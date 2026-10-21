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
  { id: "hem", namn: "Hem & trädgård", ingress: "RUT-avdrag med 50 procent av arbetskostnaden." },
  { id: "halsa", namn: "Skönhet & hälsa", ingress: "Återkommande fakturor, klippkort och företagsavtal." },
  { id: "kreativt", namn: "Kreativt & digitalt", ingress: "Projekt, delbetalningar, licenser och utlägg." },
  { id: "konsult", namn: "Konsult & rådgivning", ingress: "Timmar, fast pris och de specifikationer kunden behöver." },
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
    lead: "Som snickare fakturerar du ofta både arbete och material – och det är bara arbetet som ger ROT-avdrag. Håller du ihop dem på samma rad blir avdraget fel och Skatteverket kan avslå begäran.",
    fakturarader: ["Arbetstid snickeri (tim)", "Virke och byggmaterial", "Spik, skruv och förbrukningsmaterial", "Bortforsling av byggavfall", "Framkörning"],
    utmaningar: [
      { t: "Material och arbete på samma rad", d: "Skriver du \"Montering inkl. virke\" vet varken du eller Skatteverket vad avdraget ska räknas på. Håll raderna isär från början." },
      { t: "Offerten ändras under jobbet", d: "Kunden lägger till en vägg. Utan att uppdatera underlaget stämmer inte slutfakturan mot offerten – och diskussionen hamnar hos dig." },
      { t: "Fakturan skrivs på kvällen", d: "Jobbet blir klart klockan tre, fakturan skrivs halv nio. Varje dag du väntar är en dag längre till betalning." },
    ],
    faq: [
      { q: "Ger bortforsling av byggavfall ROT-avdrag?", a: "Nej. Bortforsling, deponiavgifter och transport räknas inte som ROT-berättigat arbete. Det är själva arbetet på bostaden som ger avdrag – ta upp bortforsling som en egen rad utan avdrag." },
      { q: "Kan jag fakturera löpande under ett långt bygge?", a: "Ja, och det är ofta klokt vid större jobb. Dela upp i delfakturor allt eftersom moment blir klara. För varje betald delfaktura kan du begära utbetalning för det färdiga, avdragsgrundande arbetet." },
      { q: "Vad gäller om kunderna är två som äger bostaden tillsammans?", a: "Två delägare kan dela på avdraget om båda uppfyller villkoren och har utrymme kvar. Det kan betyda upp till 100 000 kronor i rotavdrag för ett och samma kök- eller badrumsjobb, i stället för 50 000. Ange hur avdraget ska fördelas mellan dem." },
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
    lead: "Elinstallationer går ofta fort men har mycket materiel: kabel, dosor, centraler, brytare. Avdraget gäller bara arbetet – om materiel räknas in i arbetskostnaden kan rotunderlaget bli fel.",
    fakturarader: ["Arbetstid elinstallation (tim)", "Kabel och förläggningsmateriel", "Centraler, automatsäkringar och jordfelsbrytare", "Uttag, brytare och dosor", "Felsökning (tim)"],
    utmaningar: [
      { t: "Mycket materiel per jobb", d: "Ett enkelt uttagsbyte kan ha tio materielrader. Utan tydlig uppdelning blir ROT-underlaget en gissning." },
      { t: "Jour och akutjobb", d: "Utryckning kvällstid faktureras med annan timtaxa. Om jourtid blandas ihop med ordinarie arbetstid blir både fakturan och avdragsunderlaget otydliga." },
      { t: "Många små jobb på en dag", d: "Fem kunder, fem fakturor. Skrivs de i efterhand hamnar fel adress eller fel timmar på fel kund." },
    ],
    faq: [
      { q: "Ger felsökning ROT-avdrag?", a: "Felsökning i samband med en reparation kan ge rotavdrag. Enbart felsökning, utan att något arbete utförs, ger inte rätt till avdrag. Det är arbetstiden som ger avdrag – den materiel som byts ut gör det inte." },
      { q: "Hur fakturerar jag utryckning utanför ordinarie tid?", a: "Lägg jourtiden som en egen rad med sin egen timtaxa, skild från ordinarie arbetstid. Arbetstid i bostaden kan ge rotavdrag, medan resa och framkörning aldrig gör det – de ska redovisas separat." },
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
    lead: "Måleri är arbetsintensivt – ofta är arbetskostnaden den största delen av fakturan. Det gör ROT-avdraget extra värdefullt för kunden, och extra viktigt att det räknas rätt.",
    fakturarader: ["Målningsarbete (tim eller kvm)", "Färg och grundfärg", "Spackel och slipmaterial", "Täckmaterial och maskeringstejp", "Montering av byggnadsställning"],
    utmaningar: [
      { t: "Pris per kvadratmeter", d: "Många målare prissätter per kvm, inte per timme. Underlaget måste ändå visa vad som är arbete för att ROT-avdraget ska bli rätt." },
      { t: "Färgen köps åt kunden", d: "Lägger du ut för färg ska den faktureras vidare – men utan avdrag. Blandas den in i arbetspriset blir avdraget för högt." },
      { t: "Offert långt före jobbet", d: "Målarjobb bokas ofta månader i förväg. Är offerten från 2025 kan den ha räknats med 50 % ROT – nu gäller 30 %." },
    ],
    faq: [
      { q: "Ger tapetsering ROT-avdrag?", a: "Ja, tapetsering i bostaden räknas som ROT-berättigat arbete. Som alltid gäller avdraget bara arbetskostnaden – tapeten och limmet gör det inte." },
      { q: "Hur gör jag när jag prissätter per kvadratmeter?", a: "Ange kvadratmeterpriset som arbetskostnad på en egen rad och materialet separat. Avdraget räknas på arbetsraden oavsett om den är satt per timme eller per kvm. Dokumentera den faktiska arbetstiden även vid fast pris – underlaget kan efterfrågas." },
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
    lead: "Vid akuta VVS-jobb behöver du kunna fakturera även när det inte finns en offert att utgå från. Ett läckage ska åtgärdas idag – men fakturan med rätt ROT-underlag ska ändå bli korrekt, även när du skriver den i bilen efter avslutat jobb.",
    fakturarader: ["Arbetstid VVS (tim)", "Rör, kopplingar och rördelar", "Blandare, WC och sanitetsporslin", "Utryckning och framkörning", "Jourtillägg"],
    utmaningar: [
      { t: "Akutjobb utan offert", d: "Vid läckage finns ingen offert att utgå från. Allt måste dokumenteras på plats, annars blir fakturan en efterhandskonstruktion." },
      { t: "Dyra enskilda produkter", d: "En blandare kan kosta mer än arbetstiden. Hamnar den i arbetsraden blir ROT-avdraget felaktigt högt – och underlaget underkänt." },
      { t: "Framkörning räknas inte", d: "Resor och framkörning ger inget ROT-avdrag, men faktureras ändå. De måste ligga på egen rad." },
    ],
    faq: [
      { q: "Ger stambyte ROT-avdrag?", a: "Ja, stambyte i en bostad som du äger är ROT-berättigat. I en bostadsrätt gäller avdraget bara arbete inom lägenheten – arbete i föreningens gemensamma stammar bekostas av föreningen och ger inte kunden avdrag." },
      { q: "Ger jourutryckning på helgen ROT-avdrag?", a: "Arbetstiden ger avdrag, även med jourtillägg. Själva framkörningen och resan gör det inte – lägg den som en separat rad utan avdrag." },
    ],
    relaterade: ["elektriker", "markarbetare", "snickare"],
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
      { t: "Tätskikt kräver dokumentation", d: "Dokumentera tätskiktsarbetet enligt de branschregler som gäller för uppdraget. Vid våtrumsentreprenader enligt BBV ska behöriga företag lämna ett kvalitetsdokument till beställaren." },
      { t: "Rivning och återuppbyggnad vid renovering", d: "Rivning som ingår i en godkänd renovering kan ge rotavdrag. Container och deponi gör det inte, trots att de ofta dyker upp på samma faktura." },
    ],
    faq: [
      { q: "Ger rivning av gammalt badrum ROT-avdrag?", a: "Rivning som ingår i en godkänd renovering kan ge rotavdrag. Containerhyra, deponiavgift och bortforsling ger däremot inget avdrag och ska redovisas separat." },
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
    fakturarader: ["Läggningsarbete (kvm)", "Parkett, vinyl eller laminat", "Golvunderlag och underlagsfoam", "Golvlister och trösklar", "Rivning av befintligt golv"],
    utmaningar: [
      { t: "Kvadratmeterpris som inkluderar allt", d: "Ett pris \"inklusive material\" omöjliggör ett korrekt ROT-underlag. Avdraget måste kunna räknas på enbart arbetet." },
      { t: "Spill och överblivet material", d: "Redovisa överblivet material enligt vad du och kunden har avtalat. Fakturerat material ska hållas åtskilt från arbetskostnaden." },
      { t: "Underarbetet tar längre tid än planerat", d: "Ett ojämnt undergolv kräver spackling som inte fanns i offerten. Ändringen måste nå fakturan, annars äter den din marginal." },
    ],
    faq: [
      { q: "Ger slipning av befintligt trägolv ROT-avdrag?", a: "Ja, golvslipning och ytbehandling i bostaden är ROT-berättigat arbete. Lack, olja och slipmaterial räknas som material och ger inget avdrag." },
      { q: "Hur redovisar jag spillmaterial?", a: "Redovisa det som material på materialraden, enligt vad ni avtalat. Material ger aldrig rotavdrag, eftersom avdraget bara gäller arbetskostnaden." },
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
    lead: "Material kan stå för en stor del av kostnaden vid murningsarbeten – tegel, bruk och puts. Just därför blir ROT-underlaget fel så fort material och arbete hamnar på samma rad.",
    fakturarader: ["Murningsarbete (tim)", "Tegel, block och sten", "Bruk, puts och cement", "Ställningshyra", "Montering och demontering av ställning", "Bortforsling av rivningsmassa"],
    utmaningar: [
      { t: "Material kan överstiga arbetet", d: "Vid ett fasadjobb kan materialkostnaden vara högre än arbetskostnaden. Hamnar materialet i arbetsraden blir avdraget långt för högt och underlaget underkänns." },
      { t: "Väder stoppar jobbet", d: "Bruk härdar inte i minusgrader. Jobb som drar ut kräver delfakturor – och om betalningen flyttas över ett årsskifte påverkas vilket år avdraget hör till." },
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
    lead: "Hur stor del av priset som är arbetskostnad varierar med taket och uppdraget. Resten är pannor, plåt, papp och ställningshyra – som inte ger något avdrag. Kunden räknar nästan alltid med rotavdrag redan i offerten, så uppdelningen måste hålla hela vägen.",
    fakturarader: ["Takläggningsarbete (tim eller kvm)", "Takpannor, plåt och papp", "Läkt, underlagsduk och beslag", "Ställning: montering och demontering", "Ställningshyra (ingen avdragsrätt)"],
    utmaningar: [
      { t: "Ställning: montering ja, hyra nej", d: "Montering och demontering är arbete och kan ge avdrag i samband med godkänt rotarbete. Själva hyran av ställningsmaterialet gör det inte. Två rader, inte en." },
      { t: "Stora belopp slår i taket", d: "Ett takbyte kan ensamt fylla kundens ROT-tak på 50 000 kr. Är kunderna två ägare finns dubbelt utrymme – men bara om fakturan fördelas på båda." },
      { t: "Vädret flyttar jobbet", d: "Om kundens betalning flyttas från december till januari hör avdraget till det nya året. Det kan avgöra om avdraget ryms eller inte." },
    ],
    faq: [
      { q: "Ger byggställning ROT-avdrag vid takbyte?", a: "Montering och demontering av ställningen kan ge rotavdrag när den sker i samband med ett godkänt rotarbete. Hyran av själva ställningsmaterialet ger inget avdrag. Dela därför upp dem på separata rader – annars blir hela posten ifrågasatt." },
      { q: "Hur stor del av ett takbyte ger avdrag?", a: "Bara arbetskostnaden. Pannor, plåt, papp, läkt och ställningshyra ger inget avdrag. Hur stor andel arbetet utgör varierar med takets typ och materialval, så beräkna rotunderlaget utifrån det aktuella arbetet i stället för en tumregel." },
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
    lead: "Som glasmästare hanterar du olika slags fakturering: planerade fönsterbyten där kunden vill ha rotavdrag, och akuta glasskador som går via försäkringsbolaget. De ska inte faktureras likadant – och de får inte blandas ihop.",
    fakturarader: ["Glasmästeriarbete (tim)", "Isolerglas, energiglas eller säkerhetsglas", "Karm, beslag och tätlister", "Utryckning vid akut skada", "Försäkringsärende: självrisk"],
    utmaningar: [
      { t: "Försäkring och ROT går inte ihop", d: "Får kunden ersättning från försäkringsbolaget för samma arbete kan ROT-avdrag inte användas för den delen. Blandas de ihop blir det återkrav." },
      { t: "Akutjobb utan offert", d: "En krossad ruta ska åtgärdas samma dag. Allt måste dokumenteras på plats, annars blir fakturan en efterhandskonstruktion." },
      { t: "Glaset kostar mer än timmen", d: "Energiglas och säkerhetsglas är dyra poster. Hamnar de i arbetsraden blir avdraget felaktigt högt." },
    ],
    faq: [
      { q: "Kan kunden få ROT-avdrag när försäkringen betalar?", a: "Rotavdrag kan inte ges för arbete som ersätts av försäkringen, även om ersättningen bara täcker en del av arbetskostnaden. Om ersättningen tydligt gäller endast material, eller om andra arbeten som inte rör skadan faktureras separat, kan bedömningen bli en annan. Håll delarna isär på fakturan och stäm av vid osäkerhet." },
      { q: "Ger fönsterbyte ROT-avdrag?", a: "Arbetskostnaden för fönsterbyte i småhus kan ge rotavdrag. För bostadsrätter gäller snävare regler. Själva fönstret, glaset och karmen är material och ger inget avdrag. Vid fasta priser per fönster måste arbetsdelen framgå separat för att avdraget ska kunna räknas." },
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
      { t: "Hyra och arbete på samma rad", d: "Om hyra och arbete blandas på samma rad blir avdragsunderlaget otydligt. Hyran är inte arbete och ger aldrig avdrag, hur länge ställningen än står." },
      { t: "Hyrestiden är rörlig", d: "Jobbet drar ut, ställningen står kvar. Löpande hyresdebitering måste framgå tydligt, annars blir slutfakturan en överraskning." },
      { t: "Du är underentreprenör", d: "Om du arbetar som underentreprenör åt en takläggare är det ofta huvudentreprenören som fakturerar slutkunden. Ditt underlag behöver ändå tydligt skilja arbete från hyra och transport." },
    ],
    faq: [
      { q: "Ger byggställning ROT-avdrag?", a: "Montering och demontering av byggnadsställning kan ge rotavdrag när arbetet sker i samband med ett godkänt rotarbete. Hyran av ställningsmaterialet omfattas inte. Redovisa dem därför alltid på separata rader på fakturan." },
      { q: "Hur fakturerar jag när hyrestiden förlängs?", a: "Ange hyran som en egen rad med antal veckor och veckopris, så räknas summan ut automatiskt när perioden ändras. Vid långa jobb är det ofta tydligare att delfakturera hyran löpande än att lägga hela beloppet på slutfakturan." },
    ],
    relaterade: ["takmontor", "malare", "murare"],
  },

  {
    slug: "markarbetare",
    namn: "markarbetare",
    singular: "markarbetaren",
    kategori: "bygg",
    avdrag: "rot",
    meta: "Fakturaprogram för markarbetare med ROT-avdrag. Dränering ger avdrag, uppfarten inte – och grävmaskinen räknas aldrig som arbete.",
    lead: "Vid markarbete går ROT-gränsen tvärs genom uppdraget. Dränering av husgrund och schakt för vatten, avlopp, el eller fiber ger avdrag med 30 procent av arbetskostnaden. Att asfaltera, lägga marksten, anlägga uppfart, gräsmatta eller trädgårdsgång gör det inte. Och grävmaskinen räknas aldrig som arbetskostnad, hur stor del av notan den än utgör.",
    fakturarader: ["Markarbete och schakt (tim)", "Dränering av husgrund (löpmeter)", "Schakt för vatten- och avloppsledning", "Hyra av grävmaskin", "Bortforsling av schaktmassor", "Återfyllning och packning"],
    utmaningar: [
      { t: "Grävmaskinen är inte arbete", d: "Skatteverket undantar uttryckligen maskinell utrustning som grävmaskiner och borraggregat. Flera prisguider på nätet påstår motsatsen – att maskinkostnaden får räknas in vid markarbeten. Gör du det blir begäran felaktig, och maskinen är ofta den största posten." },
      { t: "Gränsen går vid huset, inte vid tomtgränsen", d: "Arbetet måste höra till byggnaden: dränering runt grunden, schakt för att dra in ledningar, markarbete för en tillbyggnad. Samma grävmaskin som sedan lägger en uppfart ger inget avdrag alls." },
      { t: "Massorna är en egen post", d: "Bortforsling av schaktmassor och deponiavgifter ger inte ROT. Ligger de inbakade i timpriset drar de ned kundens avdrag utan att det syns på fakturan." },
    ],
    faq: [
      { q: "Räknas grävmaskinen som arbetskostnad vid ROT-avdrag?", a: "Nej. Skatteverket ger inte rotavdrag för maskinell utrustning, till exempel grävmaskiner eller borraggregat. Det gäller även när maskinen körs av den som utför arbetet. Ta upp maskinen på en egen rad – flera prisguider påstår motsatsen, men det stämmer inte." },
      { q: "Ger dränering av huset ROT-avdrag?", a: "Ja. Dränering av husgrunden hör till byggnaden och ger rotavdrag med 30 procent av arbetskostnaden, upp till 50 000 kronor per person och år. Dräneringsrör, fuktskydd och makadam är material och ingår inte." },
      { q: "Ger en ny uppfart eller marksten ROT-avdrag?", a: "Nej. Att asfaltera, lägga sten eller plattor och att anlägga uppfarter, gräsmattor och trädgårdsgångar ger inte rotavdrag. Inte heller staket, murar eller pool. Det är arbete på tomten, inte på bostaden." },
      { q: "Ger schaktning för el, fiber eller vatten ROT-avdrag?", a: "Ja. Schaktning för att dra in vatten, avlopp, el eller tele till bostaden ger rotavdrag, eftersom arbetet krävs för husets försörjning. Själva ledningen är material." },
    ],
    relaterade: ["rormokare", "snickare", "tradgardsmastare"],
  },

  /* ───────── RUT – hem & trädgård ───────── */
  {
    slug: "tradgardsmastare",
    namn: "trädgårdsmästare",
    singular: "trädgårdsmästaren",
    kategori: "hem",
    avdrag: "rut",
    meta: "Fakturaprogram för trädgårdsmästare med RUT-avdrag automatiskt. 50 % på arbetet, växter separat. Fakturera direkt från trädgården.",
    lead: "För trädgårdsarbeten som omfattas av rutavdrag kan kunden få avdrag med 50 procent av arbetskostnaden. Gränsen mellan arbete som ger rätt till rutavdrag och annat arbete är viktig, och växter ger aldrig avdrag.",
    fakturarader: ["Trädgårdsarbete (tim)", "Häckklippning och beskärning", "Växter, jord och gödsel", "Bortforsling av trädgårdsavfall", "Maskinhyra"],
    utmaningar: [
      { t: "RUT eller inget avdrag alls", d: "Häckklippning och ogräsrensning ger RUT. Anläggning av ny trädgård, liksom plantering och omplantering, gör det normalt inte. Gränsen måste synas redan i offerten." },
      { t: "Säsongsarbete i korta pass", d: "Två timmar här, tre där. Många små jobb blir många små fakturor – skrivs de i klump i efterhand blir det fel." },
      { t: "Växter är inte arbete", d: "Plantor, jord och gödsel är material och ger aldrig avdrag, hur mycket arbete som än ingår i planteringen." },
    ],
    faq: [
      { q: "Vilket trädgårdsarbete ger RUT-avdrag?", a: "Löpande skötsel ger RUT: häckklippning, gräsklippning, ogräsrensning, beskärning, krattning och snöskottning. Nyanläggning räknas normalt inte, och inte heller plantering eller omplantering av växter." },
      { q: "Ger bortforsling av trädgårdsavfall RUT-avdrag?", a: "Själva arbetet med att samla ihop avfallet ger avdrag, men transport och deponiavgift gör det inte. Dela upp dem på separata rader så blir underlaget korrekt." },
    ],
    relaterade: ["stadfirma", "snickare", "malare"],
  },
  {
    slug: "stadfirma",
    namn: "städfirmor",
    singular: "städfirman",
    kategori: "hem",
    avdrag: "rut",
    meta: "Fakturaprogram för städfirmor med RUT-avdrag. Hemstäd, flyttstäd och trapphus på samma faktura – men bara en del ger avdrag. 14 dagar gratis.",
    lead: "Hemstädning och flyttstädning ger kunden rutavdrag med 50 procent av arbetskostnaden. Men långt ifrån allt en städfirma utför ger avdrag: grovstädning med maskin, byggstädning, poolrengöring och städning av trapphus och andra gemensamhetsutrymmen står uttryckligen utanför. Blandas de med hemstädet på samma rad blir hela underlaget fel.",
    fakturarader: ["Hemstädning (tim)", "Flyttstädning, fast pris", "Storstädning med maskin (tim)", "Trapphusstädning, avtal per månad", "Rengöringsmedel och förbrukningsmaterial", "Framkörning"],
    utmaningar: [
      { t: "Allt städ är inte rutarbete", d: "Enklare städning – dammsuga, dammtorka, putsa fönster, städa skåp och kyl – ger avdrag. Grovstädning med mer avancerad utrustning, djuprengöring av möbler, poolrengöring och städning efter byggarbete gör det inte. Står de på samma rad som hemstädet går det inte att räkna ut avdraget." },
      { t: "Föreningar och företag ger inget avdrag", d: "Trapphusstädning åt en bostadsrättsförening är både fel kundtyp och fel utrymme: rutavdrag gäller privatpersoner i den egna bostaden, och gemensamhetsutrymmen i flerfamiljshus är undantagna. Den fakturan ska skrivas utan avdrag, med full moms." },
      { t: "Många små pass, en faktura i månaden", d: "Varannan vecka hos tolv kunder blir snabbt ett underlag som är omöjligt att rekonstruera i efterhand. Varje tillfälle behöver datum och timmar medan det är färskt." },
    ],
    faq: [
      { q: "Ger trapphusstädning åt en bostadsrättsförening RUT-avdrag?", a: "Nej. Skatteverket undantar uttryckligen städning av gemensamhetsutrymmen i flerfamiljshus. Dessutom görs rutavdrag bara av privatpersoner – en bostadsrättsförening är en juridisk person. Fakturera föreningen utan avdrag." },
      { q: "Ger byggstädning RUT-avdrag?", a: "Nej, städning efter ett byggarbete ger inte rutavdrag. Däremot kan den räknas in i rotavdraget när den hör ihop med ett ROT-arbete. Det är alltså inte avdragslöst – det är ett annat avdrag, och det ska synas på fakturan." },
      { q: "Ger flyttstädning RUT-avdrag?", a: "Ja. Att städa hos någon som ska flytta in i eller ut ur en bostad finns med i Skatteverkets lista över rutarbeten. Flyttstädning ger alltså avdrag med 50 procent av arbetskostnaden, även när själva flytten faktureras av någon annan." },
      { q: "Får kunden betala städningen kontant?", a: "Nej. Sedan den 1 januari 2020 krävs elektronisk betalning för att rutavdrag ska medges – kort, Swish eller betalning via bank. Kontanter, check och presentkort ger inte rätt till avdrag, hur korrekt fakturan än är." },
    ],
    relaterade: ["fonsterputsare", "flyttfirma", "tradgardsmastare"],
  },
  {
    slug: "fonsterputsare",
    namn: "fönsterputsare",
    singular: "fönsterputsaren",
    kategori: "hem",
    avdrag: "rut",
    meta: "Fakturaprogram för fönsterputsare med RUT-avdrag. Pris per fönster men avdrag på arbetskostnaden – lift och framkörning separat.",
    lead: "Att putsa fönster står uttryckligen i Skatteverkets lista över rutarbeten, så kunden får avdrag med 50 procent av arbetskostnaden. Svårigheten är en annan: branschen prissätter per fönster, men avdraget räknas på arbetskostnad. Lift, stege och framkörning ger aldrig avdrag och måste ligga på egna rader.",
    fakturarader: ["Fönsterputs villa, antal fönster", "Fönsterputs lägenhet (tim)", "Tillägg spröjsade fönster", "Hyra av skylift", "Framkörning", "Fönsterputs kontor, avtal"],
    utmaningar: [
      { t: "Pris per fönster, avdrag per arbetskostnad", d: "\"24 fönster, 2 400 kr\" säger inget om hur mycket som är arbete. Underlaget till Skatteverket bygger på arbetskostnaden, så styckpriset måste ändå redovisas som arbete – och allt annat brytas ut." },
      { t: "Liften är inte arbete", d: "Skylift, ställning och specialutrustning är maskinkostnad och ger inte rutavdrag, även när jobbet är omöjligt att utföra utan dem. Samma sak med framkörningen." },
      { t: "Halva kundstocken är företag", d: "Kontor, butiker och restauranger ger inget rutavdrag alls – avdraget gäller privatpersoner i bostad. I praktiken behöver du två sorters fakturor och får inte blanda ihop dem." },
    ],
    faq: [
      { q: "Ger fönsterputsning RUT-avdrag?", a: "Ja. \"Putsa fönster\" finns med bland de enklare städarbeten som Skatteverket räknar som rutarbete. Kunden får skattereduktion med 50 procent av arbetskostnaden, upp till det gemensamma taket på 75 000 kronor per person och år." },
      { q: "Ger hyra av skylift RUT-avdrag?", a: "Nej. Utrustning och maskiner ger aldrig rutavdrag, lika lite som material och resekostnader. Ta upp liften som en egen rad utan avdrag – räknas den in i arbetskostnaden blir hela begäran felaktig." },
      { q: "Kan jag fakturera ett kontor med RUT-avdrag?", a: "Nej. Rutavdrag är en skattereduktion för privatpersoner och gäller arbete i eller i anslutning till bostaden. Fönsterputs åt företag, butiker och föreningar faktureras utan avdrag, med full moms." },
    ],
    relaterade: ["stadfirma", "flyttfirma", "tradgardsmastare"],
  },
  {
    slug: "flyttfirma",
    namn: "flyttfirmor",
    singular: "flyttfirman",
    kategori: "hem",
    avdrag: "rut",
    meta: "Fakturaprogram för flyttfirmor med RUT-avdrag. Bärhjälp ger avdrag – flyttbil, kartonger och magasinhyra gör det inte. Dela raderna rätt.",
    lead: "Av allt en flyttfirma fakturerar är det bara arbetet som ger rutavdrag: bärhjälp, packning, lastning och lossning, med 50 procent av arbetskostnaden. Flyttbil, drivmedel, flyttkartonger och magasinhyra är uttryckligen undantagna. Ett paketpris på \"flytt från 5 995 kr\" går därför inte att räkna avdrag på – uppdraget måste delas upp redan i offerten.",
    fakturarader: ["Bärhjälp och flyttarbete (tim)", "Packning och uppackning (tim)", "Ned- och uppmontering av möbler", "Flyttbil och drivmedel", "Flyttkartonger och emballage", "Magasinhyra per månad", "Flyttstädning"],
    utmaningar: [
      { t: "Paketpriset går inte att dela i efterhand", d: "Säljs flytten som ett fast pris utan uppdelning finns ingen arbetskostnad att begära avdrag på. Uppdelningen måste finnas från offerten, inte konstrueras när kunden frågar efter sitt avdrag." },
      { t: "Bilen är den största posten utan avdrag", d: "Flyttbil, drivmedel, flyttkartonger och magasinhyra ger inte rutavdrag. Inte heller resor mellan er lokal och kundens bostad. Ligger de i timpriset drar du ned kundens avdrag utan att någon märker det." },
      { t: "Magasinering är två olika saker", d: "Arbetet med att bära och transportera bohaget är en sak, hyran för förrådet en annan. Hyran ger inget avdrag och behöver en egen rad – annars ifrågasätts hela underlaget." },
    ],
    faq: [
      { q: "Ger flyttbil och drivmedel RUT-avdrag?", a: "Nej. Skatteverket undantar uttryckligen flyttbil, drivmedel, flyttkartonger och magasinhyra. Avdraget gäller arbetet: att flytta bohaget, packa ned och upp, lasta och lossa. Allt annat ska ligga på egna rader utan avdrag." },
      { q: "Ger möbelmontering vid flytten RUT-avdrag?", a: "Ja, men bara när möbeln inte kan flyttas hel. Att montera ned och upp en garderob som måste tas isär för att komma ut hör till flytten. Att montera ihop en nyköpt möbel gör det inte." },
      { q: "Ger en flytt utomlands RUT-avdrag?", a: "Nej, inte när bohaget transporteras med flyg eller båt – det är undantaget. Avdraget gäller flytt av bohag mellan kundens bostäder, och rutavdrag förutsätter dessutom att arbetet utförs inom EU eller EES." },
      { q: "Ska flyttstädningen stå på samma faktura?", a: "Den kan göra det, men den ska ha en egen rad. Flyttstädning är städarbete och ger rutavdrag på sin egen arbetskostnad – håll den skild från bärhjälpen så blir båda posterna rätt i begäran till Skatteverket." },
    ],
    relaterade: ["stadfirma", "fonsterputsare", "snickare"],
  },

  {
    slug: "barnvakt",
    namn: "barnvakter",
    singular: "barnvakten",
    kategori: "hem",
    avdrag: "rut",
    meta: "Fakturaprogram för barnvakter med RUT-avdrag. Läxhjälp räknas bara till tio procent, och hämtning på förskolan ger inget avdrag alls.",
    lead: "Barnpassning ger rutavdrag med 50 procent av arbetskostnaden, men reglerna är mer detaljerade än de flesta tror. Avdraget gäller barn till och med årskurs 7, läxhjälp får utgöra högst tio procent av tiden vid varje tillfälle, och transporten till och från förskolan ger inget avdrag även när den sker mitt i passet.",
    fakturarader: ["Barnpassning (tim)", "Kvällspassning, tillägg", "Läxhjälp inom passet", "Hämtning och lämning", "Resa till och från uppdraget"],
    utmaningar: [
      { t: "Tio-procentsregeln på läxhjälp", d: "Hjälp med läxor och annat skolarbete ger avdrag bara upp till tio procent av tiden vid varje passningstillfälle. Blir det mer räknas den delen som undervisning, och undervisning ger inget rutavdrag. Skriv ut hur tiden fördelas." },
      { t: "Hämtning och lämning är inte passning", d: "Att köra barnet till förskolan, skolan eller fritidsaktiviteten ger inte avdrag – det är transport. Den tiden ska ligga på en egen rad utan avdrag, även när den sker mitt i ett pass." },
      { t: "Släktskap stänger av avdraget", d: "Passar du barn du är släkt med ger arbetet inget rutavdrag, oavsett hur korrekt fakturan ser ut. Det är värt att klara ut innan ni kommer överens om priset." },
    ],
    faq: [
      { q: "Hur gamla barn omfattas av RUT för barnpassning?", a: "Barn till och med årskurs 7. För äldre barn ger passning inte rutavdrag. Åldersgränsen följer skolgången, inte födelseåret, så kontrollera vilken årskurs barnet går i." },
      { q: "Ger läxhjälp RUT-avdrag?", a: "Delvis. Läxhjälp och annat skolarbete ger avdrag upp till tio procent av tiden vid varje passningstillfälle. Renodlad privatundervisning eller coachning ger inget avdrag alls, hur kort den än är." },
      { q: "Får jag ta betalt för matlagning under passet?", a: "Enklare matlagning i liten omfattning, direkt kopplad till passningen, ingår i rutarbetet. Att laga mat som en egen tjänst gör det inte – då är det matlagning, inte barnpassning." },
      { q: "Ger det avdrag att hämta barnet på förskolan?", a: "Nej. Betalning för transport vid hämtning och lämning vid förskola, skola eller fritidsaktiviteter är uttryckligen undantagen. Ta upp den som en egen rad utan avdrag." },
    ],
    relaterade: ["stadfirma", "fastighetsskotare", "tradgardsmastare"],
  },
  {
    slug: "fastighetsskotare",
    namn: "fastighetsskötare",
    singular: "fastighetsskötaren",
    kategori: "hem",
    avdrag: "rut",
    meta: "Fakturaprogram för fastighetsskötare med RUT. Snöskottning och tillsyn ger avdrag – reparationer gör det inte. Dela raderna rätt.",
    lead: "Tillsyn av bostaden och snöskottning ger rutavdrag med 50 procent av arbetskostnaden. Men samma besök innehåller ofta både sådant som ger avdrag och sådant som inte gör det: att vattna blommor och spola kranar ger avdrag, att byta en trasig kran gör det inte. Gränsen går vid reparation.",
    fakturarader: ["Tillsyn av bostad (per besök)", "Snöskottning av uppfart och tak", "Borttagning av istappar", "Mindre reparation", "Material", "Framkörning"],
    utmaningar: [
      { t: "Tillsyn ger avdrag, reparation gör det inte", d: "Att ta hand om post, vattna blommor, vädra, spola kranar och toaletter och kontrollera lamporna är tillsyn och ger rutavdrag. Upptäcker du en skada och lagar den är själva lagningen ett annat slags arbete utan avdrag." },
      { t: "Många korta besök, ett underlag", d: "Tillsyn faktureras ofta per besök under en längre bortavaro. Utan datum och tidsåtgång per besök går underlaget inte att rekonstruera när kunden vill ha sitt avdrag." },
      { t: "Snöskottning har en bestämd omfattning", d: "Avdraget gäller uppfarter, hus- och garagetak och gårdsplaner samt istappar i anslutning till bostaden. Snöröjning längre bort på tomten eller på en gemensam väg hör inte dit." },
    ],
    faq: [
      { q: "Ger snöskottning RUT-avdrag?", a: "Ja, på uppfarter, hus- och garagetak och gårdsplaner, liksom borttagning av istappar i anslutning till bostaden. Det är arbetet som ger avdrag – inte maskinhyra eller bortforsling av snön." },
      { q: "Vad räknas som tillsyn av bostaden?", a: "Att ta hand om posten, vattna blommor, vädra, spola kranar och toaletter och kontrollera att lamporna fungerar. Åtgärder vid en mindre skada ingår i tillsynen, men själva reparationen eller underhållet gör det inte." },
      { q: "Ger arbete i en bostadsrättsförenings gemensamma utrymmen avdrag?", a: "Nej. Rutavdrag görs av privatpersoner för arbete i den egna bostaden. En förening är en juridisk person, och gemensamhetsutrymmen i flerfamiljshus är dessutom undantagna. Den fakturan skrivs utan avdrag." },
    ],
    relaterade: ["tradgardsmastare", "barnvakt", "stadfirma"],
  },

  /* ───────── Skönhet & hälsa ───────── */
  {
    slug: "frisor",
    namn: "frisörer",
    singular: "frisören",
    kategori: "halsa",
    avdrag: null,
    meta: "Fakturaprogram för frisörer och salonger. Fakturera företagskunder, hyr stol eller driv eget – offert, faktura och påminnelser på svenska.",
    lead: "De flesta klippningar betalas i kassan, men inte alla. Stolshyra och uppdrag åt företag, till exempel vid bröllop och fotograferingar, kan behöva faktureras – och då behövs en riktig faktura med korrekt moms, inte ett kvitto.",
    fakturarader: ["Klippning och styling", "Färgning och behandling", "Stolshyra (per månad)", "Uppdrag på plats, t.ex. bröllop", "Produkter"],
    utmaningar: [
      { t: "Stolshyra varje månad", d: "Hyr du ut stolar ska samma faktura ut varje månad till samma personer. Skrivs den för hand varje gång är det bara en tidsfråga innan en glöms bort." },
      { t: "Företagskunder vill ha faktura", d: "Uppdragsgivare inom reklam, film och evenemang vill ofta ha faktura, med fullständiga företagsuppgifter och betalningsvillkor." },
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
    lead: "Utöver enstaka behandlingar kan du fakturera klippkort och friskvårdsavtal med företag. Då krävs en faktura med fullständiga företagsuppgifter, och ofta ett avtal som löper varje månad.",
    fakturarader: ["Massagebehandling (per tillfälle)", "Klippkort, t.ex. 10 behandlingar", "Friskvårdsavtal företag (per månad)", "Massage på arbetsplats", "Reseersättning"],
    utmaningar: [
      { t: "Friskvårdsbidrag kräver rätt underlag", d: "Kunden behöver en betald faktura eller ett kvitto som underlag för friskvårdsbidrag. Saknas behandlingstyp eller datum får kunden problem – och ringer dig." },
      { t: "Klippkort betalas i förskott", d: "Tio behandlingar betalas nu men utförs under ett halvår. Fakturan ska visa vad som ingår och under vilken period." },
      { t: "Företagsavtal återkommer", d: "Samma företag, samma belopp, varje månad. Det är arbete som inte borde göras om från början varje gång." },
    ],
    faq: [
      { q: "Ger massage RUT-avdrag?", a: "Nej. Massage och kroppsbehandlingar omfattas inte av RUT. Däremot kan massage räknas som skattefri friskvård hos kundens arbetsgivare. Massage utan motionsinslag får då kosta högst 1 000 kronor per tillfälle, och underlaget ska visa behandling och datum." },
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
    fakturarader: ["PT-pass (styck)", "Träningspaket, t.ex. 10 pass", "Onlinecoaching (per månad)", "Kostrådgivning", "Företagsavtal för personalträning"],
    utmaningar: [
      { t: "Paket som sträcker sig över månader", d: "Tio pass betalda i januari, sista passet i maj. Fakturan måste visa vad som ingår och gälla som underlag hela perioden." },
      { t: "Kunder som glömmer betala", d: "Privatkunder betalar sällan sent av ovilja, utan för att fakturan försvinner i inkorgen. En påminnelse löser det – om den går att skicka på tio sekunder." },
      { t: "Friskvårdsbidrag", d: "Många kunder vill använda sitt friskvårdsbidrag. Underlaget måste visa vilken aktivitet som betalats – en betalningsbekräftelse utan de uppgifterna behöver kompletteras." },
    ],
    faq: [
      { q: "Kan kunden använda friskvårdsbidrag för PT?", a: "Ofta ja – personlig träning räknas normalt som friskvård. Kunden behöver ett underlag som visar vilken aktivitet som betalats, datum och ditt företags uppgifter. Ange därför alltid träningsform och period tydligt." },
      { q: "Hur fakturerar jag ett träningspaket?", a: "Fakturera hela paketet som en rad med antal pass angivet, till exempel \"Träningspaket 10 pass, giltigt sex månader från köpet\". Då ser både du och kunden vad som är betalt och hur länge det gäller." },
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
    lead: "Fotouppdrag bokas långt i förväg och betalas i omgångar: boknings­avgift nu, resten efter leverans. Dessutom säljer du inte bara tid utan också rätten att använda bilderna – och det ska framgå av fakturan.",
    fakturarader: ["Fotografering (tim eller paket)", "Efterbearbetning och retusch", "Bokningsavgift / förskott", "Nyttjanderätt och licens", "Resa och logi"],
    utmaningar: [
      { t: "Förskott och slutfaktura", d: "Bokningsavgiften betalas kanske ett år före bröllopet. Slutfakturan måste dra av den – annars fakturerar du dubbelt." },
      { t: "Nyttjanderätt är inte tid", d: "Ett företag som ska använda bilderna i reklam betalar för licensen, inte bara för timmarna. Står det inte på fakturan uppstår diskussionen i efterhand." },
      { t: "Lång väg från jobb till betalning", d: "Fotografering i juni, leverans i juli, betalning i augusti. Utan påminnelser blir det lätt september." },
    ],
    faq: [
      { q: "Hur fakturerar jag bokningsavgift och slutbetalning?", a: "Skicka en första faktura på bokningsavgiften när avtalet skrivs. När jobbet är levererat skickar du slutfakturan på totalbeloppet med en avdragsrad för den redan betalda avgiften, så att det framgår vad som återstår." },
      { q: "Vilken moms gäller för fotografering?", a: "Fotografiska tjänster och försäljning av fotografier har normalt 25 procent moms. Att ett fotografi säljs som konst innebär inte i sig att en lägre momssats gäller. Vid osäkerhet om din egen verksamhet, stäm av med Skatteverket." },
    ],
    relaterade: ["webbdesigner", "musiker", "konsult"],
  },
  {
    slug: "webbdesigner",
    namn: "webbdesigners",
    singular: "webbdesignern",
    kategori: "kreativt",
    avdrag: null,
    meta: "Fakturaprogram för webbdesigners och frilansutvecklare. Fakturera projekt, löpande timmar och förvaltning – med offert som blir faktura.",
    lead: "Webbprojekt har en tydlig början men sällan ett tydligt slut. Uppdraget växer, förvaltning tillkommer, och det som började som ett fast pris blir löpande timmar. Fakturan behöver återspegla de ändringar ni har kommit överens om.",
    fakturarader: ["Design och UX (tim)", "Utveckling (tim)", "Fast projektpris, delbetalning", "Löpande förvaltning (per månad)", "Domän, hosting och licenser"],
    utmaningar: [
      { t: "Uppdraget växer utöver avtalet", d: "\"Kan vi bara lägga till en sida till?\" Utan att det syns på fakturan blir tilläggen gratis arbete." },
      { t: "Fast pris i delbetalningar", d: "Ett projekt på 80 000 kr faktureras sällan i ett svep. Delfakturorna måste hänga ihop så att slutsumman stämmer." },
      { t: "Vidarefakturering av kostnader", d: "Domäner, licenser och plugins köps i ditt namn men är kundens kostnad. De ska vidarefaktureras på egna rader, inte döljas i timpriset." },
    ],
    faq: [
      { q: "Hur fakturerar jag ett projekt i delbetalningar?", a: "Dela upp projektet i tydliga moment – till exempel 40 procent vid start, 40 procent vid designgodkännande och 20 procent vid leverans. Skapa en faktura per moment och hänvisa till offerten, så ser kunden hela bilden." },
      { q: "Ska jag fakturera hosting och domäner vidare?", a: "Ja, om du köper dem för kundens räkning. Lägg dem som egna rader med samma belopp du betalat, eller med ditt påslag om det framgår av avtalet. Observera att inköp i eget namn för vidareförsäljning normalt är vidarefakturering, inte utlägg – det påverkar momsen. Att gömma dem i timpriset gör det dessutom svårt för kunden att se vad som är löpande kostnader." },
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
      { t: "Utländska kunder och moms", d: "När du säljer till ett företag i ett annat EU-land gäller normalt huvudregeln för tjänster mellan företag – men det kräver rätt uppgifter på fakturan." },
      { t: "Prissättning per ord", d: "Ett pris på 1,20 kr/ord och 4 300 ord ska bli rätt summa utan handräkning – och synas tydligt för kunden." },
      { t: "Många små uppdrag", d: "Fem texter på en vecka till samma byrå. Antingen fem fakturor eller en samlad – men aldrig fem glömda." },
    ],
    faq: [
      { q: "Hur fakturerar jag en kund i ett annat EU-land?", a: "Säljer du till ett företag i ett annat EU-land med giltigt VAT-nummer fakturerar du normalt utan svensk moms enligt reglerna om omvänd betalningsskyldighet. Fakturan ska då innehålla både ditt och kundens VAT-nummer och en hänvisning till att omvänd betalningsskyldighet gäller. Kontrollera alltid kundens VAT-nummer innan du skickar." },
      { q: "Hur fakturerar jag per ord?", a: "Ange antalet ord som antal och ordpriset som styckpris, så räknas summan ut automatiskt. Kunden ser både volymen och priset per enhet, vilket minskar frågorna i efterhand." },
    ],
    relaterade: ["webbdesigner", "konsult", "fotograf"],
  },

  {
    slug: "musiker",
    namn: "musiker",
    singular: "musikern",
    kategori: "kreativt",
    avdrag: null,
    meta: "Fakturaprogram för musiker. Gaget är momsfritt, inspelningsrätt 6 % och skivor 25 % – tre momssatser i samma verksamhet, rätt på fakturan.",
    lead: "Få yrken har så spretiga momsregler som musikerns. Ersättningen du får för att framträda inför publik är momsfri. Upplåter du rätten till en inspelning är det 6 procent. Säljer du skivor, nedladdad musik eller streaming är det 25 procent. Tre olika behandlingar som kan dyka upp samma månad – och ibland på samma faktura.",
    fakturarader: ["Gage för spelning (momsfritt)", "Reseersättning och logi", "Ersättning för inspelningsrätt (6 % moms)", "Skivor och merch (25 % moms)", "Studiotid och produktion", "Repetition inför uppdrag"],
    utmaningar: [
      { t: "Tre momssatser i samma verksamhet", d: "Gaget är momsfritt, inspelningsrätten 6 procent och skivförsäljningen 25 procent. Sätts fel sats på fakturan är det du som får betala mellanskillnaden i efterhand, inte arrangören." },
      { t: "Momsfriheten gäller framträdandet – inte allt annat", d: "Undantaget träffar ersättningen för att framträda inför publik när du själv säljer framträdandet. Bokar du ut andra artister är det artistförmedling, och då gäller 25 procent." },
      { t: "Arrangören betalar efter spelningen, inte på scenen", d: "Gaget faktureras i efterhand, ofta till en förening eller kommun med 30 dagars betalningstid. Utan faktureringsunderlag från kvällen blir det svårt att komma ihåg vad som avtalades." },
    ],
    faq: [
      { q: "Ska jag ta ut moms på gaget för en spelning?", a: "Nej. Den ersättning du som artist får för ditt framträdande inför publik är momsfri. Det förutsätter att du själv säljer framträdandet, att det sker inför en publik och att det du framför är upphovsrättsligt skyddat." },
      { q: "Vilken moms gäller när jag upplåter rätten till en inspelning?", a: "6 procent. Det gäller när du som utövande konstnär upplåter eller överlåter rätten till en inspelning av ett verk du framför, till exempel till ett skivbolag eller en upphovsrättsorganisation." },
      { q: "Vilken moms gäller på skivor, nedladdningar och streaming?", a: "25 procent. Försäljning av skivor, nedladdad musik och streaming av musik beskattas med full momssats – till skillnad från både gaget och inspelningsrätten." },
      { q: "Vilken moms gäller om jag bokar ut andra artister?", a: "25 procent. Artistförmedling är en vanlig tjänst och omfattas varken av undantaget för framträdanden eller av den lägre kultursatsen." },
    ],
    relaterade: ["fotograf", "oversattare", "konsult"],
  },

  {
    slug: "grafisk-designer",
    namn: "grafiska designers",
    singular: "grafiska designern",
    kategori: "kreativt",
    avdrag: null,
    meta: "Fakturaprogram för grafiska designers. Skilj på nyttjanderätt och originalfiler redan i offerten – det är där diskussionerna uppstår.",
    lead: "Som grafisk designer säljer du sällan bara tid. Du säljer också rätten att använda det du har gjort, och ibland själva originalfilerna. Upphovsrätten uppstår hos dig och följer inte automatiskt med fakturan. Står det inte i offerten vad kunden får använda logotypen till, kommer frågan i stället ett år senare – när den redan sitter på en lastbil.",
    fakturarader: ["Designarbete (tim)", "Logotyp och visuell identitet, fast pris", "Nyttjanderätt, omfattning och tid", "Överlämning av originalfiler", "Extra korrekturrunda", "Tryckoriginal och repro"],
    utmaningar: [
      { t: "Nyttjanderätt är inte samma sak som äganderätt", d: "Kunden betalar normalt för att få använda arbetet, inte för att överta upphovsrätten. Hur brett och hur länge rätten gäller är en prisfråga – skriv ut omfattningen i stället för att lämna den öppen." },
      { t: "Originalfilerna är ett eget beslut", d: "Levererad PDF och redigerbar originalfil är två olika saker. Lämnar du över originalet kan kunden ändra arbetet utan dig. Det kan vara helt rimligt, men det ska vara prissatt och inte något som antas ingå." },
      { t: "Korrekturrundorna tar slut", d: "Ett fast pris utan angivet antal rundor blir löpande arbete till fast pris. Ange hur många rundor som ingår och vad en extra runda kostar, redan i offerten." },
    ],
    faq: [
      { q: "Ingår originalfilerna när kunden har betalat?", a: "Inte automatiskt. Det kunden har köpt är det ni har kommit överens om. Vill kunden ha de redigerbara originalfilerna är det en egen post – ange den i offerten så slipper ni diskussionen vid leverans." },
      { q: "Hur skriver jag nyttjanderätten på fakturan?", a: "Som en egen rad med omfattning och tid, till exempel \"Nyttjanderätt logotyp, samtliga kanaler, utan tidsbegränsning\". Är rätten begränsad i tid bör det framgå när den löper ut, så att en förlängning kan faktureras." },
      { q: "Vad gäller för bilder och typsnitt jag har köpt in?", a: "Licensen du har köpt gäller dig, inte automatiskt din kund. Kontrollera om licensen får överlåtas innan du levererar – annars kan kunden använda material utan giltig licens, och det är din leverans det hänger på." },
    ],
    relaterade: ["webbdesigner", "fotograf", "musiker"],
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
      { t: "Timmar som ska specificeras", d: "Större kunder vill se datum, antal timmar och vad som gjordes. En faktura med bara \"Konsultarvode 42 tim\" kan behöva kompletteras." },
      { t: "Vidarefakturering av resa och logi", d: "Resa och logi faktureras vidare utan påslag. De hör hemma på egna rader, så att både du och kunden ser vad som är arvode och vad som är kostnad." },
      { t: "Långa betalningsvillkor", d: "Stora bolag betalar på 30 eller 60 dagar. Utan påminnelser blir det ofta längre än så." },
    ],
    faq: [
      { q: "Hur detaljerad ska en konsultfaktura vara?", a: "Fakturan måste enligt lag innehålla uppgift om tjänstens omfattning och art. Ange därför alltid vad uppdraget avser, antal timmar och period. Många kunder kräver dessutom en tidsspecifikation – att lägga den på egna rader från början sparar en runda fram och tillbaka." },
      { q: "Behöver jag F-skatt för att fakturera som konsult?", a: "Som egenföretagare behöver du F-skatt eller FA-skatt för att kunden inte ska behöva göra skatteavdrag och betala arbetsgivaravgifter. Om du är godkänd för F-skatt anger du \"Godkänd för F-skatt\" på fakturan – det är det kunden kontrollerar först." },
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
      { t: "Säsongstoppar", d: "Arbetet med bokslut och deklarationer sammanfaller ofta. När arbetsbelastningen är som högst är faktureringen lätt att skjuta upp." },
    ],
    faq: [
      { q: "Kan flera konsulter arbeta i samma konto?", a: "Ja. Med byråplanen bjuder du in flera konsulter, tilldelar kunder och styr behörigheter i tre nivåer. Varje konsult ser bara de företag som har tilldelats konsulten, medan byråansvarig har full överblick." },
      { q: "Kan jag fakturera åt mina kunder?", a: "Ja. Som tilldelad konsult skapar och skickar du fakturor i kundens namn, med kundens företagsuppgifter, bankgiro och fakturamall. Numreringen följer kundens egen serie." },
    ],
    relaterade: ["konsult", "webbdesigner"],
  },
];

export const yrkeSlugs = yrken.map((y) => y.slug);
export const getYrke = (slug: string) => yrken.find((y) => y.slug === slug);
