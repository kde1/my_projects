function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const slots = {
  body: [
    { id: "rex", label: "Tyrant torso", score: { speed: 5, defense: 4, reach: 6, ferocity: 9 } },
    { id: "sauropod", label: "Long giant", score: { speed: 2, defense: 5, reach: 10, ferocity: 3 } },
    { id: "ceratops", label: "Shield body", score: { speed: 4, defense: 9, reach: 4, ferocity: 6 } },
    { id: "raptor", label: "Runner frame", score: { speed: 10, defense: 2, reach: 5, ferocity: 8 } }
  ],
  head: [
    { id: "rex", label: "Crusher skull", score: { speed: 0, defense: 1, reach: 1, ferocity: 10 } },
    { id: "trike", label: "Horned shield", score: { speed: 0, defense: 8, reach: 2, ferocity: 6 } },
    { id: "duck", label: "Hadrosaur crest", score: { speed: 2, defense: 2, reach: 2, ferocity: 2 } },
    { id: "raptor", label: "Raptor snout", score: { speed: 4, defense: 1, reach: 2, ferocity: 8 } }
  ],
  tail: [
    { id: "whip", label: "Whip tail", score: { speed: 1, defense: 2, reach: 9, ferocity: 2 } },
    { id: "club", label: "Club tail", score: { speed: -1, defense: 9, reach: 5, ferocity: 5 } },
    { id: "raptor", label: "Balance tail", score: { speed: 7, defense: 1, reach: 5, ferocity: 4 } },
    { id: "spike", label: "Spike tail", score: { speed: 0, defense: 7, reach: 6, ferocity: 6 } }
  ],
  legs: [
    { id: "runner", label: "Runner legs", score: { speed: 10, defense: 2, reach: 3, ferocity: 4 } },
    { id: "pillar", label: "Pillar legs", score: { speed: 1, defense: 8, reach: 4, ferocity: 2 } },
    { id: "stalker", label: "Hunter legs", score: { speed: 7, defense: 3, reach: 4, ferocity: 8 } },
    { id: "quad", label: "Four-foot stance", score: { speed: 4, defense: 7, reach: 3, ferocity: 5 } }
  ],
  armor: [
    { id: "none", label: "No armor", score: { speed: 2, defense: 0, reach: 0, ferocity: 0 } },
    { id: "plates", label: "Back plates", score: { speed: -1, defense: 8, reach: 1, ferocity: 3 } },
    { id: "sail", label: "Tall sail", score: { speed: 0, defense: 3, reach: 4, ferocity: 5 } },
    { id: "spines", label: "Neck spines", score: { speed: 0, defense: 6, reach: 2, ferocity: 5 } }
  ],
  detail: [
    { id: "claws", label: "Sickle claws", score: { speed: 2, defense: 0, reach: 1, ferocity: 8 } },
    { id: "beak", label: "Keratin beak", score: { speed: 0, defense: 4, reach: 1, ferocity: 3 } },
    { id: "feathers", label: "Proto-feathers", score: { speed: 3, defense: 2, reach: 0, ferocity: 2 } },
    { id: "crest", label: "Signal crest", score: { speed: 1, defense: 1, reach: 2, ferocity: 1 } }
  ]
};

const speciesLab = [
  {
    id: "tyrannosaurus",
    name: "Tyrannosaurus rex",
    period: "Late Cretaceous",
    diet: "carnivore",
    trait: "huge skull and bone-crushing bite",
    fact: "T. rex had banana-sized teeth and one of the strongest bite forces known from land animals.",
    build: { body: 0, head: 0, tail: 2, legs: 2, armor: 0, detail: 0 },
    colors: ["#5f7f45", "#d0c09a"],
    boost: { speed: 4, strength: 20, defense: 4, reach: 4, ferocity: 18 }
  },
  {
    id: "velociraptor",
    name: "Velociraptor",
    period: "Late Cretaceous",
    diet: "carnivore",
    trait: "light frame, balance tail, and sickle claw",
    fact: "Velociraptor was much smaller than movie versions, but it was agile and probably feathered.",
    build: { body: 3, head: 3, tail: 2, legs: 0, armor: 0, detail: 2 },
    colors: ["#725042", "#ddc8ad"],
    boost: { speed: 22, strength: 6, defense: 2, reach: 4, ferocity: 14 }
  },
  {
    id: "triceratops",
    name: "Triceratops",
    period: "Late Cretaceous",
    diet: "herbivore",
    trait: "three horns and a protective frill",
    fact: "Triceratops used its beak for plants, while the horns and frill helped with defense and display.",
    build: { body: 2, head: 1, tail: 1, legs: 3, armor: 0, detail: 1 },
    colors: ["#6d6f3c", "#d6c08f"],
    boost: { speed: 4, strength: 12, defense: 22, reach: 3, ferocity: 8 }
  },
  {
    id: "ankylosaurus",
    name: "Ankylosaurus",
    period: "Late Cretaceous",
    diet: "herbivore",
    trait: "armor plates and a heavy tail club",
    fact: "Ankylosaurus was built like a low armored tank, with a tail club for defense.",
    build: { body: 2, head: 1, tail: 1, legs: 1, armor: 1, detail: 1 },
    colors: ["#4f5f3e", "#c9bb91"],
    boost: { speed: -4, strength: 16, defense: 28, reach: 2, ferocity: 6 }
  },
  {
    id: "stegosaurus",
    name: "Stegosaurus",
    period: "Late Jurassic",
    diet: "herbivore",
    trait: "tall plates and tail spikes",
    fact: "Stegosaurus plates may have helped with display, species recognition, or heat exchange.",
    build: { body: 2, head: 2, tail: 3, legs: 3, armor: 1, detail: 3 },
    colors: ["#496a68", "#c9d2b1"],
    boost: { speed: 1, strength: 10, defense: 18, reach: 8, ferocity: 9 }
  },
  {
    id: "spinosaurus",
    name: "Spinosaurus",
    period: "Late Cretaceous",
    diet: "fish-eating carnivore",
    trait: "long snout and tall sail",
    fact: "Spinosaurus had crocodile-like jaws and adaptations that may have helped it hunt around water.",
    build: { body: 0, head: 3, tail: 0, legs: 2, armor: 2, detail: 1 },
    colors: ["#496a68", "#d8c79c"],
    boost: { speed: 5, strength: 12, defense: 8, reach: 16, ferocity: 15 }
  },
  {
    id: "brachiosaurus",
    name: "Brachiosaurus",
    period: "Late Jurassic",
    diet: "herbivore",
    trait: "high shoulders and long browsing neck",
    fact: "Brachiosaurus could reach vegetation that many other plant-eaters could not.",
    build: { body: 1, head: 2, tail: 0, legs: 1, armor: 0, detail: 3 },
    colors: ["#7a6048", "#d8c79c"],
    boost: { speed: -2, strength: 18, defense: 12, reach: 28, ferocity: 1 }
  },
  {
    id: "parasaurolophus",
    name: "Parasaurolophus",
    period: "Late Cretaceous",
    diet: "herbivore",
    trait: "long sound-making head crest",
    fact: "Parasaurolophus may have used its crest like a resonating chamber for calls.",
    build: { body: 3, head: 2, tail: 2, legs: 0, armor: 0, detail: 3 },
    colors: ["#8a6742", "#dbc99f"],
    boost: { speed: 12, strength: 4, defense: 5, reach: 6, ferocity: 1 }
  }
];

