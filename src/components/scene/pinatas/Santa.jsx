import { STROKE, THIN } from './shared.jsx'

const RED = '#D7263D'
const SKIN = '#F7C9A0'

/** Santa Claus redondito de papel. */
export default function Santa({ palette }) {
  const [main, , accent] = palette
  return (
    <g>
      {/* Cuerpo */}
      <ellipse cx="150" cy="255" rx="105" ry="88" fill={RED} {...STROKE} />
      <path d="M150,343 A105,88 0 0,0 255,255 L215,255 Q210,320 150,343 Z" fill="url(#halftone)" />
      <rect x="47" y="255" width="206" height="26" fill="#1A1A1A" />
      <rect x="132" y="250" width="36" height="36" rx="5" fill="#FFC20E" {...THIN} />
      <rect x="142" y="260" width="16" height="16" fill="#1A1A1A" />
      {/* Brazos */}
      <ellipse cx="52" cy="220" rx="22" ry="40" fill={RED} {...STROKE} transform="rotate(25 52 220)" />
      <ellipse cx="248" cy="220" rx="22" ry="40" fill={RED} {...STROKE} transform="rotate(-25 248 220)" />
      <circle cx="40" cy="252" r="15" fill={accent} {...THIN} />
      <circle cx="260" cy="252" r="15" fill={accent} {...THIN} />
      {/* Cabeza */}
      <circle cx="150" cy="150" r="58" fill={SKIN} {...STROKE} />
      <path d="M92,160 Q96,232 150,240 Q204,232 208,160 Q180,180 150,176 Q120,180 92,160 Z" fill="#fff" {...STROKE} />
      <path d="M120,176 Q135,164 150,176 Q165,164 180,176 Q165,186 150,180 Q135,186 120,176 Z" fill="#fff" {...THIN} />
      <circle cx="150" cy="160" r="10" fill="#F28C8C" {...THIN} />
      <circle cx="130" cy="140" r="6" fill="#1A1A1A" />
      <circle cx="170" cy="140" r="6" fill="#1A1A1A" />
      <circle cx="116" cy="160" r="8" fill={main} opacity="0.35" />
      <circle cx="184" cy="160" r="8" fill={main} opacity="0.35" />
      {/* Gorro */}
      <path d="M92,118 Q110,40 196,58 Q240,70 248,120 L208,112 Q150,96 92,118 Z" fill={RED} {...STROKE} />
      <rect x="84" y="106" width="132" height="26" rx="13" fill="#fff" {...STROKE} />
      <circle cx="250" cy="124" r="17" fill="#fff" {...STROKE} />
    </g>
  )
}
