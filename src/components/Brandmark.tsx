/**
 * EnkeltFaktura-logotypens ikon: tre staplade streck dar det nedersta
 * svingar upp at hoger. Geometrin ar vektoriserad fran originalfilen
 * (public/logo.png) och verifierad mot den (IoU 0.91) - andra inte
 * koordinaterna utan att jamfora mot originalet igen.
 *
 * color ar brandbla som standard. Pa mork botten: skicka "#FFFFFF"
 * (eller "currentColor" for att arva textfargen).
 */
export function Brandmark({
  className = "",
  color = "#0359F8",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g stroke={color} strokeWidth="12.08" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.04 8.9H41.96" />
        <path d="M6.04 23.36H26.22" />
        <path d="M6.04 39.1H30.19L41.96 32.11" />
      </g>
    </svg>
  );
}