const quizItems = [
  q("Tyrannosaurus rex", "tyrannosaurus", "Late Cretaceous", "tyrannosaur", "skull and torso crop", "66% 45%", 1.55, "huge skull, deep jaws, tiny two-fingered arms, and powerful hind legs", "Deep tyrannosaur skull, heavy jaw, reduced forelimbs."),
  q("Triceratops", "triceratops", "Late Cretaceous", "ceratopsian", "frill and horn crop", "70% 37%", 1.65, "three facial horns and a large protective frill", "Brow horns plus nasal horn; broad solid-looking frill."),
  q("Spinosaurus", "spinosaurus", "Late Cretaceous", "spinosaurid", "sail and snout crop", "55% 42%", 1.5, "a long crocodile-like snout and a tall sail on its back", "Spinosaurid snout with a tall neural-spine sail."),
  q("Parasaurolophus", "parasaurolophus", "Late Cretaceous", "hadrosaur", "crest and shoulder crop", "72% 34%", 1.7, "a long backward-curving crest probably useful for sound and display", "Hadrosaur body with a long backward-projecting tubular crest."),
  q("Allosaurus", "allosaurus", "Late Jurassic", "allosauroid", "skull and forelimb crop", "62% 42%", 1.55, "a lighter skull than T. rex, brow ridges, and three-fingered hands", "Large Jurassic theropod with brow ridges and three usable fingers."),
  q("Brachiosaurus", "brachiosaurus", "Late Jurassic", "sauropod", "neck and shoulder crop", "47% 38%", 1.45, "very high shoulders, long front legs, and a towering neck", "Sauropod with high shoulders and forelimbs longer than hind limbs."),
  q("Stegosaurus", "stegosaurus", "Late Jurassic", "stegosaur", "plate and tail crop", "51% 43%", 1.55, "tall back plates and a spiked tail called a thagomizer", "Alternating plates along the back and tail spikes."),
  q("Ankylosaurus", "ankylosaurus", "Late Cretaceous", "ankylosaur", "armor and tail crop", "52% 48%", 1.5, "heavy body armor and a large tail club", "Low armored body with osteoderms and a tail club."),
  q("Velociraptor", "velociraptor", "Late Cretaceous", "dromaeosaur", "head and sickle claw crop", "58% 46%", 1.7, "a small feathered predator with a sickle claw and narrow snout", "Small feathered dromaeosaur, much smaller than movie versions."),
  q("Carnotaurus", "carnotaurus", "Late Cretaceous", "abelisaurid", "horned skull crop", "66% 42%", 1.6, "a short deep skull, tiny arms, and bull-like horns over the eyes", "Abelisaurid with brow horns and extremely reduced arms."),
  q("Dilophosaurus", "dilophosaurus", "Early Jurassic", "theropod", "double crest crop", "61% 39%", 1.55, "paired head crests and a slim Early Jurassic theropod build", "Twin cranial crests; no movie-style neck frill."),
  q("Gallimimus", "gallimimus", "Late Cretaceous", "ornithomimid", "leg and body crop", "54% 44%", 1.55, "an ostrich-like body with long legs, long neck, and toothless beak", "Fast ornithomimid with long cursorial legs."),
  q("Pachycephalosaurus", "pachycephalosaurus", "Late Cretaceous", "pachycephalosaur", "dome skull crop", "66% 39%", 1.75, "a thick domed skull with knobs and small spikes around the back", "Dome-headed ornithischian with skull ornamentation."),
  q("Iguanodon", "iguanodon", "Early Cretaceous", "ornithopod", "hand and head crop", "58% 47%", 1.55, "a robust ornithopod with thumb spikes and a beaked mouth", "Look for the thumb spike and heavy ornithopod body."),
  q("Diplodocus", "diplodocus", "Late Jurassic", "sauropod", "tail and neck crop", "48% 47%", 1.4, "a very long, low body with a whip-like tail and small head", "Long low diplodocid with a horizontal neck and whip tail."),
  q("Apatosaurus", "apatosaurus", "Late Jurassic", "sauropod", "thick neck crop", "48% 42%", 1.45, "a heavy sauropod with a thick neck, robust body, and long tail", "Chunkier sauropod build than Diplodocus."),
  q("Deinonychus", "deinonychus", "Early Cretaceous", "dromaeosaur", "sickle claw crop", "57% 47%", 1.6, "a feathered raptor larger than Velociraptor with a strong sickle claw", "Dromaeosaur with strong grasping arms and killing claw."),
  q("Microraptor", "microraptor", "Early Cretaceous", "paravian", "wing feather crop", "54% 42%", 1.75, "a tiny four-winged feathered dinosaur with feathers on arms and legs", "Small paravian with long feathers on both forelimbs and hindlimbs."),
  q("Archaeopteryx", "archaeopteryx", "Late Jurassic", "paravian", "wing and tail crop", "55% 41%", 1.75, "birdlike wings, a long bony feathered tail, clawed fingers, and teeth", "Early avialan with wings, teeth, and a long bony tail."),
  q("Therizinosaurus", "therizinosaurus", "Late Cretaceous", "therizinosaur", "claw and torso crop", "57% 44%", 1.55, "enormous scythe-like hand claws, a pot-bellied body, and feathers", "Bizarre theropod with gigantic hand claws."),
  q("Oviraptor", "oviraptor", "Late Cretaceous", "oviraptorid", "beak and crest crop", "58% 39%", 1.7, "a feathered oviraptorid with a short beaked skull and birdlike body", "Short beak, crest, and feathered arms."),
  q("Corythosaurus", "corythosaurus", "Late Cretaceous", "hadrosaur", "helmet crest crop", "66% 36%", 1.65, "a tall rounded helmet-like crest and duck-billed snout", "Rounded helmet crest on a lambeosaurine hadrosaur."),
  q("Lambeosaurus", "lambeosaurus", "Late Cretaceous", "hadrosaur", "hatchet crest crop", "65% 36%", 1.65, "a hatchet-shaped crest projecting upward and forward", "Hadrosaur with a hatchet-like crest shape."),
  q("Edmontosaurus", "edmontosaurus", "Late Cretaceous", "hadrosaur", "duck-bill crop", "64% 43%", 1.55, "a large duck-billed hadrosaur without a tall hollow crest", "Broad hadrosaur beak but no tall cranial crest."),
  q("Styracosaurus", "styracosaurus", "Late Cretaceous", "ceratopsian", "spiked frill crop", "69% 38%", 1.65, "a long nasal horn and many long spikes around the frill", "Ceratopsian with dramatic frill spikes."),
  q("Protoceratops", "protoceratops", "Late Cretaceous", "ceratopsian", "small frill crop", "63% 43%", 1.55, "a small ceratopsian with a beak, modest frill, and no large brow horns", "Small hornless ceratopsian with a parrot-like beak."),
  q("Giganotosaurus", "giganotosaurus", "Late Cretaceous", "carcharodontosaur", "long skull crop", "63% 43%", 1.55, "a giant theropod with a long low skull and three-fingered arms", "Carcharodontosaurid with long skull, unlike deep tyrannosaur skulls."),
  q("Baryonyx", "baryonyx", "Early Cretaceous", "spinosaurid", "snout and claw crop", "61% 43%", 1.6, "a long crocodile-like snout and large hand claws, but no tall Spinosaurus sail", "Fish-eating spinosaurid with big thumb claw."),
  q("Suchomimus", "suchomimus", "Early Cretaceous", "spinosaurid", "snout and back crop", "59% 43%", 1.55, "a crocodile-like snout, large claws, and a low ridge along the back", "Spinosaurid with long narrow snout and lower back ridge."),
  q("Acrocanthosaurus", "acrocanthosaurus", "Early Cretaceous", "carcharodontosaur", "back ridge crop", "55% 40%", 1.55, "high neural spines forming a ridge along the back", "Large theropod with raised neural-spine ridge."),
  q("Ceratosaurus", "ceratosaurus", "Late Jurassic", "theropod", "nasal horn crop", "64% 39%", 1.65, "a nasal horn on the snout, small brow horns, and a deep tail", "Jurassic theropod with a distinctive horn on the snout."),
  q("Maiasaura", "maiasaura", "Late Cretaceous", "hadrosaur", "low crest crop", "64% 39%", 1.55, "a duck-billed hadrosaur with a low crest above the eyes", "Hadrosaur with a gentle low cranial crest."),
  q("Kentrosaurus", "kentrosaurus", "Late Jurassic", "stegosaur", "spikes and plates crop", "54% 43%", 1.6, "a smaller stegosaur with plates near the shoulders and long paired spikes toward the hips and tail", "Stegosaur with more dramatic rear-body spikes than Stegosaurus."),
  q("Utahraptor", "utahraptor", "Early Cretaceous", "dromaeosaur", "large raptor crop", "57% 45%", 1.6, "a large feathered dromaeosaur with sickle claws and powerful arms", "Much larger dromaeosaur than Velociraptor."),
  q("Tarbosaurus", "tarbosaurus", "Late Cretaceous", "tyrannosaur", "skull and jaw crop", "65% 43%", 1.6, "a deep tyrannosaur skull, powerful jaws, and reduced two-fingered arms", "Asian tyrannosaur with a T. rex-like deep skull and tiny forelimbs."),
  q("Torosaurus", "torosaurus", "Late Cretaceous", "ceratopsian", "huge frill crop", "70% 37%", 1.65, "a very large frill, long brow horns, and a Triceratops-like body", "Ceratopsian with an especially long frill and paired brow horns."),
  q("Pachyrhinosaurus", "pachyrhinosaurus", "Late Cretaceous", "ceratopsian", "boss and frill crop", "69% 38%", 1.65, "a thick bony nasal boss instead of a long nose horn", "Ceratopsian with a blunt nasal boss rather than a tall nasal horn."),
  q("Carcharodontosaurus", "carcharodontosaurus", "Late Cretaceous", "carcharodontosaur", "toothed skull crop", "63% 43%", 1.55, "a giant long skull with blade-like serrated teeth", "Carcharodontosaurid with long jaws and shark-tooth-like serrations."),
  q("Mapusaurus", "mapusaurus", "Late Cretaceous", "carcharodontosaur", "long predator crop", "62% 43%", 1.55, "a long low skull, three-fingered arms, and giant predator build", "South American carcharodontosaur closely related to Giganotosaurus."),
  q("Camarasaurus", "camarasaurus", "Late Jurassic", "sauropod", "boxy skull crop", "48% 39%", 1.45, "a shorter boxy skull, sturdy neck, and compact sauropod body", "Sauropod with a boxier head and sturdier proportions than Diplodocus."),
  q("Brontosaurus", "brontosaurus", "Late Jurassic", "sauropod", "heavy neck crop", "47% 42%", 1.45, "a massive body, strong neck, and long whip-like tail", "Heavy diplodocid sauropod with a robust neck and long tail."),
  q("Sauropelta", "sauropelta", "Early Cretaceous", "ankylosaur", "shoulder spike crop", "54% 45%", 1.55, "armor plates and large shoulder spikes along a low body", "Nodosaur with prominent shoulder spikes and no tail club."),
  q("Nodosaurus", "nodosaurus", "Late Cretaceous", "ankylosaur", "armor plate crop", "53% 46%", 1.55, "a low armored body covered in bony plates but no tail club", "Armored nodosaur body with osteoderms and a clubless tail."),
  q("Struthiomimus", "struthiomimus", "Late Cretaceous", "ornithomimid", "runner body crop", "54% 44%", 1.55, "an ostrich-like runner with long legs, long arms, and a toothless beak", "Slender ornithomimid with long grasping arms and cursorial legs."),
  q("Ornithomimus", "ornithomimus", "Late Cretaceous", "ornithomimid", "beak and legs crop", "55% 44%", 1.55, "a lightweight ostrich-mimic body with a small head and fast legs", "Classic ostrich-mimic dinosaur with toothless beak and long legs."),
  q("Ouranosaurus", "ouranosaurus", "Early Cretaceous", "ornithopod", "sail back crop", "56% 42%", 1.55, "an Iguanodon-like body with tall spines forming a back sail", "Ornithopod with thumb spikes and a high-spined back sail."),
  q("Dryosaurus", "dryosaurus", "Late Jurassic", "ornithopod", "small runner crop", "57% 45%", 1.6, "a small fast ornithopod with long hind legs and a stiff tail", "Light Jurassic plant-eater built for quick running."),
  q("Citipati", "citipati", "Late Cretaceous", "oviraptorid", "crest and beak crop", "58% 39%", 1.7, "a tall head crest, short beak, and feathered oviraptorid body", "Oviraptorid with a high rounded crest and birdlike posture."),
  q("Majungasaurus", "majungasaurus", "Late Cretaceous", "abelisaurid", "short skull crop", "65% 42%", 1.6, "a short deep skull, rough skull ornament, and very tiny arms", "Abelisaurid with a blunt skull and extremely reduced forelimbs."),
  q("Coelophysis", "coelophysis", "Late Triassic", "theropod", "slender body crop", "60% 42%", 1.6, "a slim early theropod body, long neck, and narrow jaws", "Early lightweight theropod with a long neck and narrow skull.")
];

