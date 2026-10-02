
/* ============================================================
   5e. Mochi's life: 🐾 pets (25 rare animals with real biology stories) and 🩺 getting sick
   ============================================================ */
/* ---------- Pet art: Mochi-style, 200 × 200 ---------- */
const pE = (x, y, r = 1) => `<ellipse cx="${x}" cy="${y}" rx="${5 * r}" ry="${6.2 * r}" fill="${CO}"/><circle cx="${x + 1.8 * r}" cy="${y - 2.4 * r}" r="${2 * r}" fill="#fff"/>`;
const pB = (x1, x2, y, r = 1) => `<ellipse cx="${x1}" cy="${y}" rx="${9 * r}" ry="${5.4 * r}" fill="#FFB3C1" opacity=".8"/><ellipse cx="${x2}" cy="${y}" rx="${9 * r}" ry="${5.4 * r}" fill="#FFB3C1" opacity=".8"/>`;
const pM = (x, y, w = 6) => `<path d="M${x - w} ${y} q${w / 2} ${w * .8} ${w} 0 q${w / 2} ${w * .8} ${w} 0" fill="none" stroke="${CO}" stroke-width="2.8" stroke-linecap="round"/>`;
const pFace = (x1, x2, y, r = 1) => pE(x1, y, r) + pE(x2, y, r) + pB(x1 - 14 * r, x2 + 14 * r, y + 14 * r, r) + pM((x1 + x2) / 2, y + 12 * r, 5 * r);
const SH = `<ellipse cx="100" cy="186" rx="54" ry="7" fill="rgba(91,75,73,.13)"/>`;
const blobP = (fill, extra = "") => `<path d="${BODY}" fill="${fill}" ${CS}/>${extra}`;
const PET_ART = {
  dolphin: () => `${SH}<path d="M92 86 L106 52 L122 90Z" fill="#F7B7C8" ${CS}/><path d="M34 122 L8 96 L16 124 L6 150Z" fill="#F7B7C8" ${CS}/><path d="M30 124 C38 84 120 70 162 98 C178 106 190 112 198 110 C194 126 178 134 160 134 C128 158 58 160 30 124Z" fill="#F7B7C8" ${CS}/><path d="M92 138 L80 162 L108 142Z" fill="#F2A0B6" ${CS}/><path d="M60 128 Q110 150 158 132" fill="none" stroke="#FFE3EA" stroke-width="6" stroke-linecap="round"/>${pE(146, 106)}${pB(0, 138, 120).replace(/<ellipse cx="0"[^>]*>/, "")}<path d="M170 120 q8 4 16 0" fill="none" stroke="${CO}" stroke-width="2.6" stroke-linecap="round"/>`,
  spoonbill: () => `${SH}<path d="M88 176 v10 M112 176 v10" stroke="#2B2433" stroke-width="5" stroke-linecap="round"/><path d="M84 66 q-14 -26 6 -34 q-4 14 10 26" fill="#F6E7B0" ${CS}/>${blobP("#fff")}<ellipse cx="112" cy="110" rx="26" ry="16" fill="#2B2433"/><circle cx="112" cy="106" r="4" fill="#fff"/><circle cx="113" cy="105" r="2" fill="${CO}"/><path d="M118 118 L178 136 Q198 142 192 156 Q184 166 170 154 L112 128Z" fill="#2B2433" ${CS}/>${pB(70, 150, 130)}<path d="M52 140 q18 16 40 10" fill="none" stroke="#E9E4DA" stroke-width="5" stroke-linecap="round"/>`,
  treefrog: () => `${SH}<circle cx="68" cy="88" r="20" fill="#C8A27A" ${CS}/><circle cx="132" cy="88" r="20" fill="#C8A27A" ${CS}/><ellipse cx="100" cy="132" rx="66" ry="50" fill="#C8A27A" ${CS}/><path d="M76 118 L124 156 M124 118 L76 156" stroke="#9C7A55" stroke-width="6" stroke-linecap="round" opacity=".55"/>${pE(68, 88, 1.2)}${pE(132, 88, 1.2)}${pB(56, 144, 130)}<path d="M80 140 Q100 154 120 140" fill="none" stroke="${CO}" stroke-width="3" stroke-linecap="round"/>${[[44, 176], [156, 176]].map(([x, y]) => `<g fill="#C8A27A" ${CS}><circle cx="${x - 10}" cy="${y}" r="6"/><circle cx="${x}" cy="${y + 3}" r="6"/><circle cx="${x + 10}" cy="${y}" r="6"/></g>`).join("")}`,
  turtle: () => `${SH}<ellipse cx="62" cy="170" rx="14" ry="9" fill="#E8C35A" ${CS}/><ellipse cx="138" cy="170" rx="14" ry="9" fill="#E8C35A" ${CS}/><circle cx="170" cy="126" r="24" fill="#F2C84B" ${CS}/><path d="M30 150 C30 72 150 72 160 150Z" fill="#8A6A3A" ${CS}/><path d="M36 150 H160" stroke="${CO}" stroke-width="3.5"/><path d="M60 110 Q96 90 132 110 M52 132 Q96 112 146 132" fill="none" stroke="#6E522A" stroke-width="3"/><path d="M96 84 V150 M70 96 L64 150 M124 96 L130 150" stroke="#2B2433" stroke-width="6" stroke-linecap="round" opacity=".8"/>${pE(176, 120)}<ellipse cx="164" cy="136" rx="6" ry="3.5" fill="#FFB3C1"/><path d="M180 134 q5 4 10 0" fill="none" stroke="${CO}" stroke-width="2.6" stroke-linecap="round"/>`,
  horseshoe: () => `${SH}<path d="M100 150 L100 196" stroke="#7A6450" stroke-width="7" stroke-linecap="round"/><path d="M62 150 L138 150 L126 176 L74 176Z" fill="#8C7458" ${CS}/><path d="M24 150 C24 64 176 64 176 150 Q100 128 24 150Z" fill="#A58B6A" ${CS}/><path d="M60 96 Q100 80 140 96" fill="none" stroke="#C4AA86" stroke-width="5" stroke-linecap="round"/><ellipse cx="62" cy="112" rx="6" ry="4" fill="#5B4B49" transform="rotate(-20 62 112)"/><ellipse cx="138" cy="112" rx="6" ry="4" fill="#5B4B49" transform="rotate(20 138 112)"/>${pE(88, 126)}${pE(112, 126)}${pB(74, 126, 138, .8)}`,
  redpanda: () => `${SH}<path d="M150 170 C196 170 202 118 176 104 C184 130 176 150 152 152Z" fill="#C9541F" ${CS}/><path d="M176 110 l8 8 M184 128 l10 2 M180 148 l10 -4" stroke="#7A3212" stroke-width="7" stroke-linecap="round"/><path d="M52 96 L50 58 L86 72Z M148 96 L150 58 L114 72Z" fill="#C9541F" ${CS}/><path d="M58 84 L57 66 L76 74Z M142 84 L143 66 L124 74Z" fill="#fff"/>${blobP("#D9622B")}<path d="M60 112 Q70 96 84 108 M140 112 Q130 96 116 108" fill="#fff"/><ellipse cx="100" cy="134" rx="22" ry="14" fill="#fff"/><path d="M78 118 L70 146 M122 118 L130 146" stroke="#8A3512" stroke-width="6" stroke-linecap="round"/>${pE(80, 116)}${pE(120, 116)}<ellipse cx="100" cy="128" rx="6" ry="4" fill="${CO}"/>${pM(100, 136, 5)}`,
  platypus: () => `${SH}<path d="M100 160 C60 196 20 188 16 168 C30 158 60 150 100 150Z" fill="#6B4430" ${CS}/><path d="M22 168 L52 158 M30 178 L66 164" stroke="#8C5A3C" stroke-width="2"/>${blobP("#8C5A3C")}${pE(80, 110)}${pE(120, 110)}${pB(62, 138, 126)}<ellipse cx="100" cy="142" rx="38" ry="15" fill="#3A3A48" ${CS}/><circle cx="92" cy="138" r="2.5" fill="#6D6D80"/><circle cx="108" cy="138" r="2.5" fill="#6D6D80"/><path d="M56 176 l-6 8 l8 -2 l2 8 l6 -8 Z M144 176 l6 8 l-8 -2 l-2 8 l-6 -8 Z" fill="#E08A5E" ${CS}/>`,
  molerat: () => `${SH}${blobP("#F6BFB0")}<path d="M52 96 q10 -6 18 0 M130 96 q10 -6 18 0 M48 150 q14 6 26 0 M126 150 q14 6 26 0 M70 80 q30 -10 60 0" fill="none" stroke="#E59A88" stroke-width="3" stroke-linecap="round"/><circle cx="82" cy="112" r="3" fill="${CO}"/><circle cx="118" cy="112" r="3" fill="${CO}"/>${pB(66, 134, 126)}<ellipse cx="100" cy="126" rx="9" ry="6" fill="#E59A88"/><rect x="92" y="134" width="7.5" height="16" rx="2" fill="#FFF8E7" ${CS}/><rect x="100.5" y="134" width="7.5" height="16" rx="2" fill="#FFF8E7" ${CS}/><path d="M72 128 l-18 -4 M72 134 l-18 2 M128 128 l18 -4 M128 134 l18 2" stroke="${CO}" stroke-width="1.6" stroke-linecap="round"/>`,
  fennec: () => `${SH}<path d="M150 172 C194 176 202 130 182 114 C186 138 176 156 150 158Z" fill="#F3D9A8" ${CS}/><path d="M182 118 C192 126 194 138 190 146 C184 138 182 128 182 118Z" fill="#5B4B49"/><path d="M64 96 L28 10 L98 70Z M136 96 L172 10 L102 70Z" fill="#F3D9A8" ${CS}/><path d="M66 82 L40 28 L88 70Z M134 82 L160 28 L112 70Z" fill="#FFC9D3"/>${blobP("#F3D9A8")}<ellipse cx="100" cy="140" rx="26" ry="16" fill="#FFF6E4"/>${pE(80, 114)}${pE(120, 114)}${pB(62, 138, 130)}<ellipse cx="100" cy="130" rx="6" ry="4.5" fill="${CO}"/>${pM(100, 138, 5)}`,
  sloth: () => `${SH}${blobP("#B9A58A", `<circle cx="60" cy="96" r="6" fill="#9CC48A" opacity=".8"/><circle cx="148" cy="150" r="7" fill="#9CC48A" opacity=".8"/><circle cx="136" cy="80" r="5" fill="#9CC48A" opacity=".8"/>`)}<ellipse cx="100" cy="122" rx="46" ry="32" fill="#EFE3CC"/><path d="M66 110 Q78 102 90 118 M134 110 Q122 102 110 118" stroke="#6E5A45" stroke-width="12" stroke-linecap="round" fill="none"/>${pE(80, 114, .8)}${pE(120, 114, .8)}<ellipse cx="100" cy="128" rx="7" ry="5" fill="${CO}"/><path d="M88 138 Q100 148 112 138" fill="none" stroke="${CO}" stroke-width="3" stroke-linecap="round"/><path d="M30 150 l-8 10 M36 154 l-4 12 M42 156 l0 12 M170 150 l8 10 M164 154 l4 12 M158 156 l0 12" stroke="#5B4B49" stroke-width="3.5" stroke-linecap="round"/>`,
  penguin: () => `${SH}<ellipse cx="80" cy="180" rx="14" ry="6" fill="#2F3140"/><ellipse cx="120" cy="180" rx="14" ry="6" fill="#2F3140"/>${blobP("#2F3140")}<path d="M100 92 C140 92 150 130 146 150 C140 172 60 172 54 150 C50 130 60 92 100 92Z" fill="#fff"/><path d="M58 108 C48 116 50 132 60 136 Q64 120 58 108Z M142 108 C152 116 150 132 140 136 Q136 120 142 108Z" fill="#F6B33A"/>${pE(84, 116)}${pE(116, 116)}${pB(72, 128, 132)}<path d="M92 128 L108 128 L100 140Z" fill="#2B2433"/><path d="M94 130 h12" stroke="#F6B33A" stroke-width="2.5"/>`,
  hummingbird: () => `${SH}<path d="M150 150 q8 -20 20 -10 q-6 14 -20 10Z M150 150 q20 4 20 20 q-16 0 -20 -20Z" fill="#FF8FB1"/><circle cx="152" cy="152" r="5" fill="#FDD66B"/><ellipse cx="60" cy="70" rx="46" ry="18" fill="rgba(211,228,255,.7)" ${CS} transform="rotate(-30 60 70)"/><ellipse cx="140" cy="66" rx="46" ry="18" fill="rgba(211,228,255,.7)" ${CS} transform="rotate(30 140 66)"/><path d="M26 44 l-8 -6 M36 30 l-6 -8 M174 40 l8 -6" stroke="${CO}" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="100" cy="120" rx="44" ry="42" fill="#3FB68B" ${CS}/><path d="M78 140 Q100 158 122 140 Q112 130 100 132 Q88 130 78 140Z" fill="#E0457B"/>${pE(88, 110)}${pE(112, 110)}${pB(76, 124, 124, .7)}<path d="M142 116 L192 104" stroke="${CO}" stroke-width="4" stroke-linecap="round"/>`,
  kakapo: () => `${SH}${blobP("#8DBF5A", [[60, 120], [70, 150], [140, 150], [150, 120], [100, 76], [80, 90], [120, 90]].map(([x, y]) => `<path d="M${x} ${y} l5 3" stroke="#4F7A2C" stroke-width="3" stroke-linecap="round"/>`).join(""))}<ellipse cx="100" cy="118" rx="44" ry="30" fill="#E8D07A"/>${pE(82, 112)}${pE(118, 112)}<path d="M92 120 Q100 116 108 120 L104 138 Q100 142 96 136Z" fill="#E6E0D0" ${CS}/><path d="M60 128 l-16 -2 M60 134 l-16 4 M140 128 l16 -2 M140 134 l16 4" stroke="#C9B26A" stroke-width="2" stroke-linecap="round"/>`,
  chameleon: () => `<defs><linearGradient id="chamG" x1="0" x2="1"><stop offset="0" stop-color="#3FC1C9"/><stop offset=".55" stop-color="#8BD17C"/><stop offset="1" stop-color="#F25F5C"/></linearGradient></defs>${SH}<path d="M150 150 C190 150 196 110 170 104 C152 100 146 124 164 128 C176 130 176 116 168 116" fill="none" stroke="#F25F5C" stroke-width="11" stroke-linecap="round"/><path d="M60 170 v14 M120 170 v14" stroke="${CO}" stroke-width="7" stroke-linecap="round"/><path d="M28 132 C30 92 80 70 120 78 C150 84 162 110 156 140 C150 170 60 176 28 132Z" fill="url(#chamG)" ${CS}/><path d="M40 106 L30 70 L68 90" fill="#3FC1C9" ${CS}/><path d="M60 150 Q100 162 140 146" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".6"/><circle cx="66" cy="112" r="18" fill="#8BD17C" ${CS}/><circle cx="70" cy="112" r="7" fill="${CO}"/><circle cx="72" cy="109" r="2.5" fill="#fff"/>${pB(0, 60, 136).replace(/<ellipse cx="0"[^>]*>/, "")}<path d="M36 130 q10 6 18 0" fill="none" stroke="${CO}" stroke-width="2.6" stroke-linecap="round"/>`,
  axolotl: () => `${SH}${[[-30, 34, 92], [0, 26, 110], [30, 34, 128]].map(([a, x, y]) => `<ellipse cx="${x}" cy="${y}" rx="17" ry="7" fill="#F58FB1" ${CS} transform="rotate(${a} ${x} ${y})"/><ellipse cx="${200 - x}" cy="${y}" rx="17" ry="7" fill="#F58FB1" ${CS} transform="rotate(${-a} ${200 - x} ${y})"/>`).join("")}${blobP("#F9C4D4")}${pE(76, 118)}${pE(124, 118)}${pB(60, 140, 134)}<path d="M84 132 Q100 148 116 132" fill="none" stroke="${CO}" stroke-width="3" stroke-linecap="round"/>`,
  seahorse: () => `${SH}<path d="M110 60 C150 60 156 100 134 118 C160 132 156 170 120 176 C100 180 96 196 110 196 C124 196 122 184 114 186" fill="none" stroke="${CO}" stroke-width="3.5"/><path d="M110 60 C148 60 154 100 132 118 C158 132 152 168 120 174 C96 178 84 164 88 146 C92 128 100 120 92 104 C84 88 88 60 110 60Z" fill="#F4B942" ${CS}/><path d="M120 176 C104 182 100 196 112 196 C124 196 122 184 114 186" fill="none" stroke="#F4B942" stroke-width="8" stroke-linecap="round"/><path d="M92 76 L50 80 Q44 86 50 92 L92 90Z" fill="#F4B942" ${CS}/><path d="M142 124 l18 -8 l-6 14 l12 4 l-22 8Z" fill="#FFD98A" ${CS}/><path d="M100 132 h24 M98 146 h26 M100 160 h20" stroke="#D99A2B" stroke-width="3" stroke-linecap="round"/><path d="M104 60 l4 -12 l6 12 l6 -10 l4 12" fill="#F4B942" ${CS}/>${pE(110, 80)}<ellipse cx="112" cy="96" rx="7" ry="4" fill="#FFB3C1"/>`,
  clownfish: () => `${SH}${[40, 70, 100].map((x, i) => `<path d="M${x + 20} 196 q-10 -24 0 -36" fill="none" stroke="#C98BDB" stroke-width="7" stroke-linecap="round"/>`).join("")}<path d="M36 118 L8 94 L12 124 L6 152Z" fill="#F28C28" ${CS}/><ellipse cx="104" cy="122" rx="74" ry="48" fill="#F28C28" ${CS}/><path d="M92 76 Q108 56 128 78" fill="#F28C28" ${CS}/><path d="M60 82 C74 104 74 142 60 164 M104 74 C118 104 118 142 104 170 M148 80 C158 104 158 140 148 164" stroke="#fff" stroke-width="13" fill="none"/><path d="M60 82 C74 104 74 142 60 164 M104 74 C118 104 118 142 104 170 M148 80 C158 104 158 140 148 164" stroke="${CO}" stroke-width="2" fill="none" opacity=".5"/>${pE(160, 112)}<ellipse cx="160" cy="128" rx="7" ry="4" fill="#FFB3C1"/><path d="M168 138 q5 4 10 0" fill="none" stroke="${CO}" stroke-width="2.6" stroke-linecap="round"/>`,
  tardigrade: () => `${SH}${[50, 80, 120, 150].map(x => `<path d="M${x} 160 v18" stroke="${CO}" stroke-width="20" stroke-linecap="round"/><path d="M${x} 160 v18" stroke="#D8C7B5" stroke-width="14" stroke-linecap="round"/><path d="M${x - 6} 186 l-3 5 M${x} 187 v6 M${x + 6} 186 l3 5" stroke="${CO}" stroke-width="2" stroke-linecap="round"/>`).join("")}<path d="M24 124 C24 82 70 70 104 72 C150 74 180 94 178 128 C176 162 140 172 100 172 C58 172 24 160 24 124Z" fill="#D8C7B5" ${CS}/><path d="M64 78 C60 110 62 150 68 170 M100 72 C98 110 98 150 100 172 M136 76 C140 110 140 150 134 170" stroke="#C2AE98" stroke-width="3" fill="none"/>${pE(160, 112, .8)}${pE(140, 112, .8)}<circle cx="168" cy="132" r="7" fill="#F7B6C2" ${CS}/><ellipse cx="146" cy="126" rx="7" ry="4" fill="#FFB3C1"/>`,
  octopus: () => `${SH}${[[-60, 40], [-38, 62], [-16, 84], [8, 108], [30, 128], [52, 150]].map(([d, x]) => `<path d="M${x + 6} 128 C${x - 4} 160 ${x + 18} 176 ${x + 4} 188 Q${x - 6} 184 ${x - 2} 176" fill="none" stroke="#E0736B" stroke-width="16" stroke-linecap="round"/>`).join("")}<ellipse cx="100" cy="100" rx="62" ry="56" fill="#E0736B" ${CS}/><path d="M60 60 Q80 46 100 50" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".5"/>${pE(80, 104, 1.1)}${pE(120, 104, 1.1)}${pB(62, 138, 120)}${pM(100, 120, 5)}${[[26, 40], [170, 34], [182, 60]].map(([x, y]) => `<path d="M${x} ${y + 8} C${x - 12} ${y - 2} ${x - 4} ${y - 10} ${x} ${y - 2} C${x + 4} ${y - 10} ${x + 12} ${y - 2} ${x} ${y + 8}Z" fill="#FF6B8A"/>`).join("")}`,
  jellyfish: () => `<circle cx="100" cy="100" r="80" fill="rgba(191,227,247,.35)"/>${[60, 78, 96, 114, 132].map((x, i) => `<path d="M${x} 118 q${i % 2 ? 10 : -10} 20 0 36 q${i % 2 ? -10 : 10} 16 0 34" fill="none" stroke="#9FD3F0" stroke-width="4" stroke-linecap="round"/>`).join("")}<path d="M40 118 C40 56 160 56 160 118 Q140 128 120 118 Q100 130 80 118 Q60 128 40 118Z" fill="rgba(191,227,247,.9)" ${CS}/><path d="M86 84 L114 110 M114 84 L86 110" stroke="#E9573F" stroke-width="7" stroke-linecap="round" opacity=".85"/>${pE(80, 100, .8)}${pE(120, 100, .8)}${pB(66, 134, 108, .7)}`,
  monarch: () => `${SH}<path d="M100 96 C70 40 20 40 22 84 C24 118 70 118 100 108Z M100 108 C70 116 34 130 44 164 C56 188 92 160 100 122Z" fill="#F28C28" ${CS}/><path d="M100 96 C130 40 180 40 178 84 C176 118 130 118 100 108Z M100 108 C130 116 166 130 156 164 C144 188 108 160 100 122Z" fill="#F28C28" ${CS}/><path d="M100 100 L40 64 M100 100 L34 96 M100 112 L54 150 M100 100 L160 64 M100 100 L166 96 M100 112 L146 150" stroke="#2B2433" stroke-width="3"/>${[[30, 70], [28, 92], [48, 164], [170, 70], [172, 92], [152, 164]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="#fff"/>`).join("")}<ellipse cx="100" cy="116" rx="12" ry="42" fill="#2B2433" ${CS}/><path d="M96 76 Q88 52 78 46 M104 76 Q112 52 122 46" fill="none" stroke="${CO}" stroke-width="2.6"/><circle cx="78" cy="46" r="4" fill="${CO}"/><circle cx="122" cy="46" r="4" fill="${CO}"/><circle cx="96" cy="90" r="2.2" fill="#fff"/><circle cx="104" cy="90" r="2.2" fill="#fff"/>`,
  firefly: () => `<circle cx="100" cy="150" r="46" fill="rgba(255,242,122,.45)"/>${SH}<ellipse cx="100" cy="150" rx="34" ry="30" fill="#FFF27A" ${CS}/><path d="M84 82 Q60 50 44 48 M116 82 Q140 50 156 48" fill="none" stroke="${CO}" stroke-width="3"/><path d="M58 112 C54 80 146 80 142 112 L136 140 Q100 150 64 140Z" fill="#4A4550" ${CS}/><path d="M100 90 V144" stroke="#2B2433" stroke-width="3"/><ellipse cx="100" cy="86" rx="30" ry="22" fill="#E9573F" ${CS}/>${pE(88, 84, .8)}${pE(112, 84, .8)}${pB(78, 122, 94, .6)}`,
  mantis: () => `${SH}<path d="M72 64 L60 34 M128 64 L140 34" stroke="${CO}" stroke-width="4"/><ellipse cx="58" cy="30" rx="12" ry="9" fill="#41B3A3" ${CS}/><ellipse cx="142" cy="30" rx="12" ry="9" fill="#41B3A3" ${CS}/><path d="M48 30 H68 M132 30 H152" stroke="#F7E36D" stroke-width="3"/><path d="M40 150 C24 150 22 126 40 124 L56 130 M160 150 C176 150 178 126 160 124 L144 130" fill="#F25F5C" ${CS}/><path d="M34 118 C34 70 166 70 166 118 C166 160 130 176 100 176 C70 176 34 160 34 118Z" fill="#5CC98D" ${CS}/><path d="M42 132 Q100 150 158 132 M50 152 Q100 168 150 152" stroke="#2F8F87" stroke-width="5" fill="none"/><path d="M60 88 Q100 72 140 88" stroke="#F28C28" stroke-width="7" fill="none" stroke-linecap="round"/>${pE(84, 112)}${pE(116, 112)}${pB(70, 130, 124, .8)}${pM(100, 124, 5)}`,
  seastar: () => `${SH}<path d="${Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 36 : 86; return `${i ? "L" : "M"}${(100 + r * Math.cos(a)).toFixed(1)} ${(112 + r * Math.sin(a)).toFixed(1)}`; }).join(" ")}Z" fill="#F2994A" ${CS} stroke-linejoin="round"/>${[[100, 50], [100, 36], [150, 96], [168, 90], [130, 158], [140, 172], [70, 158], [60, 172], [50, 96], [32, 90]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="#FFD1A6"/>`).join("")}${pE(88, 108, .9)}${pE(112, 108, .9)}${pB(76, 124, 122, .7)}${pM(100, 122, 4)}`,
  spider: () => `${SH}${[[-1, 0], [1, 0]].map(([s]) => [[44, 156, 18, 184], [52, 146, 12, 150], [60, 132, 20, 110]].map(([x1, y1, x2, y2]) => `<path d="M${100 + s * (100 - x1)} ${y1} L${100 + s * (100 - x2)} ${y2}" stroke="${CO}" stroke-width="5" stroke-linecap="round"/>`).join("")).join("")}<path d="M76 118 L56 70 M124 118 L144 70" stroke="${CO}" stroke-width="5" stroke-linecap="round"/><path d="M58 66 h-6 M146 66 h6" stroke="#fff" stroke-width="5" stroke-linecap="round"/><path d="M40 116 C30 60 170 60 160 116 Q100 104 40 116Z" fill="#3D6CE0" ${CS}/><path d="M60 100 Q100 70 140 100" fill="none" stroke="#F25F5C" stroke-width="10" stroke-linecap="round"/><path d="M78 88 Q100 76 122 88" fill="none" stroke="#F7E36D" stroke-width="6" stroke-linecap="round"/><ellipse cx="100" cy="146" rx="40" ry="30" fill="#2B2433" ${CS}/><circle cx="86" cy="140" r="10" fill="#fff"/><circle cx="114" cy="140" r="10" fill="#fff"/><circle cx="88" cy="142" r="6" fill="${CO}"/><circle cx="116" cy="142" r="6" fill="${CO}"/><circle cx="90" cy="139" r="2" fill="#fff"/><circle cx="118" cy="139" r="2" fill="#fff"/><path d="M94 160 q6 4 12 0" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/>`
};
const petSvg = (id, cls = "") => `<svg class="${cls}" viewBox="-6 0 212 200" aria-hidden="true">${PET_ART[id] ? PET_ART[id]() : ""}</svg>`;

/* ---------- 25 pets. Append new pets at the END only. esc: true = unlocks only from ⏱️ Escape mode ---------- */
const PET_RAR = { common: ["Common", "#B9F3C9"], rare: ["✦ Rare", "#A0C4FF"], epic: ["💎 Epic", "#C9A0FF"], legend: ["👑 Legendary", "#FFE27A"] };
const PETS = [
  { id: "redpanda", name: "Red panda", nick: "Maple", sci: "Ailurus fulgens", group: "Mammal", rar: "common", status: "Endangered", home: "Mountain forests of the Himalayas and south-west China",
    story: "Not a bear and not a giant panda: it has its own family. It eats mostly bamboo, but its gut is short, like a meat-eater's, with no special chambers for digesting cellulose. So it gets very little energy from its food, and saves energy by sleeping a lot and wrapping its thick, fluffy tail around itself.",
    link: "🍙 Nutrition: cellulose is hard to digest without the right enzymes or gut microbes.", k: "stages", n: 1, how: "Clear your first stage (any mode)" },
  { id: "clownfish", name: "Clownfish", nick: "Nemi", sci: "Amphiprion ocellaris", group: "Fish", rar: "common", esc: true, status: "Least Concern", home: "Warm coral reefs of the Indian and Pacific Oceans",
    story: "It lives among the stinging tentacles of a sea anemone. A special mucus coat stops the anemone's stinging cells from firing. The fish cleans and guards the anemone; the anemone protects the fish from predators. All clownfish hatch as males, and if the group's female dies, the biggest male changes into a female!",
    link: "🌍 Ecosystems: this is mutualism, where both species benefit.", k: "esc", n: 1, how: "Clear 1 stage in ⏱️ Escape mode" },
  { id: "axolotl", name: "Axolotl", nick: "Pinky", sci: "Ambystoma mexicanum", group: "Amphibian", rar: "common", status: "Critically Endangered", home: "Only the canals of Xochimilco, Mexico City",
    story: "It keeps its baby (larval) features for its whole life, including the feathery external gills on its head. It can regrow lost legs, parts of its spinal cord and even parts of its heart, using cells that divide by mitosis to rebuild the missing parts.",
    link: "🧬 Cell division: regeneration uses mitosis to make genetically identical cells.", k: "notes", n: 5, how: "Clear 5 questions from your Mistake Notebook" },
  { id: "seastar", name: "Sea star", nick: "Twinkle", sci: "Asteroidea", group: "Echinoderm", rar: "common", esc: true, status: "Many species", home: "Rocky shores and seabeds all over the world, including Hong Kong",
    story: "No brain and no blood! Seawater is pumped through a water vascular system that moves hundreds of tiny tube feet. To eat a mussel, it pulls the shell open, then pushes its own stomach out through its mouth to digest the food outside its body. It can also regrow lost arms.",
    link: "🍙 Nutrition: digestion can even happen outside the body, using enzymes.", k: "esc", n: 3, how: "Clear 3 stages in ⏱️ Escape mode" },
  { id: "penguin", name: "Emperor penguin", nick: "Tux", sci: "Aptenodytes forsteri", group: "Bird", rar: "common", status: "Near Threatened", home: "Sea ice around Antarctica",
    story: "Thousands huddle together in −40 °C winds and take turns in the warm middle. In their flippers and legs, warm blood flowing out passes cold blood flowing back (countercurrent heat exchange), so little heat is lost. The father keeps the egg on his feet for about two months without eating.",
    link: "⚖️ Homeostasis: keeping body temperature constant in extreme cold.", k: "streak", n: 3, how: "Reach a 3-day streak" },
  { id: "sloth", name: "Three-toed sloth", nick: "Slowmo", sci: "Bradypus variegatus", group: "Mammal", rar: "common", status: "Least Concern", home: "Rainforests of Central and South America",
    story: "It moves so slowly that green algae grow in its fur, giving it camouflage (and the algae get a home: mutualism). It has a very low metabolic rate and can take weeks to digest one meal of leaves. It climbs down from its tree only about once a week.",
    link: "⚡ Respiration and metabolism: a low metabolic rate means slow energy use.", k: "days", n: 5, how: "Play on 5 different days" },
  { id: "firefly", name: "Firefly", nick: "Glimmer", sci: "Lampyridae", group: "Insect", rar: "rare", esc: true, status: "Declining in many places", home: "Warm, damp places worldwide, including Hong Kong's countryside",
    story: "It makes cold light by bioluminescence: the enzyme luciferase uses ATP and oxygen to change luciferin, and almost all the energy becomes light instead of heat. Each species flashes its own pattern to find a mate. Light pollution makes it harder for them to find each other.",
    link: "🔑 Enzymes and ⚡ respiration: ATP from respiration powers the glow.", k: "escNoHint", n: 2, how: "Clear 2 stages in ⏱️ Escape mode without hints" },
  { id: "monarch", name: "Monarch butterfly", nick: "Amber", sci: "Danaus plexippus", group: "Insect", rar: "rare", esc: true, status: "Vulnerable (migratory population)", home: "North America, migrating to Mexico each winter",
    story: "It goes through complete metamorphosis: egg, caterpillar (larva), pupa, adult. Caterpillars eat poisonous milkweed and store the toxins, so birds that try one learn that orange-and-black means 'yuck'. Some fly up to 4,000 km to spend winter in Mexico.",
    link: "🌸 Growth and development, and 🦋 natural selection of warning colours.", k: "esc", n: 6, how: "Clear 6 stages in ⏱️ Escape mode" },
  { id: "octopus", name: "Octopus", nick: "Inky", sci: "Octopus vulgaris", group: "Mollusc", rar: "rare", esc: true, status: "Least Concern", home: "Oceans worldwide, including Hong Kong waters",
    story: "It has three hearts and blue blood! Its blood carries oxygen using haemocyanin, which contains copper instead of iron. About two-thirds of its nerve cells are in its arms, so each arm can taste and react on its own. It changes colour in a flash to hide.",
    link: "❤️ Transport: haemocyanin (copper, blue) vs haemoglobin (iron, red).", k: "clean", n: 3, how: "3 escapes in ⏱️ Escape mode before time runs out, with 0 strikes" },
  { id: "mantis", name: "Peacock mantis shrimp", nick: "Punchy", sci: "Odontodactylus scyllarus", group: "Crustacean", rar: "rare", esc: true, status: "Not assessed", home: "Coral reefs of the Indo-Pacific",
    story: "Humans have 3 types of colour receptor in the eye; the mantis shrimp has 12 to 16! It punches prey with club-like arms so fast that the water in front of them bubbles (cavitation), cracking snail shells open.",
    link: "🧠 Coordination: photoreceptors in the eye detect different wavelengths of light.", k: "escBoss", n: 1, how: "Beat 1 boss stage in ⏱️ Escape mode" },
  { id: "fennec", name: "Fennec fox", nick: "Sandy", sci: "Vulpes zerda", group: "Mammal", rar: "rare", status: "Least Concern", home: "The Sahara Desert, North Africa",
    story: "Its huge ears (up to 15 cm) are full of blood vessels. When it's hot, the vessels widen (vasodilation) and heat escapes from the ears. It gets most of its water from food, and its kidneys make very concentrated urine to save water.",
    link: "⚖️ Homeostasis: vasodilation and water balance by the kidneys.", k: "rush", n: 80, how: "Score 80+ in ⚡ Cell Rush" },
  { id: "platypus", name: "Platypus", nick: "Paddle", sci: "Ornithorhynchus anatinus", group: "Mammal", rar: "rare", status: "Near Threatened", home: "Rivers of eastern Australia",
    story: "A mammal that lays eggs! Its young feed on milk that seeps from patches of skin (it has no nipples). Its rubbery bill has electroreceptors that sense the tiny electric signals from the muscles of shrimps hidden in the mud. Males have a venomous spur on each back leg.",
    link: "🦋 Classification: mammals have hair and feed their young on milk, even egg-layers.", k: "dict", n: 1, how: "Get a perfect 🎧 Word Dictation round" },
  { id: "tardigrade", name: "Tardigrade (water bear)", nick: "Chonk", sci: "Tardigrada", group: "Tardigrade", rar: "rare", status: "Everywhere!", home: "Moss, lichen and ponds all over the world, maybe even in Hong Kong parks",
    story: "Less than 1 mm long. When it dries out, it curls into a 'tun' and slows its metabolism to less than 0.01% of normal. In this state it survives boiling, freezing, strong radiation and even outer space. A special protein helps protect its DNA from damage.",
    link: "🔑 Metabolism and 🧫 DNA: protecting enzymes and genes from damage.", k: "cured", n: 3, how: "Cure your Study Pal 3 times in the 🩺 medicine cabinet" },
  { id: "seahorse", name: "Seahorse", nick: "Coral", sci: "Hippocampus kuda", group: "Fish", rar: "rare", status: "Vulnerable", home: "Shallow seagrass and coral reefs, including around Hong Kong",
    story: "The dad gets pregnant! The female puts her eggs into the male's brood pouch, he fertilises them, and weeks later he gives birth to hundreds of tiny babies. It is a fish that swims upright, beating its small back fin very fast.",
    link: "🌸 Reproduction: fertilisation and care of young can be done by either parent.", k: "spell", n: 40, how: "Spell 40 biology words correctly" },
  { id: "spider", name: "Peacock spider", nick: "Disco", sci: "Maratus volans", group: "Arachnid", rar: "epic", esc: true, status: "Not assessed", home: "Southern Australia",
    story: "Only 4–5 mm long. The male lifts a colourful flap on his abdomen and dances, waving his legs, to impress a female. This is sexual selection: females choose the best dancers, so bright colours and fancy moves get passed on.",
    link: "🦋 Evolution: sexual selection changes a species over many generations.", k: "escNoHint", n: 5, how: "Clear 5 stages in ⏱️ Escape mode without hints" },
  { id: "chameleon", name: "Panther chameleon", nick: "Rainbow", sci: "Furcifer pardalis", group: "Reptile", rar: "epic", esc: true, status: "Least Concern", home: "Madagascar",
    story: "It changes colour by changing the spacing of tiny crystals in special skin cells, which changes the light they reflect. Each eye moves on its own, giving almost 360° vision, and its sticky tongue shoots out longer than its body in a split second.",
    link: "🧠 Coordination: each eye sends its own signals to the brain.", k: "esc", n: 12, how: "Clear 12 stages in ⏱️ Escape mode" },
  { id: "hummingbird", name: "Hummingbird", nick: "Zippy", sci: "Trochilidae", group: "Bird", rar: "epic", esc: true, status: "Many species", home: "The Americas",
    story: "Its heart can beat over 1,000 times a minute: it has the fastest metabolism of any warm-blooded animal. It hovers by beating its wings about 50 times a second, drinks sugary nectar and pollinates flowers. At night it enters torpor, slowing its body down to save energy.",
    link: "⚡ Respiration: nectar sugar → lots of ATP; 🌱 pollination of flowers.", k: "clean", n: 8, how: "8 escapes in ⏱️ Escape mode before time runs out, with 0 strikes" },
  { id: "jellyfish", name: "Immortal jellyfish", nick: "Forever", sci: "Turritopsis dohrnii", group: "Cnidarian", rar: "epic", esc: true, status: "Not assessed", home: "Oceans worldwide",
    story: "When it is hurt or old, it can turn its body back into a young polyp and start its life again, by changing its cells into different types of cells. It is about 95% water and has no brain, heart or bones. Scientists study it to learn about ageing.",
    link: "🧬 Cells: cells can change into other cell types (like stem cells).", k: "escBoss", n: 5, how: "Beat 5 boss stages in ⏱️ Escape mode" },
  { id: "molerat", name: "Naked mole-rat", nick: "Wrinkles", sci: "Heterocephalus glaber", group: "Mammal", rar: "epic", status: "Least Concern", home: "Underground tunnels in East Africa",
    story: "It can live over 30 years (a mouse lives about 2–3) and almost never gets cancer. Deep in its crowded tunnels, it can survive about 18 minutes without oxygen by switching to anaerobic respiration. It lives in colonies with one queen, like bees.",
    link: "⚡ Respiration: surviving low oxygen with anaerobic pathways.", k: "correct", n: 150, how: "Answer 150 questions correctly" },
  { id: "kakapo", name: "Kākāpō", nick: "Mossy", sci: "Strigops habroptilus", group: "Bird", rar: "epic", status: "Critically Endangered", home: "Predator-free islands of New Zealand",
    story: "The world's only flightless parrot, and the heaviest. It evolved on islands with no mammal predators, so flying wasn't needed. When people brought cats and rats, numbers crashed. Only about 250 are left, and every single bird has a name and is tracked.",
    link: "🦋 Evolution: natural selection depends on the environment, including predators.", k: "topics", n: 3, how: "Clear 3 whole topics" },
  { id: "spoonbill", name: "Black-faced spoonbill", nick: "Spoony", sci: "Platalea minor", group: "Bird", rar: "legend", hk: true, status: "Endangered", home: "🇭🇰 Winters at Mai Po and Deep Bay, Hong Kong",
    story: "It sweeps its spoon-shaped bill from side to side in shallow water. Touch receptors inside the bill snap it shut on fish and shrimps. Only a few thousand exist, and a big share spend every winter in Hong Kong's Deep Bay wetlands, so protecting Mai Po matters for the whole species.",
    link: "🌍 Ecosystems: wetland conservation and food chains in mudflats.", k: "streak", n: 14, how: "Reach a 14-day streak" },
  { id: "treefrog", name: "Romer's tree frog", nick: "Romy", sci: "Liuixalus romeri", group: "Amphibian", rar: "legend", hk: true, status: "Endangered · found only in Hong Kong", home: "🇭🇰 Lantau, Lamma, Po Toi and Chek Lap Kok islands",
    story: "Only about 2 cm long, and found nowhere else on Earth (endemic to Hong Kong). It was discovered in 1952 by John Romer. When the new airport was built on Chek Lap Kok, frogs were moved to safe new homes. Its tadpoles grow in tiny pools and change into frogs by metamorphosis.",
    link: "🦋 Biodiversity: endemic species need their small habitats protected.", k: "topics", n: 8, how: "Clear 8 whole topics" },
  { id: "dolphin", name: "Chinese white dolphin", nick: "Bubbles", sci: "Sousa chinensis", group: "Mammal", rar: "legend", hk: true, esc: true, status: "Vulnerable · declining in Hong Kong", home: "🇭🇰 Pearl River Estuary, west of Lantau",
    story: "Born dark grey, it turns pink as it grows. The pink isn't pigment: it's blood vessels near the skin that help it lose heat. It finds fish by echolocation. Boat traffic, underwater noise, land reclamation and pollution have made Hong Kong's population fall.",
    link: "⚖️ Homeostasis (blood vessels and heat loss) and 🌍 human impact on ecosystems.", k: "esc", n: 20, how: "Clear 20 stages in ⏱️ Escape mode" },
  { id: "turtle", name: "Golden coin turtle", nick: "Goldie", sci: "Cuora trifasciata", group: "Reptile", rar: "legend", hk: true, esc: true, status: "Critically Endangered", home: "🇭🇰 Streams in Hong Kong country parks",
    story: "Its hinged lower shell closes like a box to protect it. It is an ectotherm: its body temperature follows its surroundings, so it basks in the sun to warm up. It is critically endangered because of poaching, as some people wrongly believe it is a medicine. Hong Kong's wild turtles are carefully protected.",
    link: "⚖️ Homeostasis: ectotherms vs endotherms; 🌍 illegal wildlife trade.", k: "escBoss", n: 10, how: "Beat 10 boss stages in ⏱️ Escape mode" },
  { id: "horseshoe", name: "Chinese horseshoe crab", nick: "Fossil", sci: "Tachypleus tridentatus", group: "Chelicerate", rar: "legend", hk: true, esc: true, status: "Endangered", home: "🇭🇰 Mudflats of Pak Nai and Shui Hau",
    story: "A 'living fossil': its relatives were around 450 million years ago, before the dinosaurs. It isn't a true crab; it's closer to spiders and scorpions. Its blue blood (haemocyanin) is used to test medicines for bacterial toxins. Young ones grow up on Hong Kong's mudflats for about 10 years.",
    link: "❤️ Transport (blue blood) and 🦋 classification of arthropods.", k: "clean", n: 15, how: "15 escapes in ⏱️ Escape mode before time runs out, with 0 strikes" }
];
const petVal = k => ({ stages: S.completed_rooms.length, esc: S.stats.escClears, escNoHint: S.stats.escNoHint, escBoss: S.stats.escBosses, clean: S.stats.cleanEscapes,
  streak: S.longest_streak, days: S.stats.days, dict: S.stats.dictPerfect, spell: S.stats.spellRight, notes: S.mistakes_cleared || 0, rush: S.rush.best,
  correct: S.stats.correct, cured: S.stats.cured, topics: typeof topicsCleared === "function" ? topicsCleared() : 0 })[k] || 0;
const petById = id => PETS.find(p => p.id === id);
let petQueue = [];
function checkPets() {
  if (!S) return;
  PETS.forEach(p => { if (!S.pets[p.id] && petVal(p.k) >= p.n) { S.pets[p.id] = today(); if (!S.activePet) S.activePet = p.id; petQueue.push(p); } });
  if (petQueue.length) { save(); setTimeout(showPetUnlock, 2400); }
}
function showPetUnlock() {
  if (!petQueue.length) return;
  if ($modal.innerHTML || R || RU || document.getElementById("dIn") || document.querySelector(".nb-hero")) { setTimeout(showPetUnlock, 3000); return; }
  const p = petQueue.shift();
  if ((p.rar === "epic" || p.rar === "legend") && !p.cer && !reduced()) { p.cer = true; petQueue.unshift(p); return giftCeremony(p.rar, showPetUnlock); }
  SFX.fanfare(); confetti(p.rar === "legend" ? 260 : 140);
  const box = openModal(`<span class="kicker">🐾 New pet!</span><h2>${esc(p.nick)} the ${esc(p.name)} joined ${esc(palName())}!</h2>
    <div class="petreveal flipin ${p.rar}">${p.rar === "legend" || p.rar === "epic" ? `<i class="aura" aria-hidden="true"></i>` : ""}${petSvg(p.id)}</div>
    <div class="row" style="justify-content:center">${petChips(p)}</div>
    <p style="text-align:center">${esc(p.story.split(". ")[0])}.</p>
    ${say("chiikawa", p.hk ? "A Hong Kong treasure...! I'll protect you forever! 🥹🇭🇰" : "Waaai~! A new friend! 🥹✨", "sparkle")}
    <div class="row" style="justify-content:center"><button class="btn big" id="puSet">⭐ Make ${esc(p.nick)} my companion</button><button class="btn plain" id="puRead">📖 Read its story</button></div>`, { onClose: () => setTimeout(showPetUnlock, 400) });
  box.querySelector("#puSet").onclick = () => { SFX.item(); S.activePet = p.id; save(); closeModal(); if (!R && !RU) renderMap(); setTimeout(showPetUnlock, 400); };
  box.querySelector("#puRead").onclick = () => { SFX.tap(); openPet(p.id); };
}
// ✨ Epic and legendary pets arrive in a gift box: it shakes 3 times, bursts open with light rays, then the card flips in
function giftCeremony(rar, done) {
  const d = document.createElement("div"); d.className = `gift ${rar}`; d.setAttribute("aria-hidden", "true");
  d.innerHTML = `<div class="rays"></div>${rar === "legend" ? Array.from({ length: 18 }, (_, i) => `<i class="gold" style="left:${(i * 53) % 100}%;animation-delay:${(i % 6) * .18}s"></i>`).join("") : ""}
    <svg class="gbox" viewBox="0 0 120 120"><rect x="16" y="50" width="88" height="62" rx="8" fill="${rar === "legend" ? "#FFD25E" : rar === "myth" ? "#FF86D0" : "#C9A0FF"}" stroke="${CO}" stroke-width="4"/>
      <rect x="10" y="34" width="100" height="22" rx="6" fill="${rar === "legend" ? "#FFE58F" : rar === "myth" ? "#FFC2E8" : "#DCC4FF"}" stroke="${CO}" stroke-width="4"/>
      <rect x="52" y="34" width="16" height="78" fill="#FF8FA3" stroke="${CO}" stroke-width="3.5"/>
      <path d="M60 34 C40 8 22 18 34 32 Z M60 34 C80 8 98 18 86 32 Z" fill="#FF8FA3" stroke="${CO}" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M24 64 v36" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".6"/></svg>
    <div class="glabel">${rar === "legend" ? "👑 LEGENDARY" : rar === "myth" ? "🌈 MYTHIC" : "💎 EPIC"}</div>`;
  document.body.appendChild(d); [0, 450, 900].forEach(t => setTimeout(() => SFX.tap(), t));
  setTimeout(() => { d.classList.add("open"); SFX.fanfare(); confetti(rar === "legend" ? 220 : 120); }, 1400);
  setTimeout(() => { d.remove(); done(); }, 2500);
}
const petChips = p => `<span class="pill" style="background:${PET_RAR[p.rar][1]}">${PET_RAR[p.rar][0]}</span><span class="pill" style="background:#fff">${esc(p.group)}</span>${p.hk ? `<span class="pill" style="background:#FFC2C2">🇭🇰 Hong Kong</span>` : ""}${p.esc ? `<span class="pill" style="background:#2B2433;color:#fff">⏱️ Escape</span>` : ""}`;
function openPet(id) {
  const p = petById(id), own = !!S.pets[id];
  const box = openModal(`<span class="kicker">🐾 Pet journal</span>
    <h2>${own ? `${esc(p.nick)} · ${esc(p.name)}` : `??? · ${esc(p.name)}`}</h2>
    <div class="petstory"><div class="petpic ${own ? "" : "locked"} ${p.rar}">${petSvg(p.id)}</div>
      <div><div class="row">${petChips(p)}</div>
        <p class="small"><i>${esc(p.sci)}</i> · ${esc(p.group)}<br>🗺️ ${esc(p.home)}<br>🛡️ Status: <b>${esc(p.status)}</b></p></div></div>
    ${own ? `<section class="jsec"><h3>📖 Its biology story</h3><p>${esc(p.story)}</p><div class="formula">${esc(p.link)}</div></section>
      <div class="row">${S.activePet === id ? `<span class="pill" style="background:var(--green)">⭐ Your companion</span>` : `<button class="btn big" id="ppSet">⭐ Make companion</button>`}${TTS.ok ? `<button class="btn plain" id="ppRead">🔊 Read aloud</button>` : ""}</div>`
      : `<section class="jsec"><h3>🔒 How to unlock</h3><p>${esc(p.how)}</p><div class="tprog"><i style="width:${Math.min(100, Math.round(100 * petVal(p.k) / p.n))}%"></i></div><p class="small">${Math.min(petVal(p.k), p.n)} / ${p.n}</p>
        ${p.esc ? `<p class="small muted">⏱️ This pet only comes to players who are brave enough to use Escape mode!</p>` : ""}</section>`}`, { wide: true });
  const s = box.querySelector("#ppSet"); if (s) s.onclick = () => { SFX.item(); S.activePet = id; save(); closeModal(); renderMap(); };
  const r = box.querySelector("#ppRead"); if (r) r.onclick = () => speak(`${p.name}. ${p.story}`);
}

/* ---------- 🩺 Getting sick: pick the right treatment ---------- */
const MEDS = [
  { id: "antibiotic", icon: "💊", name: "Antibiotics", does: "Antibiotics kill bacteria or stop them growing, for example by damaging their cell walls or their ribosomes." },
  { id: "antiviral", icon: "🧪", name: "Antiviral medicine", does: "Antiviral medicine stops certain viruses from making copies of themselves inside our cells." },
  { id: "antifungal", icon: "🧴", name: "Antifungal cream", does: "Antifungal medicine attacks fungal cells, for example their cell membranes." },
  { id: "dewormer", icon: "🪱", name: "Deworming tablets", does: "Deworming tablets kill parasitic worms living in the gut." },
  { id: "antimalarial", icon: "🦟", name: "Antimalarial tablets", does: "Antimalarial medicine kills the Plasmodium protist in the liver and red blood cells." },
  { id: "rest", icon: "🛌", name: "Rest, fluids + paracetamol", does: "Rest and fluids help the immune system do its job; paracetamol lowers fever and eases pain." },
  { id: "ors", icon: "🥤", name: "Oral rehydration salts", does: "ORS replaces the water and ions (like sodium) lost in diarrhoea and vomiting. Glucose in it helps sodium and water be absorbed." },
  { id: "vitc", icon: "🍊", name: "Vitamin C (citrus fruit)", does: "Vitamin C is needed to make collagen, which holds skin, gums and blood vessels together." },
  { id: "iron", icon: "🥬", name: "Iron-rich food", does: "Iron is needed to make haemoglobin, which carries oxygen in red blood cells." },
  { id: "antihist", icon: "🤧", name: "Antihistamine", does: "Antihistamines block histamine, the chemical released in allergic reactions." },
  { id: "cool", icon: "🧊", name: "Cool down + water", does: "Moving to a cool place, fanning and drinking water helps an overheated body lose heat and replace lost sweat." },
  { id: "glucose", icon: "🍬", name: "Glucose drink", does: "A glucose drink raises a low blood glucose level quickly." },
  { id: "vaccine", icon: "💉", name: "Vaccine", does: "Vaccines prevent diseases by training the immune system before infection. They don't cure an infection you already have." }
];
const medById = id => MEDS.find(m => m.id === id);
const ILLS = [
  { id: "cold", name: "Common cold", type: "virus", agent: "a rhinovirus", icon: "🤧", sym: "runny nose, sneezing, a mild sore throat", test: "Throat swab: no bacteria grew in the lab culture. It's a virus.", cure: ["rest"],
    why: "Colds are caused by viruses. There is no medicine that kills cold viruses, so rest and fluids let the immune system make antibodies and clear it in about a week.", tip: "Wash hands often and don't touch your eyes and nose: cold viruses spread on hands." },
  { id: "flu", name: "Influenza (flu)", type: "virus", agent: "the influenza virus", icon: "🤒", sym: "sudden high fever, aching muscles, very tired", test: "Rapid flu test: positive for influenza A.", cure: ["antiviral", "rest"],
    why: "Flu is a virus. Antiviral medicine (given early) stops the virus copying itself inside cells, and rest helps the immune system win.", tip: "A flu vaccine every year trains your immune system to make memory cells before flu season." },
  { id: "strep", name: "Strep throat", type: "bacterium", agent: "Streptococcus bacteria", icon: "😣", sym: "very sore throat, fever, white spots on the tonsils", test: "Throat swab: Streptococcus bacteria grew on the agar plate.", cure: ["antibiotic"],
    why: "This infection is caused by bacteria, so antibiotics work. {P} must finish the whole course, even after feeling better, so no bacteria survive.", tip: "Stopping antibiotics early lets the toughest bacteria survive, which helps antibiotic resistance spread." },
  { id: "food", name: "Food poisoning", type: "bacterium", agent: "Salmonella bacteria from an undercooked egg", icon: "🤢", sym: "diarrhoea, vomiting, stomach cramps", test: "Stool sample: Salmonella found. Mochi is losing lots of water.", cure: ["ors"],
    why: "The main danger is dehydration. Oral rehydration salts replace water and ions, and most cases clear up by themselves. Antibiotics are only for severe cases.", tip: "Cook eggs and meat thoroughly, and keep raw and cooked food apart." },
  { id: "athlete", name: "Athlete's foot", type: "fungus", agent: "a fungus", icon: "🦶", sym: "itchy, cracked, peeling skin between the toes after days in sweaty sports shoes", test: "Skin scraping: fungal threads (hyphae) seen under the microscope.", cure: ["antifungal"],
    why: "A fungus grows well in warm, damp places. Antifungal cream kills fungal cells.", tip: "Dry between your toes and don't share towels or slippers in changing rooms." },
  { id: "worms", name: "Roundworm infection", type: "parasite", agent: "roundworms (Ascaris)", icon: "🪱", sym: "tummy ache and tiredness after eating unwashed vegetables", test: "Stool sample: roundworm eggs seen under the microscope.", cure: ["dewormer"],
    why: "Parasitic worms live in the gut and take nutrients. Deworming tablets kill them.", tip: "Wash vegetables well and wash hands before eating." },
  { id: "malaria", name: "Malaria", type: "protist", agent: "the Plasmodium protist, spread by Anopheles mosquitoes", icon: "🦟", sym: "fever and chills that come back every 2–3 days, after a trip to a tropical country", test: "Blood smear: Plasmodium parasites inside red blood cells.", cure: ["antimalarial"],
    why: "Plasmodium is a protist (a single-celled eukaryote), not a bacterium or virus. Antimalarial tablets kill it.", tip: "Use mosquito nets and repellent, and take preventive tablets when travelling to malaria areas." },
  { id: "dengue", name: "Dengue fever", type: "virus", agent: "the dengue virus, spread by Aedes mosquitoes (found in Hong Kong!)", icon: "🥵", sym: "high fever, a rash, pain behind the eyes and aching joints", test: "Blood test: positive for dengue virus.", cure: ["rest"],
    why: "Dengue is a virus with no specific cure. Rest, lots of fluids and paracetamol help. (Aspirin and ibuprofen are avoided because they can increase bleeding.)", tip: "Empty standing water in flowerpot trays and buckets so Aedes mosquitoes can't breed." },
  { id: "scurvy", name: "Scurvy", type: "deficiency", agent: "a lack of vitamin C", icon: "🍜", sym: "bleeding gums, bruises and slow-healing cuts, after weeks of eating only instant noodles", test: "Diet diary: no fruit or vegetables for 6 weeks. Not an infection.", cure: ["vitc"],
    why: "Scurvy is a deficiency disease: no pathogen is involved. Vitamin C is needed to make collagen, so eating citrus fruit and vegetables fixes it.", tip: "A balanced diet with fruit and vegetables every day prevents scurvy." },
  { id: "anaemia", name: "Iron-deficiency anaemia", type: "deficiency", agent: "not enough iron in the diet", icon: "😮‍💨", sym: "pale skin, very tired, out of breath after climbing stairs", test: "Blood test: low haemoglobin. Not an infection.", cure: ["iron"],
    why: "Iron is part of haemoglobin. With too little, blood carries less oxygen, so {P} feels tired. Red meat, beans and dark green leafy vegetables help.", tip: "Vitamin C helps your body absorb iron from plant foods." },
  { id: "hayfever", name: "Hay fever (allergy)", type: "allergy", agent: "an allergic reaction to pollen", icon: "🌼", sym: "sneezing and itchy, watery eyes every spring, but no fever", test: "Skin-prick test: strong reaction to grass pollen. Not infectious.", cure: ["antihist"],
    why: "In an allergy, the immune system overreacts to something harmless and releases histamine. Antihistamines block its effects.", tip: "Allergies are not caught from other people: they aren't caused by pathogens." },
  { id: "heat", name: "Heat exhaustion", type: "homeostasis", agent: "overheating while playing basketball on a hot, humid Hong Kong afternoon", icon: "☀️", sym: "hot, dizzy, heavy sweating, very thirsty", test: "Body temperature 39 °C, no infection. In humid air, sweat evaporates slowly.", cure: ["cool"],
    why: "Homeostasis was overwhelmed: in humid air, sweat can't evaporate well to remove heat. Cooling down and drinking water restore body temperature and water balance.", tip: "Drink water before you feel thirsty and rest in the shade on very hot days." },
  { id: "hypo", name: "Low blood glucose", type: "homeostasis", agent: "skipping breakfast before a PE lesson", icon: "😵‍💫", sym: "shaky, sweaty and dizzy halfway through PE", test: "Blood glucose: 3.2 mmol/L (lower than normal). Not an infection.", cure: ["glucose"],
    why: "Muscles used lots of glucose for respiration, and there was no breakfast to replace it. A glucose drink raises blood glucose fast; then eat a proper meal.", tip: "Breakfast with starch (like bread or oats) releases glucose slowly for the morning." }
];
const TYPE_LABEL = { virus: "a virus", bacterium: "bacteria", fungus: "a fungus", parasite: "a parasitic worm", protist: "a protist", deficiency: "a deficiency (not a pathogen)", allergy: "an allergy (not a pathogen)", homeostasis: "a homeostasis problem (not a pathogen)" };
const illById = id => ILLS.find(x => x.id === id);
function wrongWhy(m, ill) {
  const cause = TYPE_LABEL[ill.type];
  if (m.id === "antibiotic" && ill.type === "virus") return "❌ Antibiotics don't work on viruses! They target bacterial structures like cell walls and bacterial ribosomes, and viruses have neither. Using antibiotics when they aren't needed also helps antibiotic-resistant bacteria spread.";
  if (m.id === "antibiotic" && ill.id === "food") return "❌ Not the best choice. Most Salmonella food poisoning clears up by itself, and antibiotics are only for severe cases. The real danger right now is losing too much water.";
  if (m.id === "antibiotic") return `❌ Antibiotics only work against bacteria. This is caused by ${cause}.`;
  if (m.id === "vaccine") return "❌ Vaccines prevent diseases by training the immune system before an infection. They can't cure an illness {P} already has.";
  if (m.id === "antiviral") return `❌ Antiviral medicine only stops viruses from copying themselves. This is caused by ${cause}.`;
  if (m.id === "rest" && ill.cure.indexOf("rest") < 0) return `❌ Rest always helps a little, but this is caused by ${cause} and needs the right treatment to get better.`;
  return `❌ ${m.does} But {P}'s problem is caused by ${cause}.`;
}
function maybeGetSick(chance) {
  if (!S || S.ill || S.lastIllDay === today() || Math.random() >= chance) return false;
  const pool = ILLS.filter(x => x.id !== S.lastIll);
  const ill = pick(pool); S.ill = { id: ill.id, since: today() }; S.lastIllDay = today(); S.lastIll = ill.id; save();
  return true;
}
function openClinic() {
  const ill = S.ill && illById(S.ill.id); if (!ill) return;
  const tried = S.ill.tried || [];
  const box = openModal(`<span class="kicker">🩺 Dr Koma's clinic</span><h2>${ill.icon} ${esc(palName())} isn't feeling well</h2>
    <div class="petstory"><div class="petpic sick">${figure("chiikawa", "sick")}</div>
      <div class="chart"><b>Symptoms:</b> ${esc(ill.sym)}<br><b>🔬 Test result:</b> ${esc(ill.test)}</div></div>
    ${say("shisa", "What is causing it: a virus, bacteria, a fungus, a parasite... or no pathogen at all? Pick the right treatment from the cabinet! 🦁🩺", "normal", "hint")}
    <div class="medgrid">${MEDS.map(m => `<button class="med ${tried.includes(m.id) ? "tried" : ""}" data-med="${m.id}" ${tried.includes(m.id) ? "disabled" : ""}><span class="mi">${m.icon}</span><span>${esc(m.name)}</span></button>`).join("")}</div>
    <div id="clinicFb" aria-live="polite"></div>`, { wide: true });
  box.querySelectorAll("[data-med]").forEach(b => b.onclick = () => {
    const m = medById(b.dataset.med), fb = box.querySelector("#clinicFb");
    if (ill.cure.includes(m.id)) {
      S.ill = null; S.stats.cured += 1; const bonus = 20; S.coins += bonus; save(true); SFX.fanfare(); confetti(120); checkTrophies();
      box.innerHTML = `<span class="kicker">🩺 Dr Koma's clinic</span><h2>🎉 ${esc(palName())} feels better!</h2>
        <div class="petstory"><div class="petpic">${figure("chiikawa", "sparkle")}</div>
          <div><p><b>${esc(ill.name)}</b> is caused by ${esc(ill.agent)} (${TYPE_LABEL[ill.type]}).</p><p>✅ ${esc(ill.why)}</p></div></div>
        <div class="formula">🛡️ Prevention: ${esc(ill.tip)}</div>
        <p style="text-align:center"><span class="pill coinpill">+${bonus} 🌰</span> <span class="pill">🩺 Cured ${S.stats.cured} time${S.stats.cured > 1 ? "s" : ""}</span></p>
        ${say("chiikawa", "Thank you, doctor...! I feel so much better! 🥹✨", "happy")}
        <div class="row" style="justify-content:center"><button class="btn big" id="clDone">Yay! 🌱</button></div>`;
      box.querySelector("#clDone").onclick = () => { SFX.tap(); closeModal(); renderMap(); };
    } else {
      S.ill.tried = (S.ill.tried || []).concat(m.id); S.stats.wrongMeds = (S.stats.wrongMeds || 0) + 1; save(); SFX.wrong();
      b.disabled = true; b.classList.add("tried");
      fb.innerHTML = `<div class="fb no">${say("chiikawa", "Uu... it didn't help... 🥺", "sick")}${say("shisa", esc(wrongWhy(m, ill)), "normal", "hint")}</div>`;
    }
  });
}
/* Small moments of biology in Mochi's daily life (shown in the chat card) */
const DAILY_LIFE = [
  "🪥 {P} brushed their teeth. Plaque bacteria turn sugar into acid, which dissolves tooth enamel, so brushing matters!",
  "🧼 {P} washed their hands for 20 seconds with soap. Soap breaks up the fatty outer layer of many germs.",
  "😴 {P} slept 9 hours. During deep sleep, the body releases growth hormone for growing and repair.",
  "🍳 {P} ate eggs for breakfast. Proteases break the protein into amino acids to build new cells.",
  "🍚 {P} chewed rice slowly. Salivary amylase in the mouth starts breaking starch into maltose.",
  "🚶 {P} climbed the stairs. Breathing got faster to bring in more oxygen and remove carbon dioxide.",
  "🌞 {P} played in the sun for a while. Skin uses sunlight to make vitamin D for strong bones.",
  "💧 {P} forgot to drink water. The brain released more ADH, so the kidneys saved water and made darker urine.",
  "🥶 {P} shivered in the cold air-con. Shivering is muscles contracting to release heat from respiration.",
  "😳 {P} blushed when the teacher said 'well done'. Blood vessels in the skin widened (vasodilation).",
  "🥦 {P} ate broccoli. The fibre (cellulose) isn't digested, but helps food move through the gut.",
  "🏃 {P} sprinted for the bus. Muscles used anaerobic respiration and made lactic acid. Deep breaths repay the oxygen debt.",
  "🤧 {P} covered a sneeze with a tissue. Droplets can carry viruses to other people.",
  "💉 {P} got a vaccine. The immune system made memory cells, ready for a faster response next time."
];
