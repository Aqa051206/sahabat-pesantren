import { Bell, HeartHandshake, Lock, MessageCircle, ShieldCheck } from 'lucide-react'

const badges = [
  { Icon: ShieldCheck, background: 'var(--color-mint-50)', iconColor: 'text-primary' },
  { Icon: Lock, background: 'var(--color-sky-50)', iconColor: 'text-lavender' },
  { Icon: MessageCircle, background: 'var(--color-pink)', iconColor: 'text-primary' },
  { Icon: Bell, background: 'var(--color-amber)', iconColor: 'text-primary' },
  { Icon: HeartHandshake, background: 'var(--color-mint-50)', iconColor: 'text-primary' },
]

export default function HeroIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-[560px]">
      <div className="absolute inset-0 rounded-full border border-[var(--color-sky-50)] bg-gradient-to-br from-[var(--color-mint-50)] via-[var(--color-sky-50)] to-[var(--color-band-1)] blur-[2px]" />
      <svg
        viewBox="0 0 560 430"
        role="img"
        aria-label="Ilustrasi ruang aman santri"
        className="relative z-10 w-full drop-shadow-[0_22px_40px_rgba(28,42,90,0.12)]"
      >
        <circle cx="280" cy="200" r="150" fill="rgba(18,198,214,0.08)" />
        <circle cx="280" cy="200" r="135" fill="none" stroke="var(--color-sky-50)" strokeWidth="2" />
        <circle cx="280" cy="200" r="105" fill="none" stroke="var(--color-sky-50)" strokeWidth="1.5" strokeDasharray="10 12" />

        {badges.map(({ Icon, background, iconColor }, index) => {
          const angle = (Math.PI * 2 * index) / badges.length - Math.PI / 2
          const x = 280 + Math.cos(angle) * 170
          const y = 200 + Math.sin(angle) * 170
          return (
            <g key={Icon.displayName ?? index} transform={`translate(${x - 22}, ${y - 22})`}>
              <circle r="22" fill="white" />
              <circle r="18" fill={background} />
              <Icon size={18} x={-9} y={-9} className={iconColor} />
            </g>
          )
        })}

        <g transform="translate(132 100)">
          <rect x="120" y="28" width="178" height="168" rx="26" fill="var(--color-band-1)" />
          <rect x="154" y="54" width="110" height="76" rx="18" fill="var(--color-mint-50)" />
          <rect x="164" y="70" width="90" height="18" rx="9" fill="var(--color-mint-50)" />
          <rect x="164" y="95" width="68" height="12" rx="6" fill="var(--color-sky-50)" />
          <rect x="145" y="145" width="130" height="18" rx="9" fill="var(--color-sky-50)" />
          <circle cx="147" cy="176" r="10" fill="var(--color-mint-50)" />
          <circle cx="286" cy="160" r="70" fill="var(--color-sky-50)" />
          <path d="M245 163 C255 116, 330 109, 342 157 C351 194, 316 230, 280 228 C249 226, 229 196, 245 163Z" fill="var(--color-primary)" opacity="0.14" />
          <circle cx="314" cy="128" r="24" fill="var(--color-amber)" opacity="0.18" />
          <path d="M196 195 L296 195 L324 260 L171 260 Z" fill="white" />
          <path d="M238 149 L270 149 L292 194 L214 194 Z" fill="var(--color-sky-50)" />
          <circle cx="240" cy="110" r="30" fill="var(--color-mint-50)" />
          <circle cx="240" cy="110" r="18" fill="white" />
          <circle cx="228" cy="108" r="4" fill="var(--color-navy)" /><circle cx="252" cy="108" r="4" fill="var(--color-navy)" />
          <path d="M228 120 Q240 129 252 120" stroke="var(--color-navy)" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M150 260 L410 260" stroke="var(--color-line)" strokeWidth="4" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  )
}