const quizFieldGuide = {
  tyrannosaurus: {
    lived: "Late Cretaceous, about 68-66 million years ago",
    where: "Western North America, including places such as Montana, Wyoming, South Dakota, and nearby regions",
    habitat: "Warm river valleys, forested floodplains, and coastal lowlands",
    diet: "Carnivore; hunted and scavenged large dinosaurs",
    facts: [
      "Its teeth could be as long as bananas.",
      "Its skull was built for an extremely powerful bite.",
      "Adults were bulky, but younger animals were probably faster and slimmer."
    ]
  },
  triceratops: {
    lived: "Late Cretaceous, about 68-66 million years ago",
    where: "Western North America",
    habitat: "Open woodlands, floodplains, and lowland plant-rich habitats",
    diet: "Herbivore; likely ate tough low plants with a strong beak",
    facts: [
      "It had two long brow horns, one nose horn, and a huge frill.",
      "Its beak could clip tough vegetation.",
      "It lived at the same time and in the same region as Tyrannosaurus rex."
    ]
  },
  spinosaurus: {
    lived: "Late Cretaceous, about 99-93 million years ago",
    where: "North Africa, especially Morocco and Egypt",
    habitat: "River systems, deltas, mangrove-like wetlands, and coastal waterways",
    diet: "Mostly fish and other aquatic or shoreline prey",
    facts: [
      "Its long snout was shaped a bit like a crocodile's.",
      "The tall back sail was made from extended spine bones.",
      "It is one of the strongest candidates for a semi-aquatic dinosaur."
    ]
  },
  parasaurolophus: {
    lived: "Late Cretaceous, about 76-73 million years ago",
    where: "Western North America",
    habitat: "Floodplains, forests, and coastal plains",
    diet: "Herbivore; ate plants with a duck-billed mouth and grinding teeth",
    facts: [
      "Its long hollow crest may have helped make deep calls.",
      "It could walk on two legs or four.",
      "Its name means 'near crested lizard.'"
    ]
  },
  allosaurus: {
    lived: "Late Jurassic, about 155-145 million years ago",
    where: "North America and possibly parts of Europe",
    habitat: "Seasonal floodplains, fern prairies, and river-edge woodlands",
    diet: "Carnivore; preyed on other Jurassic dinosaurs",
    facts: [
      "It had three-fingered hands with large claws.",
      "It was one of the top predators of the Morrison Formation.",
      "Its skull was lighter than T. rex but still dangerous."
    ]
  },
  brachiosaurus: {
    lived: "Late Jurassic, about 154-150 million years ago",
    where: "North America, especially Colorado, Utah, and Wyoming",
    habitat: "Warm floodplains with conifers, cycads, and tall vegetation",
    diet: "Herbivore; browsed high vegetation",
    facts: [
      "Its front legs were longer than its back legs.",
      "Its nostrils sat high on the skull.",
      "Its high shoulders helped it reach food other herbivores could not."
    ]
  },
  stegosaurus: {
    lived: "Late Jurassic, about 155-150 million years ago",
    where: "Western North America and possibly Portugal",
    habitat: "Open floodplains and lightly wooded areas",
    diet: "Herbivore; ate low-growing plants",
    facts: [
      "The tail spikes are nicknamed a thagomizer.",
      "Its back plates may have helped with display or species recognition.",
      "Its brain was small compared with its body size."
    ]
  },
  ankylosaurus: {
    lived: "Late Cretaceous, about 68-66 million years ago",
    where: "Western North America",
    habitat: "Wooded lowlands and floodplains",
    diet: "Herbivore; cropped low plants",
    facts: [
      "It was covered in bony armor plates called osteoderms.",
      "Its tail club could have been a serious defensive weapon.",
      "It lived alongside T. rex and Triceratops."
    ]
  },
  velociraptor: {
    lived: "Late Cretaceous, about 75-71 million years ago",
    where: "Mongolia and northern China",
    habitat: "Dry, sandy environments with dunes, streams, and scrubby vegetation",
    diet: "Carnivore; hunted small animals and possibly scavenged",
    facts: [
      "Real Velociraptor was much smaller than the movie version.",
      "It almost certainly had feathers.",
      "A famous fossil preserves Velociraptor locked in combat with Protoceratops."
    ]
  },
  carnotaurus: {
    lived: "Late Cretaceous, about 72-69 million years ago",
    where: "Argentina",
    habitat: "Seasonal plains, river areas, and dry woodland",
    diet: "Carnivore",
    facts: [
      "Its name means 'meat-eating bull.'",
      "It had short horns above the eyes.",
      "Its arms were extremely reduced, even compared with many other theropods."
    ]
  },
  dilophosaurus: {
    lived: "Early Jurassic, about 193 million years ago",
    where: "Southwestern United States",
    habitat: "River floodplains and seasonally wet lowlands",
    diet: "Carnivore; ate smaller dinosaurs and other animals",
    facts: [
      "It had two thin crests on its head.",
      "There is no fossil evidence for the movie-style neck frill.",
      "It was one of the largest predators of its early Jurassic environment."
    ]
  },
  gallimimus: {
    lived: "Late Cretaceous, about 70 million years ago",
    where: "Mongolia",
    habitat: "Open floodplains and semi-arid plains",
    diet: "Likely omnivore; may have eaten plants, small animals, and eggs",
    facts: [
      "Its name means 'chicken mimic.'",
      "It had long legs built for speed.",
      "It belonged to the ostrich-like ornithomimids."
    ]
  },
  pachycephalosaurus: {
    lived: "Late Cretaceous, about 70-66 million years ago",
    where: "Western North America",
    habitat: "Woodlands and floodplains",
    diet: "Probably herbivore or omnivore",
    facts: [
      "Its skull dome could be over 20 cm thick.",
      "Scientists debate whether it used the dome for head-butting or display.",
      "Its name means 'thick-headed lizard.'"
    ]
  },
  iguanodon: {
    lived: "Early Cretaceous, about 126-122 million years ago",
    where: "Europe, especially Belgium and the United Kingdom",
    habitat: "Forested floodplains and coastal lowlands",
    diet: "Herbivore",
    facts: [
      "It had a famous thumb spike.",
      "It was one of the first dinosaurs ever scientifically described.",
      "It could probably move on two legs or four."
    ]
  },
  diplodocus: {
    lived: "Late Jurassic, about 154-152 million years ago",
    where: "Western North America",
    habitat: "Floodplains with rivers, conifers, ferns, and open spaces",
    diet: "Herbivore; likely browsed low to mid-height plants",
    facts: [
      "It had an extremely long whip-like tail.",
      "Its skull was small compared with its enormous body.",
      "It was built longer and lower than many other sauropods."
    ]
  },
  apatosaurus: {
    lived: "Late Jurassic, about 152-151 million years ago",
    where: "Western North America",
    habitat: "River floodplains and open woodland",
    diet: "Herbivore",
    facts: [
      "It had a thick, powerful neck.",
      "It was more heavily built than Diplodocus.",
      "The name Brontosaurus is closely tied to its scientific history."
    ]
  },
  deinonychus: {
    lived: "Early Cretaceous, about 115-108 million years ago",
    where: "North America",
    habitat: "Wooded floodplains and seasonal plains",
    diet: "Carnivore",
    facts: [
      "Its name means 'terrible claw.'",
      "It helped change scientific thinking about dinosaurs as active animals.",
      "It had a large sickle claw on each second toe."
    ]
  },
  microraptor: {
    lived: "Early Cretaceous, about 125-120 million years ago",
    where: "China",
    habitat: "Forested lake environments",
    diet: "Carnivore; ate small animals, including fish, mammals, and birds",
    facts: [
      "It had long feathers on both arms and legs.",
      "It may have glided between trees.",
      "Some fossils preserve dark, glossy feather coloration."
    ]
  },
  archaeopteryx: {
    lived: "Late Jurassic, about 150 million years ago",
    where: "Germany",
    habitat: "Tropical islands and lagoon environments",
    diet: "Carnivore or insectivore; ate small animals",
    facts: [
      "It had feathers and wings, but also teeth and a long bony tail.",
      "It is a key fossil in the story of bird evolution.",
      "Its fossils come from fine limestone that preserved feather details."
    ]
  },
  therizinosaurus: {
    lived: "Late Cretaceous, about 70 million years ago",
    where: "Mongolia",
    habitat: "Wooded or semi-arid floodplain environments",
    diet: "Probably herbivore or omnivore",
    facts: [
      "It had some of the longest hand claws of any known animal.",
      "Despite the claws, it was related to meat-eating theropods.",
      "It may have used its claws to pull branches or for defense."
    ]
  },
  oviraptor: {
    lived: "Late Cretaceous, about 75 million years ago",
    where: "Mongolia",
    habitat: "Dry dunes and semi-arid plains",
    diet: "Omnivore; may have eaten plants, small animals, shellfish, or eggs",
    facts: [
      "Its name means 'egg thief,' but that reputation may be unfair.",
      "Related fossils show adults brooding nests.",
      "It had a short beaked skull and likely feathers."
    ]
  },
  corythosaurus: {
    lived: "Late Cretaceous, about 77-75 million years ago",
    where: "Western North America",
    habitat: "Coastal plains and river floodplains",
    diet: "Herbivore",
    facts: [
      "Its crest looks a bit like a Corinthian helmet.",
      "The hollow crest may have helped produce calls.",
      "It belonged to the duck-billed hadrosaurs."
    ]
  },
  lambeosaurus: {
    lived: "Late Cretaceous, about 76-75 million years ago",
    where: "Western North America",
    habitat: "Coastal floodplains and forests",
    diet: "Herbivore",
    facts: [
      "Its crest had a hatchet-like shape.",
      "It was a lambeosaurine hadrosaur, a group famous for head crests.",
      "Its teeth formed dental batteries for grinding plants."
    ]
  },
  edmontosaurus: {
    lived: "Late Cretaceous, about 73-66 million years ago",
    where: "Western North America",
    habitat: "Floodplains, coastal plains, and forests",
    diet: "Herbivore",
    facts: [
      "Some fossils preserve skin impressions.",
      "It was a large duck-billed dinosaur without a tall hollow crest.",
      "It lived through the very end of the dinosaur age."
    ]
  },
  styracosaurus: {
    lived: "Late Cretaceous, about 76-75 million years ago",
    where: "Alberta, Canada",
    habitat: "River floodplains and lush coastal lowlands",
    diet: "Herbivore",
    facts: [
      "It had a long nose horn and dramatic spikes around the frill.",
      "Its name means 'spiked lizard.'",
      "The frill may have helped with display and recognition."
    ]
  },
  protoceratops: {
    lived: "Late Cretaceous, about 75-71 million years ago",
    where: "Mongolia and northern China",
    habitat: "Desert and semi-desert dune environments",
    diet: "Herbivore",
    facts: [
      "It was much smaller than Triceratops.",
      "It had a parrot-like beak and a modest frill.",
      "Many fossils are known, including nests and juveniles."
    ]
  },
  giganotosaurus: {
    lived: "Late Cretaceous, about 99-97 million years ago",
    where: "Argentina",
    habitat: "Warm floodplains and river systems",
    diet: "Carnivore; likely hunted large herbivores",
    facts: [
      "It was one of the largest known meat-eating dinosaurs.",
      "Its skull was long and low compared with T. rex.",
      "It lived millions of years before T. rex."
    ]
  },
  baryonyx: {
    lived: "Early Cretaceous, about 130-125 million years ago",
    where: "United Kingdom and nearby parts of Europe",
    habitat: "Rivers, lakes, wetlands, and floodplains",
    diet: "Fish and meat",
    facts: [
      "Fish scales were found with the original fossil.",
      "It had a large thumb claw.",
      "Its narrow snout helped it catch slippery prey."
    ]
  },
  suchomimus: {
    lived: "Early Cretaceous, about 125-112 million years ago",
    where: "Niger, Africa",
    habitat: "River deltas, floodplains, and wetlands",
    diet: "Mostly fish, plus other prey",
    facts: [
      "Its name means 'crocodile mimic.'",
      "It had a long narrow snout and big hand claws.",
      "It was related to Spinosaurus but did not have the same tall sail."
    ]
  },
  acrocanthosaurus: {
    lived: "Early Cretaceous, about 113-110 million years ago",
    where: "North America, especially Oklahoma, Texas, and nearby states",
    habitat: "Floodplains, coastal plains, and open woodland",
    diet: "Carnivore",
    facts: [
      "Its name means 'high-spined lizard.'",
      "Tall neural spines formed a ridge along its back.",
      "It was one of North America's biggest predators before T. rex."
    ]
  },
  ceratosaurus: {
    lived: "Late Jurassic, about 153-148 million years ago",
    where: "North America, Portugal, and possibly Tanzania",
    habitat: "River floodplains and wetland edges",
    diet: "Carnivore",
    facts: [
      "It had a horn on its snout and small brow horns.",
      "Its tail was deep and powerful.",
      "It shared Jurassic ecosystems with Allosaurus and Stegosaurus."
    ]
  },
  maiasaura: {
    lived: "Late Cretaceous, about 76 million years ago",
    where: "Montana, United States",
    habitat: "Nesting grounds, floodplains, and coastal lowlands",
    diet: "Herbivore",
    facts: [
      "Its name means 'good mother lizard.'",
      "Huge nesting colonies have been found.",
      "Fossils show growth stages from hatchlings to adults."
    ]
  },
  kentrosaurus: {
    lived: "Late Jurassic, about 155-150 million years ago",
    where: "Tanzania",
    habitat: "Warm floodplains with seasonal plant growth",
    diet: "Herbivore",
    facts: [
      "It was a smaller relative of Stegosaurus.",
      "It had plates near the shoulders and long spikes toward the hips and tail.",
      "Its spikes were probably important for defense."
    ]
  },
  utahraptor: {
    lived: "Early Cretaceous, about 135-130 million years ago",
    where: "Utah, United States",
    habitat: "Seasonal floodplains and semi-arid habitats",
    diet: "Carnivore",
    facts: [
      "It was much larger than Velociraptor.",
      "It had a huge sickle claw on each foot.",
      "It probably had feathers like other dromaeosaurs."
    ]
  },
  tarbosaurus: {
    lived: "Late Cretaceous, about 70 million years ago",
    where: "Mongolia and northern China",
    habitat: "River floodplains, woodlands, and semi-arid plains",
    diet: "Carnivore; hunted and scavenged large dinosaurs",
    facts: ["It was a close Asian relative of Tyrannosaurus rex.", "Its skull was deep and powerful.", "Its arms were small with two-fingered hands."]
  },
  torosaurus: {
    lived: "Late Cretaceous, about 68-66 million years ago",
    where: "Western North America",
    habitat: "Floodplains, open woodland, and coastal lowlands",
    diet: "Herbivore",
    facts: ["It had one of the longest frills among horned dinosaurs.", "It carried two long brow horns and a smaller nose horn.", "Scientists have debated its relationship to Triceratops."]
  },
  pachyrhinosaurus: {
    lived: "Late Cretaceous, about 73-69 million years ago",
    where: "Alaska and western Canada",
    habitat: "Cool coastal plains, river valleys, and forests",
    diet: "Herbivore",
    facts: ["Its name means 'thick-nosed lizard.'", "It had a rough bony boss on its nose.", "Large bonebeds suggest it may have gathered in groups."]
  },
  carcharodontosaurus: {
    lived: "Late Cretaceous, about 100-94 million years ago",
    where: "North Africa",
    habitat: "River systems, deltas, and warm floodplains",
    diet: "Carnivore",
    facts: ["Its name means 'shark-toothed lizard.'", "Its teeth were serrated like steak knives.", "It was one of the giant predators of Cretaceous Africa."]
  },
  mapusaurus: {
    lived: "Late Cretaceous, about 97-93 million years ago",
    where: "Argentina",
    habitat: "Warm floodplains and river channels",
    diet: "Carnivore",
    facts: ["It was closely related to Giganotosaurus.", "Several individuals were found together in one fossil site.", "It belonged to the carcharodontosaurids."]
  },
  camarasaurus: {
    lived: "Late Jurassic, about 155-145 million years ago",
    where: "Western North America",
    habitat: "Seasonal floodplains with conifers, ferns, and open woodland",
    diet: "Herbivore",
    facts: ["It had a boxy skull with spoon-shaped teeth.", "It was one of the more common sauropods of the Morrison Formation.", "Its body was shorter and sturdier than Diplodocus."]
  },
  brontosaurus: {
    lived: "Late Jurassic, about 156-146 million years ago",
    where: "Western North America",
    habitat: "River floodplains and open woodland",
    diet: "Herbivore",
    facts: ["Its name means 'thunder lizard.'", "It was a robust relative of Apatosaurus.", "It had a long neck and long tail balanced on a massive body."]
  },
  sauropelta: {
    lived: "Early Cretaceous, about 108 million years ago",
    where: "Western North America",
    habitat: "Floodplains, forests, and river-edge habitats",
    diet: "Herbivore",
    facts: ["It had large spikes projecting from the shoulder area.", "It was a nodosaur, an armored dinosaur without a tail club.", "Bony plates protected its back and sides."]
  },
  nodosaurus: {
    lived: "Late Cretaceous, about 95-90 million years ago",
    where: "North America",
    habitat: "Coastal plains and lowland forests",
    diet: "Herbivore",
    facts: ["It gave its name to the nodosaur family.", "It had armor plates but no heavy tail club.", "Its low body helped shield it from predators."]
  },
  struthiomimus: {
    lived: "Late Cretaceous, about 77-66 million years ago",
    where: "Western North America",
    habitat: "Open floodplains and lightly wooded plains",
    diet: "Likely omnivore",
    facts: ["Its name means 'ostrich mimic.'", "It had long arms and hands with three fingers.", "Its long legs suggest it was a fast runner."]
  },
  ornithomimus: {
    lived: "Late Cretaceous, about 76-66 million years ago",
    where: "Western North America",
    habitat: "Floodplains, open woodland, and coastal plains",
    diet: "Likely omnivore",
    facts: ["It had a toothless beak.", "Some relatives preserve feather impressions.", "Its body plan looked much like a modern ostrich."]
  },
  ouranosaurus: {
    lived: "Early Cretaceous, about 125-112 million years ago",
    where: "Niger, Africa",
    habitat: "River floodplains and warm seasonal lowlands",
    diet: "Herbivore",
    facts: ["It had tall spines along its back.", "It was related to Iguanodon.", "It had thumb spikes and a broad beaked mouth."]
  },
  dryosaurus: {
    lived: "Late Jurassic, about 155-145 million years ago",
    where: "Western North America and Tanzania",
    habitat: "Open woodland and floodplains",
    diet: "Herbivore",
    facts: ["It was a small, nimble plant-eater.", "Its long hind legs suggest quick running.", "Its stiff tail helped with balance."]
  },
  citipati: {
    lived: "Late Cretaceous, about 75-71 million years ago",
    where: "Mongolia",
    habitat: "Dry dunes and semi-arid plains",
    diet: "Omnivore",
    facts: ["Fossils show adults sitting on nests.", "It had a short beak and a tall head crest.", "It was likely covered in feathers."]
  },
  majungasaurus: {
    lived: "Late Cretaceous, about 70-66 million years ago",
    where: "Madagascar",
    habitat: "Seasonal floodplains and dry woodland",
    diet: "Carnivore",
    facts: ["It had a short, deep skull.", "Its arms were extremely small.", "Fossil evidence suggests it sometimes bit other Majungasaurus."]
  },
  coelophysis: {
    lived: "Late Triassic, about 216-203 million years ago",
    where: "Southwestern United States",
    habitat: "Seasonal river plains and dry lowlands",
    diet: "Carnivore",
    facts: ["It was a slim early theropod.", "Many fossils were found at Ghost Ranch in New Mexico.", "Its light body and long legs made it an agile hunter."]
  }
};

