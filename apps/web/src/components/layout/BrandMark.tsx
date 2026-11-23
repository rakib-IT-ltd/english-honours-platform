/** Original open-book logo mark (placeholder until the owner supplies a real logo). */
export function BrandMark({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="" aria-hidden="true">
      <path d="M32 20c-6-5-15-6-24-4v33c9-2 18-1 24 4z" fill="#f0a830" />
      <path d="M32 20c6-5 15-6 24-4v33c-9-2-18-1-24 4z" fill="#f7c566" />
      <path d="M32 20v33" stroke="#0b2a5b" strokeWidth="2" />
      <path d="M8 52c8-2 17-1 24 4 7-5 16-6 24-4" fill="none" stroke="#dfe8f6" strokeWidth="2" />
    </svg>
  );
}
