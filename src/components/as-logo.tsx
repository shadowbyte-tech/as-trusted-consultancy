export function ASLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#fde047', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#facc15', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <path
        d="M50 2.5 L93.3 26.25 L93.3 73.75 L50 97.5 L6.7 73.75 L6.7 26.25 Z"
        fill="url(#gold-gradient)"
        stroke="black"
        strokeWidth="3"
      />
      <text
        x="50"
        y="58"
        fontFamily="Arial, sans-serif"
        fontSize="36"
        fontWeight="bold"
        fill="black"
        textAnchor="middle"
      >
        A.S
      </text>
    </svg>
  );
}