const quizChoicePools = {
  tyrannosaur: ["Tyrannosaurus rex", "Tarbosaurus", "Daspletosaurus", "Albertosaurus", "Gorgosaurus", "Alioramus"],
  ceratopsian: ["Triceratops", "Torosaurus", "Styracosaurus", "Centrosaurus", "Protoceratops", "Pachyrhinosaurus", "Chasmosaurus"],
  spinosaurid: ["Spinosaurus", "Baryonyx", "Suchomimus", "Irritator", "Siamosaurus", "Ichthyovenator"],
  hadrosaur: ["Parasaurolophus", "Corythosaurus", "Lambeosaurus", "Edmontosaurus", "Maiasaura", "Saurolophus", "Gryposaurus"],
  allosauroid: ["Allosaurus", "Saurophaganax", "Torvosaurus", "Ceratosaurus", "Monolophosaurus", "Yangchuanosaurus"],
  carcharodontosaur: ["Giganotosaurus", "Carcharodontosaurus", "Mapusaurus", "Acrocanthosaurus", "Concavenator", "Allosaurus"],
  sauropod: ["Brachiosaurus", "Diplodocus", "Apatosaurus", "Camarasaurus", "Brontosaurus", "Barosaurus", "Giraffatitan"],
  stegosaur: ["Stegosaurus", "Kentrosaurus", "Huayangosaurus", "Tuojiangosaurus", "Dacentrurus", "Miragaia"],
  ankylosaur: ["Ankylosaurus", "Euoplocephalus", "Nodosaurus", "Sauropelta", "Minmi", "Gastonia"],
  dromaeosaur: ["Velociraptor", "Deinonychus", "Utahraptor", "Dromaeosaurus", "Dakotaraptor", "Achillobator"],
  ornithomimid: ["Gallimimus", "Struthiomimus", "Ornithomimus", "Deinocheirus", "Anserimimus", "Harpymimus"],
  pachycephalosaur: ["Pachycephalosaurus", "Stygimoloch", "Dracorex", "Stegoceras", "Prenocephale", "Homalocephale"],
  ornithopod: ["Iguanodon", "Mantellisaurus", "Ouranosaurus", "Camptosaurus", "Tenontosaurus", "Dryosaurus"],
  paravian: ["Microraptor", "Archaeopteryx", "Anchiornis", "Confuciusornis", "Rahonavis", "Yi qi"],
  therizinosaur: ["Therizinosaurus", "Nothronychus", "Segnosaurus", "Erlikosaurus", "Beipiaosaurus", "Falcarius"],
  oviraptorid: ["Oviraptor", "Citipati", "Conchoraptor", "Khaan", "Anzu", "Gigantoraptor"],
  abelisaurid: ["Carnotaurus", "Majungasaurus", "Rajasaurus", "Aucasaurus", "Skorpiovenator", "Abelisaurus"],
  theropod: ["Dilophosaurus", "Coelophysis", "Cryolophosaurus", "Ceratosaurus", "Sinosaurus", "Megapnosaurus"]
};

const geneGoals = {
  speed: {
    label: "Speed Hunter",
    picks: { body: "B", head: "B", tail: 1, legs: 0, armor: 0, detail: 0 },
    challenge: "Can Isaac build a predator that reaches Speed 80 without dropping Strength below 45?",
    note: "Fast animals usually need lighter bodies, long balancing tails, and limbs built for stride length."
  },
  strength: {
    label: "Bone Crusher",
    picks: { body: 0, head: 0, tail: "A", legs: 2, armor: "B", detail: 0 },
    challenge: "Can Isaac make a dinosaur with Strength 80 and Ferocity 75, but still enough Speed to chase prey?",
    note: "Strength comes from skull leverage, muscle attachment, body mass, and stable legs."
  },
  tank: {
    label: "Armored Survivor",
    picks: { body: 2, head: 1, tail: 1, legs: 3, armor: 1, detail: 1 },
    challenge: "Can Isaac build a herbivore that survives predators with Defense 85 and Strength 65?",
    note: "Armor is powerful, but heavy defenses can trade away speed and agility."
  },
  balanced: {
    label: "Balanced Apex",
    picks: { body: "A", head: "B", tail: 2, legs: "B", armor: "A", detail: "B" },
    challenge: "Can Isaac create a dinosaur with every trait above 55, like a balanced ecosystem specialist?",
    note: "Evolution is tradeoffs: the best dinosaur depends on habitat, food, predators, and body plan."
  }
};

const state = {
  body: 0,
  head: 0,
  tail: 2,
  legs: 2,
  armor: 0,
  detail: 0,
  baseColor: "#5f7f45",
  bellyColor: "#d0c09a",
  pattern: "scales",
  size: 100,
  posture: 0,
  fossilName: true,
  dnaA: "tyrannosaurus",
  dnaB: "velociraptor",
  dnaGoal: "speed",
  dnaBoost: { speed: 0, strength: 0, defense: 0, reach: 0, ferocity: 0 },
  lastSplice: null,
  quizIndex: 0,
  quizScore: 0,
  quizTotal: 0,
  quizStreak: 0,
  quizAnswered: false,
  quizPotential: 10,
  quizHintsUsed: 0,
  currentItem: null,
  quizDifficulty: "easy",
  quizOrder: [],
  galleryPage: 0,
  galleryQuizPage: 0,
  galleryQuizRevealed: new Set(),
  offsets: {}
};

const layers = {
  body: document.querySelector("#bodyLayer"),
  head: document.querySelector("#headLayer"),
  neck: document.querySelector("#neckLayer"),
  tail: document.querySelector("#tailLayer"),
  backLeg: document.querySelector("#backLegLayer"),
  frontLeg: document.querySelector("#frontLegLayer"),
  armor: document.querySelector("#armorLayer"),
  detail: document.querySelector("#detailLayer")
};

const svg = document.querySelector("#dinoSvg");
const dino = document.querySelector("#dino");
const partControls = document.querySelector("#partControls");
const template = document.querySelector("#slotTemplate");
const nameEl = document.querySelector("#dinoName");
const dnaASelect = document.querySelector("#dnaA");
const dnaBSelect = document.querySelector("#dnaB");
const dnaGoalSelect = document.querySelector("#dnaGoal");
const geneList = document.querySelector("#geneList");
const fossilNote = document.querySelector("#fossilNote");
const challengeText = document.querySelector("#challengeText");
const badgeRow = document.querySelector("#badgeRow");
const quizImage = document.querySelector("#quizImage");
const quizOptions = document.querySelector("#quizOptions");
const quizFeedback = document.querySelector("#quizFeedback");
const quizScore = document.querySelector("#quizScore");
const quizTotal = document.querySelector("#quizTotal");
const quizStreak = document.querySelector("#quizStreak");
const nextQuizBtn = document.querySelector("#nextQuizBtn");
const quizDifficulty = document.querySelector("#quizDifficulty");
const quizPotential = document.querySelector("#quizPotential");
const hintQuizBtn = document.querySelector("#hintQuizBtn");
const quizEra = document.querySelector("#quizEra");
const quizView = document.querySelector("#quizView");
const quizPrompt = document.querySelector("#quizPrompt");
const landingPrint = document.querySelector("#landingPrint");
const galleryPrint = document.querySelector("#galleryPrint");
const galleryTabs = document.querySelector("#galleryTabs");
const galleryGrid = document.querySelector("#galleryGrid");
const galleryPrintPages = document.querySelector("#galleryPrintPages");
const galleryQuizTabs = document.querySelector("#galleryQuizTabs");
const galleryQuizGrid = document.querySelector("#galleryQuizGrid");
const galleryQuizPrint = document.querySelector("#galleryQuizPrint");
const galleryQuizPrintPages = document.querySelector("#galleryQuizPrintPages");

function path(attrs) {
  return `<path ${attrs}></path>`;
}

function ellipse(attrs) {
  return `<ellipse ${attrs}></ellipse>`;
}

function polygon(attrs) {
  return `<polygon ${attrs}></polygon>`;
}

function line(attrs) {
  return `<path class="crease" ${attrs}></path>`;
}

function tendon(attrs) {
  return `<path class="tendon" ${attrs}></path>`;
}

function textureShape(tag, attrs) {
  return tag === "ellipse"
    ? ellipse(`class="pattern patternFill" ${attrs}`)
    : path(`class="pattern patternFill" ${attrs}`);
}

