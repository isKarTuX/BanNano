interface FlowerProps {
  className?: string
  style?: React.CSSProperties
}

export function Sunflower({ className, style }: FlowerProps) {
  return (
    <svg
      viewBox="0 0 120 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      {/* Tallo */}
      <path
        d="M58 160 Q62 140 60 120 Q58 100 60 80"
        stroke="#6B8E23"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      {/* Hoja izquierda */}
      <path
        d="M58 120 Q45 115 40 125 Q38 130 42 132 Q48 135 55 128"
        stroke="#6B8E23"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Hoja derecha */}
      <path
        d="M60 105 Q75 100 80 108 Q82 112 78 114 Q72 116 65 110"
        stroke="#6B8E23"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Centro */}
      <circle cx="60" cy="60" r="18" fill="#8B6914" stroke="#5C4A0D" strokeWidth="2.5" />
      {/* Pétalos - estilo dibujo irregular */}
      <g stroke="#DAA520" strokeWidth="2.5" strokeLinecap="round" fill="#FFD700">
        <ellipse cx="60" cy="28" rx="6" ry="16" transform="rotate(0 60 60)" />
        <ellipse cx="60" cy="28" rx="6" ry="16" transform="rotate(30 60 60)" />
        <ellipse cx="60" cy="28" rx="6" ry="16" transform="rotate(60 60 60)" />
        <ellipse cx="60" cy="28" rx="6" ry="16" transform="rotate(90 60 60)" />
        <ellipse cx="60" cy="28" rx="6" ry="16" transform="rotate(120 60 60)" />
        <ellipse cx="60" cy="28" rx="6" ry="16" transform="rotate(150 60 60)" />
        <ellipse cx="60" cy="28" rx="6" ry="16" transform="rotate(180 60 60)" />
        <ellipse cx="60" cy="28" rx="6" ry="16" transform="rotate(210 60 60)" />
        <ellipse cx="60" cy="28" rx="6" ry="16" transform="rotate(240 60 60)" />
        <ellipse cx="60" cy="28" rx="6" ry="16" transform="rotate(270 60 60)" />
        <ellipse cx="60" cy="28" rx="6" ry="16" transform="rotate(300 60 60)" />
        <ellipse cx="60" cy="28" rx="6" ry="16" transform="rotate(330 60 60)" />
      </g>
      {/* Puntos en el centro */}
      <circle cx="55" cy="55" r="1.5" fill="#5C4A0D" />
      <circle cx="65" cy="58" r="1.5" fill="#5C4A0D" />
      <circle cx="58" cy="65" r="1.5" fill="#5C4A0D" />
      <circle cx="63" cy="63" r="1.5" fill="#5C4A0D" />
      <circle cx="56" cy="62" r="1.5" fill="#5C4A0D" />
    </svg>
  )
}

export function Tulip({ className, style }: FlowerProps) {
  return (
    <svg
      viewBox="0 0 100 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      {/* Tallo */}
      <path
        d="M50 140 Q52 120 50 100 Q48 80 50 60"
        stroke="#228B22"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Hoja izquierda */}
      <path
        d="M48 110 Q30 105 25 115 Q23 120 28 122 Q36 125 46 118"
        stroke="#228B22"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="#32CD32"
        fillOpacity="0.3"
      />
      {/* Hoja derecha */}
      <path
        d="M50 95 Q68 90 72 98 Q74 102 70 104 Q64 106 54 102"
        stroke="#228B22"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="#32CD32"
        fillOpacity="0.3"
      />
      {/* Flor - pétalos de tulipán */}
      <g>
        {/* Pétalo izquierdo */}
        <path
          d="M50 60 Q35 40 30 25 Q28 15 35 10 Q42 8 48 18 Q50 25 50 35"
          stroke="#FF1493"
          strokeWidth="2.5"
          fill="#FF69B4"
          fillOpacity="0.7"
        />
        {/* Pétalo derecho */}
        <path
          d="M50 60 Q65 40 70 25 Q72 15 65 10 Q58 8 52 18 Q50 25 50 35"
          stroke="#FF1493"
          strokeWidth="2.5"
          fill="#FF1493"
          fillOpacity="0.6"
        />
        {/* Pétalo centro */}
        <path
          d="M50 60 Q45 35 48 20 Q50 12 52 20 Q55 35 50 60"
          stroke="#C71585"
          strokeWidth="2"
          fill="#FF1493"
          fillOpacity="0.5"
        />
        {/* Detalle interior */}
        <path
          d="M45 25 Q50 20 55 25"
          stroke="#C71585"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M43 35 Q50 30 57 35"
          stroke="#C71585"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  )
}

