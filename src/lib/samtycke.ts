/**
 * Namnet pa besokarens cookie-val.
 *
 * Det lases pa tre stallen: bannern, skriptet i <head> som doljer bannern
 * fore forsta malningen, och GoogleAnalytics som avgor om statistik far
 * startas. Skrivs namnet pa flera hall kan de glida ifran varandra - och da
 * laddas statistik utan samtycke, utan att nagot ser trasigt ut.
 */
export const KEY_SAMTYCKE = "lf-cookie-consent"; // "all" | "necessary"
