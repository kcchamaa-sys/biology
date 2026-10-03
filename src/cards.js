
/* ============================================================
   5k. 🃏 Biology Capsule Lab: 40 collectible trading cards (each a real biology term, structure or concept).
   Rarities: Common (bronze) · Rare (silver holo) · Epic (gold) · Legendary (rainbow holo) · Mythic (cosmic foil).
   Cards are won from capsules; streaks give bonus capsules and a little extra luck.
   ============================================================ */
const CARD_RAR = {
  common: { n: "Common", sym: "●", w: 58, dup: 5, c: "#C9824F" }, rare: { n: "Rare", sym: "◆", w: 27, dup: 10, c: "#8FA1BC" },
  epic: { n: "Epic", sym: "★", w: 10, dup: 25, c: "#E0A92A" }, legend: { n: "Legendary", sym: "✦", w: 4, dup: 60, c: "#E27893" }, myth: { n: "Mythic", sym: "✺", w: 1, dup: 120, c: "#9B7BFF" }
};
const CARD_ORDER = ["common", "rare", "epic", "legend", "myth"];
// art background tint per category
const CATEGORY_BG = { Organelle: ["#F3E6FF", "#D9B8FF"], "Cell structure": ["#FFE6F0", "#FFB8D2"], Cell: ["#FFE1E1", "#FFA9A9"], Molecule: ["#DFF3FF", "#9AD5FF"], Process: ["#FFEBD0", "#FFC27A"], Tissue: ["#E3F8D8", "#A9E58B"],
  "Plant structure": ["#E3F8D8", "#A9E58B"], "Organ structure": ["#FFE1EA", "#FFA7C0"], Organ: ["#FFE1EA", "#FFA7C0"], Hormone: ["#FFF3C9", "#FFD966"], Immunity: ["#E3E9FF", "#A9B9FF"], Nervous: ["#EDE3FF", "#C2A6FF"],
  Genetics: ["#E3E6FF", "#A9AEFF"], Biotechnology: ["#DDF7F3", "#8FE3D6"], Ecology: ["#DDF8E6", "#8FE3AE"], Evolution: ["#E8F7DD", "#B5E58B"], Biodiversity: ["#E0F5E8", "#8FD9A8"], Control: ["#FFEFD6", "#FFC98A"] };

