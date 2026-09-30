
/* ============================================================
   5b. ⚡ Cell Rush banks (quick mixed questions)
   ============================================================ */
const TF_BANK = [
  ["Magnesium is needed to make chlorophyll.", true, ""],
  ["Iron is needed to make chlorophyll.", false, "Iron is needed for haemoglobin; magnesium is in chlorophyll."],
  ["Sucrose is made of glucose + fructose.", true, ""],
  ["Maltose is made of glucose + galactose.", false, "Maltose = glucose + glucose. Lactose = glucose + galactose."],
  ["Glycogen is the energy store in plants.", false, "Plants store starch; animals store glycogen."],
  ["A triglyceride is made of glycerol and three fatty acids.", true, ""],
  ["Hydrolysis joins molecules and releases water.", false, "That's condensation. Hydrolysis splits molecules by adding water."],
  ["Proteins are made of amino acids joined by peptide bonds.", true, ""],
  ["Benedict's test turns brick-red with starch.", false, "Iodine turns blue-black with starch; Benedict's is for reducing sugars."],
  ["Denatured proteins lose their 3-D shape.", true, ""],
  ["Animal cells have a cell wall.", false, "Only plant (and fungal, bacterial) cells have walls."],
  ["Ribosomes are the site of protein synthesis.", true, ""],
  ["Mitochondria are the site of aerobic respiration.", true, ""],
  ["Bacteria have a true nucleus.", false, "Bacteria are prokaryotes: no true nucleus."],
  ["The cell membrane is a phospholipid bilayer with proteins.", true, ""],
  ["Diffusion needs energy from respiration.", false, "Diffusion is passive."],
  ["Osmosis is the movement of water through a differentially permeable membrane.", true, ""],
  ["A plant cell in pure water will burst.", false, "The cell wall stops it bursting; it becomes turgid."],
  ["Active transport moves substances against a concentration gradient.", true, ""],
  ["Phagocytes engulf bacteria.", true, ""],
  ["DNA is replicated during interphase.", true, ""],
  ["In metaphase, chromatids move to opposite poles.", false, "That's anaphase. In metaphase they line up at the equator."],
  ["Mitosis produces genetically identical cells.", true, ""],
  ["Meiosis produces two diploid cells.", false, "Meiosis produces four haploid cells."],
  ["Human gametes have 23 chromosomes.", true, ""],
  ["Enzymes are used up in reactions.", false, "Enzymes are not used up."],
  ["Enzymes lower the activation energy of a reaction.", true, ""],
  ["Enzymes denatured by boiling work again when cooled.", false, "Denaturation is permanent."],
  ["Pepsin works best at about pH 2.", true, ""],
  ["A competitive inhibitor binds to the active site.", true, ""],
  ["The oxygen released in photosynthesis comes from carbon dioxide.", false, "It comes from water (photolysis)."],
  ["The Calvin cycle takes place in the stroma.", true, ""],
  ["Chlorophyll absorbs mainly green light.", false, "It absorbs red and blue light and reflects green."],
  ["Hydrogencarbonate indicator turns yellow when CO₂ increases.", true, ""],
  ["Glycolysis happens in the mitochondria.", false, "Glycolysis happens in the cytoplasm."],
  ["Oxygen is the final hydrogen acceptor in aerobic respiration.", true, ""],
  ["Anaerobic respiration in muscles produces lactic acid.", true, ""],
  ["Yeast produces lactic acid when respiring anaerobically.", false, "Yeast produces ethanol and CO₂."],
  ["Bile contains enzymes that digest fat.", false, "Bile has no enzymes; it emulsifies fat."],
  ["Most absorption happens in the small intestine.", true, ""],
  ["Lack of vitamin C causes scurvy.", true, ""],
  ["Fatty acids and glycerol are absorbed into the lacteal.", true, ""]
];
const PAIR_BANK = [
  ["Glucose", "Monosaccharide"], ["Sucrose", "Glucose + fructose"], ["Starch", "Energy store in plants"], ["Glycogen", "Energy store in animals"],
  ["Cellulose", "Plant cell walls"], ["Triglyceride", "Glycerol + 3 fatty acids"], ["Peptide bond", "Joins amino acids"], ["Biuret test", "Purple with protein"],
  ["Nucleus", "Contains chromosomes"], ["Ribosome", "Makes proteins"], ["Chloroplast", "Photosynthesis"], ["Mitochondrion", "Aerobic respiration"],
  ["Diffusion", "High → low concentration, passive"], ["Osmosis", "Water through a membrane"], ["Active transport", "Low → high, needs ATP"], ["Plasmolysis", "Membrane pulls from wall"],
  ["Interphase", "DNA replication"], ["Metaphase", "Line up at equator"], ["Anaphase", "Chromatids pulled apart"], ["Crossing over", "Swap parts of chromatids"],
  ["Active site", "Where the substrate binds"], ["Denaturation", "Permanent change of shape"], ["Lactase", "Lactose-free milk"], ["Pectinase", "Clearer fruit juice"],
  ["Stoma", "Pore for gas exchange"], ["Palisade mesophyll", "Most chloroplasts"], ["Photolysis", "Splits water with light"], ["RuBP", "Accepts CO₂"],
  ["Glycolysis", "Glucose → 2 pyruvate"], ["Krebs cycle", "In the matrix; releases CO₂"], ["Oxygen debt", "Extra O₂ after exercise"],
  ["Bile", "Emulsifies fat"], ["Pepsin", "Protease in the stomach"], ["Villus", "Finger-like, absorbs food"], ["Lacteal", "Absorbs fats"], ["Rickets", "Lack of vitamin D / calcium"]
];
const ODD_BANK = [
  ["Which is NOT a polysaccharide?", ["Starch", "Glycogen", "Cellulose", "Sucrose"], 3, "Sucrose is a disaccharide."],
  ["Which is NOT a reducing sugar?", ["Glucose", "Maltose", "Fructose", "Sucrose"], 3, "Sucrose is a non-reducing sugar."],
  ["Which is NOT found in an animal cell?", ["Nucleus", "Mitochondrion", "Ribosome", "Cell wall"], 3, "Animal cells have no cell wall."],
  ["Which is NOT found in a bacterium?", ["Ribosome", "Cell membrane", "Plasmid", "Mitochondrion"], 3, "Prokaryotes have no membrane-bound organelles."],
  ["Which does NOT need energy from respiration?", ["Active transport", "Phagocytosis", "Muscle contraction", "Osmosis"], 3, "Osmosis is passive."],
  ["Which is NOT a stage of mitosis?", ["Prophase", "Metaphase", "Telophase", "Interphase"], 3, "Interphase is between divisions, not a stage of mitosis."],
  ["Which does NOT create genetic variation?", ["Crossing over", "Independent assortment", "Random fertilisation", "Mitosis"], 3, "Mitosis gives identical cells."],
  ["Which is NOT a protein?", ["Enzyme", "Antibody", "Haemoglobin", "Cellulose"], 3, "Cellulose is a carbohydrate."],
  ["Which does NOT limit photosynthesis?", ["Light intensity", "CO₂ concentration", "Temperature", "Oxygen concentration"], 3, "Oxygen is a product, not a limiting factor."],
  ["Which is NOT made in the light-dependent reactions?", ["ATP", "NADPH", "Oxygen", "Glucose"], 3, "Glucose is made from the Calvin cycle products."],
  ["Which is NOT a product of aerobic respiration?", ["Carbon dioxide", "Water", "ATP", "Lactic acid"], 3, "Lactic acid comes from anaerobic respiration in muscles."],
  ["Which does NOT secrete a digestive enzyme?", ["Salivary glands", "Stomach", "Pancreas", "Gall bladder"], 3, "The gall bladder stores bile, which has no enzymes."],
  ["Which is NOT an adaptation of villi?", ["Microvilli", "Thin epithelium", "Capillary network", "Thick muscular wall"], 3, "Villi have a thin wall for fast absorption."],
  ["Which enzyme does NOT digest protein?", ["Pepsin", "Trypsin", "Peptidase", "Lipase"], 3, "Lipase digests fats."]
];
const CLOZE_BANK = [
  ["Water moves by osmosis from a region of ___ water potential to lower water potential.", ["higher", "lower"], 0],
  ["A red blood cell in pure water will ___.", ["burst", "shrink"], 0],
  ["Active transport moves substances ___ a concentration gradient.", ["against", "down"], 0],
  ["Mitosis produces ___ daughter cells.", ["two", "four"], 0],
  ["Gametes are ___.", ["haploid", "diploid"], 0],
  ["Above the optimum temperature, enzymes are ___.", ["denatured", "inactive but unharmed"], 0],
  ["At 4 °C, enzymes are ___.", ["inactive but not denatured", "denatured"], 0],
  ["Competitive inhibitors bind to the ___.", ["active site", "cell wall"], 0],
  ["The light-dependent reactions happen on the ___.", ["thylakoids", "stroma"], 0],
  ["CO₂ is fixed by combining with ___.", ["RuBP", "ATP"], 0],
  ["Glycolysis happens in the ___.", ["cytoplasm", "matrix"], 0],
  ["Yeast makes ___ and CO₂ without oxygen.", ["ethanol", "lactic acid"], 0],
  ["Bile ___ fats.", ["emulsifies", "digests"], 0],
  ["Glucose is carried to the liver in the ___.", ["hepatic portal vein", "lacteal"], 0],
  ["Plant cells store energy as ___.", ["starch", "glycogen"], 0],
  ["The Biuret test turns ___ with protein.", ["purple", "brick-red"], 0]
];
const ORDER_BANK = [
  () => ["Tap the stages of mitosis in order.", ["Prophase", "Metaphase", "Anaphase", "Telophase"]],
  () => ["Tap the path of food through the gut, in order.", subseq(["Mouth", "Oesophagus", "Stomach", "Small intestine", "Large intestine"], 4)],
  () => ["Tap the stages of aerobic respiration in order.", ["Glycolysis", "Krebs cycle", "Oxidative phosphorylation"]],
  () => ["Tap the steps of the leaf starch test in order.", ["Boil in water", "Hot alcohol (water bath)", "Rinse in warm water", "Add iodine"]],
  () => ["Tap the Calvin cycle steps in order.", ["CO₂ + RuBP", "GP", "Triose phosphate", "Glucose"]],
  () => ["Tap from SMALLEST to LARGEST.", ["Glucose", "Maltose", "Starch"]],
  () => ["Tap how an enzyme works, in order.", ["Substrate binds to active site", "Enzyme–substrate complex", "Products released", "Enzyme free again"]]
];
/* Visual type 1: food test colour tubes */
const TEST_COLOURS = { "Blue-black": "#1F2350", "Brick-red": "#C2451E", "Purple": "#8E44C8", "Blue": "#5B8FE0", "Colourless": "#F2F2F2", "Milky white": "#E9E4DA", "Yellow": "#F2C230" };
const TEST_BANK = [
  ["Iodine + starch turns...", "Blue-black"], ["Benedict's + glucose (heated) turns...", "Brick-red"], ["Biuret + protein turns...", "Purple"],
  ["Benedict's + pure water (heated) stays...", "Blue"], ["DCPIP + vitamin C becomes...", "Colourless"], ["Limewater + CO₂ turns...", "Milky white"],
  ["Hydrogencarbonate indicator + lots of CO₂ turns...", "Yellow"]
];
/* Visual type 2: organelle spotter (a part of the plant cell glows) */
const SPOT_PARTS = { wall: "Cell wall", membrane: "Cell membrane", vacuole: "Vacuole", nucleus: "Nucleus", chloroplast: "Chloroplast", mito: "Mitochondrion" };
