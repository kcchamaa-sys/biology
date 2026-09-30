
/* ============================================================
   4a. Parts II–IV of the compulsory part (usually taught in S5–S6)
   ============================================================ */
const K = (who, mood, text) => [who, mood, text];
ROOMS.push(
  /* ---------------- Basic Genetics ---------------- */
  { id: "t9s1", t: "t9", s: 1, name: "The Pea Garden", focus: "Mendel and monohybrid inheritance", scene: "garden",
    special: "peapod", specialName: "Pea pod", specialLine: "A giant pea pod! Some peas are round, some are wrinkled... why?",
    tint: "#C8E6B0", floor: "#9CBE83", dim: .56, code: "31592", item: "🫛 Pea-pod sticker",
    intro: [K("chiikawa", "sparkle", "Peas! Round ones and wrinkly ones! 🫛✨"), K("hachiware", "normal", "Mendel studied peas to find out how features are passed on. Let's be geneticists!"), K("usagi", "happy", "WAHOO! Pea party! 🐰")],
    notes: [
      "A <b>gene</b> is a section of DNA that controls a characteristic. <b>Alleles</b> are different forms of the same gene, found at the same <b>locus</b> on homologous chromosomes.",
      "<b>Genotype</b> = the alleles an organism has (e.g. Tt). <b>Phenotype</b> = its observable features (e.g. tall), which depend on genotype and environment.",
      "<b>Homozygous</b>: two identical alleles (TT or tt). <b>Heterozygous</b>: two different alleles (Tt).",
      "A <b>dominant</b> allele shows its effect in the heterozygote; a <b>recessive</b> allele shows only when homozygous.",
      "<b>Mendel's law of segregation</b>: the two alleles of a gene separate during gamete formation (meiosis), so each gamete carries only one allele.",
      "Tt × Tt → genotypes 1 TT : 2 Tt : 1 tt → phenotypes <b>3 dominant : 1 recessive</b>. A <b>test cross</b> with a homozygous recessive (tt) reveals an unknown genotype."
    ],
    rules: ["Genotype (alleles) + environment → phenotype", "Tt × Tt → 3 : 1 · Tt × tt → 1 : 1", "Test cross: unknown × homozygous recessive"],
    terms: [["gene", "section of DNA that controls a characteristic"], ["allele", "one of the different forms of a gene"], ["genotype", "the alleles an organism has"], ["phenotype", "the observable features of an organism"], ["homozygous", "having two identical alleles of a gene"], ["heterozygous", "having two different alleles of a gene"], ["dominant", "allele expressed even when only one copy is present"], ["recessive", "allele expressed only when two copies are present"], ["test cross", "cross with a homozygous recessive to find an unknown genotype"]] },
  { id: "t9s2", t: "t9", s: 2, name: "The Family Tree Hall", focus: "Pedigrees, codominance, blood groups and sex-linkage", scene: "library",
    special: "family", specialName: "Family portrait", specialLine: "A family portrait with circles and squares... it's a pedigree!",
    tint: "#E8C9A8", floor: "#C09F7D", dim: .6, code: "74205", item: "🌳 Family-tree sticker",
    intro: [K("chiikawa", "shock", "Circles and squares everywhere?! Is this maths?! 😱"), K("hachiware", "happy", "It's a pedigree! Circles are females, squares are males. Shaded means affected."), K("momonga", "sparkle", "My family tree would be full of cute ancestors. 💜")],
    notes: [
      "<b>Pedigree</b> symbols: ○ female, □ male, shaded = affected. Two unaffected parents with an affected child → the trait is <b>recessive</b> (both parents are carriers).",
      "<b>Codominance</b>: both alleles are fully expressed in the heterozygote.",
      "<b>Multiple alleles</b>: more than two alleles exist for a gene. ABO blood groups: Iᴬ and Iᴮ are codominant; i is recessive. Group O = ii; AB = IᴬIᴮ.",
      "<b>Sex determination</b>: females XX, males XY. The father's sperm decides the sex, so the chance of a boy is 1/2 each time.",
      "<b>Sex-linked</b> genes are on the X chromosome (e.g. <b>red-green colour blindness</b>, <b>haemophilia</b>). Males (XʸY) need only one recessive allele to be affected, so they are affected more often. Females can be <b>carriers</b> (XᴬXᵃ)."
    ],
    rules: ["Unaffected parents → affected child ⇒ recessive trait", "Blood group: Iᴬ = Iᴮ (codominant) > i", "XX female · XY male · X-linked recessive traits are more common in males"],
    terms: [["pedigree", "family tree showing how a trait is inherited"], ["carrier", "heterozygous person who carries a recessive allele without showing it"], ["codominance", "both alleles fully expressed in the heterozygote"], ["multiple alleles", "more than two alleles for one gene"], ["sex chromosome", "X or Y chromosome that determines sex"], ["sex-linked", "gene found on a sex chromosome (usually X)"], ["haemophilia", "sex-linked disorder in which blood clots slowly"], ["colour blindness", "sex-linked difficulty telling red from green"]] },
  { id: "t9s3", t: "t9", s: 3, name: "The Variation Arena", focus: "Variation and genetic problem solving", scene: "clinic",
    special: "heightchart", specialName: "Height chart", specialLine: "A wall of heights: nobody is exactly the same! Why?",
    tint: "#B9C4D6", floor: "#8C98AC", dim: .74, code: "58163", item: "📏 Height-chart sticker",
    intro: [K("rakko", "brave", "Boss stage. Everyone is different. Explain why, and solve my crosses. ⚔️"), K("chiikawa", "cry", "Punnett squares... my brain is a square now... 🥺"), K("hachiware", "happy", "Draw the gametes first, then fill the square. It'll work out~! ✨")],
    notes: [
      "<b>Discontinuous variation</b>: clear-cut groups with no in-betweens (e.g. ABO blood group, tongue rolling). Usually controlled by one or a few genes; shown in a <b>bar chart</b>.",
      "<b>Continuous variation</b>: a range of values (e.g. height, body mass). Controlled by <b>many genes</b> plus the <b>environment</b>; shows a bell-shaped (normal) <b>distribution</b> in a histogram.",
      "Causes of <b>genetic variation</b>: meiosis (crossing over, independent assortment), random fertilisation, and <b>mutation</b> (the only source of new alleles).",
      "<b>Environmental variation</b> (diet, sunlight, exercise) is not inherited. Identical twins raised apart show the effect of the environment.",
      "Solving crosses: write parental genotypes → gametes → Punnett square → genotype and phenotype ratios. Ratios are <b>probabilities</b>, not guarantees."
    ],
    rules: ["Discontinuous: distinct groups, few genes · Continuous: range, many genes + environment", "Only mutation creates NEW alleles", "Parents → gametes → Punnett square → ratios (probabilities)"],
    terms: [["variation", "differences between individuals of the same species"], ["continuous variation", "variation with a range of values, e.g. height"], ["discontinuous variation", "variation with distinct groups, e.g. blood group"], ["mutation", "a change in the DNA sequence or chromosome"], ["probability", "the chance that an outcome will happen"], ["Punnett square", "grid used to predict the offspring of a cross"]] },

  /* ---------------- Molecular Genetics and Biotechnology ---------------- */
  { id: "t10s1", t: "t10", s: 1, name: "The DNA Staircase", focus: "DNA structure, genes and chromosomes", scene: "cellworld",
    special: "dna", specialName: "DNA ladder", specialLine: "A twisty ladder spins slowly... each rung is a pair of letters!",
    tint: "#C9C3F0", floor: "#9E97CC", dim: .6, code: "60482", item: "🧬 Double-helix sticker",
    intro: [K("chiikawa", "shock", "The staircase is TWISTING! Where does it go?! 😵"), K("hachiware", "normal", "It's DNA's double helix! A pairs with T, and C pairs with G."), K("usagi", "happy", "Climb the ladder! WOO! 🐰")],
    notes: [
      "DNA is a <b>double helix</b>: two strands of <b>nucleotides</b>, each nucleotide = <b>deoxyribose</b> sugar + <b>phosphate</b> + a nitrogenous <b>base</b>.",
      "Sugar and phosphate form the backbone. Bases pair by <b>complementary base pairing</b>: <b>A–T</b> and <b>C–G</b>, held by hydrogen bonds.",
      "In a DNA molecule, amount of A = amount of T and amount of C = amount of G.",
      "A <b>gene</b> is a sequence of bases that codes for a polypeptide. The <b>genome</b> is all the DNA of an organism.",
      "DNA is packed with proteins into <b>chromosomes</b> in the nucleus. Humans have 23 pairs.",
      "<b>DNA replication</b> (before cell division): the helix unzips, each strand acts as a template, and new complementary strands are built, so each new molecule has one old and one new strand (<b>semi-conservative</b>)."
    ],
    rules: ["Nucleotide = deoxyribose + phosphate + base", "A–T · C–G (complementary base pairing)", "Replication is semi-conservative: one old strand + one new strand"],
    terms: [["double helix", "the twisted-ladder shape of DNA"], ["nucleotide", "unit of DNA: sugar, phosphate and base"], ["deoxyribose", "the sugar in DNA nucleotides"], ["base pairing", "A pairs with T and C pairs with G"], ["genome", "all the genetic material of an organism"], ["replication", "copying of DNA before cell division"], ["semi-conservative", "each new DNA molecule keeps one original strand"]] },
  { id: "t10s2", t: "t10", s: 2, name: "The Ribosome Factory", focus: "Protein synthesis and mutation", scene: "library",
    special: "copier", specialName: "Code copier", specialLine: "The machine copies a DNA message onto a long paper strip: mRNA!",
    tint: "#D6CFE8", floor: "#ADA4C9", dim: .62, code: "92738", item: "📜 mRNA-strip sticker",
    intro: [K("chiikawa", "normal", "The copier is printing letters... A, U, G, C? 📜"), K("hachiware", "happy", "That's transcription! Then ribosomes read the message three letters at a time to make proteins."), K("kurimanju", "happy", "Three letters... like a haiku... 🍵")],
    notes: [
      "<b>Protein synthesis</b> has two stages: <b>transcription</b> (in the nucleus) and <b>translation</b> (at ribosomes in the cytoplasm).",
      "Transcription: part of the DNA unzips and one strand is the template for making <b>mRNA</b>. RNA has <b>ribose</b>, is single-stranded, and has <b>uracil (U)</b> instead of thymine.",
      "mRNA leaves the nucleus through nuclear pores to a <b>ribosome</b>.",
      "Translation: the ribosome reads mRNA in <b>codons</b> (3 bases). <b>tRNA</b> molecules with matching <b>anticodons</b> bring the correct <b>amino acids</b>, which are joined by peptide bonds.",
      "The <b>genetic code</b> is a triplet code: each codon codes for one amino acid; there are start and stop codons.",
      "<b>Mutations</b>: a <b>gene mutation</b> changes the base sequence (e.g. sickle-cell anaemia); a <b>chromosome mutation</b> changes chromosome number or structure (e.g. Down syndrome: an extra chromosome 21). Mutagens: radiation (UV, X-rays), some chemicals (in tobacco smoke)."
    ],
    rules: ["DNA —transcription (nucleus)→ mRNA —translation (ribosome)→ polypeptide", "RNA: ribose · single strand · U instead of T", "Codon = 3 bases = 1 amino acid"],
    terms: [["transcription", "making mRNA from a DNA template"], ["translation", "making a polypeptide from mRNA at a ribosome"], ["messenger RNA", "mRNA: carries the genetic code to the ribosome"], ["transfer RNA", "tRNA: brings amino acids to the ribosome"], ["codon", "three bases on mRNA that code for one amino acid"], ["anticodon", "three bases on tRNA that pair with a codon"], ["uracil", "base found in RNA instead of thymine"], ["mutagen", "a factor that increases the rate of mutation"]] },
  { id: "t10s3", t: "t10", s: 3, name: "The Gene Lab", focus: "Biotechnology and bioethics", scene: "lab",
    special: "petri", specialName: "Petri dish", specialLine: "Glowing bacteria in a dish... they've been given a new gene!",
    tint: "#A8D8C8", floor: "#7DAF9E", dim: .74, code: "15874", item: "🧫 Glowing-bacteria sticker",
    intro: [K("rakko", "brave", "Boss stage. Cutting and pasting genes needs a steady hand... and careful ethics. ⚔️"), K("chiikawa", "shock", "The bacteria are GLOWING?! Is that safe?! 😱"), K("momonga", "happy", "Obviously they're glowing because I'm here. 💜")],
    notes: [
      "<b>Recombinant DNA technology</b>: a gene is cut out using <b>restriction enzymes</b> (which cut at specific base sequences, leaving <b>sticky ends</b>).",
      "The same restriction enzyme cuts a <b>plasmid</b> (the <b>vector</b>); <b>DNA ligase</b> joins the gene into the plasmid.",
      "The recombinant plasmid is put into bacteria, which multiply and make the protein, e.g. <b>human insulin</b> for diabetics.",
      "<b>Genetically modified organisms (GMOs)</b>: e.g. pest-resistant crops, Golden Rice (vitamin A). Concerns: gene flow to wild plants, allergies, effects on ecosystems.",
      "<b>PCR</b> (polymerase chain reaction) makes many copies of a DNA sample. <b>Gel electrophoresis</b> separates DNA fragments by size: small fragments move further.",
      "<b>DNA fingerprinting</b>: comparing band patterns identifies suspects or relatives. The <b>Human Genome Project</b> mapped all human genes. <b>Bioethics</b> weighs benefits against risks and privacy."
    ],
    rules: ["Restriction enzyme cuts → ligase joins → plasmid vector → bacteria make protein", "PCR copies DNA · electrophoresis sorts by size (small travel further)", "Weigh benefits vs risks (bioethics)"],
    terms: [["restriction enzyme", "enzyme that cuts DNA at a specific base sequence"], ["DNA ligase", "enzyme that joins pieces of DNA"], ["plasmid", "small ring of DNA used as a vector"], ["vector", "carrier that takes a gene into a host cell"], ["recombinant DNA", "DNA made by joining DNA from different sources"], ["electrophoresis", "method that separates DNA fragments by size in a gel"], ["DNA fingerprinting", "identifying people by their DNA band pattern"], ["genetically modified organism", "organism whose DNA has been changed by gene technology"]] },

  /* ---------------- Biodiversity and Evolution ---------------- */
  { id: "t11s1", t: "t11", s: 1, name: "The Name-Tag Museum", focus: "Classification and dichotomous keys", scene: "library",
    special: "butterfly", specialName: "Specimen case", specialLine: "A butterfly in a glass case... its name tag is missing!",
    tint: "#E3D5B8", floor: "#BBA98A", dim: .6, code: "40316", item: "🏷️ Name-tag sticker",
    intro: [K("chiikawa", "cry", "So many creatures and no name tags... 😖"), K("hachiware", "normal", "Let's classify them! Kingdom, phylum, class... down to species."), K("usagi", "happy", "I'm Pyon usagi! WOO! 🐰")],
    notes: [
      "<b>Biodiversity</b> is the variety of living things. <b>Classification</b> groups organisms by shared features into a <b>hierarchy</b>: Domain → Kingdom → Phylum → Class → Order → Family → Genus → Species.",
      "A <b>species</b> is a group of organisms that can interbreed to produce <b>fertile</b> offspring.",
      "<b>Binomial nomenclature</b>: each species has a two-part Latin name, <i>Genus species</i> (e.g. <i>Homo sapiens</i>); the genus has a capital letter and the name is in italics (or underlined).",
      "<b>Three domains</b>: Bacteria, Archaea, Eukarya. <b>Five kingdoms</b>: Prokaryotae (Monera), Protoctista, Fungi, Plantae, Animalia.",
      "A <b>dichotomous key</b> uses pairs of contrasting statements to identify organisms step by step. Use features that are stable and easy to see."
    ],
    rules: ["Domain → Kingdom → Phylum → Class → Order → Family → Genus → Species", "Species = can interbreed → fertile offspring", "Binomial name: Genus (capital) species (lower case), italics"],
    terms: [["biodiversity", "the variety of living things"], ["classification", "sorting organisms into groups by shared features"], ["species", "organisms that can interbreed to give fertile offspring"], ["genus", "group of closely related species"], ["binomial nomenclature", "two-part scientific naming system"], ["dichotomous key", "identification key using pairs of choices"], ["kingdom", "a major group of organisms, e.g. Plantae"], ["domain", "the highest rank: Bacteria, Archaea or Eukarya"]] },
  { id: "t11s2", t: "t11", s: 2, name: "The Survival Island", focus: "Natural selection and evolution", scene: "garden",
    special: "globe", specialName: "Island globe", specialLine: "A little globe with islands... each island has different finches!",
    tint: "#B7D9A4", floor: "#8DB97A", dim: .6, code: "86251", item: "🏝️ Island sticker",
    intro: [K("chiikawa", "shock", "Some moths are dark, some are pale... the birds are eating the pale ones?! 😱"), K("hachiware", "normal", "That's natural selection! The best-suited survive and pass on their alleles."), K("usagi", "happy", "Survival of the... WAHOO-est! 🐰")],
    notes: [
      "<b>Evolution</b> is the change in the inherited features of a population over many generations.",
      "<b>Natural selection</b> (Darwin): (1) individuals show <b>variation</b>; (2) more offspring are produced than can survive, so there is <b>competition</b> (struggle for existence); (3) those with favourable features <b>survive and reproduce</b>; (4) they pass on the favourable <b>alleles</b>, which become more common.",
      "Examples: <b>antibiotic-resistant bacteria</b> (resistant mutants survive treatment); <b>peppered moths</b> (dark moths survived better on sooty trees).",
      "<b>Artificial selection</b>: humans choose which organisms breed, e.g. high-yield rice, dog breeds.",
      "Origin of life: early Earth conditions may have formed simple organic molecules; the first cells were prokaryotes. Theories are supported or changed by new evidence."
    ],
    rules: ["Variation → competition → survival of the fittest → reproduction → alleles passed on", "Environment selects; individuals do not choose to change", "Artificial selection: humans choose the breeders"],
    terms: [["evolution", "change in inherited features of a population over generations"], ["natural selection", "better-adapted individuals survive and reproduce more"], ["adaptation", "a feature that helps an organism survive in its environment"], ["competition", "struggle between organisms for limited resources"], ["antibiotic resistance", "bacteria no longer killed by an antibiotic"], ["artificial selection", "humans choosing which organisms breed"]] },
  { id: "t11s3", t: "t11", s: 3, name: "The Fossil Cave", focus: "Evidence for evolution and speciation", scene: "pond",
    special: "fossil", specialName: "Fossil rock", specialLine: "An ancient spiral shell is trapped in the rock... how old is it?",
    tint: "#8FA9B8", floor: "#6B8494", dim: .76, code: "27960", item: "🐚 Fossil sticker",
    intro: [K("rakko", "brave", "Boss stage. The rocks remember everything. Read their evidence. ⚔️"), K("chiikawa", "cry", "It's dark and ancient in here... uuu... 🥺"), K("kurimanju", "happy", "Old things... like good tea leaves... 🍵")],
    notes: [
      "<b>Fossils</b> are remains or traces of organisms preserved in rock. Deeper rock layers are usually older, so the <b>fossil record</b> shows how organisms changed over time.",
      "The fossil record is incomplete: soft-bodied organisms rarely fossilise, and many fossils are destroyed or undiscovered.",
      "<b>Comparative anatomy</b>: <b>homologous structures</b> (e.g. the pentadactyl limb in humans, bats, whales) have the same basic structure but different functions, suggesting a <b>common ancestor</b>.",
      "<b>Molecular evidence</b>: closely related species have more similar DNA and protein sequences.",
      "<b>Speciation</b>: when populations are <b>isolated</b> (e.g. by mountains or sea), different selection pressures and mutations make them change until they can no longer interbreed, forming new species."
    ],
    rules: ["Evidence: fossils · homologous structures · DNA/protein similarities", "Deeper layers → usually older fossils", "Isolation + different selection → new species (cannot interbreed)"],
    terms: [["fossil", "preserved remains or traces of an ancient organism"], ["fossil record", "the sequence of fossils in rock layers over time"], ["homologous structure", "same basic structure, different function, from a common ancestor"], ["common ancestor", "an ancient species from which others evolved"], ["speciation", "formation of a new species"], ["isolation", "separation of populations so they cannot interbreed"]] },

  /* ---------------- Life Processes in Plants ---------------- */
  { id: "t12s1", t: "t12", s: 1, name: "The Root Tunnel", focus: "Mineral nutrition and water uptake", scene: "garden",
    special: "plant", specialName: "Seedling pot", specialLine: "Tiny root hairs wiggle in the soil... they're drinking!",
    tint: "#C9B28F", floor: "#9C8565", dim: .62, code: "53748", item: "🌱 Root-hair sticker",
    intro: [K("chiikawa", "shock", "We're UNDER the ground?! It's all roots! 😱"), K("hachiware", "normal", "Roots take in water and minerals. Root hairs are the champions of absorption!"), K("usagi", "happy", "Dig dig dig! WOO! 🐰")],
    notes: [
      "Plants are <b>autotrophs</b>: they make organic food by photosynthesis, but need <b>mineral ions</b> from the soil.",
      "<b>Nitrate</b> → amino acids and proteins (lack: poor growth, yellow older leaves). <b>Magnesium</b> → chlorophyll (lack: yellowing between veins). Farmers add <b>fertilisers</b> (N, P, K).",
      "<b>Root hair cells</b> have a long, thin extension giving a large surface area, and a thin wall.",
      "Water enters root hairs by <b>osmosis</b> (soil water has a higher water potential than cell sap).",
      "Mineral ions are absorbed mainly by <b>active transport</b> (against the gradient, needs respiration), sometimes by diffusion.",
      "Water moves across the root cortex to the <b>xylem</b>, then up the stem. Gas exchange in roots is by diffusion from air spaces in the soil; waterlogged soil lacks O₂."
    ],
    rules: ["Water in by osmosis · ions in by active transport", "N → proteins · Mg → chlorophyll", "Root hairs: long, thin → large surface area"],
    terms: [["autotroph", "organism that makes its own organic food"], ["root hair cell", "root cell with a long extension for absorption"], ["fertiliser", "substance added to soil to supply mineral ions"], ["mineral ion", "inorganic ion needed by plants, e.g. nitrate"], ["cortex", "tissue between the root surface and the xylem"], ["waterlogged", "soil full of water, lacking air"]] },
  { id: "t12s2", t: "t12", s: 2, name: "The Transpiration Tower", focus: "Transpiration and water transport", scene: "greenhouse",
    special: "potometer", specialName: "Potometer", specialLine: "A leafy shoot in a glass tube... a tiny air bubble is moving!",
    tint: "#BFE3D0", floor: "#8DB9A2", dim: .6, code: "68092", item: "💦 Water-droplet sticker",
    intro: [K("chiikawa", "sparkle", "The water is climbing UP the stem all by itself?! ✨"), K("hachiware", "normal", "Transpiration pulls it! Water evaporates from leaves and the whole column moves up."), K("momonga", "happy", "Water flows towards me because I'm adorable. 💜")],
    notes: [
      "<b>Transpiration</b> is the loss of water vapour from the aerial parts of a plant, mainly through the <b>stomata</b>.",
      "Water evaporates from mesophyll cell surfaces into air spaces, then diffuses out through stomata.",
      "<b>Transpiration pull</b>: water lost from leaves pulls water up the <b>xylem</b> as a continuous column (water molecules stick together by cohesion).",
      "Xylem vessels are dead, hollow, lignified tubes with no end walls, good for carrying water and minerals.",
      "Rate of transpiration increases with: higher <b>light intensity</b> (stomata open), higher <b>temperature</b>, lower <b>humidity</b>, stronger <b>wind</b>.",
      "A <b>potometer</b> measures water <b>uptake</b> (about equal to water loss) by the movement of an air bubble. Transpiration also cools the plant and transports minerals."
    ],
    rules: ["Evaporation from leaves → transpiration pull → water up the xylem", "Faster: bright, warm, dry, windy", "Potometer measures water UPTAKE"],
    terms: [["transpiration", "loss of water vapour from a plant's leaves"], ["transpiration pull", "pulling of water up the xylem by water loss from leaves"], ["xylem vessel", "dead, hollow, lignified tube carrying water"], ["potometer", "apparatus that measures water uptake by a shoot"], ["humidity", "amount of water vapour in the air"], ["lignin", "hard substance that strengthens xylem walls"]] },
  { id: "t12s3", t: "t12", s: 3, name: "The Phloem Express", focus: "Translocation and support in plants", scene: "lab",
    special: "pump", specialName: "Sugar pump", specialLine: "Sweet sap rushes through a little pipe... up AND down!",
    tint: "#E0C8A8", floor: "#B8A080", dim: .74, code: "19436", item: "🍯 Sweet-sap sticker",
    intro: [K("rakko", "brave", "Boss stage. Water goes up; sugar goes where it's needed. Know your pipes. ⚔️"), K("chiikawa", "brave", "Xylem up... phloem both ways... I-I've got it! 💪"), K("usagi", "happy", "Sugar express! All aboard! 🐰🚂")],
    notes: [
      "<b>Translocation</b> is the transport of organic nutrients (mainly <b>sucrose</b>, also amino acids) in the <b>phloem</b>.",
      "Phloem carries food from <b>sources</b> (e.g. photosynthesising leaves) to <b>sinks</b> (e.g. roots, growing buds, fruits, storage organs), so it can move <b>up or down</b>.",
      "Phloem sieve tubes are living cells with sieve plates. Xylem is dead and carries water and minerals <b>upwards</b> only.",
      "Evidence: <b>ringing</b> a stem (removing the bark and phloem) makes the bark above swell with sugar; <b>aphids'</b> mouthparts feed from phloem sap.",
      "<b>Support</b> in plants: <b>turgid</b> cells support soft (herbaceous) stems and leaves; <b>lignified xylem</b> (wood) supports woody plants."
    ],
    rules: ["Phloem: sucrose, source → sink, both directions, living", "Xylem: water + minerals, upwards, dead + lignified", "Support: turgidity (soft stems) · lignified xylem (woody stems)"],
    terms: [["translocation", "transport of sucrose and amino acids in the phloem"], ["phloem", "living tissue that carries organic food"], ["sieve tube", "phloem cell with perforated end walls"], ["source", "part of a plant that makes or releases sugar"], ["sink", "part of a plant that uses or stores sugar"], ["ringing experiment", "removing a ring of bark to show phloem transport"]] },

  /* ---------------- Gas Exchange in Humans ---------------- */
  { id: "t13s1", t: "t13", s: 1, name: "The Airway Adventure", focus: "The breathing system and alveoli", scene: "cellworld",
    special: "lungs", specialName: "Balloon lungs", specialLine: "Two pink balloon lungs puff in and out... there's a note in the bronchus!",
    tint: "#F5C6D6", floor: "#CD98AA", dim: .6, code: "84513", item: "🫁 Tiny-lungs sticker",
    intro: [K("chiikawa", "shock", "We got breathed in?! Down the windpipe?! 😱"), K("hachiware", "happy", "Follow the air: nose → trachea → bronchi → bronchioles → alveoli!"), K("usagi", "happy", "Wheee~! Slide down the trachea! 🐰")],
    notes: [
      "Air path: <b>nasal cavity</b> → pharynx → larynx → <b>trachea</b> → <b>bronchi</b> → <b>bronchioles</b> → <b>alveoli</b>.",
      "The nasal cavity warms, moistens and filters air. <b>Mucus</b> traps dust and germs; <b>cilia</b> sweep mucus up to the throat.",
      "C-shaped <b>cartilage</b> rings keep the trachea open.",
      "<b>Alveoli</b> are adapted for gas exchange: huge total <b>surface area</b>; walls <b>one cell thick</b> (short diffusion distance); <b>moist</b> lining (gases dissolve); dense <b>capillary network</b> (steep concentration gradient).",
      "O₂ diffuses from alveolar air into the blood; CO₂ diffuses from the blood into the alveoli."
    ],
    rules: ["Nose → trachea → bronchi → bronchioles → alveoli", "Alveoli: large area · thin · moist · rich blood supply", "O₂: alveoli → blood · CO₂: blood → alveoli"],
    terms: [["trachea", "windpipe supported by cartilage rings"], ["bronchus", "one of two tubes branching from the trachea (plural: bronchi)"], ["bronchiole", "small airway leading to the alveoli"], ["alveolus", "tiny air sac where gas exchange happens (plural: alveoli)"], ["cilia", "tiny hairs that sweep mucus"], ["mucus", "sticky liquid that traps dust and germs"], ["cartilage", "firm tissue that keeps the trachea open"]] },
  { id: "t13s2", t: "t13", s: 2, name: "The Breathing Bellows", focus: "Ventilation: how we breathe", scene: "clinic",
    special: "belljar", specialName: "Bell-jar model", specialLine: "Pull the rubber sheet down and the balloons inflate... magic?",
    tint: "#C7D3F2", floor: "#98A6CC", dim: .62, code: "30687", item: "🎈 Balloon-lung sticker",
    intro: [K("chiikawa", "normal", "Huff... puff... how do our lungs actually fill up? 🤔"), K("hachiware", "normal", "Muscles change the volume of the chest, and air flows in or out because of pressure."), K("kurimanju", "happy", "Deep breaths... like smelling tea... 🍵")],
    notes: [
      "<b>Inhalation</b>: external intercostal muscles <b>contract</b> → ribcage moves <b>up and out</b>; diaphragm muscles <b>contract</b> → diaphragm <b>flattens</b>; chest volume <b>increases</b> → pressure <b>decreases</b> below atmospheric → air flows <b>in</b>.",
      "<b>Exhalation</b> (at rest): external intercostal muscles and diaphragm <b>relax</b>; ribcage moves down and in; diaphragm domes up; volume decreases → pressure increases → air flows <b>out</b>. Internal intercostal muscles help in forced exhalation.",
      "The <b>bell-jar model</b>: pulling the rubber sheet (diaphragm) down increases volume, so the balloons (lungs) inflate. It can't show ribcage movement.",
      "A <b>spirometer</b> trace shows <b>tidal volume</b> (volume of a normal breath) and <b>vital capacity</b> (maximum volume breathed out after a deepest breath in).",
      "During exercise, breathing rate and depth increase to supply more O₂ and remove more CO₂."
    ],
    rules: ["Inhale: muscles contract → volume ↑ → pressure ↓ → air in", "Exhale: muscles relax → volume ↓ → pressure ↑ → air out", "Air moves from high to low pressure"],
    terms: [["ventilation", "breathing: moving air in and out of the lungs"], ["intercostal muscles", "muscles between the ribs"], ["diaphragm", "dome-shaped muscle sheet below the lungs"], ["inhalation", "breathing in"], ["exhalation", "breathing out"], ["tidal volume", "volume of air in one normal breath"], ["vital capacity", "maximum volume of air breathed out after a deepest breath"], ["spirometer", "apparatus that measures breathing volumes"]] },
  { id: "t13s3", t: "t13", s: 3, name: "The Smoky Alley", focus: "Air composition, smoking and lung health", scene: "lab",
    special: "limewater", specialName: "Breath flask", specialLine: "Breathe through the tube... the limewater goes cloudy!",
    tint: "#B8B2A6", floor: "#8C877C", dim: .76, code: "57219", item: "🚭 Clean-air sticker",
    intro: [K("rakko", "brave", "Boss stage. Smoke is an enemy you can't cut with a sword. Know how it harms. ⚔️"), K("chiikawa", "cry", "Cough cough... the air is so smoky... 😖"), K("hachiware", "happy", "Let's clear the air with science! ✨")],
    notes: [
      "Inhaled vs exhaled air: O₂ about <b>21% → 16%</b>; CO₂ about <b>0.04% → 4%</b>; exhaled air is also <b>warmer</b> and <b>saturated with water vapour</b>. Nitrogen stays about 78%.",
      "<b>Limewater</b> turns milky faster with exhaled air, showing it has more CO₂.",
      "<b>Tar</b> in tobacco smoke paralyses cilia and contains <b>carcinogens</b> (cause lung cancer); mucus builds up → smoker's cough, <b>chronic bronchitis</b>.",
      "<b>Emphysema</b>: alveolar walls break down → smaller surface area → breathlessness.",
      "<b>Nicotine</b> is addictive and raises heart rate and blood pressure. <b>Carbon monoxide</b> binds to haemoglobin, reducing O₂ transport.",
      "Air pollutants (e.g. suspended particulates, sulphur dioxide) also irritate airways and worsen asthma."
    ],
    rules: ["Exhaled air: less O₂, more CO₂, warmer, more water vapour", "Tar → cancer, paralysed cilia · CO → less O₂ carried · nicotine → addiction", "Emphysema → smaller alveolar surface area"],
    terms: [["tar", "sticky substance in smoke containing carcinogens"], ["carcinogen", "substance that can cause cancer"], ["nicotine", "addictive drug in tobacco"], ["carbon monoxide", "gas that binds to haemoglobin and reduces O₂ transport"], ["emphysema", "disease in which alveolar walls break down"], ["bronchitis", "inflammation of the bronchi with excess mucus"]] },

  /* ---------------- Transport in Humans ---------------- */
  { id: "t14s1", t: "t14", s: 1, name: "The Blood Bank", focus: "Blood and blood vessels", scene: "clinic",
    special: "bloodbag", specialName: "Blood bag", specialLine: "A red blood bag hangs on a stand... it's full of cells and plasma!",
    tint: "#F2C4C4", floor: "#C99A9A", dim: .6, code: "43851", item: "🩸 Blood-drop sticker",
    intro: [K("chiikawa", "shock", "Is that... BLOOD?! 😱🩸"), K("hachiware", "normal", "Don't faint! Blood is a busy delivery system with plasma, red cells, white cells and platelets."), K("momonga", "happy", "My blood type is 'cute'. 💜")],
    notes: [
      "<b>Plasma</b> (mostly water) carries dissolved glucose, amino acids, CO₂, urea, hormones and heat.",
      "<b>Red blood cells</b>: contain <b>haemoglobin</b> (carries O₂ as oxyhaemoglobin); biconcave disc (large surface area); <b>no nucleus</b> (more room for haemoglobin).",
      "<b>White blood cells</b> defend the body: <b>phagocytes</b> engulf germs; <b>lymphocytes</b> make antibodies. <b>Platelets</b> help <b>blood clotting</b>.",
      "<b>Arteries</b> carry blood <b>away</b> from the heart at high pressure: thick, muscular, elastic walls, small lumen.",
      "<b>Veins</b> carry blood <b>to</b> the heart at low pressure: thin walls, large lumen, <b>valves</b> stop backflow.",
      "<b>Capillaries</b>: walls <b>one cell thick</b>, very narrow; exchange substances with body cells."
    ],
    rules: ["Artery: away, thick elastic wall, high pressure", "Vein: to heart, thin wall, valves, low pressure", "Capillary: one cell thick → exchange"],
    terms: [["plasma", "liquid part of blood"], ["red blood cell", "cell with haemoglobin that carries oxygen"], ["white blood cell", "cell that defends the body against pathogens"], ["platelet", "cell fragment that helps blood clot"], ["artery", "vessel carrying blood away from the heart"], ["vein", "vessel carrying blood back to the heart"], ["capillary", "tiny vessel with walls one cell thick"], ["lumen", "the space inside a blood vessel"]] },
  { id: "t14s2", t: "t14", s: 2, name: "The Heart Pump House", focus: "The heart and double circulation", scene: "cellworld",
    special: "heart", specialName: "Beating heart", specialLine: "Ba-dum! Ba-dum! A giant heart beats... one chamber holds a riddle.",
    tint: "#F7B7C0", floor: "#CE8C96", dim: .62, code: "91672", item: "❤️ Heartbeat sticker",
    intro: [K("chiikawa", "sparkle", "Ba-dum... ba-dum... it's like a drum! 🥁✨"), K("hachiware", "normal", "The heart is two pumps side by side: right side to the lungs, left side to the body."), K("usagi", "happy", "Ba-dum ba-dum WAHOO! 🐰")],
    notes: [
      "The heart has four chambers: <b>right atrium</b>, <b>right ventricle</b>, <b>left atrium</b>, <b>left ventricle</b>. Atria receive blood; ventricles pump it out.",
      "<b>Double circulation</b>: <b>pulmonary</b> circulation (heart → lungs → heart) and <b>systemic</b> circulation (heart → body → heart). Blood passes through the heart twice per round.",
      "Right side: deoxygenated blood from the <b>vena cava</b> → right atrium → right ventricle → <b>pulmonary artery</b> → lungs.",
      "Left side: oxygenated blood from the <b>pulmonary vein</b> → left atrium → left ventricle → <b>aorta</b> → body.",
      "The <b>left ventricle</b> wall is thickest: it pumps blood all round the body at high pressure.",
      "<b>Valves</b> (bicuspid, tricuspid, semilunar) prevent backflow. The <b>septum</b> separates oxygenated and deoxygenated blood. <b>Coronary arteries</b> supply the heart muscle."
    ],
    rules: ["Body → vena cava → RA → RV → pulmonary artery → lungs", "Lungs → pulmonary vein → LA → LV → aorta → body", "Left ventricle wall thickest · valves stop backflow"],
    terms: [["atrium", "upper chamber of the heart that receives blood (plural: atria)"], ["ventricle", "lower chamber of the heart that pumps blood out"], ["aorta", "largest artery, carrying blood from the left ventricle"], ["vena cava", "large vein bringing blood back to the right atrium"], ["pulmonary artery", "carries deoxygenated blood to the lungs"], ["pulmonary vein", "carries oxygenated blood from the lungs"], ["double circulation", "blood passes through the heart twice per circuit"], ["septum", "wall dividing the left and right sides of the heart"], ["coronary artery", "artery supplying blood to the heart muscle"]] },
  { id: "t14s3", t: "t14", s: 3, name: "The Capillary Maze", focus: "Tissue fluid, lymph and heart health", scene: "pond",
    special: "villi", specialName: "Capillary bed", specialLine: "Tiny tubes leak a clear fluid around the cells... where does it go?",
    tint: "#A9C8E8", floor: "#7F9FC0", dim: .76, code: "26348", item: "💧 Tissue-fluid sticker",
    intro: [K("rakko", "brave", "Boss stage. Blood never touches the cells directly. Explain how they are fed. ⚔️"), K("chiikawa", "cry", "Everything is leaking... uuu... 🥺"), K("hachiware", "happy", "It's supposed to leak! That's tissue fluid. It'll work out~! ✨")],
    notes: [
      "At the <b>arterial end</b> of a capillary, high blood pressure forces plasma (without red cells or large proteins) out to form <b>tissue fluid</b>.",
      "Tissue fluid bathes cells: O₂ and nutrients diffuse into cells; CO₂ and wastes diffuse out.",
      "At the <b>venous end</b>, most tissue fluid returns to the capillaries (pressure is lower). The rest drains into <b>lymph vessels</b> as <b>lymph</b>, which returns to the blood near the heart.",
      "<b>Lymph nodes</b> contain lymphocytes and filter germs. The lymphatic system also carries fats from the lacteals.",
      "<b>Coronary heart disease</b>: fatty deposits (<b>atherosclerosis</b>) narrow coronary arteries, which can cause a <b>heart attack</b>. Risk factors: smoking, high-fat diet, lack of exercise, high blood pressure, obesity.",
      "Regular exercise strengthens the heart, raising stroke volume and lowering resting heart rate."
    ],
    rules: ["Arterial end: pressure pushes fluid out · venous end: most returns", "Excess tissue fluid → lymph → back to blood", "Fatty deposits in coronary arteries → heart attack"],
    terms: [["tissue fluid", "fluid that bathes body cells, formed from plasma"], ["lymph", "tissue fluid inside lymph vessels"], ["lymph node", "swelling in lymph vessels that filters germs"], ["atherosclerosis", "build-up of fatty deposits in arteries"], ["heart attack", "death of heart muscle when its blood supply is blocked"], ["blood pressure", "force of blood on vessel walls"]] },

  /* ---------------- Reproduction, Growth and Development ---------------- */
  { id: "t15s1", t: "t15", s: 1, name: "The Flower Garden", focus: "Reproduction in flowering plants", scene: "greenhouse",
    special: "flower", specialName: "Giant flower", specialLine: "A giant flower sways... a bee has left a pollen-covered note!",
    tint: "#F5D0E0", floor: "#C9A6B8", dim: .56, code: "75034", item: "🌸 Petal sticker",
    intro: [K("chiikawa", "sparkle", "Flowers everywhere! It smells so sweet! 🌸✨"), K("hachiware", "normal", "Flowers are for reproduction! Pollen goes from anther to stigma. Let's follow its journey."), K("usagi", "happy", "Bzzz! I'm a bee! WOO! 🐝🐰")],
    notes: [
      "Flower parts: <b>sepals</b> (protect bud), <b>petals</b> (attract insects), <b>stamens</b> = <b>anther</b> (makes pollen) + filament; <b>carpel</b> = <b>stigma</b> (receives pollen) + style + <b>ovary</b> (contains ovules).",
      "<b>Pollination</b>: transfer of pollen from anther to stigma. <b>Insect-pollinated</b> flowers: bright petals, scent, nectar, sticky pollen, stigma inside. <b>Wind-pollinated</b>: small dull petals, feathery stigmas outside, huge amounts of light, smooth pollen.",
      "<b>Fertilisation</b>: a <b>pollen tube</b> grows down the style; the male gamete fuses with the female gamete in the ovule.",
      "After fertilisation: ovule → <b>seed</b>; ovary → <b>fruit</b>. Seeds and fruits are <b>dispersed</b> by wind, animals, water or explosion, reducing competition.",
      "<b>Germination</b> needs <b>water</b>, <b>oxygen</b> and a <b>suitable temperature</b> (not light).",
      "<b>Asexual reproduction</b> (vegetative propagation, e.g. cuttings, bulbs, runners) makes genetically identical offspring quickly."
    ],
    rules: ["Anther → pollen · stigma receives pollen · ovary → fruit · ovule → seed", "Pollination ≠ fertilisation", "Germination needs water + O₂ + suitable temperature"],
    terms: [["anther", "part of the stamen that makes pollen"], ["stigma", "sticky tip of the carpel that receives pollen"], ["ovary", "part of the carpel containing ovules; becomes the fruit"], ["ovule", "structure containing the female gamete; becomes the seed"], ["pollination", "transfer of pollen from anther to stigma"], ["pollen tube", "tube that carries the male gamete to the ovule"], ["germination", "the start of growth of a seed"], ["dispersal", "spreading of seeds away from the parent plant"]] },
  { id: "t15s2", t: "t15", s: 2, name: "The Baby Clinic", focus: "Human reproduction", scene: "clinic",
    special: "egg", specialName: "Zygote lamp", specialLine: "A glowing round lamp... it's shaped like a fertilised egg cell!",
    tint: "#FFD6DF", floor: "#D4A6B0", dim: .58, code: "48560", item: "👶 Baby-footprint sticker",
    intro: [K("chiikawa", "shock", "B-babies come from ONE tiny cell?! 😳"), K("hachiware", "normal", "Yes! A sperm fertilises an egg to form a zygote, which grows by mitosis."), K("momonga", "sparkle", "I was the cutest zygote ever. 💜")],
    notes: [
      "Male: <b>testes</b> make sperm and testosterone; <b>sperm duct</b> carries sperm; <b>seminal vesicle</b> and <b>prostate gland</b> add fluid; urethra.",
      "Female: <b>ovaries</b> release eggs (ovulation); <b>oviduct</b> (site of fertilisation); <b>uterus</b> (fetus develops); <b>cervix</b>; vagina.",
      "<b>Menstrual cycle</b> (about 28 days): menstruation (days 1–5), uterine lining thickens, <b>ovulation</b> around day 14, then the lining is kept if an embryo implants.",
      "<b>Fertilisation</b> in the oviduct forms a <b>zygote</b>, which divides into an embryo and <b>implants</b> in the uterine lining.",
      "The <b>placenta</b> exchanges substances between mother and fetus (O₂, nutrients in; CO₂, urea out) without mixing blood. The <b>umbilical cord</b> links the fetus to the placenta; <b>amniotic fluid</b> protects it.",
      "<b>Birth control</b>: barrier (condom, prevents sperm meeting egg; also reduces STIs), hormonal (pill, stops ovulation), IUD, sterilisation (vasectomy, tubal ligation)."
    ],
    rules: ["Fertilisation in the oviduct → zygote → implantation in the uterus", "Ovulation ≈ day 14 of a 28-day cycle", "Placenta: exchange without mixing blood"],
    terms: [["testis", "male organ that makes sperm (plural: testes)"], ["ovary", "female organ that releases eggs"], ["oviduct", "tube where fertilisation happens"], ["uterus", "organ where the fetus develops"], ["ovulation", "release of an egg from the ovary"], ["implantation", "embryo embedding in the uterine lining"], ["placenta", "organ for exchange between mother and fetus"], ["menstruation", "shedding of the uterine lining"]] },
  { id: "t15s3", t: "t15", s: 3, name: "The Growth Chart Tower", focus: "Growth and development", scene: "library",
    special: "heightchart", specialName: "Growth chart", specialLine: "Pencil lines on the wall mark how tall everyone grew each year!",
    tint: "#DCE8B4", floor: "#B3C286", dim: .74, code: "12987", item: "📈 Growth-curve sticker",
    intro: [K("rakko", "brave", "Boss stage. Growth isn't just getting taller. Measure it properly. ⚔️"), K("chiikawa", "brave", "I'll grow big and strong... one question at a time! 💪"), K("usagi", "happy", "Grow grow grow! WAHOO! 🐰")],
    notes: [
      "<b>Growth</b> is a permanent increase in size or <b>dry mass</b>, due to cell division, cell enlargement and cell differentiation. <b>Development</b> is the change in form and function (e.g. specialised cells).",
      "Ways to measure growth: height/length, fresh mass, <b>dry mass</b> (most reliable: removes changes in water content, but kills the organism), cell number.",
      "Human growth curve: fast in infancy, steady in childhood, a <b>growth spurt</b> at puberty (earlier in girls), then stops in adulthood.",
      "Germinating seeds: <b>dry mass decreases</b> at first (stored food is used in respiration) until leaves photosynthesise, then it increases.",
      "Plant growth happens mainly at <b>meristems</b> (root and shoot tips). Growth needs food, and is affected by hormones and the environment.",
      "<b>Metamorphosis</b> (e.g. butterfly: egg → larva → pupa → adult) is a type of development with big changes in form."
    ],
    rules: ["Growth = permanent increase in size / dry mass", "Dry mass is most reliable (water content varies)", "Seed germination: dry mass falls, then rises once photosynthesis starts"],
    terms: [["growth", "permanent increase in size or dry mass"], ["development", "changes in form and function as an organism matures"], ["dry mass", "mass after all water is removed"], ["differentiation", "cells becoming specialised"], ["meristem", "region of cell division in plants"], ["growth spurt", "rapid growth at puberty"], ["metamorphosis", "big change in body form during development"]] },

  /* ---------------- Coordination and Response ---------------- */
  { id: "t16s1", t: "t16", s: 1, name: "The Eye and Ear Studio", focus: "Stimuli, receptors, the eye and the ear", scene: "library",
    special: "eye", specialName: "Giant eyeball", specialLine: "A giant eyeball blinks at you... its pupil is getting smaller!",
    tint: "#C8D8F0", floor: "#9DAFCB", dim: .6, code: "65821", item: "👁️ Sharp-eye sticker",
    intro: [K("chiikawa", "shock", "The eyeball is LOOKING at me! 👁️😱"), K("hachiware", "normal", "It's a model of the eye! Receptors turn stimuli like light and sound into nerve impulses."), K("usagi", "happy", "I can hear EVERYTHING with these ears! WOO! 🐰")],
    notes: [
      "A <b>stimulus</b> is a change in the environment. <b>Receptors</b> detect stimuli and produce nerve impulses; <b>effectors</b> (muscles, glands) respond.",
      "The eye: <b>cornea</b> (refracts light most) · <b>iris</b> (controls pupil size) · <b>lens</b> (fine focusing) · <b>retina</b> (rods and cones) · <b>optic nerve</b> · <b>blind spot</b> (no receptors).",
      "<b>Rods</b>: sensitive to dim light, black-and-white vision. <b>Cones</b>: colour vision in bright light; most at the <b>fovea</b> (yellow spot).",
      "<b>Pupil reflex</b>: in bright light, circular muscles of the iris contract → pupil constricts (less light enters, protects retina).",
      "<b>Accommodation</b>: near object → ciliary muscles contract, suspensory ligaments slacken, lens becomes <b>thicker/rounder</b>. Distant object → ciliary muscles relax, ligaments tighten, lens <b>thinner</b>.",
      "The ear: <b>ear drum</b> vibrates → <b>ear ossicles</b> amplify → <b>cochlea</b> (receptor cells) → auditory nerve. <b>Semicircular canals</b> detect head movement (balance)."
    ],
    rules: ["Stimulus → receptor → nerve → brain/spinal cord → effector → response", "Bright light: circular muscles contract → pupil smaller", "Near object: ciliary muscles contract → lens thicker"],
    terms: [["stimulus", "a change in the environment that is detected"], ["receptor", "cell or organ that detects a stimulus"], ["effector", "muscle or gland that carries out a response"], ["retina", "light-sensitive layer with rods and cones"], ["accommodation", "changing the lens shape to focus"], ["ciliary muscle", "muscle that changes the shape of the lens"], ["cochlea", "coiled part of the inner ear with sound receptors"], ["pupil", "hole in the iris that lets light in"]] },
  { id: "t16s2", t: "t16", s: 2, name: "The Nerve Network", focus: "The nervous system and reflexes", scene: "cellworld",
    special: "brain", specialName: "Brain dome", specialLine: "A wrinkly pink brain glows under a glass dome... it's thinking!",
    tint: "#E3C9EE", floor: "#B89AC3", dim: .62, code: "80375", item: "⚡ Nerve-spark sticker",
    intro: [K("chiikawa", "shock", "OUCH! I touched something hot and my hand jumped away before I thought! 😱🔥"), K("hachiware", "normal", "That was a reflex! The impulse went through your spinal cord, not your thinking brain."), K("kurimanju", "happy", "Hot tea... also causes reflexes... *careful sip* 🍵")],
    notes: [
      "The <b>central nervous system</b> (CNS) = brain + spinal cord. The <b>peripheral nervous system</b> = nerves.",
      "Neurones: <b>sensory neurone</b> (receptor → CNS), <b>interneurone</b> (relay, in the CNS), <b>motor neurone</b> (CNS → effector). The <b>myelin sheath</b> speeds up impulses.",
      "A <b>synapse</b> is a gap between neurones: impulses cross by <b>neurotransmitters</b> diffusing across, so impulses travel <b>one way</b>.",
      "<b>Reflex arc</b>: receptor → sensory neurone → interneurone (spinal cord) → motor neurone → effector. Reflexes are rapid, automatic and protective (e.g. knee jerk, withdrawal).",
      "Brain: <b>cerebrum</b> (thinking, memory, voluntary actions, senses) · <b>cerebellum</b> (balance, coordination of movement) · <b>medulla oblongata</b> (heart rate, breathing rate).",
      "Voluntary actions are conscious and controlled by the cerebrum; reflex actions are involuntary."
    ],
    rules: ["Receptor → sensory → interneurone → motor → effector", "Synapse: chemical transmission, one direction", "Cerebrum: thinking · cerebellum: balance · medulla: heart & breathing"],
    terms: [["neurone", "nerve cell that carries impulses"], ["sensory neurone", "carries impulses from receptors to the CNS"], ["motor neurone", "carries impulses from the CNS to effectors"], ["interneurone", "relay neurone inside the CNS"], ["synapse", "junction between two neurones"], ["reflex arc", "pathway of a reflex action"], ["cerebellum", "part of the brain for balance and coordination"], ["medulla oblongata", "part of the brain controlling heart and breathing rates"]] },
  { id: "t16s3", t: "t16", s: 3, name: "The Hormone Post Office", focus: "Hormones and plant responses", scene: "greenhouse",
    special: "sun", specialName: "One-sided lamp", specialLine: "A lamp shines from one side... the seedlings are all bending towards it!",
    tint: "#F7E3A1", floor: "#CDB873", dim: .6, code: "37916", item: "📮 Hormone-letter sticker",
    intro: [K("chiikawa", "normal", "The seedlings are leaning over... are they tired? 🌱"), K("hachiware", "happy", "No! They're growing towards light. Plant hormones called auxins control it."), K("usagi", "happy", "Hormone mail delivery! WOO! 📮🐰")],
    notes: [
      "<b>Hormones</b> are chemicals made by <b>endocrine glands</b>, carried in the <b>blood</b> to target organs. Effects are slower and longer-lasting than nerve impulses.",
      "Examples: <b>insulin</b> and <b>glucagon</b> (pancreas) · <b>adrenaline</b> (adrenal glands: fight or flight) · <b>growth hormone</b> (pituitary) · <b>oestrogen</b>, <b>progesterone</b>, <b>testosterone</b> (sex hormones).",
      "Nervous vs hormonal: nerve impulses are electrical, fast, short-lived and precise; hormones are chemical, slower, longer-lasting and widespread.",
      "Plant responses are <b>tropisms</b>: growth responses to a directional stimulus. <b>Phototropism</b>: shoots grow towards light. <b>Gravitropism</b>: roots grow down.",
      "<b>Auxin</b> made at the shoot tip moves to the <b>shaded side</b>, making cells there elongate more, so the shoot bends towards light.",
      "Experiments: removing the tip or covering it with foil stops bending, showing the tip detects light and produces auxin."
    ],
    rules: ["Hormones: chemical, in blood, slower, longer-lasting", "Auxin collects on the shaded side → more elongation → bends towards light", "Tip removed or covered → no bending"],
    terms: [["hormone", "chemical messenger carried in the blood"], ["endocrine gland", "ductless gland that secretes hormones into blood"], ["target organ", "organ that responds to a hormone"], ["adrenaline", "hormone for the fight-or-flight response"], ["tropism", "directional growth response of a plant"], ["phototropism", "growth response towards light"], ["auxin", "plant hormone that causes cell elongation"]] },
  { id: "t16s4", t: "t16", s: 4, name: "The Dance Studio", focus: "Movement: bones, joints and muscles", scene: "kitchen",
    special: "bone", specialName: "Skeleton arm", specialLine: "A model arm bends at the elbow... the muscles take turns pulling!",
    tint: "#E8D5F0", floor: "#BFA9CC", dim: .76, code: "59240", item: "💃 Dance-move sticker",
    intro: [K("rakko", "brave", "Boss stage. Every sword swing needs muscles working in pairs. Show me. ⚔️"), K("chiikawa", "brave", "Biceps... triceps... I'll flex my brain! 💪"), K("usagi", "happy", "DANCE! WOO! WOOOO! 🐰💃")],
    notes: [
      "The <b>skeleton</b> supports the body, protects organs, allows movement, and makes blood cells in bone marrow.",
      "A <b>synovial joint</b> (e.g. elbow = hinge joint; hip/shoulder = ball-and-socket joint) has <b>cartilage</b> (reduces friction, absorbs shock), <b>synovial fluid</b> (lubricates) and <b>ligaments</b> (join bone to bone).",
      "<b>Tendons</b> join muscle to bone; they are inelastic so muscle pull moves the bone.",
      "Muscles can only <b>contract</b> (pull), not push, so they work in <b>antagonistic pairs</b>.",
      "Bending the arm: <b>biceps contracts</b>, triceps relaxes. Straightening: <b>triceps contracts</b>, biceps relaxes.",
      "Muscle contraction needs <b>ATP</b> from respiration, and is triggered by motor neurones. Exercise and a balanced diet keep bones and muscles healthy."
    ],
    rules: ["Ligament: bone–bone · tendon: muscle–bone", "Muscles only pull → antagonistic pairs", "Bend elbow: biceps contracts · straighten: triceps contracts"],
    terms: [["synovial joint", "freely movable joint with fluid-filled cavity"], ["ligament", "tissue joining bone to bone"], ["tendon", "inelastic tissue joining muscle to bone"], ["antagonistic muscles", "a pair of muscles producing opposite movements"], ["biceps", "muscle that bends the arm at the elbow"], ["triceps", "muscle that straightens the arm"], ["synovial fluid", "liquid that lubricates a joint"], ["hinge joint", "joint allowing movement in one plane, e.g. elbow"]] },

  /* ---------------- Homeostasis ---------------- */
  { id: "t17s1", t: "t17", s: 1, name: "The Sugar Balance Bakery", focus: "Negative feedback and blood glucose", scene: "kitchen",
    special: "scale", specialName: "Sugar scale", specialLine: "A balance scale tips when sugar is added... then slowly levels again!",
    tint: "#F3D9B0", floor: "#CBA67B", dim: .6, code: "84103", item: "⚖️ Balance sticker",
    intro: [K("chiikawa", "sparkle", "Cakes! Sweets! Blood sugar go UP! 🍰✨"), K("hachiware", "normal", "Then insulin brings it back down! Homeostasis keeps our inside world steady."), K("usagi", "shock", "Haa?! My sugar is going up and down like a see-saw?! 🐰")],
    notes: [
      "<b>Homeostasis</b> is keeping the <b>internal environment</b> (e.g. blood glucose, temperature, water, gas levels) fairly constant.",
      "<b>Negative feedback</b>: a change from the <b>set point</b> is detected by receptors → a control centre → effectors bring the level <b>back</b> towards normal.",
      "Blood glucose too <b>high</b> (after a meal): the <b>pancreas</b> secretes <b>insulin</b> → liver and muscle cells take up glucose and convert it to <b>glycogen</b>; cells respire more glucose → level falls.",
      "Blood glucose too <b>low</b> (e.g. fasting, exercise): pancreas secretes <b>glucagon</b> → liver converts glycogen to glucose → level rises.",
      "<b>Diabetes mellitus</b>: the body makes too little insulin (type 1) or cells respond poorly (type 2). Glucose may appear in urine. Treatment: insulin injections, diet control, exercise."
    ],
    rules: ["Change detected → corrective response → back to normal (negative feedback)", "High glucose → insulin → glucose → glycogen", "Low glucose → glucagon → glycogen → glucose"],
    terms: [["homeostasis", "keeping the internal environment constant"], ["negative feedback", "a change triggers a response that reverses it"], ["set point", "the normal value that is maintained"], ["insulin", "hormone that lowers blood glucose"], ["glucagon", "hormone that raises blood glucose"], ["pancreas", "organ that secretes insulin and glucagon"], ["diabetes", "condition in which blood glucose is not controlled well"]] },
  { id: "t17s2", t: "t17", s: 2, name: "The Mountain Breath Camp", focus: "Regulating blood gases (breathing rate)", scene: "garden",
    special: "lungs", specialName: "Breathing balloon", specialLine: "Up on the mountain the balloon puffs faster and faster... why?",
    tint: "#BFD8EE", floor: "#93B3CF", dim: .76, code: "20658", item: "⛰️ Mountain sticker",
    intro: [K("rakko", "brave", "Final homeostasis boss. When you run, your breathing changes without asking you. Explain it. ⚔️"), K("chiikawa", "cry", "Huff... huff... I'm so out of breath... 🥺"), K("hachiware", "happy", "Your medulla is on it! It'll work out~! ✨")],
    notes: [
      "During exercise, respiration increases → more <b>CO₂</b> in the blood → blood becomes more acidic.",
      "<b>Chemoreceptors</b> (in the medulla and in the aorta and carotid arteries) detect the rise in CO₂.",
      "The <b>breathing centre</b> in the <b>medulla oblongata</b> sends more impulses to the intercostal muscles and diaphragm → breathing becomes <b>faster and deeper</b> → more CO₂ removed and more O₂ taken in.",
      "When CO₂ returns to normal, breathing rate falls again: <b>negative feedback</b>. The level of <b>CO₂</b> (not O₂) is the main stimulus.",
      "The heart rate also rises (controlled by the medulla), so more O₂ and glucose reach muscles. Holding your breath raises CO₂, which forces you to breathe again."
    ],
    rules: ["Exercise → CO₂ ↑ → chemoreceptors → medulla → faster, deeper breathing", "CO₂ back to normal → breathing slows (negative feedback)", "CO₂ is the main stimulus for breathing"],
    terms: [["chemoreceptor", "receptor that detects chemical changes, e.g. CO₂"], ["breathing centre", "region of the medulla controlling breathing"], ["breathing rate", "number of breaths per minute"], ["carbon dioxide", "waste gas of respiration; main stimulus for breathing"], ["carotid artery", "artery in the neck containing chemoreceptors"]] },

  /* ---------------- Ecosystems ---------------- */
  { id: "t18s1", t: "t18", s: 1, name: "The Pond Community", focus: "Ecosystem organisation and interactions", scene: "pond",
    special: "pondweed", specialName: "Pond tank", specialLine: "Fish, snails and pondweed all live together in this little world!",
    tint: "#9CC7E8", floor: "#6F93B3", dim: .58, code: "46829", item: "🐟 Pond-pal sticker",
    intro: [K("chiikawa", "happy", "So many pond friends! Hello, little snail! 🐌"), K("hachiware", "normal", "A pond is an ecosystem: living things and their surroundings all interacting."), K("momonga", "sparkle", "I'd be the star of any community. 💜")],
    notes: [
      "Levels: <b>organism</b> → <b>population</b> (one species in an area) → <b>community</b> (all populations) → <b>ecosystem</b> (community + physical environment).",
      "A <b>habitat</b> is where an organism lives; its <b>niche</b> is its role (what it eats, when it's active, etc.).",
      "<b>Abiotic factors</b>: non-living, e.g. light, temperature, water, pH, oxygen, soil. <b>Biotic factors</b>: living, e.g. predators, competitors, food.",
      "<b>Predation</b> (predator eats prey; populations cycle) · <b>Competition</b> (for food, space, light, mates) · <b>Parasitism</b> (parasite benefits, host harmed, e.g. tapeworm) · <b>Mutualism</b> (both benefit, e.g. root-nodule bacteria and legumes) · <b>Commensalism</b> (one benefits, the other unaffected).",
      "Organisms show <b>adaptations</b> to their habitat, e.g. streamlined fish, camouflage."
    ],
    rules: ["Population → community → ecosystem (+ abiotic environment)", "Abiotic = non-living · biotic = living", "Predation · competition · parasitism · mutualism · commensalism"],
    terms: [["population", "all organisms of one species in an area"], ["community", "all the populations living in an area"], ["ecosystem", "a community and its physical environment"], ["habitat", "the place where an organism lives"], ["niche", "the role of a species in its ecosystem"], ["abiotic factor", "non-living factor, e.g. temperature"], ["mutualism", "relationship in which both species benefit"], ["parasitism", "relationship in which one benefits and the host is harmed"]] },
  { id: "t18s2", t: "t18", s: 2, name: "The Food Web Forest", focus: "Energy flow and nutrient cycling", scene: "garden",
    special: "globe", specialName: "Cycle globe", specialLine: "Arrows swirl around a globe: carbon goes round and round!",
    tint: "#B9E6C3", floor: "#86BD95", dim: .6, code: "71543", item: "🕸️ Food-web sticker",
    intro: [K("chiikawa", "shock", "Who eats who?! The arrows are everywhere! 😵"), K("hachiware", "normal", "Arrows show the direction of energy flow: from the eaten to the eater."), K("kurimanju", "happy", "Tea leaves... are producers... 🍵")],
    notes: [
      "<b>Food chain</b>: producer → primary consumer → secondary consumer → tertiary consumer. Arrows show the direction of <b>energy flow</b>. A <b>food web</b> is interlinked food chains.",
      "<b>Producers</b> (plants) make food by photosynthesis. <b>Decomposers</b> (bacteria, fungi) break down dead matter and release nutrients.",
      "Only about <b>10%</b> of energy passes to the next <b>trophic level</b>; the rest is lost as heat in respiration, in undigested waste and uneaten parts. So food chains are short.",
      "<b>Ecological pyramids</b>: numbers (can be inverted), <b>biomass</b>, and <b>energy</b> (always upright).",
      "<b>Carbon cycle</b>: photosynthesis removes CO₂; respiration, decomposition and <b>combustion</b> return it. Deforestation and burning fossil fuels increase CO₂.",
      "<b>Nitrogen cycle</b>: decomposers → ammonium → <b>nitrifying bacteria</b> → nitrate (absorbed by plants); <b>nitrogen-fixing bacteria</b> (root nodules) fix N₂; <b>denitrifying bacteria</b> (waterlogged soil) return N₂ to the air."
    ],
    rules: ["Energy flows one way; nutrients cycle", "About 10% of energy passes to the next level", "Pyramid of energy is always upright"],
    terms: [["producer", "organism that makes its own food, e.g. a plant"], ["consumer", "organism that eats other organisms"], ["decomposer", "organism that breaks down dead matter"], ["trophic level", "feeding level in a food chain"], ["food web", "network of linked food chains"], ["biomass", "total mass of living material"], ["nitrifying bacteria", "bacteria that change ammonium into nitrate"], ["nitrogen fixation", "changing nitrogen gas into nitrogen compounds"]] },
  { id: "t18s3", t: "t18", s: 3, name: "The Field Study Camp", focus: "Studying ecosystems and conservation", scene: "greenhouse",
    special: "quadrat", specialName: "Quadrat frame", specialLine: "A square frame lies on the grass... count the daisies inside!",
    tint: "#C8E6B0", floor: "#9CBE83", dim: .76, code: "93287", item: "🔲 Quadrat sticker",
    intro: [K("rakko", "brave", "Boss stage. A true field scientist samples fairly. No cherry-picking. ⚔️"), K("chiikawa", "brave", "Random quadrats... I'll throw them fairly! 💪"), K("usagi", "happy", "Counting daisies! 1, 2, WAHOO! 🐰🌼")],
    notes: [
      "<b>Quadrats</b> (square frames) are placed <b>randomly</b> to estimate plant abundance: count individuals or estimate <b>percentage cover</b>; <b>frequency</b> = % of quadrats containing the species.",
      "A <b>line transect</b> (or belt transect) samples along a line to show how species change with an abiotic factor (e.g. from shore to land, light to shade).",
      "Measure abiotic factors with instruments: light meter, thermometer, pH meter, anemometer, humidity sensor.",
      "Larger samples and repeats make estimates more <b>reliable</b>; random placement avoids <b>bias</b>.",
      "Human impacts: deforestation, habitat loss, pollution (sewage → <b>eutrophication</b> → algal bloom → O₂ depletion), overfishing, global warming.",
      "<b>Conservation</b>: protected areas (e.g. Hong Kong country parks, Mai Po wetland), laws, recycling, sustainable fishing, seed banks, reducing carbon emissions."
    ],
    rules: ["Quadrats: random placement · many samples", "Transect: change along a gradient", "Eutrophication: nutrients → algae bloom → decay → O₂ ↓ → fish die"],
    terms: [["quadrat", "square frame used to sample organisms"], ["line transect", "line along which organisms are sampled"], ["percentage cover", "% of a quadrat's area covered by a species"], ["sampling", "studying part of an area to estimate the whole"], ["eutrophication", "nutrient enrichment of water causing algal blooms"], ["conservation", "protecting species and habitats"], ["biodiversity", "the variety of living things"]] },

  /* ---------------- Health and Diseases ---------------- */
  { id: "t19s1", t: "t19", s: 1, name: "The Germ Lab", focus: "Communicable diseases", scene: "lab",
    special: "virus", specialName: "Virus model", specialLine: "A spiky ball spins in a glass case... it's a virus model!",
    tint: "#C8E8D0", floor: "#9CC0A4", dim: .6, code: "38417", item: "🦠 Germ-buster sticker",
    intro: [K("chiikawa", "cry", "Germs everywhere?! I'm washing my paws ten times! 😭🧼"), K("hachiware", "normal", "Knowing how germs spread is the best way to stop them!"), K("usagi", "happy", "Germ patrol! WOO! 🐰🧽")],
    notes: [
      "<b>Health</b> is a state of complete physical, mental and social well-being, not just the absence of disease.",
      "<b>Communicable diseases</b> are caused by <b>pathogens</b> and can spread: <b>bacteria</b> (e.g. tuberculosis, cholera), <b>viruses</b> (e.g. influenza, COVID-19, AIDS, dengue fever), <b>fungi</b> (e.g. athlete's foot), <b>protists</b> (e.g. malaria).",
      "Transmission: <b>air</b> (droplets: flu, TB), <b>water and food</b> (cholera, food poisoning), <b>vectors</b> (mosquitoes: dengue, malaria), <b>direct contact</b> (athlete's foot), <b>body fluids</b> (HIV, hepatitis B).",
      "Prevention: hand washing, wearing masks, cooking food well, clean water, killing mosquito larvae (remove stagnant water), safe sex, not sharing needles, vaccination.",
      "<b>Antibiotics</b> kill bacteria but <b>not viruses</b>. Misuse leads to <b>antibiotic resistance</b>."
    ],
    rules: ["Pathogens: bacteria · viruses · fungi · protists", "Routes: air · water/food · vectors · contact · body fluids", "Antibiotics work on bacteria, NOT viruses"],
    terms: [["pathogen", "microorganism that causes disease"], ["communicable disease", "disease that can spread between people"], ["vector", "organism that carries a pathogen, e.g. mosquito"], ["virus", "tiny non-cellular pathogen that reproduces inside cells"], ["antibiotic", "drug that kills bacteria"], ["transmission", "spread of a pathogen from one host to another"]] },
  { id: "t19s2", t: "t19", s: 2, name: "The Body Fortress", focus: "Body defence and immunity", scene: "cellworld",
    special: "shield", specialName: "Antibody shield", specialLine: "A shield covered with Y-shaped badges... they're antibodies!",
    tint: "#F5D6C6", floor: "#CDAA98", dim: .62, code: "67054", item: "🛡️ Antibody sticker",
    intro: [K("chiikawa", "brave", "The germs are attacking! Defend the fortress! 💪🛡️"), K("hachiware", "happy", "Our body has walls (skin), guards (phagocytes) and special forces (lymphocytes)!"), K("momonga", "sparkle", "My antibodies are the cutest in the fortress. 💜")],
    notes: [
      "<b>Non-specific defence</b> (first line): <b>skin</b> (barrier), <b>mucus</b> and <b>cilia</b> in airways, <b>stomach acid</b>, lysozyme in tears; <b>blood clotting</b> seals wounds.",
      "Second line: <b>phagocytes</b> engulf and digest pathogens; <b>inflammation</b> (redness, swelling, heat) brings more blood and phagocytes to the site.",
      "<b>Specific defence</b> (immune response): <b>lymphocytes</b> recognise specific <b>antigens</b>. <b>B cells</b> make <b>antibodies</b> that bind to antigens; T cells help and kill infected cells.",
      "After infection, <b>memory cells</b> remain. On a second infection, the <b>secondary response</b> is faster, stronger and longer-lasting, so we usually don't get ill again.",
      "<b>Active immunity</b>: your own body makes antibodies (after infection or <b>vaccination</b>); long-lasting. <b>Passive immunity</b>: ready-made antibodies received (e.g. from mother's milk, antibody injection); immediate but short-lived.",
      "A <b>vaccine</b> contains dead/weakened pathogens or their antigens, triggering a primary response and memory cells without causing disease."
    ],
    rules: ["Non-specific: skin, mucus, acid, phagocytes, inflammation", "Specific: lymphocytes → antibodies against a specific antigen", "Secondary response: faster, stronger (memory cells) · vaccines use this"],
    terms: [["antigen", "molecule on a pathogen that triggers an immune response"], ["antibody", "Y-shaped protein that binds to a specific antigen"], ["lymphocyte", "white blood cell of the specific immune response"], ["memory cell", "long-lived lymphocyte that remembers an antigen"], ["vaccination", "giving a vaccine to trigger immunity"], ["active immunity", "immunity from making your own antibodies"], ["passive immunity", "immunity from receiving ready-made antibodies"], ["inflammation", "redness, swelling and heat at an injured or infected site"]] },
  { id: "t19s3", t: "t19", s: 3, name: "The Healthy Life Clinic", focus: "Non-communicable diseases and healthy living", scene: "clinic",
    special: "heart", specialName: "Health heart", specialLine: "A glowing heart monitor beeps steadily... keep it healthy!",
    tint: "#D8E8F0", floor: "#ABBFCB", dim: .76, code: "14369", item: "🏅 Healthy-life sticker",
    intro: [K("rakko", "brave", "Final boss of the whole game. The strongest warrior is a healthy one. ⚔️"), K("chiikawa", "brave", "I'll eat my veggies AND answer everything! 💪🥦"), K("hachiware", "happy", "Last stage! It'll work out~! We believe in you! ✨")],
    notes: [
      "<b>Non-communicable diseases</b> are not caused by pathogens and do not spread: e.g. <b>cancer</b>, <b>cardiovascular diseases</b>, <b>diabetes</b> (type 2), chronic lung disease.",
      "<b>Cancer</b>: uncontrolled cell division forms a <b>tumour</b>; <b>malignant</b> tumours can spread (metastasis). Risk factors: smoking, UV light, some viruses, carcinogens, genes. Treatment: surgery, radiotherapy, chemotherapy.",
      "<b>Cardiovascular diseases</b> (e.g. coronary heart disease, stroke): risk factors include a high-fat or high-salt diet, smoking, lack of exercise, obesity, stress, genes.",
      "Many risk factors are <b>lifestyle</b> choices: balanced diet, regular exercise, not smoking, limiting alcohol, enough sleep and managing stress reduce risk.",
      "<b>Drug abuse</b> (e.g. ketamine, cannabis) and alcohol harm organs such as the brain, liver and bladder, and affect social and mental health.",
      "Screening (e.g. blood pressure, blood glucose, cervical smear) detects problems early, when treatment works best."
    ],
    rules: ["Non-communicable: not caused by pathogens, not infectious", "Risk factors: genes + lifestyle + environment", "Prevention: diet · exercise · no smoking · screening"],
    terms: [["non-communicable disease", "disease not caused by a pathogen"], ["risk factor", "something that increases the chance of a disease"], ["tumour", "mass of cells formed by uncontrolled division"], ["malignant", "cancerous tumour that can spread"], ["cardiovascular disease", "disease of the heart or blood vessels"], ["stroke", "damage to the brain when its blood supply is blocked"], ["screening", "testing people to find a disease early"]] }
);
// Link each stage to its topic (older stages use a number, newer ones the topic id), then sort into curriculum order
ROOMS.forEach(r => { r.tid = typeof r.t === "number" ? `t${r.t + 1}` : r.t; r.t = TOPICS.findIndex(T => T.id === r.tid); });
ROOMS.sort((a, b) => a.t - b.t || a.s - b.s);
ROOMS.forEach(r => { const T = TOPICS[r.t]; r.topicNo = T.no; r.topic = T.name; r.boss = r.s === ROOMS.filter(x => x.t === r.t).length; });