function bodyMarkup(kind) {
  const bodies = {
    rex: `
      ${ellipse('class="skin" cx="450" cy="285" rx="180" ry="78"')}
      ${path('class="skin-shadow" d="M292 300 C382 354 535 360 622 302 C592 360 383 381 302 330Z"')}
      ${path('class="belly" d="M318 296 C383 350 532 355 604 300 C548 335 393 335 318 296Z"')}
      ${path('class="skin-highlight" d="M336 260 C405 230 523 229 588 265 C522 250 412 251 336 260Z"')}
      ${textureShape("ellipse", 'cx="450" cy="280" rx="171" ry="67"')}
      ${line('d="M349 278 C397 266 458 264 519 272"')}
      ${line('d="M383 319 C430 335 505 335 562 318"')}`,
    sauropod: `
      ${ellipse('class="skin" cx="458" cy="292" rx="205" ry="66"')}
      ${path('class="skin-shadow" d="M267 303 C366 354 565 358 662 306 C626 364 338 372 267 326Z"')}
      ${path('class="belly" d="M278 305 C378 350 557 350 655 305 C574 328 373 330 278 305Z"')}
      ${path('class="skin-highlight" d="M304 266 C391 239 528 240 617 267 C525 257 394 258 304 266Z"')}
      ${textureShape("ellipse", 'cx="458" cy="288" rx="195" ry="58"')}
      ${line('d="M336 283 C405 272 506 273 587 285"')}`,
    ceratops: `
      ${path('class="skin" d="M285 290 C325 216 548 208 628 273 C680 316 618 365 455 363 C317 360 246 333 285 290Z"')}
      ${path('class="skin-shadow" d="M278 306 C365 357 551 370 637 316 C604 374 332 385 267 334Z"')}
      ${path('class="belly" d="M300 310 C380 352 540 358 620 309 C560 334 384 336 300 310Z"')}
      ${path('class="skin-highlight" d="M313 272 C375 229 527 224 601 278 C518 257 390 257 313 272Z"')}
      ${textureShape("path", 'd="M297 284 C356 232 540 225 617 280 C567 312 354 314 297 284Z"')}
      ${line('d="M342 292 C414 280 520 282 587 300"')}`,
    raptor: `
      ${path('class="skin" d="M303 298 C366 230 526 228 601 283 C630 315 593 348 470 349 C365 350 285 330 303 298Z"')}
      ${path('class="skin-shadow" d="M303 313 C382 350 535 356 609 313 C579 359 367 371 293 328Z"')}
      ${path('class="belly" d="M331 311 C399 340 525 341 585 309 C522 327 398 328 331 311Z"')}
      ${path('class="skin-highlight" d="M335 276 C398 246 514 246 579 282 C503 267 407 267 335 276Z"')}
      ${textureShape("path", 'd="M322 288 C390 250 518 248 586 286 C526 302 393 303 322 288Z"')}
      ${line('d="M355 295 C418 284 505 286 566 301"')}`
  };
  return draggable("body", bodies[kind]);
}

function neckMarkup(bodyKind) {
  const neck = bodyKind === "sauropod"
    ? `${path('class="skin" d="M585 257 C620 180 658 126 704 96 C731 80 749 104 731 126 C692 174 657 223 634 288Z"')}
       ${path('class="skin-highlight" d="M628 204 C651 155 679 120 710 101 C680 140 656 186 635 249Z"')}
       ${path('class="skin-shadow" d="M607 266 C646 220 677 171 724 120 C704 180 671 239 634 288Z"')}
       ${textureShape("path", 'd="M600 254 C632 184 664 132 704 102 C716 96 727 104 725 116 C686 166 656 218 633 278Z"')}
       ${line('d="M636 219 C658 208 680 203 705 207"')}`
    : `${path('class="skin" d="M585 268 C631 237 663 228 693 238 C704 242 704 264 688 272 C655 286 624 290 585 306Z"')}
       ${path('class="skin-shadow" d="M594 291 C633 283 665 282 692 267 C655 293 624 301 585 306Z"')}
       ${path('class="skin-highlight" d="M604 265 C637 244 668 239 691 246 C658 251 632 260 604 265Z"')}
       ${line('d="M619 278 C644 268 666 265 686 266"')}`;
  return draggable("neck", neck);
}

function headMarkup(kind) {
  const heads = {
    rex: `
      ${path('class="skin head-skin" d="M655 214 C708 184 788 198 805 243 C820 284 765 302 706 288 C666 279 635 244 655 214Z"')}
      ${path('class="skin-shadow" d="M681 262 C725 289 780 282 805 245 C804 291 745 306 699 288Z"')}
      ${path('class="belly" d="M696 260 C732 281 777 278 802 253 C786 297 718 303 682 274Z"')}
      ${path('class="skin-highlight" d="M676 218 C711 202 762 207 789 229 C750 219 711 218 676 218Z"')}
      ${textureShape("path", 'd="M664 220 C710 197 781 207 801 244 C773 259 704 258 664 220Z"')}
      ${path('class="tooth" d="M723 281 l12 30 l12 -30Z"')}
      ${path('class="tooth" d="M754 284 l10 25 l11 -25Z"')}
      ${ellipse('class="eye" cx="746" cy="226" rx="8" ry="6"')}
      ${ellipse('class="pupil" cx="749" cy="226" rx="3" ry="5"')}
      ${ellipse('class="nostril" cx="789" cy="247" rx="5" ry="3"')}
      ${line('d="M694 247 C727 240 766 241 798 251"')}`,
    trike: `
      ${path('class="skin" d="M637 224 C667 177 744 177 776 224 C807 270 763 306 702 300 C655 296 613 262 637 224Z"')}
      ${path('class="skin" d="M631 205 C612 162 648 130 701 147 C756 127 797 160 775 207 C744 190 670 188 631 205Z"')}
      ${path('class="skin-shadow" d="M637 269 C682 302 755 298 787 252 C778 303 719 318 667 296Z"')}
      ${path('class="skin-highlight" d="M642 202 C676 170 734 166 770 202 C723 187 681 188 642 202Z"')}
      ${textureShape("path", 'd="M637 224 C667 177 744 177 776 224 C758 250 660 250 637 224Z"')}
      ${path('class="horn" d="M688 207 l-20 -67 l42 54Z"')}
      ${path('class="horn" d="M735 207 l34 -61 l-5 70Z"')}
      ${path('class="horn" d="M715 246 l27 42 l-44 -22Z"')}
      ${ellipse('class="eye" cx="725" cy="226" rx="8" ry="6"')}
      ${ellipse('class="pupil" cx="728" cy="226" rx="3" ry="5"')}
      ${ellipse('class="nostril" cx="770" cy="251" rx="5" ry="3"')}
      ${line('d="M650 214 C682 202 728 202 765 216"')}`,
    duck: `
      ${path('class="skin" d="M640 230 C690 186 765 202 804 248 C766 292 682 296 642 262 C629 251 629 240 640 230Z"')}
      ${path('class="skin" d="M673 204 C681 161 733 160 750 204 C727 194 697 194 673 204Z"')}
      ${path('class="skin-shadow" d="M674 272 C723 292 777 276 804 248 C785 297 711 309 666 279Z"')}
      ${path('class="belly" d="M690 270 C735 284 778 275 804 248 C791 301 711 309 666 279Z"')}
      ${path('class="skin-highlight" d="M666 225 C706 202 758 211 792 240 C752 226 709 222 666 225Z"')}
      ${textureShape("path", 'd="M651 231 C692 203 758 211 792 247 C755 260 694 258 651 231Z"')}
      ${ellipse('class="eye" cx="728" cy="227" rx="8" ry="6"')}
      ${ellipse('class="pupil" cx="731" cy="227" rx="3" ry="5"')}
      ${ellipse('class="nostril" cx="789" cy="250" rx="5" ry="3"')}
      ${line('d="M668 250 C704 244 752 246 792 253"')}`,
    raptor: `
      ${path('class="skin" d="M650 225 C697 190 776 209 800 249 C765 279 700 286 656 263 C637 253 635 237 650 225Z"')}
      ${path('class="skin-shadow" d="M674 264 C720 286 767 277 800 249 C782 287 713 299 656 263Z"')}
      ${path('class="skin-highlight" d="M669 222 C708 205 757 212 790 240 C747 227 706 225 669 222Z"')}
      ${textureShape("path", 'd="M655 226 C700 201 772 213 796 248 C759 260 697 256 655 226Z"')}
      ${path('class="tooth" d="M718 272 l9 22 l10 -21Z"')}
      ${path('class="tooth" d="M747 274 l8 20 l9 -20Z"')}
      ${ellipse('class="eye" cx="728" cy="225" rx="8" ry="6"')}
      ${ellipse('class="pupil" cx="731" cy="225" rx="3" ry="5"')}
      ${ellipse('class="nostril" cx="787" cy="248" rx="5" ry="3"')}
      ${line('d="M677 246 C713 238 758 240 791 250"')}`
  };
  return draggable("head", heads[kind]);
}

function tailMarkup(kind) {
  const tails = {
    whip: `
      ${path('class="skin" d="M290 292 C196 238 100 231 44 266 C118 276 198 309 306 325Z"')}
      ${path('class="skin-shadow" d="M83 266 C150 281 225 306 306 325 C208 326 120 293 44 266Z"')}
      ${textureShape("path", 'd="M290 292 C196 238 100 231 44 266 C118 276 198 309 306 325Z"')}
      ${tendon('d="M92 266 C158 270 228 291 294 313"')}`,
    club: `
      ${path('class="skin" d="M298 300 C205 255 125 262 77 292 C139 309 217 325 308 326Z"')}
      ${ellipse('class="skin" cx="70" cy="294" rx="42" ry="27"')}
      ${ellipse('class="skin-shadow" cx="65" cy="306" rx="34" ry="13"')}
      ${textureShape("path", 'd="M298 300 C205 255 125 262 77 292 C139 309 217 325 308 326Z"')}
      ${tendon('d="M104 293 C169 292 234 305 298 321"')}`,
    raptor: `
      ${path('class="skin" d="M306 294 C214 239 123 229 58 248 C118 270 214 310 316 324Z"')}
      ${path('class="skin-shadow" d="M95 254 C159 276 233 308 316 324 C215 321 119 279 58 248Z"')}
      ${textureShape("path", 'd="M306 294 C214 239 123 229 58 248 C118 270 214 310 316 324Z"')}
      ${tendon('d="M92 252 C164 259 236 289 305 315"')}`,
    spike: `
      ${path('class="skin" d="M300 300 C210 254 123 254 64 286 C130 301 214 321 312 326Z"')}
      ${path('class="skin-shadow" d="M96 286 C157 298 231 317 312 326 C221 331 128 309 64 286Z"')}
      ${textureShape("path", 'd="M300 300 C210 254 123 254 64 286 C130 301 214 321 312 326Z"')}
      ${polygon('class="horn" points="82,263 64,226 111,260"')}${polygon('class="horn" points="125,272 111,235 153,270"')}
      ${tendon('d="M101 284 C166 288 238 306 300 320"')}`
  };
  return draggable("tail", tails[kind]);
}

function legMarkup(kind, side) {
  const x = side === "front" ? 535 : 350;
  const flip = side === "front" ? 1 : -1;
  const legs = {
    runner: `
      ${path(`class="skin" d="M${x} 326 C${x + 18 * flip} 366 ${x + 4 * flip} 392 ${x + 33 * flip} 420 C${x + 9 * flip} 429 ${x - 31 * flip} 426 ${x - 48 * flip} 417 C${x - 18 * flip} 390 ${x - 12 * flip} 354 ${x - 33 * flip} 326Z"`)}
      ${ellipse(`class="joint" cx="${x - 15 * flip}" cy="348" rx="25" ry="17"`)}
      ${path(`class="skin-shadow" d="M${x - 17 * flip} 364 C${x + 9 * flip} 391 ${x + 14 * flip} 407 ${x + 33 * flip} 420 C${x + 4 * flip} 426 ${x - 28 * flip} 423 ${x - 48 * flip} 417 C${x - 24 * flip} 394 ${x - 21 * flip} 376 ${x - 17 * flip} 364Z"`)}
      ${tendon(`d="M${x - 18 * flip} 347 C${x - 7 * flip} 372 ${x + 3 * flip} 396 ${x + 29 * flip} 417"`)}
      ${path(`class="claw" d="M${x + 31 * flip} 418 l45 8 l-43 13Z"`)}`,
    pillar: `
      ${path(`class="skin" d="M${x - 34} 324 L${x + 34} 324 L${x + 48} 420 L${x - 48} 420Z"`)}
      ${ellipse(`class="joint" cx="${x}" cy="346" rx="38" ry="18"`)}
      ${path(`class="skin-shadow" d="M${x - 5} 332 L${x + 34} 324 L${x + 48} 420 L${x + 9} 420Z"`)}
      ${tendon(`d="M${x - 16} 338 C${x - 8} 368 ${x - 10} 392 ${x - 20} 418"`)}
      ${path(`class="claw" d="M${x - 45} 418 l102 0 l-28 18 l-78 0Z"`)}`,
    stalker: `
      ${path(`class="skin" d="M${x} 324 C${x + 36 * flip} 354 ${x + 12 * flip} 381 ${x + 70 * flip} 414 C${x + 33 * flip} 428 ${x - 10 * flip} 424 ${x - 38 * flip} 410 C${x - 8 * flip} 380 ${x - 22 * flip} 354 ${x - 45 * flip} 324Z"`)}
      ${ellipse(`class="joint" cx="${x - 18 * flip}" cy="347" rx="31" ry="19"`)}
      ${path(`class="skin-shadow" d="M${x - 7 * flip} 365 C${x + 20 * flip} 388 ${x + 42 * flip} 402 ${x + 70 * flip} 414 C${x + 33 * flip} 428 ${x - 10 * flip} 424 ${x - 38 * flip} 410 C${x - 16 * flip} 392 ${x - 11 * flip} 376 ${x - 7 * flip} 365Z"`)}
      ${tendon(`d="M${x - 24 * flip} 348 C${x - 7 * flip} 374 ${x + 21 * flip} 397 ${x + 65 * flip} 413"`)}
      ${path(`class="claw" d="M${x + 67 * flip} 412 l44 10 l-45 13Z"`)}`,
    quad: `
      ${path(`class="skin" d="M${x - 36} 322 C${x - 60} 360 ${x - 52} 388 ${x - 44} 421 L${x + 3} 421 C${x - 4} 383 ${x + 5} 352 ${x + 34} 322Z"`)}
      ${ellipse(`class="joint" cx="${x - 13}" cy="347" rx="34" ry="18"`)}
      ${path(`class="skin-shadow" d="M${x - 19} 354 C${x - 31} 382 ${x - 27} 402 ${x - 19} 421 L${x + 3} 421 C${x - 4} 383 ${x + 5} 352 ${x + 34} 322 C${x + 12} 338 ${x - 5} 345 ${x - 19} 354Z"`)}
      ${tendon(`d="M${x - 31} 344 C${x - 20} 372 ${x - 18} 395 ${x - 27} 419"`)}
      ${path(`class="claw" d="M${x - 51} 419 l73 0 l-20 15 l-55 0Z"`)}`
  };
  return draggable(`${side}Leg`, legs[kind]);
}

