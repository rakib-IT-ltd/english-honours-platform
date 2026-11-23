/** Original illustration (stacked books and an open book). Decorative only. */
export function HeroIllustration() {
  const spines: { y: number; fill: string; label: string }[] = [
    { y: 28, fill: '#16397a', label: 'Literature' },
    { y: 70, fill: '#1c4690', label: 'Poetry' },
    { y: 112, fill: '#14336d', label: 'Drama' },
    { y: 154, fill: '#1a4189', label: 'Criticism' },
  ];
  return (
    <svg viewBox="0 0 420 300" aria-hidden="true" focusable="false" className="hero-art">
      <ellipse cx="215" cy="268" rx="190" ry="16" fill="#0b2a5b" opacity="0.12" />
      {spines.map((book, index) => (
        <g key={book.label} transform={`translate(${index % 2 === 0 ? 0 : 10} 0)`}>
          <rect x="150" y={book.y} width="210" height="38" rx="4" fill={book.fill} />
          <rect x="150" y={book.y + 33} width="210" height="5" fill="#f3e6c4" />
          <rect x="164" y={book.y + 8} width="4" height="22" fill="#f0a830" />
          <text x="182" y={book.y + 25} fill="#f7e4b3" fontSize="17" fontFamily="Georgia, serif">
            {book.label}
          </text>
        </g>
      ))}
      <path
        d="M215 232C185 214 130 212 82 232V262C130 244 185 246 215 266Z"
        fill="#fff8e6"
        stroke="#d9c79a"
      />
      <path
        d="M215 232C245 214 300 212 348 232V262C300 244 245 246 215 266Z"
        fill="#fffdf4"
        stroke="#d9c79a"
      />
      <path d="M215 232V266" stroke="#d9c79a" />
      <g fill="none" stroke="#b9ab84" strokeWidth="2">
        <path d="M105 236C140 228 180 230 205 242M105 248C140 240 180 242 205 254" />
        <path d="M225 242C250 230 290 228 325 236M225 254C250 242 290 240 325 248" />
      </g>
      <rect
        x="330"
        y="262"
        width="80"
        height="8"
        rx="4"
        fill="#1b1f2a"
        transform="rotate(-8 330 262)"
      />
    </svg>
  );
}
