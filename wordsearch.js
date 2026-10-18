// Word Search (self-contained): 16 x 14 grid, 30-40 random words per puzzle.
// Select a word by dragging from its first letter to its last, or by tapping the first letter and then the last.
(() => {
  const $ = (id) => document.getElementById(id);
  const COLS = 16,
    ROWS = 14,
    PUZZLES = 100,
    BUDGET = 215; // max total letters of all words in one puzzle (the grid only has 224 cells, words overlap)
  const rng = (s) => () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const shuf = (a, r) => {
    for (let i = a.length - 1; i > 0; i--) {
      const j = (r() * (i + 1)) | 0;
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const fmt = (s) => ((s / 60) | 0) + ":" + String(s % 60).padStart(2, "0");

  // Any words will do, no themes. English and Malay words are mixed together.
  // Add or remove words here (letters A-Z only, 5 to 10 letters).
  const WORDS = [
    ...new Set(
      `
      TIGER SHEEP HORSE ZEBRA PANDA MONKEY RABBIT MOUSE EAGLE SNAKE WHALE SHARK TURTLE CAMEL KOALA LLAMA MOOSE OTTER
      PARROT PENGUIN GOOSE SNAIL SQUID TROUT BISON BADGER BEAVER DONKEY FALCON GIRAFFE HAMSTER HEDGEHOG JAGUAR LIZARD
      OSTRICH PIGEON SPARROW TURKEY WALRUS BREAD SALAD PASTA PIZZA BURGER SANDWICH NOODLE CHEESE BUTTER HONEY SUGAR
      PEPPER APPLE BANANA GRAPE LEMON MANGO MELON ORANGE PEACH BERRY CHERRY COCONUT DURIAN PAPAYA GUAVA CARROT ONION
      POTATO TOMATO GARLIC GINGER CHILLI CURRY SATAY COOKIE CANDY CHOCOLATE COFFEE JUICE WATER FRIES STEAK CHICKEN
      BACON SAUSAGE PANCAKE WAFFLE DONUT MUFFIN CEREAL YOGURT PEANUT ALMOND OLIVE CLOUD STORM THUNDER RIVER OCEAN
      BEACH MOUNTAIN VALLEY FOREST JUNGLE DESERT ISLAND FIELD GRASS FLOWER TULIP DAISY ORCHID BAMBOO BRANCH COAST
      CLIFF CORAL BREEZE FROST RAINBOW HOUSE WINDOW FLOOR TABLE CHAIR CLOCK MIRROR SHELF PHONE RADIO STOVE BASKET
      BUCKET BROOM TOWEL BLANKET PILLOW CARPET CURTAIN GARDEN FENCE STAIRS KITCHEN SPOON KNIFE PLATE GLASS BOTTLE
      KETTLE WATCH CAMERA PENCIL PAPER ERASER RULER SCHOOL CLASS TEACHER STUDENT LESSON HOMEWORK GRADE SCIENCE HISTORY
      MUSIC SPORT LIBRARY OFFICE CHART GLOBE ATLAS TRAIN PLANE TRUCK BRIDGE TUNNEL AIRPORT STATION TICKET PASSPORT
      SUITCASE HOTEL COMPASS ANCHOR HARBOR JOURNEY ROCKET FERRY SCOOTER HELMET SHIRT PANTS SKIRT DRESS SCARF GLOVE
      JACKET SHORTS SANDAL APRON PYJAMA SOCCER TENNIS RUGBY HOCKEY BOXING DANCE PAINT WRITE CHESS PUZZLE SCORE TRACK
      CLIMB SKATE BADMINTON GREEN YELLOW PURPLE BROWN BLACK WHITE SILVER DOCTOR NURSE PILOT FARMER DRIVER BAKER ARTIST
      SINGER POLICE LAWYER JUDGE MAYOR GUARD SAILOR MINER BUILDER TAILOR WRITER MONTH MINUTE SECOND NIGHT MORNING
      EVENING TODAY SPRING SUMMER AUTUMN WINTER HAPPY SMILE LAUGH FRIEND FAMILY MOTHER FATHER SISTER BROTHER CHILD
      DREAM PEACE BRAVE QUICK QUIET SWEET SMART HEAVY LIGHT SMALL LARGE SHORT YOUNG JAPAN INDIA CHINA KOREA ITALY
      SPAIN FRANCE EGYPT BRAZIL CANADA GREECE KENYA NORWAY SWEDEN MALAYSIA THAILAND SINGAPORE PUMPKIN MARKER WRITING
      CAMPING SURPRISE STORK CLOVE BEDROOM PICTURE PEACEFUL PHARMACY TREASURE CLEVER VOLLEYBALL SUNRISE CAMPUS ORCHARD
      BUFFALO PARCEL TERMITE CORMORANT HARBOUR OSPREY CAFETERIA PORCUPINE CHORUS STARLIGHT CARDAMOM SWEATER MONSOON
      NEEDLE CUSHION SHAMPOO INSPIRE BEETLE HAMMER TOUCAN COLOURFUL INDIGO QUARRY DIARY CABIN CARAMEL SUNBEAM LADYBIRD
      FLASHLIGHT BLENDER TOWER CINEMA CANARY HOODIE CHEERFUL DANCING CUCUMBER THEATRE BAKING MAILBOX BALCONY SKATING
      PRAIRIE CIRCUS CLIMBING WISDOM WRESTLING PARADE IMAGINE BISCUIT GAZELLE DIVING WONDER MARKET KARATE MIRACLE
      RUNNING VOLCANO LETTUCE MANSION FENCING BATHROOM MITTENS LANDSLIDE READING BRONZE GLOVES PLAYGROUND FUDGE
      PAPRIKA HERON OREGANO TEMPLE OMELETTE ANTELOPE SEAGULL SALAMANDER STAPLER RHYTHM RAINFALL HIKING COOKING WETLAND
      CYCLING TWILIGHT CASHEW NETBALL SCARLET SHOVEL SUNSET BLOSSOM SAVANNA NECKLACE VILLAGE DRIZZLE SINGING BASIL
      SEASHELL MONITOR HARMONY FOOTBALL NUTMEG SMOOTHIE KNITTING PAJAMAS CRIMSON THYME LADDER TEAPOT SANDALS TUNDRA
      GARDENING NOODLES SMOOTH TURMERIC GIANT MELODY OYSTER FOLDER JOGGING PAINTING PORRIDGE WOMBAT CONDOR TOOTHPASTE
      MILKSHAKE GECKO RAINCOAT CHIPMUNK PLATYPUS LEOPARD SPONGE STALACTITE STREAM STINGRAY EARTHQUAKE LETTER RADISH
      SLOTH MYSTERY MAGPIE LANTERN SNEAKERS SPEAKER NIGHTFALL WALNUT COURAGE LAUGHTER POPSICLE CHARGER BIRTHDAY
      HOLIDAY ROUGH COBRA THREAD MUSHROOM THICKET

      KUCING BURUNG ANGSA LEMBU KERBAU KAMBING HARIMAU SINGA GAJAH MONYET KATAK PENYU UDANG KETAM SOTONG SIPUT SEMUT
      LEBAH NYAMUK LALAT CICAK BUAYA ARNAB TIKUS MUSANG BERUANG BADAK HELANG MERPATI BELATUK MURAI ENGGANG PELANDUK
      KANCIL TUPAI LIPAS KUMBANG BELALANG CACING BELUT HARUAN KERANG BIHUN SAMBAL LEMAK GORENG RENDANG KETUPAT LEMANG
      CENDOL GARAM BAWANG HALIA KUNYIT SERAI SANTAN MANGGIS PISANG LIMAU NANAS TEMBIKAI BETIK JAMBU MANGGA KELAPA
      LANGSAT KANGKUNG BAYAM TIMUN TERUNG KACANG JAGUNG KELEDEK TELUR DAGING PULUT TEMPE TAUHU BUBUR CEKODOK KEROPOK
      SUNGAI TASIK GUNUNG BUKIT HUTAN PANTAI PASIR TANAH PULAU OMBAK HUJAN RIBUT ANGIN LANGIT BULAN BINTANG MATAHARI
      PELANGI PETIR GURUH KILAT POKOK BUNGA RUMPUT BULUH EMBUN KABUS BANJIR LEMBAH PADANG BELUKAR KOLAM RUMAH BILIK
      PINTU TINGKAP BUMBUNG DINDING LANTAI KERUSI KATIL BANTAL SELIMUT ALMARI CERMIN LAMPU KIPAS TELEVISYEN TELEFON
      PENSEL KERTAS KASUT SELUAR PAYUNG KUNCI PISAU GARFU PINGGAN MANGKUK CAWAN GELAS BOTOL PERIUK KUALI DAPUR TIKAR
      BAKUL PENYAPU BALDI TUALA SABUN BERUS SIKAT KERETA KAPAL PERAHU BASIKAL MOTOSIKAL TEKSI KERETAPI JALAN JAMBATAN
      TEROWONG STESEN TIKET PASPORT PELANCONG BANDAR KAMPUNG PEKAN NEGERI NEGARA DUNIA PASAR KEDAI MUZIUM TAMAN ISTANA
      MENARA ABANG KAKAK NENEK DATUK KAWAN RAKAN MURID PELAJAR DOKTOR JURURAWAT POLIS ASKAR PETANI NELAYAN PEMANDU
      TUKANG PEKERJA PUTERI PAHLAWAN MERAH HIJAU KUNING PUTIH HITAM JINGGA COKLAT PERAK KELABU BESAR KECIL PANJANG
      PENDEK TINGGI RENDAH CANTIK COMEL GEMBIRA SEDIH MARAH TAKUT BERANI PANDAI RAJIN BIJAK SAYANG CINTA HARAPAN
      IMPIAN DAMAI BAHAGIA CERIA SIHAT PERLAHAN PANAS SEJUK MANIS MASAM PAHIT MASIN MINGGU TAHUN PETANG MALAM SEMALAM
      SEKOLAH KELAS BELAJAR MEMBACA MENULIS BERLARI MELOMPAT BERENANG MENYANYI MENARI BERMAIN MEMASAK MELUKIS MENDAKI
      TAKRAW GASING CONGKAK SILAT SONGKET CERITA BUNYI WARNA CAHAYA BAYANG RAHSIA HARTA HADIAH KEJUTAN PERMAINAN HURUF
      ANGKA SALJI PANGGUNG CERAH DELIMA TARIAN CADAR MONSUN TERUJA DAERAH RENANG BERTANDING CAKERAWALA GITAR BERKEBUN
      CAMAR KAWAH UTARA RAMBAI TODAK PERJALANAN PEMBARIS RAMAH KOMPUTER GEOGRAFI BERLUMBA KIMIA KAKAKTUA LEBUHRAYA
      PELAKON PEMBELI KARPET SENYUM PLANET BOMBA FIZIK UNIVERSITI MASAK PEMAIN PENGAWAL RINGAN KECEWA PERLAWANAN
      PERCUTIAN SUKUN KOTOR PELAUT MUARA SELIPAR BANGGA GUNTING ARKITEK BISING RANTING KETAWA APRIL KUETIAU DEWASA
      GENDANG SERIGALA TANJUNG HOSPITAL ANGGUR PEPATUNG WAYANG REMAJA LINTAH TERMINAL MENGEMAS IKHLAS
      `
        .trim()
        .split(/\s+/),
    ),
  ];

  // [dx, dy]: all 8 directions, so words can be forwards, backwards, up, down or diagonal
  const DIRS = [
    [1, 0],
    [0, 1],
    [1, 1],
    [-1, 1],
    [-1, 0],
    [0, -1],
    [-1, -1],
    [1, -1],
  ];
  const PAL = [200, 330, 50, 140, 270, 20, 170, 300, 90, 10]; // hues for found words

  // ---------- puzzle generator (the same puzzle number always gives the same puzzle) ----------
  // Every word has at least MIN_LEN letters. The grid only has 224 cells, so the words have to cross each other.
  const MIN_LEN = 5;

  // Picks `count` words whose total length stays within BUDGET, so they can all fit in the grid.
  function pick(r, count) {
    const picked = [];
    let sum = 0;
    for (const w of shuf([...WORDS], r)) {
      if (picked.length === count) break;
      const stillNeeded = count - picked.length - 1;
      if (sum + w.length + stillNeeded * MIN_LEN > BUDGET) continue;
      if (picked.some((p) => p.includes(w) || w.includes(p))) continue; // no word hidden inside another
      picked.push(w);
      sum += w.length;
    }
    return picked;
  }

  // Places every word, longest first. For each word it lists every spot where it fits (empty cells, or letters
  // that match), then takes the spot where it crosses the most other words out of a few random choices.
  function place(r, words) {
    const grid = Array(COLS * ROWS).fill("");
    const placed = [];
    for (const word of [...words].sort((a, b) => b.length - a.length)) {
      const len = word.length;
      const spots = [];
      for (const [dx, dy] of DIRS) {
        for (let y = 0; y < ROWS; y++) {
          for (let x = 0; x < COLS; x++) {
            const ex = x + dx * (len - 1),
              ey = y + dy * (len - 1);
            if (ex < 0 || ex >= COLS || ey < 0 || ey >= ROWS) continue;
            let overlap = 0,
              ok = true;
            for (let i = 0; i < len && ok; i++) {
              const c = grid[(y + dy * i) * COLS + x + dx * i];
              if (c === word[i]) overlap++;
              else if (c !== "") ok = false;
            }
            if (ok) spots.push({ word, x, y, dx, dy, overlap });
          }
        }
      }
      if (spots.length === 0) return null;
      let best = null;
      for (let k = 0; k < 40; k++) {
        const s = spots[(r() * spots.length) | 0];
        if (!best || s.overlap > best.overlap) best = s;
      }
      for (let i = 0; i < len; i++) {
        grid[(best.y + best.dy * i) * COLS + best.x + best.dx * i] = word[i];
      }
      placed.push({ word, x: best.x, y: best.y, dx: best.dx, dy: best.dy });
    }
    return { grid, placed };
  }

  const cache = {};
  function build(n) {
    if (cache[n]) return cache[n];
    const r = rng(n * 7919 + 101);
    const want = 30 + ((r() * 11) | 0); // 30 to 40 words, different for every puzzle
    for (let attempt = 0; attempt < 400; attempt++) {
      // a very full grid may not take every word, so after many failed tries ask for one word less
      const count = Math.max(30, want - Math.floor(attempt / 15));
      const words = pick(r, count);
      if (words.length < count) continue;
      const res = place(r, words);
      if (!res) continue;
      const letters = words.join(""); // empty cells get letters from the words, so nothing stands out
      const grid = res.grid.map(
        (c) => c || letters[(r() * letters.length) | 0],
      );
      return (cache[n] = {
        grid,
        placed: res.placed,
        words: [...words].sort(),
      });
    }
    throw new Error("Could not build puzzle " + n);
  }

  // ---------- progress ----------
  let save = {};
  try {
    save = JSON.parse(localStorage.getItem("ws1") || "{}");
  } catch (e) {}
  const syncSave = () => {
    // pull in puzzles solved in another tab, keeping the best time
    try {
      const o = JSON.parse(localStorage.getItem("ws1") || "{}");
      for (const k in o) if (!save[k] || o[k] < save[k]) save[k] = o[k];
    } catch (e) {}
  };
  const persist = () => {
    try {
      syncSave();
      const v = JSON.stringify(save);
      localStorage.setItem("ws1", v);
      return localStorage.getItem("ws1") === v; // true only if it really saved
    } catch (e) {
      return false;
    }
  };

  // ---------- game state ----------
  let cur = 1,
    P = null,
    found = new Set(),
    colorOf = [],
    won = false,
    started = false,
    elapsed = 0,
    last = 0,
    hints = 0,
    drag = null,
    pend = null, // first letter chosen by tapping, waiting for the last letter
    hintCell = -1,
    restartArm = 0;

  const lineBetween = (a, b) => {
    // cells from a to b if they are in a straight line (any of the 8 directions), else null
    const dr = Math.floor(b / COLS) - Math.floor(a / COLS),
      dc = (b % COLS) - (a % COLS);
    if (a === b || !(dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc)))
      return null;
    const steps = Math.max(Math.abs(dr), Math.abs(dc)),
      sr = Math.sign(dr),
      sc = Math.sign(dc);
    return Array.from(
      { length: steps + 1 },
      (_, i) => a + sr * i * COLS + sc * i,
    );
  };

  // While dragging, snap the finger position to the nearest of the 8 straight directions.
  const SNAP = {
    0: [0, 1],
    1: [1, 1],
    2: [1, 0],
    3: [1, -1],
    4: [0, -1],
    "-1": [-1, 1],
    "-2": [-1, 0],
    "-3": [-1, -1],
    "-4": [0, -1],
  };
  function snap(start, to) {
    const r0 = Math.floor(start / COLS),
      c0 = start % COLS;
    const dr = Math.floor(to / COLS) - r0,
      dc = (to % COLS) - c0;
    if (!dr && !dc) return start;
    const [sr, sc] = SNAP[Math.round(Math.atan2(dr, dc) / (Math.PI / 4))];
    let len =
      sr && sc
        ? Math.round((Math.abs(dr) + Math.abs(dc)) / 2)
        : Math.max(Math.abs(dr), Math.abs(dc));
    while (len > 0) {
      const r = r0 + sr * len,
        c = c0 + sc * len;
      if (r >= 0 && r < ROWS && c >= 0 && c < COLS) return r * COLS + c;
      len--;
    }
    return start;
  }

  // ---------- drawing ----------
  function renderGrid() {
    const g = $("ws_grid");
    g.innerHTML = "";
    P.grid.forEach((ch, i) => {
      const d = document.createElement("div");
      d.className = "ws-c";
      d.dataset.i = i;
      d.textContent = ch;
      g.appendChild(d);
    });
  }

  function renderWords() {
    const box = $("ws_words");
    box.innerHTML = "";
    P.words.forEach((w) => {
      const s = document.createElement("span");
      s.className = "ws-w" + (found.has(w) ? " f" : "");
      s.textContent = w;
      box.appendChild(s);
    });
    $("ws_found").textContent = found.size + " / " + P.words.length;
  }

  function paint() {
    const cells = $("ws_grid").children;
    const sel = new Set(
      drag ? lineBetween(drag.start, drag.end) || [drag.start] : [],
    );
    for (let i = 0; i < cells.length; i++) {
      const el = cells[i],
        c = colorOf[i];
      el.style.background =
        c == null ? "" : "hsla(" + PAL[c % PAL.length] + ", 70%, 55%, 0.55)";
      el.classList.toggle("ws-s", sel.has(i));
      el.classList.toggle("ws-p", i === pend);
      el.classList.toggle("ws-h", i === hintCell);
    }
  }

  function renderList() {
    const box = $("ws_lv");
    box.innerHTML = "";
    for (let n = 1; n <= PUZZLES; n++) {
      const b = document.createElement("button");
      b.className = (save[n] ? "d" : "") + (n === cur ? " cur" : "");
      b.textContent = n + (save[n] ? " ✓" : "");
      b.onclick = () => load(n);
      box.appendChild(b);
    }
  }

  function showTab(t) {
    $("ws_play").classList.toggle("hide", t !== "play");
    $("ws_list").classList.toggle("hide", t !== "list");
    document
      .querySelectorAll(".ws-tabs button")
      .forEach((b) => b.classList.toggle("on", b.dataset.w === t));
    if (t === "list") renderList();
  }

  // ---------- playing ----------
  function load(n, replay) {
    syncSave();
    cur = n;
    P = build(n);
    const done = save[n] && !replay;
    found = new Set(done ? P.words : []);
    colorOf = Array(P.grid.length).fill(null);
    if (done) {
      P.placed.forEach((p, k) => {
        for (let i = 0; i < p.word.length; i++)
          colorOf[(p.y + p.dy * i) * COLS + p.x + p.dx * i] = k;
      });
    }
    won = !!done;
    started = false;
    elapsed = 0;
    hints = 0;
    drag = null;
    pend = null;
    hintCell = -1;
    $("ws_title").textContent = "Puzzle " + n;
    $("ws_tm").textContent = done ? "✓ " + fmt(save[n]) : "0:00";
    $("ws_msg").textContent = done
      ? "✅ Completed · best time " +
        fmt(save[n]) +
        ". Tap Restart to play it again."
      : "";
    renderGrid();
    renderWords();
    paint();
    showTab("play");
  }

  const startTimer = () => {
    if (!started) {
      started = true;
      last = Date.now();
    }
  };
  // The timer only runs while the Word Search screen is on screen.
  setInterval(() => {
    if (!started || won) return;
    const now = Date.now();
    if (!$("wordsearch").classList.contains("hide") && !document.hidden)
      elapsed += now - last;
    last = now;
    $("ws_tm").textContent = fmt(Math.floor(elapsed / 1000));
  }, 500);

  function check(cells) {
    if (!cells || cells.length < 2) return;
    const s = cells.map((i) => P.grid[i]).join(""),
      rev = [...s].reverse().join("");
    const w = P.words.find((x) => !found.has(x) && (x === s || x === rev));
    if (!w) return;
    const colour = found.size;
    found.add(w);
    cells.forEach((i) => (colorOf[i] = colour));
    renderWords();
    if (found.size === P.words.length) win();
  }

  function win() {
    won = true;
    const t = Math.max(1, Math.floor(elapsed / 1000));
    if (!save[cur] || t < save[cur]) save[cur] = t;
    const saved = persist();
    if (window.GH) GH.submit("wordsearch", Object.keys(save).length);
    $("ws_msg").textContent =
      "🎉 Puzzle " +
      cur +
      " solved in " +
      fmt(t) +
      (hints ? " with " + hints + " hint(s)" : "") +
      "!" +
      (saved ? "" : " ⚠️ Could not save progress on this device");
    $("ws_tm").textContent = "✓ " + fmt(t);
  }

  const cellOf = (el) => {
    const c = el && el.closest ? el.closest(".ws-c") : null;
    return c ? +c.dataset.i : -1;
  };
  const grid = $("ws_grid");
  grid.addEventListener("pointerdown", (e) => {
    const c = cellOf(e.target);
    if (c < 0 || won) return;
    e.preventDefault();
    startTimer();
    drag = { start: c, end: c };
    try {
      grid.setPointerCapture(e.pointerId);
    } catch (err) {}
    paint();
  });
  grid.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const c = cellOf(document.elementFromPoint(e.clientX, e.clientY));
    if (c >= 0) {
      drag.end = snap(drag.start, c);
      paint();
    }
  });
  grid.addEventListener("pointerup", () => {
    if (!drag) return;
    const { start, end } = drag;
    drag = null;
    if (start !== end) {
      check(lineBetween(start, end)); // dragged from the first to the last letter
      pend = null;
    } else if (pend === null) {
      pend = start; // first tap: remember the first letter
    } else if (pend === start) {
      pend = null; // tapped the same letter again: cancel
    } else {
      const line = lineBetween(pend, start); // second tap: the last letter
      if (line) {
        check(line);
        pend = null;
      } else pend = start; // not in a straight line: start over from this letter
    }
    paint();
  });
  grid.addEventListener("pointercancel", () => {
    drag = null;
    paint();
  });

  document
    .querySelectorAll(".ws-tabs button")
    .forEach((b) => (b.onclick = () => showTab(b.dataset.w)));
  $("ws_nx").onclick = () => load((cur % PUZZLES) + 1);
  $("ws_hint").onclick = () => {
    if (won) return;
    startTimer();
    const left = P.words.filter((w) => !found.has(w));
    const p = P.placed.find(
      (x) => x.word === left[(Math.random() * left.length) | 0],
    );
    hintCell = p.y * COLS + p.x; // shows where the word starts
    hints++;
    paint();
    setTimeout(() => {
      hintCell = -1;
      paint();
    }, 1800);
  };
  $("ws_rp").onclick = () => {
    if (!won && found.size > 0 && !restartArm) {
      // in the middle of a puzzle: ask for a second tap so nothing is lost by accident
      restartArm = setTimeout(() => {
        restartArm = 0;
        $("ws_rp").textContent = "🔁 Restart";
      }, 2500);
      $("ws_rp").textContent = "Tap again to restart";
      return;
    }
    clearTimeout(restartArm);
    restartArm = 0;
    $("ws_rp").textContent = "🔁 Restart";
    load(cur, true);
  };

  let first = 1;
  while (first <= PUZZLES && save[first]) first++;
  load(first > PUZZLES ? 1 : first);
})();