function armorMarkup(kind) {
  if (kind === "none") return "";
  if (kind === "plates") {
    return draggable("armor", `
      ${polygon('class="skin" points="314,242 346,174 378,245"')}
      ${polygon('class="skin" points="383,226 421,145 459,232"')}
      ${polygon('class="skin" points="468,226 506,150 543,236"')}
      ${polygon('class="skin" points="552,242 588,184 613,255"')}
      ${line('d="M346 185 L348 235"')}${line('d="M421 157 L423 222"')}${line('d="M506 163 L508 228"')}${line('d="M588 194 L590 242"')}`);
  }
  if (kind === "sail") {
    return draggable("armor", `
      ${path('class="skin" d="M334 252 C402 86 512 96 592 253 C501 223 411 222 334 252Z"')}
      ${path('class="skin-highlight" d="M384 230 C430 123 498 133 552 231 C497 213 436 212 384 230Z"')}
      ${line('d="M408 229 C420 178 428 135 438 104"')}${line('d="M476 223 C477 170 477 130 478 98"')}${line('d="M540 231 C524 178 511 139 499 110"')}`);
  }
  return draggable("armor", `
    ${polygon('class="horn" points="590,255 612,210 626,263"')}
    ${polygon('class="horn" points="626,246 653,204 660,260"')}
    ${polygon('class="horn" points="660,241 690,209 688,262"')}`);
}

function detailMarkup(kind) {
  const details = {
    claws: `
      ${path('class="claw" d="M592 417 l42 7 l-43 15Z"')}${path('class="claw" d="M403 416 l40 8 l-40 14Z"')}
      ${path('class="claw" d="M611 415 l31 4 l-31 11Z"')}${path('class="claw" d="M421 416 l29 5 l-30 10Z"')}`,
    beak: `
      ${path('class="horn" d="M788 249 C832 252 836 274 796 281 C810 267 810 257 788 249Z"')}
      ${tendon('d="M795 255 C811 259 818 264 814 272"')}`,
    feathers: `
      ${path('class="feather" d="M316 246 C272 214 260 178 291 142 C306 183 333 209 373 229Z"')}
      ${path('class="feather" d="M342 243 C306 211 300 184 324 154 C337 189 356 212 391 231Z"')}
      ${path('class="feather" d="M525 241 C568 205 585 170 559 132 C539 180 510 210 464 231Z"')}
      ${path('class="feather" d="M494 239 C535 209 549 181 532 151 C513 188 489 212 449 230Z"')}
      ${tendon('d="M292 150 C309 184 331 210 366 227"')}${tendon('d="M558 141 C540 181 514 209 471 229"')}`,
    crest: `
      ${path('class="skin" d="M692 207 C710 156 757 158 772 211 C748 196 717 195 692 207Z"')}
      ${path('class="skin-highlight" d="M712 199 C724 169 749 169 761 202 C745 194 727 193 712 199Z"')}
      ${line('d="M728 195 C730 180 732 169 735 160"')}`
  };
  return draggable("detail", details[kind]);
}

function draggable(part, markup) {
  const offset = state.offsets[part] || { x: 0, y: 0 };
  return `<g class="part" data-part="${part}" transform="translate(${offset.x} ${offset.y})">${markup}</g>`;
}

function setPattern() {
  const patternEls = document.querySelectorAll(".patternFill");
  patternEls.forEach((el) => {
    if (state.pattern === "plain") {
      el.setAttribute("fill", "transparent");
    } else {
      el.setAttribute("fill", state.pattern === "stripes" ? "url(#stripePattern)" : "url(#scalePattern)");
    }
  });
  document.documentElement.style.setProperty("--pattern-opacity", state.pattern === "plain" ? "0" : ".55");
}

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16)
  };
}

function rgbToHex({ r, g, b }) {
  const toHex = (value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function mixColor(hex, target, amount) {
  const from = hexToRgb(hex);
  const to = hexToRgb(target);
  return rgbToHex({
    r: from.r + (to.r - from.r) * amount,
    g: from.g + (to.g - from.g) * amount,
    b: from.b + (to.b - from.b) * amount
  });
}

function setSkinPalette() {
  const palette = {
    "--skin": state.baseColor,
    "--skin-light": mixColor(state.baseColor, "#f2e6b8", .28),
    "--skin-glow": mixColor(state.baseColor, "#fff3c0", .42),
    "--skin-dark": mixColor(state.baseColor, "#10170e", .52),
    "--skin-shadow": mixColor(state.baseColor, "#060805", .68),
    "--skin-line": mixColor(state.baseColor, "#050604", .72),
    "--belly": state.bellyColor,
    "--belly-light": mixColor(state.bellyColor, "#fff4cc", .38),
    "--belly-dark": mixColor(state.bellyColor, "#5b4d31", .42)
  };
  Object.entries(palette).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
    dino.style.setProperty(key, value);
  });
}

function renderDino() {
  const selected = getSelected();
  layers.tail.innerHTML = tailMarkup(selected.tail.id);
  layers.backLeg.innerHTML = legMarkup(selected.legs.id, "back");
  layers.body.innerHTML = bodyMarkup(selected.body.id);
  layers.frontLeg.innerHTML = legMarkup(selected.legs.id, "front");
  layers.neck.innerHTML = neckMarkup(selected.body.id);
  layers.head.innerHTML = headMarkup(selected.head.id);
  layers.armor.innerHTML = armorMarkup(selected.armor.id);
  layers.detail.innerHTML = detailMarkup(selected.detail.id);
  setSkinPalette();
  const scale = state.size / 100;
  dino.setAttribute("transform", `translate(${450 - 450 * scale} ${310 - 310 * scale}) scale(${scale}) rotate(${state.posture} 450 310)`);
  setPattern();
  enableDrag();
  const scores = updateScores();
  renderDnaReport(scores);
  updateName();
}

function getSelected() {
  return Object.fromEntries(Object.keys(slots).map((key) => [key, slots[key][state[key]]]));
}

function getSpecies(id) {
  return speciesLab.find((species) => species.id === id) || speciesLab[0];
}

function buildDnaLab() {
  [dnaASelect, dnaBSelect].forEach((select) => {
    speciesLab.forEach((species) => {
      const option = document.createElement("option");
      option.value = species.id;
      option.textContent = species.name;
      select.appendChild(option);
    });
  });
  dnaASelect.value = state.dnaA;
  dnaBSelect.value = state.dnaB;
  dnaGoalSelect.value = state.dnaGoal;
  renderDnaReport();
}

function resolveGenePick(pick, sampleA, sampleB, slotName) {
  if (pick === "A") return sampleA.build[slotName];
  if (pick === "B") return sampleB.build[slotName];
  return pick;
}

function blendBoost(sampleA, sampleB, goal) {
  const boost = { speed: 0, strength: 0, defense: 0, reach: 0, ferocity: 0 };
  Object.keys(boost).forEach((key) => {
    boost[key] = Math.round((sampleA.boost[key] + sampleB.boost[key]) / 3);
  });
  const goalBoosts = {
    speed: { speed: 18, strength: 2, defense: -2, reach: 1, ferocity: 4 },
    strength: { speed: -2, strength: 20, defense: 3, reach: 2, ferocity: 8 },
    tank: { speed: -5, strength: 10, defense: 22, reach: 1, ferocity: 2 },
    balanced: { speed: 8, strength: 8, defense: 8, reach: 8, ferocity: 8 }
  }[goal];
  Object.entries(goalBoosts).forEach(([key, value]) => {
    boost[key] += value;
  });
  return boost;
}

function spliceDna() {
  const sampleA = getSpecies(state.dnaA);
  const sampleB = getSpecies(state.dnaB);
  const goal = geneGoals[state.dnaGoal];
  Object.keys(slots).forEach((slotName) => {
    state[slotName] = resolveGenePick(goal.picks[slotName], sampleA, sampleB, slotName);
  });
  state.baseColor = mixColor(sampleA.colors[0], sampleB.colors[0], .5);
  state.bellyColor = mixColor(sampleA.colors[1], sampleB.colors[1], .5);
  state.pattern = state.dnaGoal === "speed" ? "stripes" : "scales";
  state.size = state.dnaGoal === "speed" ? 92 : state.dnaGoal === "strength" ? 112 : state.dnaGoal === "tank" ? 108 : 100;
  state.posture = state.dnaGoal === "speed" ? -6 : state.dnaGoal === "strength" ? 5 : 0;
  state.dnaBoost = blendBoost(sampleA, sampleB, state.dnaGoal);
  state.lastSplice = {
    sampleA: sampleA.id,
    sampleB: sampleB.id,
    goal: state.dnaGoal
  };
  state.offsets = {};
  syncInputs();
  refreshControls();
  renderDino();
  showTab("parts");
  runFieldTest();
}

function renderDnaReport(scores = updateScores()) {
  const sampleA = getSpecies(state.dnaA);
  const sampleB = getSpecies(state.dnaB);
  const goal = geneGoals[state.dnaGoal];
  if (!geneList) return;
  geneList.innerHTML = [
    ["Sample A", sampleA.name],
    ["Sample B", sampleB.name],
    ["Goal", goal.label],
    ["Best trait", topTrait(scores)],
    ["Era clue", `${sampleA.period} + ${sampleB.period}`],
    ["Diet clue", `${sampleA.diet} / ${sampleB.diet}`]
  ].map(([label, value]) => `<div><span>${label}</span><b>${value}</b></div>`).join("");
  fossilNote.textContent = `${sampleA.name}: ${sampleA.trait}. ${sampleB.name}: ${sampleB.trait}. ${goal.note}`;
  challengeText.textContent = goal.challenge;
  renderBadges(scores);
}

function topTrait(scores) {
  const labelMap = { speed: "Speed", strength: "Strength", defense: "Defense", reach: "Reach", ferocity: "Ferocity" };
  const [key, value] = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  return `${labelMap[key]} ${value}`;
}

function renderBadges(scores) {
  const badges = [
    { label: "Sprint", pass: scores.speed >= 80 },
    { label: "Crusher", pass: scores.strength >= 80 },
    { label: "Shield", pass: scores.defense >= 80 },
    { label: "Apex", pass: scores.ferocity >= 75 },
    { label: "Giant", pass: scores.reach >= 80 }
  ];
  badgeRow.innerHTML = badges.map((badge) => `<span class="${badge.pass ? "earned" : ""}">${badge.label}</span>`).join("");
}

