/** Enkelfaktura-logotypens ikon (dokument med vikt hörn + grön bock). Navy + teal. */
export function Brandmark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M16 8.5H27L35.5 17V37.4A3.2 3.2 0 0 1 32.3 40.6H16A3.2 3.2 0 0 1 12.8 37.4V11.7A3.2 3.2 0 0 1 16 8.5Z" fill="#FFFFFF" stroke="#13294B" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M27 8.8V17H35.4Z" fill="#AECBE8" />
      <path d="M27 8.8V17H35.4" fill="none" stroke="#13294B" strokeWidth="2.3" strokeLinejoin="round" />
      <path d="M17.6 18.6H26" stroke="#8FB0D6" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M17.6 23.4H22.6" stroke="#8FB0D6" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M14.6 30.8L20.4 37L32 23.4" stroke="#15A39A" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