const ART = (() => {
const _h = ICN.__h, { P, C, E, R, f, fc, fe, fr, L, H } = _h;
const spk = (x, y, r, k = "w") => `<path d="${_h.spark(x, y, r)}" fill="${_h.col(k)[0]}"/>`;
const A = {
  nucleus: C(16, 16, 13, "v") + fc(11, 11, 2.2, "#B9AEF0") + fc(22, 13, 1.8, "#B9AEF0") + fc(14, 24, 1.6, "#B9AEF0") + C(17, 16, 5.5, "p") + L("M9 19 Q12 16 14 19 M19 21 Q22 18 24 21", "#E7DDFF", 1.6) + H(8, 7, 5, 3, -30),
  membrane: [5, 9, 13, 17, 21, 25].map(x => (x > 12 && x < 20 ? "" : L(`M${x} 11 V15 M${x} 21 V17`, "#E0A800", 1.5) + C(x, 9.5, 2.6, "k") + C(x, 24.5, 2.6, "k"))).join("") + R(12.5, 5, 7, 24, 3.5, "b") + L("M16 9 V25", "#1899D6", 1.4) + H(13.6, 7, 1.6, 7),
  ribosome: E(14, 20, 11, 7, "o") + E(18, 11, 7.5, 5, "y") + L("M2 29 Q10 27 16 29 Q22 31 30 28", "k", 2) + [[6, 28], [11, 28.3], [22, 29.8]].map(([x, y]) => fc(x, y, 1.6, "r")).join("") + H(8, 17, 4, 2),
  mitochondrion: `<g transform="rotate(-18 16 17)">${E(16, 17, 14, 9, "o")}${E(16, 17, 11.5, 6.6, "#FFB066")}${L("M7 17 Q9 11 11 17 Q13 23 15 17 Q17 11 19 17 Q21 23 23 17", "#B15A00", 1.8)}</g>` + H(8, 9, 4, 2, -20),
  chloroplast: E(16, 17, 14, 10, "g") + E(16, 17, 11.5, 7.6, "#9BE15A") + [[9, 16], [16, 18], [22.5, 16]].map(([x, y]) => [0, 1, 2].map(i => fe(x, y - 2.4 + i * 2.4, 3.4, 1.1, "#2D8A00")).join("")).join("") + H(6, 10, 4, 2, -25),
  cellwall: R(2, 4, 28, 26, 7, "n") + R(5.5, 7.5, 21, 19, 4, "l") + C(16, 17, 4, "v") + L("M8 11 H10 M22 24 H24", "#46A302", 1.6) + H(4, 6, 4, 2),
  vacuole: R(2, 4, 28, 26, 6, "l") + E(16, 17, 9.5, 10.5, "a") + fc(13, 14, 1.2, "w") + fc(18, 21, 1.6, "w") + fc(19, 13, 1, "w") + L("M7 8 L9 10", "#46A302", 1.6),
  rbc: C(16, 16, 13, "r") + E(16, 16, 7, 5, "#C73030") + H(7, 8, 5, 3, -35) + E(16, 16, 7, 5, "#FF9A9A").replace('fill="#FF9A9A"', 'fill="#FF9A9A" opacity=".5"'),
  stoma: `<g transform="rotate(-12 16 16)">${P("M2 16 C2 5 14 4 16 9 C18 4 30 5 30 16 C30 27 18 28 16 23 C14 28 2 27 2 16Z", "g")}${E(16, 16, 3.2, 6.6, "#1F5E00")}${fc(8, 14, 1.5, "#9BE15A")}${fc(24, 14, 1.5, "#9BE15A")}${fc(8, 19, 1.3, "#9BE15A")}${fc(24, 19, 1.3, "#9BE15A")}</g>` + L("M16 1 V4 M13 2 L16 4 L19 2", "a", 1.4),
  alveolus: [[11, 12, 7], [22, 12, 6.5], [16, 22, 8]].map(([x, y, r]) => C(x, y, r, "k")).join("") + L("M4 8 Q8 15 4 22 M28 7 Q24 14 28 21 M10 30 Q16 25 22 30", "r", 1.8) + L("M5 5 L8 9 M27 5 L24 9", "a", 1.6) + H(8, 7, 3, 3),
  villus: P("M10 31 V11 C10 1 22 1 22 11 V31Z", "k") + L("M14 29 V9", "#FFE066", 2.4) + L("M18 29 C22 24 18 20 18 16 C18 12 20 11 18 9", "r", 1.8) + L("M7 6 L10 9 M25 6 L22 9", "#9AD9FF", 1.5) + H(11, 6, 2.5, 6),
  xylem: R(10, 2, 12, 28, 4, "n") + fr(12, 3, 8, 26, 3, "#F6D9AE") + [7, 12, 17, 22].map(y => L(`M12 ${y} Q16 ${y + 2.4} 20 ${y}`, "#8C5219", 1.8)).join("") + L("M16 27 V6 M13 9 L16 5 L19 9", "a", 1.8) + fc(16, 19, 1.4, "b"),
  neurone: L("M9 22 L3 28 M9 22 L4 17 M9 22 L8 29", "p", 2) + C(9, 21, 5.5, "p") + fc(9, 21, 2, "#E6D5FF") + L("M13 19 L27 9", "p", 2.2) + [[16, 17], [20.5, 14.2], [25, 11.4]].map(([x, y]) => E(x, y, 2.6, 1.7, "y", -33)).join("") + L("M27 9 L30 5 M27 9 L31 10 M27 9 L29 13", "p", 1.6),
  enzyme: P("M16 4 C6 4 2 12 5 19 C8 26 17 29 25 25 C29 22 29 14 24 12 L19 12 L22 18 C20 20 14 18 14 14 C14 10 18 9 20 7 C21 5 19 4 16 4Z", "p") + P("M22 3 L29 5 L26 11Z", "y") + spk(8, 8, 3, "w") + H(6, 12, 3, 6, 10),
  glucose: P("M16 2 L27 8.5 V21.5 L16 28 L5 21.5 V8.5Z", "a") + f("M16 6 L23.5 10.4 V19.6 L16 24 L8.5 19.6 V10.4Z", "w") + `<text x="16" y="18.2" text-anchor="middle" font-size="7.5" font-weight="900" fill="#1899D6" font-family="sans-serif">C₆</text>` + L("M16 2 V-1", "#1899D6", 1) + R(11, 29, 10, 3.4, 1.7, "b"),
  pollen: [0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map(a => `<g transform="rotate(${a} 16 16)">${fc(16, 2.8, 2.2, "o")}</g>`).join("") + C(16, 16, 10, "y") + fc(12, 13, 2, "#FFF3B0") + fc(20, 18, 2.4, "#FFB84D") + L("M10 20 Q16 25 22 20", "#E0A800", 1.4),
  dna: ICN.dna,
  chromosome: `<g transform="rotate(14 16 16)">${P("M12 2 C7 2 8 12 14 16 C8 20 7 30 12 30 C17 30 16 22 16 16 C16 10 17 2 12 2Z", "p")}${P("M20 2 C25 2 24 12 18 16 C24 20 25 30 20 30 C15 30 16 22 16 16 C16 10 15 2 20 2Z", "#B78AF0")}${fc(16, 16, 2.6, "y")}</g>`,
  haemoglobin: [[10, 10], [22, 10], [10, 22], [22, 22]].map(([x, y], i) => C(x, y, 7.5, i % 2 ? "b" : "a")).join("") + [[10, 10], [22, 10], [10, 22], [22, 22]].map(([x, y]) => fc(x, y, 3.3, "r")).join("") + `<text x="16" y="18.6" text-anchor="middle" font-size="6" font-weight="900" fill="#fff" font-family="sans-serif">Fe</text>`,
  phloem: R(10, 1, 12, 30, 3, "t") + [8, 16, 24].map(y => fr(10, y, 12, 2, 0, "#17AE9D")).join("") + [[13, 5], [19, 12], [13, 20], [19, 28]].map(([x, y]) => fc(x, y, 1.6, "w")).join("") + R(2, 5, 6, 22, 3, "g") + R(24, 5, 6, 22, 3, "g") + L("M16 29 V4 M13 7 L16 3 L19 7", "#fff", 1.4),
  synapse: P("M2 6 C2 2 10 2 12 8 C13 12 13 20 12 24 C10 30 2 30 2 26Z", "p") + P("M30 6 C30 2 22 2 20 8 C19 12 19 20 20 24 C22 30 30 30 30 26Z", "k") + [[6, 11], [8, 17], [6, 22]].map(([x, y]) => fc(x, y, 2, "#EBDDFF")).join("") + [[14.5, 12], [16, 16], [17.5, 20]].map(([x, y]) => fc(x, y, 1.3, "y")).join("") + L("M23 11 V21", "#C73C8C", 1.4),
  antibody: L("M16 30 V17 M16 17 L7 6 M16 17 L25 6", "b", 5) + L("M16 30 V17 M16 17 L7 6 M16 17 L25 6", "a", 2.2) + P("M2 3 L9 2 L7 8Z", "r") + P("M23 8 L25 1 L30 6Z", "r") + fc(16, 29, 2, "#1899D6"),
  insulin: P("M3 16 C3 8 12 6 18 9 C24 5 30 9 29 15 C28 22 20 24 15 22 C11 26 3 24 3 16Z", "o") + [[9, 14], [14, 12], [20, 15], [25, 13], [12, 19], [19, 20]].map(([x, y]) => fc(x, y, 1.7, "y")).join("") + P("M26 20 C29 24 31 26 29 29 C26 31 22 29 24 25Z", "a") + H(5, 12, 3, 4, 20),
  nephron: C(8, 9, 6.5, "o") + fc(8, 9, 3.2, "r") + L("M14 10 C22 8 24 16 20 18 C16 20 14 24 20 25 C26 26 28 20 26 14 V4", "y", 2.6) + L("M26 14 V28", "#FFD966", 3) + fc(26, 29, 1.6, "k") + H(4, 4, 3, 3),
  spindle: C(16, 16, 14, "#FFE0C2") + L("M16 4 C6 9 6 23 16 28 M16 4 C26 9 26 23 16 28 M16 4 V28 M16 4 C11 10 11 22 16 28 M16 4 C21 10 21 22 16 28", "#6EC2F2", 1.6) + fc(16, 4, 2.6, "d") + fc(16, 28, 2.6, "d") + [[11.5, 16, "k"], [15, 16, "p"], [18.5, 16, "k"], [22, 16, "p"]].map(([x, y, k]) => R(x - 1.6, y - 4, 3.2, 8, 1.6, k)).join(""),
  atp: [[7, 12], [16, 8], [25, 12]].map(([x, y]) => C(x, y, 5, "y")).join("") + `<text x="7" y="14.3" text-anchor="middle" font-size="6" font-weight="900" fill="#8A5A00" font-family="sans-serif">P</text><text x="16" y="10.3" text-anchor="middle" font-size="6" font-weight="900" fill="#8A5A00" font-family="sans-serif">P</text><text x="25" y="14.3" text-anchor="middle" font-size="6" font-weight="900" fill="#8A5A00" font-family="sans-serif">P</text>` + P("M12 18 L20 18 L22 25 L16 29 L10 25Z", "o") + P("M17 21 L12 29 H17 L15 33 L22 25 H17Z", "r").replace(/translate\(0 2\)/, "translate(0 0)"),
  heart: P("M16 29 C6 22 2 17 2 12 C2 8 5 5 9 5 C12 5 14.5 7 16 9.5 C17.5 7 20 5 23 5 C27 5 30 8 30 12 C30 17 26 22 16 29Z", "r") + L("M16 10 C14 16 17 22 16 27", "#B72A2A", 1.4) + L("M10 5 C10 0 17 -1 21 3", "r", 3.4) + L("M8 6 V1", "b", 3) + L("M24 6 V1", "b", 3) + L("M4 14 H9", "#fff", 1.2) + H(6, 8, 5, 4, -35),
  peapod: ICN.peapod + `<text x="16" y="31" text-anchor="middle" font-size="6" font-weight="900" fill="#46A302" font-family="sans-serif">3 : 1</text>`,
  krebs: L("M16 4 A12 12 0 1 1 5 11", "o", 3.2) + P("M2 6 L9 11 L2 15Z", "o") + [[16, 4], [28, 16], [16, 28], [4, 16]].map(([x, y]) => C(x, y, 3.4, "y")).join("") + fc(16, 16, 4, "#FFE9B5") + `<text x="16" y="18" text-anchor="middle" font-size="5" font-weight="900" fill="#B15A00" font-family="sans-serif">CO₂</text>`,
  chlorophyll: ICN.leaves + C(16, 17, 7, "g") + fc(16, 17, 3, "#C9F29A") + `<text x="16" y="19" text-anchor="middle" font-size="5" font-weight="900" fill="#1F5E00" font-family="sans-serif">Mg</text>` + L("M23 18 Q29 20 29 27", "#2D8A00", 1.6),
  restriction: "",
  pcr: "",
  feedback: L("M5 13 A11 11 0 0 1 24 7 M27 19 A11 11 0 0 1 8 25", "o", 3) + P("M25 2 L28 10 L20 9Z", "o") + P("M7 30 L4 22 L12 23Z", "o") + R(14, 8, 4, 14, 2, "w") + C(16, 23, 3.4, "r") + fr(15, 13, 2, 9, 1, "r"),
  selection: R(9, 2, 14, 30, 4, "n") + L("M12 6 V28 M17 4 V30 M21 8 V26", "#8C5219", 1.6) + `<g transform="translate(5 9)">${P("M5 4 L0 0 Q-1 5 3 8Z M5 4 L10 0 Q11 5 7 8Z", "w")}${E(5, 6, 1.5, 4.5, "#E5E5E5")}</g>` + `<g transform="translate(17 19)">${P("M5 4 L0 0 Q-1 5 3 8Z M5 4 L10 0 Q11 5 7 8Z", "#5A4A42")}${E(5, 6, 1.5, 4.5, "d")}</g>` + P("M26 4 C30 3 31 8 28 11 L26 8Z", "y") + L("M25 12 L28 11", "o", 1.6),
  carbon: ICN.tree.replace(/translate\(0 2\)/g, "translate(0 2)") + C(25, 6, 4, "w") + `<text x="25" y="8" text-anchor="middle" font-size="4" font-weight="900" fill="#4B4B4B" font-family="sans-serif">CO₂</text>` + L("M20 9 Q14 14 13 20", "a", 1.6),
  crispr: L("M7 3 C7 12 25 12 25 17 C25 22 7 22 7 31", "b", 3) + L("M25 3 C25 12 7 12 7 17 C7 22 25 22 25 31", "a", 3) + C(16, 16, 8, "p") + fc(16, 16, 3.4, "#EBDDFF") + L("M4 16 H10", "r", 2.2) + spk(26, 8, 3.4, "y") + L("M24 25 L28 29 M28 25 L24 29", "y", 1.6),
  stemcell: C(16, 9, 7, "p") + fc(16, 9, 3, "#EBDDFF") + L("M11 16 L6 21 M16 17 V21 M21 16 L26 21", "s", 1.8) + E(6, 26, 4.5, 3.4, "r") + E(16, 26, 3.6, 4.4, "b") + P("M22 22 L30 22 L28 30 L24 30Z", "g") + spk(26, 5, 3, "y"),
  pangolin: P("M2 22 C2 12 12 7 20 9 C27 11 29 18 26 24 C23 29 8 29 4 25 C3 24 2 23 2 22Z", "n") + P("M22 9 C27 7 31 10 30 14 C28 12 25 11 22 12Z", "#A87A4C") + [[10, 13], [15, 12], [20, 14], [8, 18], [13, 17], [18, 18], [23, 19], [11, 23], [16, 23], [21, 24]].map(([x, y]) => `<path d="M${x - 3} ${y} Q${x} ${y + 5} ${x + 3} ${y}Z" fill="#8C5219" stroke="#6B3E10" stroke-width=".7"/>`).join("") + fc(28, 14, 1.2, "d") + L("M26 30 Q30 28 31 22", "n", 2.6),
  luca: R(14, 14, 4, 16, 2, "n") + L("M16 16 C8 14 6 8 6 3 M16 16 C24 14 26 8 26 3 M16 12 C12 9 12 5 12 2 M16 12 C20 9 20 5 20 2", "n", 2.2) + [[6, 3], [26, 3], [12, 2], [20, 2], [9, 8], [23, 8]].map(([x, y], i) => C(x, y, 2.4, ["g", "o", "p", "b", "r", "y"][i])).join("") + E(16, 31, 8, 2.4, "y") + spk(16, 20, 3.4, "y"),
  endosym: C(16, 16, 14, "a") + C(16, 16, 12, "#C5ECFF") + `<g transform="rotate(-20 16 17)">${E(16, 17, 8.5, 5.4, "o")}${E(16, 17, 6.8, 3.8, "#FFB066")}${L("M11 17 Q13 14 15 17 Q17 20 19 17", "#B15A00", 1.2)}</g>` + L("M16 3 V8 M12 5 L16 8 L20 5", "w", 1.4) + fc(8, 9, 1.4, "w") + fc(24, 23, 1.6, "w")
};
A.pcr = `<g transform="translate(-2 3) scale(.7)">${ICN.dna}</g><g transform="translate(15 3) scale(.7)">${ICN.dna}</g>` + L("M13 6 L15 6", "o", 1) + `<text x="16" y="32" text-anchor="middle" font-size="5.5" font-weight="900" fill="#D93636" font-family="sans-serif">95°→72°</text>`;
A.restriction = `<g transform="translate(0 4) scale(.9)">${ICN.scissors}</g>` + L("M2 6 H13 M19 6 H30", "b", 2) + L("M2 10 H13 M19 10 H30", "k", 2) + spk(16, 8, 2.6, "y");

return A;
})();

const spk = (x, y, r, k = "w") => `<path d="${ICN.__h.spark(x, y, r)}" fill="${ICN.__h.col(k)[0]}"/>`;
const K_ = (id, name, rar, cat, art, d) => ({ id, name, rar, cat, art, d });
const COLLECTIBLES = [
  // ---- Common (16) ----
  K_("nucleus", "Nucleus", "common", "Organelle", "nucleus", "Surrounded by a double membrane with pores. Contains chromosomes (DNA and protein) and controls the cell's activities."),
  K_("membrane", "Cell membrane", "common", "Cell structure", "membrane", "A partially permeable phospholipid bilayer with embedded proteins. It controls which substances enter and leave the cell."),
  K_("ribosome", "Ribosome", "common", "Organelle", "ribosome", "A tiny particle of rRNA and protein with no membrane. It is the site of protein synthesis (translation of mRNA)."),
  K_("mitochondrion", "Mitochondrion", "common", "Organelle", "mitochondrion", "Has a double membrane, with the inner one folded into cristae. Aerobic respiration here releases most of the cell's ATP."),
  K_("chloroplast", "Chloroplast", "common", "Organelle", "chloroplast", "Found in plant cells. Chlorophyll in the thylakoid membranes (grana) absorbs light for photosynthesis."),
  K_("cellwall", "Cell wall", "common", "Cell structure", "cellwall", "Made of cellulose in plants. It is fully permeable, supports the cell and stops it bursting in a hypotonic solution."),
  K_("vacuole", "Vacuole", "common", "Organelle", "vacuole", "A large sac of cell sap in plant cells, bounded by the tonoplast. It stores sugars and ions and keeps the cell turgid."),
  K_("rbc", "Red blood cell", "common", "Cell", "rbc", "A biconcave disc with no nucleus, packed with haemoglobin. The large surface area makes oxygen transport efficient."),
  K_("stoma", "Stoma", "common", "Plant structure", "stoma", "A pore between two guard cells in the leaf epidermis. It lets CO₂ in and water vapour out (transpiration)."),
  K_("alveolus", "Alveolus", "common", "Organ structure", "alveolus", "A lung air sac with a wall one cell thick, wrapped in capillaries. Oxygen and CO₂ swap by diffusion."),
  K_("villus", "Villus", "common", "Organ structure", "villus", "A finger-like fold of the small intestine wall with capillaries and a lacteal. It increases the area for absorption."),
  K_("xylem", "Xylem vessel", "common", "Tissue", "xylem", "Dead, hollow tubes strengthened with lignin. They carry water and minerals up from the roots and support the plant."),
  K_("neurone", "Neurone", "common", "Cell", "neurone", "A long cell body extension (axon) carries electrical impulses. A myelin sheath speeds them up."),
  K_("enzyme", "Enzyme", "common", "Molecule", "enzyme", "A globular protein that acts as a biological catalyst. Its active site fits one substrate; heat or extreme pH denatures it."),
  K_("glucose", "Glucose", "common", "Molecule", "glucose", "C₆H₁₂O₆, a monosaccharide. It is the main respiratory substrate and the product of photosynthesis."),
  K_("pollen", "Pollen grain", "common", "Plant structure", "pollen", "Contains the male gamete nucleus. It is carried from the anther to the stigma during pollination."),
  // ---- Rare (12) ----
  K_("dna", "DNA double helix", "rare", "Molecule", "dna", "Two antiparallel polynucleotide strands held by hydrogen bonds between bases: A pairs with T, C pairs with G."),
  K_("chromosome", "Chromosome", "rare", "Genetics", "chromosome", "DNA wrapped around histone proteins and condensed. Human body cells have 46 chromosomes (23 pairs)."),
  K_("haemoglobin", "Haemoglobin", "rare", "Molecule", "haemoglobin", "A protein of four polypeptides, each with an iron-containing haem group that binds one O₂ to form oxyhaemoglobin."),
  K_("phloem", "Phloem", "rare", "Tissue", "phloem", "Living sieve tubes with companion cells. They transport sucrose and amino acids to where they are needed (translocation)."),
  K_("synapse", "Synapse", "rare", "Nervous", "synapse", "The gap between two neurones. Neurotransmitter diffuses across it, so impulses pass in one direction only."),
  K_("antibody", "Antibody", "rare", "Immunity", "antibody", "A Y-shaped protein made by plasma cells (B lymphocytes). It binds one specific antigen to mark pathogens for destruction."),
  K_("insulin", "Insulin", "rare", "Hormone", "insulin", "Secreted by β cells of the pancreas. It lowers blood glucose by promoting uptake and storage as glycogen."),
  K_("nephron", "Nephron", "rare", "Organ structure", "nephron", "The kidney's functional unit. Ultrafiltration in the glomerulus, then selective reabsorption in the tubule, forms urine."),
  K_("spindle", "Spindle fibre", "rare", "Process", "spindle", "Protein microtubules that attach to centromeres and pull sister chromatids apart to opposite poles in anaphase."),
  K_("atp", "ATP", "rare", "Molecule", "atp", "Adenosine triphosphate, the cell's energy currency. Breaking its terminal phosphate bond releases energy for cell work."),
  K_("heart", "Heart", "rare", "Organ", "heart", "A four-chambered muscular pump with valves. Its double circulation sends blood to the lungs and then to the body."),
  K_("mendel", "Mendel's peas", "rare", "Genetics", "peapod", "Crossing pure-breeding pea plants gave a 3 : 1 ratio in the F₂, showing dominant and recessive alleles."),
  // ---- Epic (7) ----
  K_("krebs", "Krebs cycle", "epic", "Process", "krebs", "Occurs in the mitochondrial matrix. Acetyl groups are oxidised to CO₂, producing reduced NAD and FAD for ATP synthesis."),
  K_("chlorophyll", "Chlorophyll", "epic", "Molecule", "chlorophyll", "A green pigment containing magnesium. It absorbs mainly red and blue light and reflects green."),
  K_("restriction", "Restriction enzyme", "epic", "Biotechnology", "restriction", "Cuts DNA at a specific base sequence, often leaving sticky ends. DNA ligase then joins the cut pieces together."),
  K_("pcr", "PCR", "epic", "Biotechnology", "pcr", "Copies DNA in cycles: heat to separate strands (~95 °C), cool to bind primers, then heat-stable Taq polymerase builds new strands."),
  K_("feedback", "Negative feedback", "epic", "Control", "feedback", "A change is detected and reversed to restore the set point, as the hypothalamus does to keep body temperature near 37 °C."),
  K_("selection", "Natural selection", "epic", "Evolution", "selection", "Individuals with advantageous variations survive and reproduce more, so those alleles become more common over generations."),
  K_("carbon", "Carbon cycle", "epic", "Ecology", "carbon", "Plants fix CO₂ by photosynthesis. Respiration, decomposition and combustion return it to the atmosphere."),
  // ---- Legendary (3) ----
  K_("crispr", "CRISPR-Cas9", "legend", "Biotechnology", "crispr", "A guide RNA leads the Cas9 enzyme to a matching DNA sequence, where it cuts both strands so the gene can be edited."),
  K_("stemcell", "Stem cell", "legend", "Cell", "stemcell", "An unspecialised cell that can divide and differentiate into specialised cell types. It is used in research and therapy."),
  K_("pangolin", "Chinese pangolin", "legend", "Biodiversity", "pangolin", "A critically endangered mammal found in Hong Kong. Its scales are made of keratin; it eats ants and termites."),
  // ---- Mythic (2) ----
  K_("luca", "LUCA", "myth", "Evolution", "luca", "The last universal common ancestor of all life, about 3.5 to 4 billion years ago. All living things share the same genetic code."),
  K_("endosym", "Endosymbiosis", "myth", "Evolution", "endosym", "Mitochondria and chloroplasts descend from engulfed prokaryotes. They have their own circular DNA, 70S ribosomes and double membranes.")
];
const CARD_N = COLLECTIBLES.length;
const cardById = id => COLLECTIBLES.find(c => c.id === id);
const OLD_CARD_MAP = { mochi: "mitochondrion", onigiri: "chloroplast", boba: "ribosome", dango: "enzyme", donut: "rbc", grapes: "alveolus", villi: "villus", virus: "nucleus", jelly: "membrane", pollen: "pollen", peapod: "mendel",
  dnastick: "dna", heartkey: "heart", stomaclip: "stoma", noodles: "neurone", photocard: "krebs", blindbox: "pcr", aura: "selection", matcha: "chlorophyll", flip: "restriction" };
function migrateCards(coll) {
  Object.keys(coll.owned).forEach(k => { if (OLD_CARD_MAP[k]) { const n = OLD_CARD_MAP[k]; coll.owned[n] = (coll.owned[n] || 0) + coll.owned[k]; delete coll.owned[k]; } });
  Object.keys(coll.owned).forEach(k => { if (!cardById(k)) delete coll.owned[k]; });
  coll.pityL = coll.pityL || 0;
}
const collOwned = r => COLLECTIBLES.filter(c => (r == null || (r === true ? c.rar !== "common" : c.rar === r)) && (S.coll.owned[c.id] || 0) > 0).length;
const collTotal = r => COLLECTIBLES.filter(c => r == null || c.rar === r).length;

/* ----- Card drawing ----- */
const cardArt = c => `<svg viewBox="0 0 32 34" class="cardart" aria-hidden="true">${ART[c.art] || ICN.sparkles}</svg>`;
function cardTile(c, own, full = false) {
  const R_ = CARD_RAR[c.rar], bg = CATEGORY_BG[c.cat] || ["#EEE", "#CCC"], no = String(COLLECTIBLES.indexOf(c) + 1).padStart(2, "0");
  const hid = !own, deep = hid && (c.rar === "legend" || c.rar === "myth");
  return `<div class="bcard r-${c.rar} ${own ? "own" : "locked"} ${full ? "full" : ""}" data-card="${c.id}" aria-label="${own ? esc(c.name) : "Locked card"}">
    <span class="bfoil" aria-hidden="true"></span>
    <div class="bbar"><span class="bn">${own ? esc(c.name) : deep ? "? ? ?" : "???"}</span><span class="bsym" title="${R_.n}">${R_.sym}</span></div>
    <div class="bart" style="--c1:${bg[0]};--c2:${bg[1]}">${c.rar === "myth" ? `<i class="gal" aria-hidden="true"></i>` : ""}${hid ? `<span class="sil">${cardArt(c)}</span><span class="qm">?</span>` : cardArt(c)}${own && (c.rar === "legend" || c.rar === "myth") ? `<i class="sparkly" aria-hidden="true"></i>` : ""}</div>
    <div class="bcat"><span>${hid ? "Mystery card" : esc(c.cat)}</span><span class="brar">${R_.n}</span></div>
    ${full ? `<p class="bdesc">${own ? esc(c.d) : "Open capsules to discover this card."}</p>` : ""}
    <div class="bfoot"><span class="bno">No. ${no}/${CARD_N}</span>${own ? `<span class="bstamp">${own > 1 ? `×${own}` : "✓"}</span>` : ""}</div></div>`;
}

/* ----- Odds: five rarities; streaks add luck; pity guarantees Epic+ every 10 capsules and Legendary+ every 40 ----- */
const PITY_E = 10, PITY_L = 40;
const streakLuck = () => Math.min(8, .4 * (S.current_streak || 0));
function oddsNow() {
  const L_ = streakLuck(), w = { common: 58 - L_, rare: 27, epic: 10 + .6 * L_, legend: 4 + .3 * L_, myth: 1 + .1 * L_ };
  return w;
}
function rollRarity() {
  const c = S.coll;
  if (c.pityL + 1 >= PITY_L) return Math.random() < .85 ? "legend" : "myth";
  if (c.pity + 1 >= PITY_E) { const r = Math.random(); return r < .8 ? "epic" : r < .97 ? "legend" : "myth"; }
  const w = oddsNow(); let x = Math.random() * CARD_ORDER.reduce((a, k) => a + w[k], 0);
  for (const k of CARD_ORDER) { if ((x -= w[k]) < 0) return k; }
  return "common";
}
function rollCollectible() {
  const rar = rollRarity(), pool = COLLECTIBLES.filter(c => c.rar === rar), fresh = pool.filter(c => !S.coll.owned[c.id]);
  const c = pick(fresh.length && Math.random() < .85 ? fresh : pool), k = CARD_ORDER.indexOf(c.rar);
  S.coll.pity = k >= 2 ? 0 : S.coll.pity + 1; S.coll.pityL = k >= 3 ? 0 : S.coll.pityL + 1;
  return c;
}
function grantCapsule(n = 1, why = "") { S.coll.pending += n; save(true); if (why) toast(`🎁 +${n} capsule${n > 1 ? "s" : ""}: ${why}`); }

/* ----- Streak capsules: +1 every 3rd streak day, +2 on milestone days ----- */
const STREAK_BIG = [7, 14, 21, 30, 50, 75, 100, 150, 200];
const streakCapsuleFor = d => (STREAK_BIG.includes(d) ? 2 : d > 0 && d % 3 === 0 ? 1 : 0);
function nextStreakCapsule() { const cur = S.current_streak || 0; for (let d = cur + 1; d < cur + 40; d++) if (streakCapsuleFor(d)) return { day: d, n: streakCapsuleFor(d), left: d - cur }; return { day: cur + 3, n: 1, left: 3 }; }

/* ----- Capsule opening ----- */
const CAP_COL = { common: ["#FFB7C5", "#FF86B4"], rare: ["#BDE7FF", "#5AB4F0"], epic: ["#FFE680", "#F2B800"], legend: ["#FFC2E8", "#B77BFF"], myth: ["#B9A6FF", "#5B3FD1"] };
const capsuleSvg = (rar = "common") => { const [a, b] = CAP_COL[rar]; return `<svg viewBox="0 0 120 120"><defs><linearGradient id="capg${rar}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
  <ellipse cx="60" cy="108" rx="34" ry="6" fill="rgba(107,74,107,.18)"/><circle cx="60" cy="58" r="44" fill="url(#capg${rar})" stroke="${CO}" stroke-width="4"/><path d="M16 58 H104 A44 44 0 0 1 16 58Z" fill="#FFFDF8" stroke="${CO}" stroke-width="4"/>
  <circle cx="60" cy="58" r="9" fill="#FFF3B0" stroke="${CO}" stroke-width="3"/><path d="M34 32 q12 -12 26 -12" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".85"/><circle cx="82" cy="40" r="3" fill="#fff" opacity=".8"/></svg>`; };
function openCapsule(fromAlbum) {
  if (!(S.coll.pending > 0)) return;
  const box = openModal(`<span class="kicker">🎁 Mystery capsule</span><h2>What biology card is inside?</h2>
    <div class="capsule" id="cap" aria-hidden="true">${capsuleSvg("common")}</div>
    ${say("chiikawa", "Please be a rare one... 🙏", "brave")}
    <p class="small muted" style="text-align:center;margin:0">${PITY_E - S.coll.pity - 1 > 0 ? `Epic or better guaranteed in ${PITY_E - S.coll.pity} capsule${PITY_E - S.coll.pity > 1 ? "s" : ""}` : "This one is guaranteed Epic or better!"} · 🔥 streak luck +${streakLuck().toFixed(1)}%</p>
    <div class="row" style="justify-content:center"><button class="btn primary big" id="capGo">Twist and open! 🔄</button></div>`, { closable: false });
  box.querySelector("#capGo").onclick = () => {
    SFX.click(); const cap = document.getElementById("cap"); cap.classList.add("shake"); box.querySelector("#capGo").disabled = true;
    const c = rollCollectible(), dup = (S.coll.owned[c.id] || 0) > 0, rr = CARD_RAR[c.rar];
    S.coll.owned[c.id] = (S.coll.owned[c.id] || 0) + 1; S.coll.pending -= 1; S.stats.pulls = (S.stats.pulls || 0) + 1;
    const reveal = () => {
      if (dup) gainCoins(rr.dup); else save(true);
      checkTrophies();
      const big = CARD_ORDER.indexOf(c.rar) >= 2;
      if (big) { SFX.fanfare(); setTimeout(() => SFX.yaha(), 400); confetti(c.rar === "common" ? 60 : 160 + 40 * CARD_ORDER.indexOf(c.rar)); } else { SFX.item(); confetti(50); }
      const owned = collOwned(), total = CARD_N;
      box.innerHTML = `<span class="kicker">${big ? `✨ ${rr.n.toUpperCase()} PULL! ✨` : "🎁 Capsule opened"}</span><h2>${dup ? "You already have this one!" : c.rar === "myth" ? "MYTHIC!!! It's real!" : big ? "What a pull!" : "New card!"}</h2>
        <div class="reveal r-${c.rar}">${cardTile(c, S.coll.owned[c.id], true)}</div>
        ${dup ? `<p class="small" style="text-align:center;margin:0">Duplicate card turned into <b>🌰 ${rr.dup}</b>.</p>` : `<p class="small" style="text-align:center;margin:0">New! <b>${owned} / ${total}</b> cards collected.</p>`}
        <div class="row" style="justify-content:center">${S.coll.pending ? `<button class="btn primary big" id="capMore">🎁 Open another (${S.coll.pending})</button>` : ""}<button class="btn yellow" id="capAlbum">📚 Collection</button><button class="btn plain" id="capDone">Done</button></div>`;
      const more = box.querySelector("#capMore"); if (more) more.onclick = () => { SFX.tap(); openCapsule(fromAlbum); };
      box.querySelector("#capAlbum").onclick = () => { SFX.tap(); openAlbum(); };
      box.querySelector("#capDone").onclick = () => { SFX.tap(); closeModal(); if (!R && !RU) renderMap(); };
      wireTilt(box);
    };
    if (CARD_ORDER.indexOf(c.rar) >= 2 && !reduced()) { cap.innerHTML = capsuleSvg(c.rar); setTimeout(() => giftCeremony(c.rar === "epic" ? "epic" : c.rar === "legend" ? "legend" : "myth", reveal), 900); }
    else setTimeout(reveal, reduced() ? 50 : 1000);
  };
}
// 3D tilt: drag or hover over a card to tilt it and move the holo shine
function wireTilt(root) {
  root.querySelectorAll(".bcard.full").forEach(card => {
    const mv = e => { const b = card.getBoundingClientRect(), x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height; card.style.setProperty("--rx", `${(.5 - y) * 16}deg`); card.style.setProperty("--ry", `${(x - .5) * 18}deg`); card.style.setProperty("--sx", `${x * 100}%`); card.style.setProperty("--sy", `${y * 100}%`); };
    const rs = () => { card.style.setProperty("--rx", "0deg"); card.style.setProperty("--ry", "0deg"); };
    card.addEventListener("pointermove", mv); card.addEventListener("pointerdown", mv); card.addEventListener("pointerleave", rs); card.addEventListener("pointerup", rs);
  });
}

/* ----- Collection album ----- */
let albumFilter = "all";
function openAlbum() {
  const cap = S.coll.pending, flt = albumFilter;
  const list = COLLECTIBLES.filter(c => flt === "all" ? true : flt === "missing" ? !(S.coll.owned[c.id] > 0) : c.rar === flt);
  const chips = [["all", "All", `${collOwned()}/${CARD_N}`], ...CARD_ORDER.map(r => [r, CARD_RAR[r].n, `${collOwned(r)}/${collTotal(r)}`]), ["missing", "Missing", ""]];
  const box = openModal(`<span class="kicker">📚 Collection</span><h2>Biology Card Collection</h2>
    <div class="tprog rainbow thick"><i style="width:${Math.round(100 * collOwned() / CARD_N)}%"></i></div>
    ${cap ? `<div class="row"><button class="btn primary big" id="alOpen">🎁 Open a capsule (${cap})</button></div>` : `<p class="small muted" style="margin:0">No capsule ready. Study today to keep your streak and earn the next one!</p>`}
    <div class="slottabs" role="tablist">${chips.map(([k, n, c]) => `<button role="tab" aria-selected="${k === flt}" data-af="${k}">${n}${c ? ` <span class="small">${c}</span>` : ""}</button>`).join("")}</div>
    <div class="cardgrid">${list.map(c => cardTile(c, S.coll.owned[c.id])).join("") || `<p class="muted">Nothing here. Great job!</p>`}</div>
    <p class="small muted">Tap a card to read it. Duplicates turn into 🌰 (5 / 10 / 25 / 60 / 120). Epic or better is guaranteed every ${PITY_E} capsules.</p>`, { wide: true });
  const b = box.querySelector("#alOpen"); if (b) b.onclick = () => { SFX.tap(); openCapsule(true); };
  box.querySelectorAll("[data-af]").forEach(x => x.onclick = () => { SFX.tap(); albumFilter = x.dataset.af; openAlbum(); });
  box.querySelectorAll(".bcard").forEach(x => x.onclick = () => { const c = cardById(x.dataset.card); SFX.tap(); openCardDetail(c); });
}
function openCardDetail(c) {
  const own = S.coll.owned[c.id] || 0;
  const box = openModal(`<span class="kicker">🃏 ${CARD_RAR[c.rar].n} card</span><div class="reveal r-${c.rar}">${cardTile(c, own, true)}</div><div class="row" style="justify-content:center"><button class="btn plain" id="cdBack">← Collection</button></div>`);
  box.querySelector("#cdBack").onclick = () => { SFX.tap(); openAlbum(); }; wireTilt(box);
}

/* ----- 🌟 The big Home advert: Biology Capsule Lab ----- */
function machineSvg2() {
  const caps = [["#FF86B4", 30, 44], ["#5AB4F0", 52, 36], ["#FFD13D", 74, 44], ["#B77BFF", 40, 62], ["#58CC02", 64, 62], ["#FF9600", 86, 60], ["#FFC2E8", 52, 80]];
  return `<svg viewBox="0 0 120 150" class="machine" aria-hidden="true"><defs><linearGradient id="mglass" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#CFE9FF" stop-opacity=".55"/></linearGradient><linearGradient id="mbase" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#FF86B4"/><stop offset="1" stop-color="#E0508F"/></linearGradient></defs>
    <ellipse cx="60" cy="144" rx="44" ry="5" fill="rgba(107,74,107,.2)"/>
    <circle cx="60" cy="52" r="44" fill="url(#mglass)" stroke="${CO}" stroke-width="3.5"/>
    <g class="mcaps">${caps.map(([c, x, y], i) => `<g class="mc m${i}"><circle cx="${x}" cy="${y}" r="11" fill="${c}" stroke="${CO}" stroke-width="2.4"/><path d="M${x - 11} ${y} H${x + 11}" stroke="${CO}" stroke-width="2"/><circle cx="${x - 4}" cy="${y - 5}" r="2.4" fill="#fff" opacity=".8"/></g>`).join("")}</g>
    <path d="M26 30 q10 -14 28 -16" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".9"/>
    <rect x="14" y="88" width="92" height="46" rx="14" fill="url(#mbase)" stroke="${CO}" stroke-width="3.5"/><rect x="24" y="96" width="30" height="14" rx="7" fill="#FFF3B0" stroke="${CO}" stroke-width="2.5"/>
    <circle cx="82" cy="104" r="10" fill="#fff" stroke="${CO}" stroke-width="3"/><path d="M82 96 V112 M74 104 H90" stroke="${CO}" stroke-width="3" stroke-linecap="round" class="crank"/>
    <rect x="42" y="118" width="36" height="14" rx="6" fill="#4B3350" stroke="${CO}" stroke-width="2.5"/></svg>`;
}
function capsuleAdHtml() {
  const pend = S.coll.pending, nx = nextStreakCapsule(), cur = S.current_streak || 0, studied = studiedToday();
  const L_ = streakLuck(), prev = cur - (cur % 3), pc = Math.min(100, Math.round(100 * (cur - prev) / (nx.day - prev || 3)));
  const stagger = CARD_ORDER.map(r => { const o = collOwned(r), t = collTotal(r); return `<div class="adrar r-${r}"><span class="adsym">${CARD_RAR[r].sym}</span><b>${r === "myth" && !o ? "?" : `${o}/${t}`}</b><span class="small">${CARD_RAR[r].n}</span></div>`; }).join("");
  const mystery = ["luca", "endosym", "crispr"].map(id => { const c = cardById(id); return `<span class="adtease r-${c.rar} ${S.coll.owned[id] ? "own" : ""}"><span class="${S.coll.owned[id] ? "" : "sil"}">${cardArt(c)}</span></span>`; }).join("");
  return `<section class="capad" aria-label="Biology Capsule Lab">
    <i class="adglow" aria-hidden="true"></i><span class="adspark s1" aria-hidden="true">${spk(5, 5, 5, "y")}</span><span class="adspark s2" aria-hidden="true">${spk(5, 5, 4, "k")}</span><span class="adspark s3" aria-hidden="true">${spk(5, 5, 3, "a")}</span>
    <div class="admain">
      <div class="admach">${machineSvg2()}${pend ? `<span class="adbadge">${pend}</span>` : ""}</div>
      <div class="adtext">
        <span class="adnew">NEW · ${CARD_N} BIOLOGY CARDS</span>
        <h2>Biology Capsule Lab</h2>
        <p>Collect real biology terms and structures as shiny trading cards, from Common to <b>Mythic</b>.</p>
        ${pend ? `<button class="btn primary big adgo" id="adOpen">🎁 Open capsule (${pend})</button>` : `<button class="btn primary big adgo" id="adStudy">${studied ? "⚡ Play a Cell Rush to earn one" : "🔥 Study today to earn one"}</button>`}
        <button class="adalbum" id="adAlbum">📚 Collection ${collOwned()}/${CARD_N}</button>
      </div></div>
    <div class="adstreak"><div class="adsrow"><b>🔥 Streak reward</b><span class="small">${nx.left === 1 && !studied ? "Study today for" : `In ${nx.left} day${nx.left > 1 ? "s" : ""}:`} <b>+${nx.n} capsule${nx.n > 1 ? "s" : ""}</b> (day ${nx.day})</span></div>
      <div class="tprog thick"><i style="width:${pc}%"></i></div>
      <span class="small muted">Streak luck: <b>+${L_.toFixed(1)}%</b> better odds (up to +8%). A capsule every 3rd day, 2 on day 7, 14, 21, 30...</span></div>
    <div class="adrow"><div class="adtease-row" aria-label="Mystery cards">${mystery}</div><div class="adrars">${stagger}</div></div>
  </section>`;
}
function wireCapsuleAd() {
  const g = id => document.getElementById(id);
  if (g("adOpen")) g("adOpen").onclick = () => { SFX.init(); SFX.tap(); openCapsule(); };
  if (g("adStudy")) g("adStudy").onclick = () => { SFX.init(); SFX.tap(); const ni = nextRoomIndex(); if (S.playMode === "study" || ni === -1) { goTab("stages"); } else enterRoom(ROOMS[ni].id); };
  if (g("adAlbum")) g("adAlbum").onclick = () => { SFX.init(); SFX.tap(); openAlbum(); };
}
