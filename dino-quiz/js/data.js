(function () {
  "use strict";

  function q(name, slug, era, group, trait, expertClue) {
    return {
      name,
      slug,
      image: `assets/quiz-${slug}.png`,
      era,
      group,
      fact: `${name} is identified by ${trait}.`,
      clue: `Look for ${trait}.`,
      expertClue
    };
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
    q("Tyrannosaurus rex", "tyrannosaurus", "Late Cretaceous", "tyrannosaur", "huge skull, deep jaws, tiny two-fingered arms, and powerful hind legs", "Deep tyrannosaur skull, heavy jaw, reduced forelimbs."),
    q("Triceratops", "triceratops", "Late Cretaceous", "ceratopsian", "three facial horns and a large protective frill", "Brow horns plus nasal horn; broad solid-looking frill."),
    q("Spinosaurus", "spinosaurus", "Late Cretaceous", "spinosaurid", "a long crocodile-like snout and a tall sail on its back", "Spinosaurid snout with a tall neural-spine sail."),
    q("Parasaurolophus", "parasaurolophus", "Late Cretaceous", "hadrosaur", "a long backward-curving crest probably useful for sound and display", "Hadrosaur body with a long backward-projecting tubular crest."),
    q("Allosaurus", "allosaurus", "Late Jurassic", "allosauroid", "a lighter skull than T. rex, brow ridges, and three-fingered hands", "Large Jurassic theropod with brow ridges and three usable fingers."),
    q("Brachiosaurus", "brachiosaurus", "Late Jurassic", "sauropod", "very high shoulders, long front legs, and a towering neck", "Sauropod with high shoulders and forelimbs longer than hind limbs."),
    q("Stegosaurus", "stegosaurus", "Late Jurassic", "stegosaur", "tall back plates and a spiked tail called a thagomizer", "Alternating plates along the back and tail spikes."),
    q("Ankylosaurus", "ankylosaurus", "Late Cretaceous", "ankylosaur", "heavy body armor and a large tail club", "Low armored body with osteoderms and a tail club."),
    q("Velociraptor", "velociraptor", "Late Cretaceous", "dromaeosaur", "a small feathered predator with a sickle claw and narrow snout", "Small feathered dromaeosaur, much smaller than movie versions."),
    q("Carnotaurus", "carnotaurus", "Late Cretaceous", "abelisaurid", "a short deep skull, tiny arms, and bull-like horns over the eyes", "Abelisaurid with brow horns and extremely reduced arms."),
    q("Dilophosaurus", "dilophosaurus", "Early Jurassic", "theropod", "paired head crests and a slim Early Jurassic theropod build", "Twin cranial crests; no movie-style neck frill."),
    q("Gallimimus", "gallimimus", "Late Cretaceous", "ornithomimid", "an ostrich-like body with long legs, long neck, and toothless beak", "Fast ornithomimid with long cursorial legs."),
    q("Pachycephalosaurus", "pachycephalosaurus", "Late Cretaceous", "pachycephalosaur", "a thick domed skull with knobs and small spikes around the back", "Dome-headed ornithischian with skull ornamentation."),
    q("Iguanodon", "iguanodon", "Early Cretaceous", "ornithopod", "a robust ornithopod with thumb spikes and a beaked mouth", "Look for the thumb spike and heavy ornithopod body."),
    q("Diplodocus", "diplodocus", "Late Jurassic", "sauropod", "a very long, low body with a whip-like tail and small head", "Long low diplodocid with a horizontal neck and whip tail."),
    q("Apatosaurus", "apatosaurus", "Late Jurassic", "sauropod", "a heavy sauropod with a thick neck, robust body, and long tail", "Chunkier sauropod build than Diplodocus."),
    q("Deinonychus", "deinonychus", "Early Cretaceous", "dromaeosaur", "a feathered raptor larger than Velociraptor with a strong sickle claw", "Dromaeosaur with strong grasping arms and killing claw."),
    q("Microraptor", "microraptor", "Early Cretaceous", "paravian", "a tiny four-winged feathered dinosaur with feathers on arms and legs", "Small paravian with long feathers on both forelimbs and hindlimbs."),
    q("Archaeopteryx", "archaeopteryx", "Late Jurassic", "paravian", "birdlike wings, a long bony feathered tail, clawed fingers, and teeth", "Early avialan with wings, teeth, and a long bony tail."),
    q("Therizinosaurus", "therizinosaurus", "Late Cretaceous", "therizinosaur", "enormous scythe-like hand claws, a pot-bellied body, and feathers", "Bizarre theropod with gigantic hand claws."),
    q("Oviraptor", "oviraptor", "Late Cretaceous", "oviraptorid", "a feathered oviraptorid with a short beaked skull and birdlike body", "Short beak, crest, and feathered arms."),
    q("Corythosaurus", "corythosaurus", "Late Cretaceous", "hadrosaur", "a tall rounded helmet-like crest and duck-billed snout", "Rounded helmet crest on a lambeosaurine hadrosaur."),
    q("Lambeosaurus", "lambeosaurus", "Late Cretaceous", "hadrosaur", "a hatchet-shaped crest projecting upward and forward", "Hadrosaur with a hatchet-like crest shape."),
    q("Edmontosaurus", "edmontosaurus", "Late Cretaceous", "hadrosaur", "a large duck-billed hadrosaur without a tall hollow crest", "Broad hadrosaur beak but no tall cranial crest."),
    q("Styracosaurus", "styracosaurus", "Late Cretaceous", "ceratopsian", "a long nasal horn and many long spikes around the frill", "Ceratopsian with dramatic frill spikes."),
    q("Protoceratops", "protoceratops", "Late Cretaceous", "ceratopsian", "a small ceratopsian with a beak, modest frill, and no large brow horns", "Small hornless ceratopsian with a parrot-like beak."),
    q("Giganotosaurus", "giganotosaurus", "Late Cretaceous", "carcharodontosaur", "a giant theropod with a long low skull and three-fingered arms", "Carcharodontosaurid with long skull, unlike deep tyrannosaur skulls."),
    q("Baryonyx", "baryonyx", "Early Cretaceous", "spinosaurid", "a long crocodile-like snout and large hand claws, but no tall Spinosaurus sail", "Fish-eating spinosaurid with big thumb claw."),
    q("Suchomimus", "suchomimus", "Early Cretaceous", "spinosaurid", "a crocodile-like snout, large claws, and a low ridge along the back", "Spinosaurid with long narrow snout and lower back ridge."),
    q("Acrocanthosaurus", "acrocanthosaurus", "Early Cretaceous", "carcharodontosaur", "high neural spines forming a ridge along the back", "Large theropod with raised neural-spine ridge."),
    q("Ceratosaurus", "ceratosaurus", "Late Jurassic", "theropod", "a nasal horn on the snout, small brow horns, and a deep tail", "Jurassic theropod with a distinctive horn on the snout."),
    q("Maiasaura", "maiasaura", "Late Cretaceous", "hadrosaur", "a duck-billed hadrosaur with a low crest above the eyes", "Hadrosaur with a gentle low cranial crest."),
    q("Kentrosaurus", "kentrosaurus", "Late Jurassic", "stegosaur", "a smaller stegosaur with plates near the shoulders and long paired spikes toward the hips and tail", "Stegosaur with more dramatic rear-body spikes than Stegosaurus."),
    q("Utahraptor", "utahraptor", "Early Cretaceous", "dromaeosaur", "a large feathered dromaeosaur with sickle claws and powerful arms", "Much larger dromaeosaur than Velociraptor."),
    q("Tarbosaurus", "tarbosaurus", "Late Cretaceous", "tyrannosaur", "a deep tyrannosaur skull, powerful jaws, and reduced two-fingered arms", "Asian tyrannosaur with a T. rex-like deep skull and tiny forelimbs."),
    q("Torosaurus", "torosaurus", "Late Cretaceous", "ceratopsian", "a very large frill, long brow horns, and a Triceratops-like body", "Ceratopsian with an especially long frill and paired brow horns."),
    q("Pachyrhinosaurus", "pachyrhinosaurus", "Late Cretaceous", "ceratopsian", "a thick bony nasal boss instead of a long nose horn", "Ceratopsian with a blunt nasal boss rather than a tall nasal horn."),
    q("Carcharodontosaurus", "carcharodontosaurus", "Late Cretaceous", "carcharodontosaur", "a giant long skull with blade-like serrated teeth", "Carcharodontosaurid with long jaws and shark-tooth-like serrations."),
    q("Mapusaurus", "mapusaurus", "Late Cretaceous", "carcharodontosaur", "a long low skull, three-fingered arms, and giant predator build", "South American carcharodontosaur closely related to Giganotosaurus."),
    q("Camarasaurus", "camarasaurus", "Late Jurassic", "sauropod", "a shorter boxy skull, sturdy neck, and compact sauropod body", "Sauropod with a boxier head and sturdier proportions than Diplodocus."),
    q("Brontosaurus", "brontosaurus", "Late Jurassic", "sauropod", "a massive body, strong neck, and long whip-like tail", "Heavy diplodocid sauropod with a robust neck and long tail."),
    q("Sauropelta", "sauropelta", "Early Cretaceous", "ankylosaur", "armor plates and large shoulder spikes along a low body", "Nodosaur with prominent shoulder spikes and no tail club."),
    q("Nodosaurus", "nodosaurus", "Late Cretaceous", "ankylosaur", "a low armored body covered in bony plates but no tail club", "Armored nodosaur body with osteoderms and a clubless tail."),
    q("Struthiomimus", "struthiomimus", "Late Cretaceous", "ornithomimid", "an ostrich-like runner with long legs, long arms, and a toothless beak", "Slender ornithomimid with long grasping arms and cursorial legs."),
    q("Ornithomimus", "ornithomimus", "Late Cretaceous", "ornithomimid", "a lightweight ostrich-mimic body with a small head and fast legs", "Classic ostrich-mimic dinosaur with toothless beak and long legs."),
    q("Ouranosaurus", "ouranosaurus", "Early Cretaceous", "ornithopod", "an Iguanodon-like body with tall spines forming a back sail", "Ornithopod with thumb spikes and a high-spined back sail."),
    q("Dryosaurus", "dryosaurus", "Late Jurassic", "ornithopod", "a small fast ornithopod with long hind legs and a stiff tail", "Light Jurassic plant-eater built for quick running."),
    q("Citipati", "citipati", "Late Cretaceous", "oviraptorid", "a tall head crest, short beak, and feathered oviraptorid body", "Oviraptorid with a high rounded crest and birdlike posture."),
    q("Majungasaurus", "majungasaurus", "Late Cretaceous", "abelisaurid", "a short deep skull, rough skull ornament, and very tiny arms", "Abelisaurid with a blunt skull and extremely reduced forelimbs."),
    q("Coelophysis", "coelophysis", "Late Triassic", "theropod", "a slim early theropod body, long neck, and narrow jaws", "Early lightweight theropod with a long neck and narrow skull.")
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

  // Trophy badges. `check(profile, round)` decides whether the badge is earned;
  // it runs after the round's discoveries/play-date are already recorded.
  // round = { correct, roundSize, hints, accuracy, maxStreak, difficulty }.
  const badges = [
    { id: "first-dig", icon: "🦴", name: "First Dig", description: "Finish your first expedition.", check: () => true },
    { id: "perfect-10", icon: "💯", name: "Perfect 10", description: "Identify all 10 dinosaurs in a round.", check: (p, r) => r.correct >= r.roundSize },
    { id: "no-hint-hero", icon: "🧠", name: "No-Hint Hero", description: "Score 8+ correct without any hints.", check: (p, r) => r.hints === 0 && r.correct >= 8 },
    { id: "streak-5", icon: "🔥", name: "Streak Master", description: "Get 5 correct in a row.", check: (p, r) => r.maxStreak >= 5 },
    { id: "streak-10", icon: "⚡", name: "Lightning Streak", description: "Get 10 correct in a row.", check: (p, r) => r.maxStreak >= 10 },
    { id: "hard-champ", icon: "🏆", name: "Hard Mode Champion", description: "Finish a Hard round with 70%+ accuracy.", check: (p, r) => r.difficulty === "hard" && r.accuracy >= 70 },
    { id: "dedicated-digger", icon: "⛏️", name: "Dedicated Digger", description: "Play on 5 different days.", check: (p) => (p.playDates || []).length >= 5 },
    { id: "half-dex", icon: "🔍", name: "Field Researcher", description: "Discover 25 dinosaurs.", check: (p) => (p.discovered || []).length >= 25 },
    { id: "full-dex", icon: "🌟", name: "Master of the Museum", description: "Discover all 50 dinosaurs.", check: (p) => (p.discovered || []).length >= 50 },
    { id: "duelist", icon: "⚔️", name: "Duelist", description: "Win a Sibling Duel.", check: () => false }
  ];

  // Lifetime rank ladder (XP only ever grows). rankForXp() picks the highest
  // rank whose threshold the explorer has passed.
  const ranks = [
    { name: "Museum Intern", xp: 0, icon: "🧹" },
    { name: "Junior Bone Hunter", xp: 150, icon: "🦴" },
    { name: "Fossil Scout", xp: 400, icon: "🔦" },
    { name: "Dino Detective", xp: 800, icon: "🔍" },
    { name: "Fossil Field Captain", xp: 1400, icon: "🧭" },
    { name: "Expert Paleontologist", xp: 2200, icon: "🎓" },
    { name: "Legendary Paleontologist", xp: 3500, icon: "🌋" }
  ];

  function rankForXp(xp) {
    const value = Number(xp) || 0;
    let current = ranks[0];
    let next = null;
    for (let i = 0; i < ranks.length; i += 1) {
      if (value >= ranks[i].xp) {
        current = ranks[i];
        next = ranks[i + 1] || null;
      }
    }
    return { current, next };
  }

  // Fossil Coin shop. Only cosmetics are ever locked — never anything playable.
  const builderUnlocks = [
    { id: "lava-pattern", name: "Lava Pattern", cost: 15, type: "pattern", value: "lava", icon: "🌋" },
    { id: "spots-pattern", name: "Spot Pattern", cost: 15, type: "pattern", value: "spots", icon: "🐆" },
    { id: "golden-palette", name: "Golden Skin", cost: 25, type: "palette", value: ["#d4af37", "#f6e6a8"], icon: "✨" },
    { id: "midnight-palette", name: "Midnight Skin", cost: 25, type: "palette", value: ["#33406e", "#9aa9d8"], icon: "🌙" },
    { id: "candy-palette", name: "Candy Skin", cost: 25, type: "palette", value: ["#c85a9c", "#f3c6de"], icon: "🍬" },
    { id: "rainbow-palette", name: "Rainbow Skin", cost: 40, type: "palette", value: ["#6a4fd0", "#f2c14e"], icon: "🌈" }
  ];

  // Daily themed expeditions. A theme matches by era and/or fossil group; the
  // active one rotates by day-of-year so it is stable for a whole day.
  const expeditions = [
    { id: "late-cretaceous", name: "Late Cretaceous Dig", blurb: "Only dinosaurs from the Late Cretaceous.", eras: ["Late Cretaceous"] },
    { id: "jurassic", name: "Jurassic Journey", blurb: "Giants and hunters of the Jurassic.", eras: ["Late Jurassic", "Early Jurassic"] },
    { id: "early-cretaceous", name: "Early Cretaceous Trek", blurb: "Specimens from the Early Cretaceous.", eras: ["Early Cretaceous"] },
    { id: "spiky", name: "Spiky Specialists", blurb: "Plated and armored plant-eaters.", groups: ["stegosaur", "ankylosaur"] },
    { id: "giants", name: "Giant Sauropods", blurb: "The long-necked giants.", groups: ["sauropod"] },
    { id: "hunters", name: "Fierce Hunters", blurb: "The apex predators.", groups: ["tyrannosaur", "carcharodontosaur", "abelisaurid", "dromaeosaur", "allosauroid", "spinosaurid"] },
    { id: "crested", name: "Crested Callers", blurb: "Crested duck-bills and egg-tenders.", groups: ["hadrosaur", "oviraptorid"] },
    { id: "runners", name: "Ostrich Runners", blurb: "Speedy ostrich-mimics and little sprinters.", groups: ["ornithomimid", "ornithopod"] }
  ];

  window.DinoData = {
    slots,
    speciesLab,
    quizItems,
    quizFieldGuide,
    quizChoicePools,
    geneGoals,
    badges,
    ranks,
    rankForXp,
    builderUnlocks,
    expeditions,
    totalDinos: quizItems.length
  };
})();