function q(name, slug, era, group, view, position, scale, trait, expertClue) {
  return {
    name,
    slug,
    image: `assets/quiz-${slug}.png`,
    era,
    group,
    view,
    crop: { position, scale },
    fact: `${name} is identified by ${trait}.`,
    clue: `Look for ${trait}.`,
    expertClue
  };
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const FALLBACK_GUIDE = { lived: "Unknown", where: "Unknown", habitat: "Unknown", diet: "Unknown", facts: [] };

// Never let a missing field-guide entry crash a render; surface it instead.
function getGuide(slug) {
  return quizFieldGuide[slug] || FALLBACK_GUIDE;
}

// One-time check that the quiz data is internally consistent. Logs loudly rather
// than failing silently (or crashing) if an item's slug/name gets out of sync.
function validateQuizData() {
  const names = new Set();
  quizItems.forEach((item) => {
    if (names.has(item.name)) console.error(`Duplicate quiz name: ${item.name}`);
    names.add(item.name);
    if (!quizFieldGuide[item.slug]) console.error(`Missing field guide for slug: ${item.slug}`);
  });
}

const quizDifficultySettings = {
  easy: {
    label: "Easy",
    points: 10,
    hintCost: 3,
    choiceCount: 4,
    slugs: [
      "tyrannosaurus",
      "triceratops",
      "stegosaurus",
      "velociraptor",
      "brachiosaurus",
      "spinosaurus",
      "ankylosaurus",
      "parasaurolophus",
      "allosaurus",
      "archaeopteryx"
    ]
  },
  medium: {
    label: "Medium",
    points: 15,
    hintCost: 4,
    choiceCount: 4,
    slugs: [
      "tyrannosaurus",
      "triceratops",
      "spinosaurus",
      "parasaurolophus",
      "allosaurus",
      "brachiosaurus",
      "stegosaurus",
      "ankylosaurus",
      "velociraptor",
      "carnotaurus",
      "dilophosaurus",
      "gallimimus",
      "pachycephalosaurus",
      "iguanodon",
      "diplodocus",
      "apatosaurus",
      "deinonychus",
      "microraptor",
      "archaeopteryx",
      "therizinosaurus",
      "oviraptor",
      "corythosaurus",
      "lambeosaurus",
      "edmontosaurus"
    ]
  },
  hard: {
    label: "Hard",
    points: 25,
    hintCost: 6,
    choiceCount: 6,
    slugs: null
  }
};

function quizDifficultySetting() {
  return quizDifficultySettings[state.quizDifficulty] || quizDifficultySettings.easy;
}

function quizPoolIndices() {
  const setting = quizDifficultySetting();
  if (!setting.slugs) return quizItems.map((_, index) => index);
  const slugs = new Set(setting.slugs);
  const indices = quizItems.map((item, index) => (slugs.has(item.slug) ? index : -1)).filter((index) => index >= 0);
  return indices.length ? indices : quizItems.map((_, index) => index);
}

function currentQuizItem() {
  if (!state.quizOrder.length || state.quizIndex >= state.quizOrder.length) {
    state.quizOrder = shuffle(quizPoolIndices());
    state.quizIndex = 0;
  }
  return quizItems[state.quizOrder[state.quizIndex]];
}

function quizChoices(item) {
  const setting = quizDifficultySetting();
  const targetCount = setting.choiceCount;
  const difficultyPool = quizPoolIndices().map((index) => quizItems[index].name);
  const groupPool = quizChoicePools[item.group] || [];
  const choices = [item.name];
  const candidates = shuffle([...groupPool, ...difficultyPool].filter((name) => name !== item.name));
  candidates.forEach((name) => {
    if (choices.length < targetCount && !choices.includes(name)) choices.push(name);
  });
  shuffle(quizItems.map((quizItem) => quizItem.name)).forEach((name) => {
    if (choices.length < targetCount && !choices.includes(name)) choices.push(name);
  });
  return shuffle(choices);
}

function renderQuiz() {
  const item = currentQuizItem();
  // Grade against the specimen that was actually rendered, not a re-derived one
  // (currentQuizItem() has reshuffle side effects at the order boundary).
  state.currentItem = item;
  state.quizHintsUsed = 0;
  state.quizPotential = quizDifficultySetting().points;
  const choices = quizChoices(item);
  quizImage.src = item.image;
  quizImage.alt = `Photorealistic quiz image of ${item.name}`;
  quizImage.style.objectPosition = "50% 50%";
  quizImage.style.transform = "scale(1)";
  quizImage.classList.remove("expert-crop");
  quizImage.classList.add("field-guide");
  // Mark the correct option with a data flag so grading never depends on
  // re-matching display strings (robust to name collisions / stray characters).
  quizOptions.innerHTML = choices.map((choice) => `<button class="quiz-option" type="button" data-answer="${escapeHtml(choice)}" data-correct="${choice === item.name}">${escapeHtml(choice)}</button>`).join("");
  quizEra.textContent = item.era;
  quizView.textContent = `${quizDifficultySetting().label} level`;
  quizPrompt.textContent = "Which dinosaur is this?";
  quizFeedback.classList.remove("is-revealed");
  quizFeedback.innerHTML = `<span class="quiz-intro">Choose carefully. Hints help, but each one lowers this fossil's point value.</span>`;
  quizScore.textContent = state.quizScore;
  quizTotal.textContent = state.quizTotal;
  quizStreak.textContent = `Streak ${state.quizStreak}`;
  quizDifficulty.value = state.quizDifficulty;
  quizPotential.textContent = state.quizPotential;
  hintQuizBtn.disabled = false;
  hintQuizBtn.textContent = `Get Hint (-${quizDifficultySetting().hintCost} pts)`;
  state.quizAnswered = false;
  quizOptions.querySelectorAll(".quiz-option").forEach((button) => {
    button.addEventListener("click", () => answerQuiz(button));
  });
}

function revealQuizHint() {
  if (state.quizAnswered || !state.currentItem) return;
  const item = state.currentItem;
  const guide = getGuide(item.slug);
  const setting = quizDifficultySetting();
  state.quizHintsUsed += 1;
  state.quizPotential = Math.max(1, state.quizPotential - setting.hintCost);
  quizPotential.textContent = state.quizPotential;
  quizFeedback.classList.add("is-revealed");
  const hintText = [
    `Field clue: ${item.clue}`,
    `Habitat clue: ${guide.habitat}. Diet: ${guide.diet}.`,
    `Era clue: ${guide.lived}. Fossil family: ${item.group}.`
  ][state.quizHintsUsed - 1] || `Final clue: ${item.expertClue}`;
  if (state.quizHintsUsed === 3) {
    const wrongOptions = shuffle([...quizOptions.querySelectorAll(".quiz-option")].filter((button) => button.dataset.correct !== "true" && !button.disabled));
    wrongOptions.slice(0, 2).forEach((button) => {
      button.disabled = true;
      button.classList.add("is-eliminated");
    });
  }
  quizFeedback.innerHTML = `
    <div class="quiz-hint">
      <b>Hint ${state.quizHintsUsed}</b>
      <span>${escapeHtml(hintText)}</span>
      <small>This fossil is now worth up to ${state.quizPotential} points.</small>
    </div>
  `;
  if (state.quizHintsUsed >= 4 || state.quizPotential <= 1) {
    hintQuizBtn.disabled = true;
    hintQuizBtn.textContent = "Hints used";
  }
}

function answerQuiz(clicked) {
  if (state.quizAnswered) return;
  const item = state.currentItem;
  const correct = clicked.dataset.correct === "true";
  state.quizAnswered = true;
  state.quizTotal += 1;
  if (correct) {
    state.quizScore += state.quizPotential;
    state.quizStreak += 1;
  } else {
    state.quizStreak = 0;
  }
  hintQuizBtn.disabled = true;
  hintQuizBtn.textContent = "Hint closed";
  quizOptions.querySelectorAll(".quiz-option").forEach((button) => {
    button.disabled = true;
    button.classList.toggle("correct", button.dataset.correct === "true");
    button.classList.toggle("wrong", button === clicked && !correct);
  });
  quizScore.textContent = state.quizScore;
  quizTotal.textContent = state.quizTotal;
  quizStreak.textContent = `Streak ${state.quizStreak}`;
  renderQuizFeedback(item, correct);
}

function nextQuiz() {
  state.quizIndex += 1;
  renderQuiz();
}

function renderQuizFeedback(item, correct) {
  const guide = getGuide(item.slug);
  const earned = correct ? state.quizPotential : 0;
  const streakNote = state.quizStreak >= 3 ? ` Hot streak: ${state.quizStreak} correct in a row.` : "";
  quizFeedback.classList.add("is-revealed");
  quizFeedback.innerHTML = `
    <div class="quiz-result ${correct ? "correct" : "wrong"}">${correct ? `Correct. +${earned} points.${streakNote}` : `Good try. The answer is ${escapeHtml(item.name)}.`}</div>
    <div class="dino-guide">
      <h3>${escapeHtml(item.name)}</h3>
      <p>${escapeHtml(item.clue)} ${escapeHtml(item.fact)}</p>
      <div class="guide-grid">
        <div><span>Time period</span><b>${escapeHtml(guide.lived)}</b></div>
        <div><span>Where it lived</span><b>${escapeHtml(guide.where)}</b></div>
        <div><span>Habitat</span><b>${escapeHtml(guide.habitat)}</b></div>
        <div><span>Diet</span><b>${escapeHtml(guide.diet)}</b></div>
      </div>
      <ul>${guide.facts.map((fact) => `<li>${escapeHtml(fact)}</li>`).join("")}</ul>
    </div>
  `;
}

function renderGallery(options = {}) {
  const quizMode = options.quizMode || false;
  const tabsEl = quizMode ? galleryQuizTabs : galleryTabs;
  const gridEl = quizMode ? galleryQuizGrid : galleryGrid;
  const pageKey = quizMode ? "galleryQuizPage" : "galleryPage";
  const pageSize = 10;
  const pageCount = Math.ceil(quizItems.length / pageSize);
  state[pageKey] = Math.max(0, Math.min(state[pageKey], pageCount - 1));
  tabsEl.innerHTML = Array.from({ length: pageCount }, (_, index) => `
    <button class="gallery-tab ${index === state[pageKey] ? "is-active" : ""}" type="button" data-page="${index}" role="tab" aria-selected="${index === state[pageKey]}">
      ${index * pageSize + 1}-${Math.min((index + 1) * pageSize, quizItems.length)}
    </button>
  `).join("");
  tabsEl.querySelectorAll(".gallery-tab").forEach((button) => {
    button.addEventListener("click", () => {
      state[pageKey] = Number(button.dataset.page);
      renderGallery({ quizMode });
    });
  });
  const start = state[pageKey] * pageSize;
  gridEl.innerHTML = quizItems.slice(start, start + pageSize).map((item) => {
    const guide = getGuide(item.slug);
    const revealed = !quizMode || state.galleryQuizRevealed.has(item.slug);
    const copy = revealed ? `
      <div class="gallery-card-copy">
        <h3>${escapeHtml(item.name)}</h3>
        <p>${escapeHtml(item.era)}</p>
        <dl>
          <div><dt>Diet</dt><dd>${escapeHtml(guide.diet)}</dd></div>
          <div><dt>Habitat</dt><dd>${escapeHtml(guide.habitat)}</dd></div>
        </dl>
      </div>
    ` : `<div class="gallery-card-copy is-hidden"><span>Tap to reveal</span></div>`;
    if (quizMode) {
      return `
        <button class="gallery-card gallery-quiz-card ${revealed ? "is-revealed" : ""}" type="button" data-slug="${escapeHtml(item.slug)}" aria-label="${revealed ? escapeHtml(item.name) : "Reveal dinosaur"}">
          <div class="gallery-image-frame">
            <img src="${escapeHtml(item.image)}" alt="">
          </div>
          ${copy}
        </button>
      `;
    }
    return `
      <article class="gallery-card">
        <div class="gallery-image-frame">
          <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}">
        </div>
        ${copy}
      </article>
    `;
  }).join("");
  if (!quizMode) renderGalleryPrintPages();
  if (quizMode) {
    gridEl.querySelectorAll(".gallery-quiz-card").forEach((card) => {
      card.addEventListener("click", () => {
        if (state.galleryQuizRevealed.has(card.dataset.slug)) {
          state.galleryQuizRevealed.delete(card.dataset.slug);
        } else {
          state.galleryQuizRevealed.add(card.dataset.slug);
        }
        renderGallery({ quizMode: true });
      });
    });
    renderGalleryQuizPrintPages();
  }
}

function renderGalleryPrintPages() {
  const pageSize = 10;
  galleryPrintPages.innerHTML = Array.from({ length: Math.ceil(quizItems.length / pageSize) }, (_, pageIndex) => {
    const start = pageIndex * pageSize;
    const pageItems = quizItems.slice(start, start + pageSize);
    return `
      <section class="gallery-print-page gallery-print-page-with-info">
        <header>
          <h2>Dinosaur Gallery</h2>
          <p>Subtab ${start + 1}-${Math.min(start + pageSize, quizItems.length)}</p>
        </header>
        <div class="gallery-print-grid">
          ${pageItems.map((item) => {
            const guide = getGuide(item.slug);
            return `
              <article class="gallery-print-card">
                <img src="${item.image}" alt="">
                <div class="gallery-print-info">
                  <h3>${item.name}</h3>
                  <p>${item.era}</p>
                  <b>Diet</b>
                  <span>${guide.diet}</span>
                  <b>Habitat</b>
                  <span>${guide.habitat}</span>
                </div>
              </article>
            `;
          }).join("")}
        </div>
      </section>
    `;
  }).join("");
}

function renderGalleryQuizPrintPages() {
  const pageSize = 10;
  galleryQuizPrintPages.innerHTML = Array.from({ length: Math.ceil(quizItems.length / pageSize) }, (_, pageIndex) => {
    const start = pageIndex * pageSize;
    const pageItems = quizItems.slice(start, start + pageSize);
    return `
      <section class="gallery-print-page">
        <header>
          <h2>Dinosaur Practice</h2>
          <p>Subtab ${start + 1}-${Math.min(start + pageSize, quizItems.length)}</p>
        </header>
        <div class="gallery-print-grid">
          ${pageItems.map((item, index) => `
            <article class="gallery-print-card">
              <img src="${item.image}" alt="">
              <div class="gallery-print-answer">${start + index + 1}. Name:</div>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }).join("");
}

function buildControls() {
  Object.keys(slots).forEach((slotName) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.querySelector("h2").textContent = slotName[0].toUpperCase() + slotName.slice(1);
    const row = node.querySelector(".choice-row");
    slots[slotName].forEach((choice, index) => {
      const button = document.createElement("button");
      button.className = "choice";
      button.type = "button";
      button.textContent = choice.label;
      button.addEventListener("click", () => {
        state[slotName] = index;
        refreshControls();
        renderDino();
      });
      row.appendChild(button);
    });
    node.querySelectorAll(".stepper button").forEach((button) => {
      button.addEventListener("click", () => {
        const dir = Number(button.dataset.dir);
        state[slotName] = (state[slotName] + dir + slots[slotName].length) % slots[slotName].length;
        refreshControls();
        renderDino();
      });
    });
    partControls.appendChild(node);
  });
  refreshControls();
}

