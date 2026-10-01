// Sudoku: puzzle generator, solver, game UI, level list and answer sheets.
const N = 100;
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
const isBeg = (l) => l % 5 < 3; // levels 1-3 beginner, 4-5 intermediate, repeating -> 60 / 40
const units = [];
for (let k = 0; k < 9; k++) {
  const r = [],
    c = [],
    b = [];
  for (let j = 0; j < 9; j++) {
    r.push(k * 9 + j);
    c.push(j * 9 + k);
    b.push((((k / 3) | 0) * 3 + ((j / 3) | 0)) * 9 + (k % 3) * 3 + (j % 3));
  }
  units.push(r, c, b);
}
function cand(g, i) {
  let m = 0;
  const r = (i / 9) | 0,
    c = i % 9;
  for (let k = 0; k < 9; k++) {
    m |= 1 << g[r * 9 + k];
    m |= 1 << g[k * 9 + c];
  }
  const br = r - (r % 3),
    bc = c - (c % 3);
  for (let a = 0; a < 3; a++)
    for (let b = 0; b < 3; b++) m |= 1 << g[(br + a) * 9 + bc + b];
  return 511 & ~(m >> 1);
}
const pc = (m) => {
  let n = 0;
  while (m) {
    m &= m - 1;
    n++;
  }
  return n;
};
function count(g, lim) {
  let bi = -1,
    bm = 0,
    bn = 10;
  for (let i = 0; i < 81; i++)
    if (!g[i]) {
      const m = cand(g, i),
        n = pc(m);
      if (n < bn) {
        bn = n;
        bi = i;
        bm = m;
        if (n < 2) break;
      }
    }
  if (bi < 0) return 1;
  let t = 0;
  for (let d = 0; d < 9; d++)
    if ((bm >> d) & 1) {
      g[bi] = d + 1;
      t += count(g, lim - t);
      g[bi] = 0;
      if (t >= lim) break;
    }
  return t;
}
function singles(p) {
  const g = p.slice();
  let go = true;
  while (go) {
    go = false;
    for (let i = 0; i < 81; i++)
      if (!g[i]) {
        const m = cand(g, i);
        if (pc(m) === 1) {
          g[i] = Math.log2(m) + 1;
          go = true;
        }
      }
    for (const u of units)
      for (let d = 1; d <= 9; d++) {
        let f = -1,
          n = 0;
        for (const i of u) {
          if (g[i] === d) {
            n = 9;
            break;
          }
          if (!g[i] && (cand(g, i) >> (d - 1)) & 1) {
            n++;
            f = i;
          }
        }
        if (n === 1) {
          g[f] = d;
          go = true;
        }
      }
  }
  return g.every((x) => x);
}
const cache = {};
function gen(l) {
  if (cache[l]) return cache[l];
  const r = rng(l * 7919 + 13),
    beg = isBeg(l);
  const bands = () =>
    shuf([0, 1, 2], r).flatMap((b) => shuf([0, 1, 2], r).map((x) => b * 3 + x));
  const R = bands(),
    C = bands(),
    D = shuf([1, 2, 3, 4, 5, 6, 7, 8, 9], r),
    s = [];
  for (let i = 0; i < 9; i++)
    for (let j = 0; j < 9; j++)
      s.push(D[(3 * (R[i] % 3) + ((R[i] / 3) | 0) + C[j]) % 9]);
  const g = s.slice(),
    order = shuf([...Array(81).keys()], r),
    target = beg ? 36 + ((r() * 5) | 0) : 29 + ((r() * 4) | 0);
  let givens = 81;
  for (const i of order) {
    if (givens <= target) break;
    const v = g[i];
    g[i] = 0;
    if (count(g.slice(), 2) !== 1 || (beg && !singles(g))) g[i] = v;
    else givens--;
  }
  return (cache[l] = { p: g, s, beg });
}

const $ = (id) => document.getElementById(id);
let lv = 1,
  u,
  notes,
  sel = -1,
  noteMode = false,
  t0 = 0,
  started = false,
  paused = false,
  pauseAt = 0,
  tick,
  won = false,
  hints = 0,
  save = {};