export function Daisy({ className, style }: FlowerProps) {
  return (
    <svg
      viewBox="0 0 100 130"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      {/* Tallo */}
      <path
        d="M50 130 Q52 110 50 90 Q48 70 50 50"
        stroke="#6B8E23"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Hojas */}
      <path
        d="M48 105 Q35 100 30 108 Q28 112 33 114 Q40 116 47 110"
        stroke="#6B8E23"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Centro */}
      <circle cx="50" cy="38" r="12" fill="#FFD700" stroke="#DAA520" strokeWidth="2" />
      {/* Pétalos blancos estilo dibujo */}
      <g stroke="#E8E8E8" strokeWidth="2" fill="#FFFFFF" fillOpacity="0.9">
        <ellipse cx="50" cy="18" rx="5" ry="14" />
        <ellipse cx="50" cy="18" rx="5" ry="14" transform="rotate(30 50 38)" />
        <ellipse cx="50" cy="18" rx="5" ry="14" transform="rotate(60 50 38)" />
        <ellipse cx="50" cy="18" rx="5" ry="14" transform="rotate(90 50 38)" />
        <ellipse cx="50" cy="18" rx="5" ry="14" transform="rotate(120 50 38)" />
        <ellipse cx="50" cy="18" rx="5" ry="14" transform="rotate(150 50 38)" />
        <ellipse cx="50" cy="18" rx="5" ry="14" transform="rotate(180 50 38)" />
        <ellipse cx="50" cy="18" rx="5" ry="14" transform="rotate(210 50 38)" />
        <ellipse cx="50" cy="18" rx="5" ry="14" transform="rotate(240 50 38)" />
        <ellipse cx="50" cy="18" rx="5" ry="14" transform="rotate(270 50 38)" />
        <ellipse cx="50" cy="18" rx="5" ry="14" transform="rotate(300 50 38)" />
        <ellipse cx="50" cy="18" rx="5" ry="14" transform="rotate(330 50 38)" />
      </g>
      {/* Puntos en centro */}
      <circle cx="47" cy="35" r="1.5" fill="#DAA520" />
      <circle cx="53" cy="37" r="1.5" fill="#DAA520" />
      <circle cx="50" cy="41" r="1.5" fill="#DAA520" />
      <circle cx="48" cy="39" r="1.5" fill="#DAA520" />
      <circle cx="52" cy="35" r="1.5" fill="#DAA520" />
    </svg>
  )
}

export function Rose({ className, style }: FlowerProps) {
  return (
    <svg
      viewBox="0 0 90 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      {/* Tallo con espinas */}
      <path
        d="M45 140 Q47 120 45 100 Q43 80 45 60"
        stroke="#228B22"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Espinas */}
      <path d="M44 115 L38 112" stroke="#228B22" strokeWidth="2" strokeLinecap="round" />
      <path d="M46 95 L52 92" stroke="#228B22" strokeWidth="2" strokeLinecap="round" />
      <path d="M44 80 L38 77" stroke="#228B22" strokeWidth="2" strokeLinecap="round" />
      {/* Hojas */}
      <path
        d="M43 110 Q28 105 23 113 Q21 117 26 119 Q33 121 41 116"
        stroke="#228B22"
        strokeWidth="2"
        strokeLinecap="round"
        fill="#32CD32"
        fillOpacity="0.3"
      />
      {/* Rosa */}
      <g>
        {/* Pétalos en capas */}
        <ellipse cx="45" cy="35" rx="18" ry="22" fill="#DC143C" fillOpacity="0.8" stroke="#8B0000" strokeWidth="2" />
        <ellipse cx="40" cy="32" rx="12" ry="16" fill="#FF1493" fillOpacity="0.6" stroke="#C71585" strokeWidth="1.5" />
        <ellipse cx="50" cy="32" rx="12" ry="16" fill="#FF1493" fillOpacity="0.6" stroke="#C71585" strokeWidth="1.5" />
        {/* Espiral interior */}
        <path
          d="M45 42 Q38 38 42 32 Q46 28 50 32 Q54 36 50 40"
          stroke="#8B0000"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M45 38 Q42 36 44 34 Q46 32 48 34"
          stroke="#8B0000"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
      </g>
    </svg>
  )
}