function refreshControls() {
  [...partControls.children].forEach((slotNode, slotIndex) => {
    const slotName = Object.keys(slots)[slotIndex];
    slotNode.querySelectorAll(".choice").forEach((button, index) => {
      button.classList.toggle("is-selected", index === state[slotName]);
    });
  });
}

function updateScores() {
  const total = { speed: 0, strength: 0, defense: 0, reach: 0, ferocity: 0 };
  Object.values(getSelected()).forEach((choice) => {
    Object.entries(choice.score).forEach(([key, value]) => {
      if (key in total) total[key] += value;
    });
  });
  // Strength is always derived from the other combat stats (no part contributes
  // a raw "strength" score), so compute it directly rather than via `|| ` — a
  // legitimate total of 0 must not silently fall through to the formula.
  total.strength = total.ferocity * .55 + total.defense * .35 + total.reach * .2;
  const normalized = Object.fromEntries(Object.entries(total).map(([key, value]) => {
    const boost = state.dnaBoost[key] || 0;
    return [key, Math.max(1, Math.min(100, Math.round(value * 2.2 + 12 + boost)))];
  }));
  ["speed", "strength", "defense", "reach", "ferocity"].forEach((key) => {
    const valueEl = document.querySelector(`#${key}Value`);
    const meterEl = document.querySelector(`#${key}Meter`);
    if (!valueEl || !meterEl) return;
    valueEl.textContent = normalized[key];
    meterEl.style.setProperty("--value", `${normalized[key]}%`);
  });
  return normalized;
}

function updateName() {
  const selected = getSelected();
  const prefix = {
    rex: "Tyranno",
    sauropod: "Macro",
    ceratops: "Cerat",
    raptor: "Veloci"
  }[selected.body.id] || "Dino";
  const middle = {
    rex: "gnatho",
    trike: "corno",
    duck: "lambeo",
    raptor: "onych"
  }[selected.head.id] || "sauro";
  const suffix = {
    whip: "cauda",
    club: "malleus",
    raptor: "cursor",
    spike: "spina"
  }[selected.tail.id] || "saurus";
  nameEl.textContent = state.fossilName ? `${prefix}${middle}${suffix}` : "Custom dinosaur";
}

function runFieldTest() {
  const score = updateScores();
  const strongest = Object.entries(score).sort((a, b) => b[1] - a[1])[0][0];
  const selected = getSelected();
  const summary = {
    speed: "It launches across the floodplain with a low, balanced sprint. The tail keeps it steady while the feet dig into the soft ground.",
    strength: "It is built for raw power. Big muscle anchors, stable legs, and weaponized jaws or claws give it serious close-range force.",
    defense: "It holds its ground like a living fortress. Armor and stance make it difficult for predators to find a weak angle.",
    reach: "It dominates the canopy edge and riverbank. Long anatomy lets it feed, display, or strike before rivals get close.",
    ferocity: "It is built for intimidation. The skull, claws, and posture make it look like the top threat in this habitat."
  }[strongest];
  const spliceNote = state.lastSplice
    ? ` DNA splice: ${getSpecies(state.lastSplice.sampleA).name} x ${getSpecies(state.lastSplice.sampleB).name}.`
    : "";
  document.querySelector("#fieldSummary").textContent = `${summary} Favorite feature: ${selected.detail.label.toLowerCase()}.${spliceNote}`;
  document.querySelector("#fieldTest").classList.add("is-visible");
  setTimeout(() => document.querySelector("#fieldTest").classList.remove("is-visible"), 6500);
}

function enableDrag() {
  document.querySelectorAll(".part").forEach((part) => {
    part.addEventListener("pointerdown", startDrag);
  });
}

function startDrag(event) {
  const target = event.currentTarget;
  const part = target.dataset.part;
  const start = pointerPoint(event);
  const origin = state.offsets[part] || { x: 0, y: 0 };
  target.setPointerCapture(event.pointerId);

  function move(moveEvent) {
    const current = pointerPoint(moveEvent);
    state.offsets[part] = {
      x: Math.max(-70, Math.min(70, origin.x + current.x - start.x)),
      y: Math.max(-55, Math.min(55, origin.y + current.y - start.y))
    };
    target.setAttribute("transform", `translate(${state.offsets[part].x} ${state.offsets[part].y})`);
  }

  function stop() {
    target.removeEventListener("pointermove", move);
    target.removeEventListener("pointerup", stop);
    target.removeEventListener("pointercancel", stop);
  }

  target.addEventListener("pointermove", move);
  target.addEventListener("pointerup", stop);
  target.addEventListener("pointercancel", stop);
}

function pointerPoint(event) {
  const point = svg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  return point.matrixTransform(svg.getScreenCTM().inverse());
}

function randomize() {
  Object.keys(slots).forEach((slotName) => {
    state[slotName] = Math.floor(Math.random() * slots[slotName].length);
  });
  const palettes = [
    ["#5f7f45", "#d0c09a"],
    ["#7a6048", "#d8c79c"],
    ["#496a68", "#c9d2b1"],
    ["#6d6f3c", "#d6c08f"],
    ["#725042", "#ddc8ad"]
  ];
  const palette = palettes[Math.floor(Math.random() * palettes.length)];
  state.baseColor = palette[0];
  state.bellyColor = palette[1];
  state.pattern = ["scales", "stripes", "plain"][Math.floor(Math.random() * 3)];
  state.size = 88 + Math.floor(Math.random() * 29);
  state.posture = -8 + Math.floor(Math.random() * 18);
  state.dnaBoost = { speed: 0, strength: 0, defense: 0, reach: 0, ferocity: 0 };
  state.lastSplice = null;
  state.offsets = {};
  syncInputs();
  refreshControls();
  renderDino();
  runFieldTest();
}

function syncInputs() {
  document.querySelector("#baseColor").value = state.baseColor;
  document.querySelector("#bellyColor").value = state.bellyColor;
  document.querySelector("#patternSelect").value = state.pattern;
  document.querySelector("#sizeRange").value = state.size;
  document.querySelector("#postureRange").value = state.posture;
  document.querySelector("#nameToggle").checked = state.fossilName;
}

function snapshot() {
  const source = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${nameEl.textContent || "dinosaur"}.svg`;
  link.click();
  URL.revokeObjectURL(url);
}

function showTab(tabName) {
  document.body.classList.remove("landing-active");
  document.querySelector(".game-shell").classList.toggle("quiz-focus", tabName === "quiz");
  document.querySelector(".game-shell").classList.toggle("gallery-focus", tabName === "gallery" || tabName === "galleryQuiz");
  if (tabName === "gallery") renderGallery();
  if (tabName === "galleryQuiz") renderGallery({ quizMode: true });
  document.querySelectorAll(".app-nav-button").forEach((item) => {
    item.classList.remove("is-active");
    item.removeAttribute("aria-current");
  });
  document.querySelectorAll(".app-nav-button[data-tab]").forEach((item) => {
    const active = item.dataset.tab === tabName;
    if (active) {
      item.classList.add("is-active");
      item.setAttribute("aria-current", "page");
    }
  });
  document.querySelectorAll(".tab-panel").forEach((panel) => panel.classList.remove("is-active"));
  document.querySelector(`#${tabName}Panel`).classList.add("is-active");
}

function showLanding() {
  document.body.classList.add("landing-active");
  document.querySelector(".game-shell").classList.remove("quiz-focus", "gallery-focus");
  document.querySelectorAll(".app-nav-button").forEach((item) => {
    item.classList.remove("is-active");
    item.removeAttribute("aria-current");
  });
  document.querySelector("[data-nav-home]").classList.add("is-active");
  document.querySelector("[data-nav-home]").setAttribute("aria-current", "page");
}

document.querySelectorAll(".app-nav-button[data-tab]").forEach((tab) => {
  tab.addEventListener("click", () => showTab(tab.dataset.tab));
});

document.querySelector("[data-nav-home]").addEventListener("click", showLanding);

document.querySelector("#baseColor").addEventListener("input", (event) => {
  state.baseColor = event.target.value;
  renderDino();
});
document.querySelector("#bellyColor").addEventListener("input", (event) => {
  state.bellyColor = event.target.value;
  renderDino();
});
document.querySelector("#patternSelect").addEventListener("change", (event) => {
  state.pattern = event.target.value;
  renderDino();
});
document.querySelector("#sizeRange").addEventListener("input", (event) => {
  state.size = Number(event.target.value);
  renderDino();
});
document.querySelector("#postureRange").addEventListener("input", (event) => {
  state.posture = Number(event.target.value);
  renderDino();
});
document.querySelector("#nameToggle").addEventListener("change", (event) => {
  state.fossilName = event.target.checked;
  updateName();
});
dnaASelect.addEventListener("change", (event) => {
  state.dnaA = event.target.value;
  renderDnaReport(updateScores());
});
dnaBSelect.addEventListener("change", (event) => {
  state.dnaB = event.target.value;
  renderDnaReport(updateScores());
});
dnaGoalSelect.addEventListener("change", (event) => {
  state.dnaGoal = event.target.value;
  renderDnaReport(updateScores());
});
document.querySelector("#spliceBtn").addEventListener("click", spliceDna);
document.querySelector("#randomizeBtn").addEventListener("click", randomize);
document.querySelector("#snapshotBtn").addEventListener("click", snapshot);
document.querySelector("#testBtn").addEventListener("click", runFieldTest);
nextQuizBtn.addEventListener("click", nextQuiz);
hintQuizBtn.addEventListener("click", revealQuizHint);
quizDifficulty.addEventListener("change", (event) => {
  state.quizDifficulty = event.target.value;
  state.quizScore = 0;
  state.quizTotal = 0;
  state.quizOrder = [];
  state.quizIndex = 0;
  state.quizStreak = 0;
  renderQuiz();
});
landingPrint.addEventListener("click", () => {
  document.body.dataset.printMode = "landing";
  window.print();
});
galleryPrint.addEventListener("click", () => {
  document.body.dataset.printMode = "gallery";
  window.print();
});
galleryQuizPrint.addEventListener("click", () => {
  document.body.dataset.printMode = "galleryQuiz";
  window.print();
});
window.addEventListener("afterprint", () => {
  delete document.body.dataset.printMode;
});

validateQuizData();
buildControls();
buildDnaLab();
renderQuiz();
renderGallery();
renderGallery({ quizMode: true });
syncInputs();
renderDino();