const startTimer = () => {
  if (!started) {
    started = true;
    t0 = Date.now();
  }
};
function setPause(on) {
  if (won || on === paused) return;
  paused = on;
  if (on) pauseAt = Date.now();
  else if (started) t0 += Date.now() - pauseAt;
  $("pov").classList.toggle("hide", !on);
  $("pause").textContent = on ? "▶ Resume" : "⏸ Pause";
}
function tickFn() {
  if (!started || won || paused) return;
  if (
    ["sudoku", "play"].some((id) =>
      document.getElementById(id).classList.contains("hide"),
    )
  ) {
    setPause(true);
    return;
  }
  $("tm").textContent = fmt(((Date.now() - t0) / 1000) | 0);
}
try {
  save = JSON.parse(localStorage.getItem("sdk100") || "{}");
} catch (e) {}
const persist = () => {
  try {
    localStorage.setItem("sdk100", JSON.stringify(save));
  } catch (e) {}
};
const fmt = (s) => ((s / 60) | 0) + ":" + String(s % 60).padStart(2, "0");

function load(l, replay) {
  lv = l;
  const q = gen(l),
    done = save[l] && !replay;
  u = (done ? q.s : q.p).slice();
  notes = Array(81).fill(0);
  sel = -1;
  won = !!done;
  hints = 0;
  paused = false;
  $("pov").classList.add("hide");
  $("pause").textContent = "⏸ Pause";
  $("msg").textContent = done
    ? "✅ Completed · best time " +
      fmt(save[l]) +
      ". Tap Replay to solve it again."
    : "";
  $("lvn").textContent = l;
  const b = $("lvb");
  b.textContent = q.beg ? "Beginner" : "Intermediate";
  b.className = "badge " + (q.beg ? "b" : "i");
  started = false;
  t0 = 0;
  clearInterval(tick);
  tick = setInterval(tickFn, 500);
  $("tm").textContent = done ? "✓ " + fmt(save[l]) : "0:00";
  draw();
  showTab("play");
}

function errs() {
  const e = new Set();
  for (const un of units) {
    const seen = {};
    for (const i of un) {
      const v = u[i];
      if (!v) continue;
      (seen[v] = seen[v] || []).push(i);
    }
    for (const k in seen)
      if (seen[k].length > 1) seen[k].forEach((i) => e.add(i));
  }
  return e;
}
function draw() {
  const q = gen(lv),
    e = errs(),
    B = $("board");
  B.innerHTML = "";
  const sv = sel >= 0 ? u[sel] : 0;
  for (let i = 0; i < 81; i++) {
    const d = document.createElement("div");
    let c = "c";
    if (q.p[i]) c += " g";
    else if (u[i]) c += " u";
    if (sel >= 0) {
      const r = (i / 9) | 0,
        cc = i % 9,
        sr = (sel / 9) | 0,
        sc = sel % 9;
      if (i === sel) c += " sel";
      else if (sv && u[i] === sv) c += " s2";
      else if (
        r === sr ||
        cc === sc ||
        (((r / 3) | 0) === ((sr / 3) | 0) && ((cc / 3) | 0) === ((sc / 3) | 0))
      )
        c += " p";
    }
    if (e.has(i) && !q.p[i]) c += " e";
    d.className = c;
    if (u[i]) d.textContent = u[i];
    else if (notes[i]) {
      let h = '<div class="n">';
      for (let k = 0; k < 9; k++)
        h += "<span>" + ((notes[i] >> k) & 1 ? k + 1 : "") + "</span>";
      d.innerHTML = h + "</div>";
    }
    d.onclick = () => {
      if (paused) return;
      startTimer();
      sel = i;
      draw();
    };
    B.appendChild(d);
  }
  checkWin();
}
function checkWin() {
  if (won || u.some((x) => !x)) return;
  const q = gen(lv);
  if (u.every((x, i) => x === q.s[i])) {
    won = true;
    const t = Math.max(1, ((Date.now() - t0) / 1000) | 0);
    if (!save[lv] || t < save[lv]) save[lv] = t;
    persist();
    $("msg").textContent =
      "🎉 Solved in " +
      fmt(t) +
      (hints ? " with " + hints + " hint(s)" : "") +
      "!";
    buildLevels();
  }
}
function put(v) {
  if (sel < 0 || won || paused) return;
  startTimer();
  const q = gen(lv);
  if (q.p[sel]) return;
  if (noteMode && v) {
    if (u[sel]) return;
    notes[sel] ^= 1 << (v - 1);
  } else {
    u[sel] = v;
    notes[sel] = 0;
    if (v)
      for (const un of units)
        if (un.includes(sel))
          for (const i of un) if (!q.p[i]) notes[i] &= ~(1 << (v - 1));
  }
  draw();
}
$("pad").innerHTML = [1, 2, 3, 4, 5, 6, 7, 8, 9]
  .map((n) => "<button>" + n + "</button>")
  .join("");
