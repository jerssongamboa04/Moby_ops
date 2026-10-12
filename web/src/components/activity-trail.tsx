/** Decorative trace of a recorded action; it does not represent live routes. */
export function ActivityTrail() {
  return <svg className="activity-trail" viewBox="0 0 720 230" aria-hidden="true" focusable="false">
    <g fill="var(--color-selected)">
      <circle cx="100" cy="86" r="65" />
      <circle cx="292" cy="169" r="57" />
      <circle cx="489" cy="70" r="63" />
      <circle cx="650" cy="140" r="58" />
      <circle cx="579" cy="198" r="23" />
    </g>
    <g fill="none" stroke="var(--color-muted)" strokeWidth="1" strokeDasharray="3 9" opacity=".55">
      <circle cx="100" cy="86" r="82" />
      <circle cx="292" cy="169" r="60" />
      <circle cx="489" cy="70" r="68" />
      <circle cx="650" cy="140" r="67" />
    </g>
    <path d="M100 86 C192 50 203 184 292 169 S392 30 489 70 S573 156 650 140"
      fill="none" stroke="var(--color-neon)" strokeWidth="18" strokeLinecap="round" />
    <g fill="var(--color-canvas)" stroke="var(--color-ink)" strokeWidth="1.8">
      <circle cx="100" cy="86" r="38" /><circle cx="292" cy="169" r="38" />
      <circle cx="489" cy="70" r="38" /><circle cx="650" cy="140" r="38" />
    </g>
    <image href="/icons/bicycle-outline.svg" x="74" y="60" width="52" height="52" />
    <image href="/icons/lock-closed-outline.svg" x="275" y="148" width="34" height="40" />
    <g fill="none" stroke="var(--color-ink)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M489 92 C484 84 473 76 473 66 A16 16 0 0 1 505 66 C505 76 494 84 489 92 Z" />
      <circle cx="489" cy="65" r="5" />
      <path d="M632 129 H641 L645 123 H655 L659 129 H668 A4 4 0 0 1 672 133 V153 A4 4 0 0 1 668 157 H632 A4 4 0 0 1 628 153 V133 A4 4 0 0 1 632 129 Z" />
      <circle cx="650" cy="143" r="8" />
    </g>
    <g fill="var(--color-neon)"><circle cx="202" cy="37" r="4" /><circle cx="389" cy="189" r="4" /><circle cx="585" cy="44" r="4" /></g>
    <g fill="var(--color-ink)"><circle cx="193" cy="70" r="3" /><circle cx="412" cy="81" r="3" /><circle cx="602" cy="15" r="3" /></g>
  </svg>;
}