[...$("pad").children].forEach((b, i) => (b.onclick = () => put(i + 1)));
$("er").onclick = () => put(0);
$("note").onclick = (e) => {
  noteMode = !noteMode;
  e.target.classList.toggle("on", noteMode);
};
$("hint").onclick = () => {
  if (won || paused) return;
  startTimer();
  const q = gen(lv);
  let i = sel;
  if (i < 0 || q.p[i] || u[i] === q.s[i]) {
    const w = [];
    for (let k = 0; k < 81; k++) if (u[k] !== q.s[k]) w.push(k);
    if (!w.length) return;
    i = w[0];
  }
  sel = i;
  u[i] = q.s[i];
  notes[i] = 0;
  hints++;
  draw();
};
$("nx").onclick = () => load((lv % N) + 1);
$("pause").onclick = () => setPause(!paused);
$("pov").onclick = () => setPause(false);
let rpArm = 0;
$("rp").onclick = () => {
  const q = gen(lv),
    dirty = !won && u.some((x, i) => x !== q.p[i]);
  if (dirty && !rpArm) {
    rpArm = setTimeout(() => {
      rpArm = 0;
      $("rp").textContent = "🔁 Replay";
    }, 2500);
    $("rp").textContent = "Tap again to reset";
    return;
  }
  clearTimeout(rpArm);
  rpArm = 0;
  $("rp").textContent = "🔁 Replay";
  load(lv, true);
};
document.addEventListener("keydown", (e) => {
  if (
    $("sudoku").classList.contains("hide") ||
    $("play").classList.contains("hide")
  )
    return;
  if (e.key >= "1" && e.key <= "9") put(+e.key);
  else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") put(0);
  else if (sel >= 0) {
    const m = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -9, ArrowDown: 9 }[
      e.key
    ];
    if (m) {
      const n = sel + m;
      if (
        n >= 0 &&
        n < 81 &&
        !(m === -1 && sel % 9 === 0) &&
        !(m === 1 && sel % 9 === 8)
      ) {
        sel = n;
        draw();
      }
      e.preventDefault();
    }
  }
});

function buildLevels() {
  const L = $("lv");
  L.innerHTML = "";
  for (let l = 1; l <= N; l++) {
    const b = document.createElement("button");
    b.className =
      (isBeg(l) ? "b" : "i") + (save[l] ? " d" : "") + (l === lv ? " cur" : "");
    b.textContent = l + (save[l] ? " ✓" : "");
    b.onclick = () => load(l);
    L.appendChild(b);
  }
}

let af = "all",
  built = 0;
function card(l) {
  const q = gen(l),
    d = document.createElement("div");
  d.className = "ac";
  d.dataset.b = q.beg ? "b" : "i";
  let h =
    "<h4><span>Level " +
    l +
    '</span><span style="color:var(--' +
    (q.beg ? "beg" : "int") +
    ')">' +
    (q.beg ? "Beginner" : "Intermediate") +
    "</span></h4><table>";
  for (let r = 0; r < 9; r++) {
    h += "<tr>";
    for (let c = 0; c < 9; c++) {
      const i = r * 9 + c;
      h += "<td" + (q.p[i] ? ' class="g"' : "") + ">" + q.s[i] + "</td>";
    }
    h += "</tr>";
  }
  d.innerHTML = h + "</table>";
  return d;
}
function buildAnswers() {
  if (built >= N) return;
  $("ansmsg").textContent = "Preparing answer sheets… " + built + "/" + N;
  const end = Math.min(N, built + 10);
  for (let l = built + 1; l <= end; l++) $("ans").appendChild(card(l));
  built = end;
  applyF();
  if (built < N) setTimeout(buildAnswers, 10);
  else
    $("ansmsg").textContent =
      "Bold digits = given clues; light digits = the solution you fill in.";
}
function applyF() {
  [...$("ans").children].forEach((c) =>
    c.classList.toggle("hide", af !== "all" && c.dataset.b !== af),
  );
}
$("flt").onclick = (e) => {
  const f = e.target.dataset.f;
  if (!f) return;
  af = f;
  [...$("flt").children].forEach((b) =>
    b.classList.toggle("on", b === e.target),
  );
  applyF();
};

function showTab(t) {
  ["play", "levels", "answers"].forEach((k) =>
    $(k).classList.toggle("hide", k !== t),
  );
  document
    .querySelectorAll(".tabs button")
    .forEach((b) => b.classList.toggle("on", b.dataset.t === t));
  if (t === "levels") buildLevels();
  if (t === "answers") buildAnswers();
}
document
  .querySelectorAll(".tabs button")
  .forEach((b) => (b.onclick = () => showTab(b.dataset.t)));

const first = [...Array(N).keys()].map((i) => i + 1).find((l) => !save[l]) || 1;
load(first);
