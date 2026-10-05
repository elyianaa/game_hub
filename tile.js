// Tile Match game (self-contained, does not depend on the other JS files).
(() => {
  const $ = (id) => document.getElementById(id),
    E = ["🍎","🍌","🍇","🍓","🍒","🥕","🌽","🍉","🍑","🥝","🍋","🍍",];
  
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
  let sv = { lvl: 1 };
  try {
    sv = Object.assign(sv, JSON.parse(localStorage.getItem("tile1") || "{}"));
  } catch (e) {}
  const persist = () => {
    try {
      localStorage.setItem("tile1", JSON.stringify(sv));
    } catch (e) {}
  };
  let C = 6,
    lvl = sv.lvl,
    T = [],
    tray = [],
    hist = [],
    pw = {},
    busy = false,
    over = false;
  const blocked = (t) =>
    T.some(
      (o) =>
        o.s === "b" &&
        o.l > t.l &&
        Math.abs(o.x - t.x) < 1 &&
        Math.abs(o.y - t.y) < 1,
    );
  const AN = [
    [1, 21],
    [10, 60],
    [20, 90],
    [30, 150],
    [40, 210],
    [50, 300],
  ];
  function size(n) {
    if (n > 50) return 450;
    let i = 0;
    while (n > AN[i + 1][0]) i++;
    const [l0, t0] = AN[i],
      [l1, t1] = AN[i + 1];
    return Math.round((t0 + ((t1 - t0) * (n - l0)) / (l1 - l0)) / 3) * 3;
  }
  function start(n) {
    try {
      begin(n);
    } catch (err) {
      $("t_board").textContent = "Tile Match error: " + err.message;
      console.error(err);
    }
  }
  const PATS = [
    ["Heart", "heart"],
    ["Diamond", "diamond"],
    ["Triangle", "tri"],
    ["Cross", "cross"],
    ["Lines", "rows"],
    ["Circle", "circle"],
    ["Columns", "cols"],
    ["Mahjong", "rect"],
  ];
  // Each pattern is a shape test on normalised coordinates (u,v in -1..1). Tiles may only land inside the shape.
  const MASK = {
    heart: (u, v) => {
      const x = u * 1.2,
        y = -v * 1.15 + 0.15,
        a = x * x + y * y - 1;
      return a * a * a - x * x * y * y * y <= 0;
    },
    diamond: (u, v) => Math.abs(u) + Math.abs(v) <= 1,
    tri: (u, v) => Math.abs(u) <= (v + 1) / 2 + 0.02,
    cross: (u, v) => Math.abs(u) <= 0.34 || Math.abs(v) <= 0.34,
    circle: (u, v) => u * u + v * v <= 1,
    rect: () => true,
    rows: (u, v, cx, cy) => cy % 2 === 0,
    cols: (u, v, cx, cy) => cx % 2 === 0,
  };
  // Random + stack layout inside the pattern. Tiles are dropped one by one and always land on top of whatever they overlap:
  //  25% exactly on an existing spot (a tower, only the top tile is visible),
  //  30% half a tile off an existing spot (overlaps partly, like bricks),
  //  45% at a spot far from the others (spreads tiles over the whole shape).
  // MAXL limits how many tiles can pile up, and grows with the level.
  function layout(total, r, MAXL, key) {
    const R = C + 1,
      T = [],
      spots = [],
      cand = [],
      m = MASK[key],
      ov = (a, b) => Math.abs(a.x - b.x) < 1 && Math.abs(a.y - b.y) < 1;
    const inside = (x, y) =>
      m(
        ((x + 0.5) / C) * 2 - 1,
        ((y + 0.5) / R) * 2 - 1,
        Math.floor(x),
        Math.floor(y),
      );
    for (let x = 0; x <= C - 1; x += 0.5)
      for (let y = 0; y <= R - 1; y += 0.5) if (inside(x, y)) cand.push([x, y]);
    const H = [
      [0.5, 0],
      [-0.5, 0],
      [0, 0.5],
      [0, -0.5],
      [0.5, 0.5],
      [-0.5, 0.5],
      [0.5, -0.5],
      [-0.5, -0.5],
    ];
    const put = (x, y) => {
      if (x < 0 || y < 0 || x > C - 1 || y > R - 1 || !inside(x, y))
        return false;
      const t = { x, y, l: 0, k: 0, s: "b" };
      let l = 0;
      for (const o of T) if (ov(o, t) && o.l >= l) l = o.l + 1;
      if (l > MAXL) return false;
      t.l = l;
      T.push(t);
      if (!spots.some((p) => p.x === x && p.y === y)) spots.push({ x, y });
      return true;
    };
    for (let g = 0; T.length < total && g < 12000; g++) {
      const p = r();
      let ok = false;
      if (spots.length && p < 0.25) {
        const q = spots[(r() * spots.length) | 0];
        ok = put(q.x, q.y);
      } else if (spots.length && p < 0.55) {
        const q = spots[(r() * spots.length) | 0],
          h = H[(r() * 8) | 0];
        ok = put(q.x + h[0], q.y + h[1]);
      }
      if (!ok) {
        let b = cand[0],
          bd = -1;
        for (let i = 0; i < 8; i++) {
          const c = cand[(r() * cand.length) | 0];
          let d = 9e9;
          for (const q of spots)
            d = Math.min(d, (q.x - c[0]) ** 2 + (q.y - c[1]) ** 2);
          if (d > bd) {
            bd = d;
            b = c;
          }
        }
        put(b[0], b[1]);
      }
    }
    return T;
  }
  function begin(n) {
    lvl = n;
    over = false;
    busy = false;
    tray = [];
    hist = [];
    pw = { u: 2, s: 1, o: 1 };
    $("t_ov").classList.add("hide");
    const r = rng(n * 104729 + 7),
      pat = PATS[(n - 1) % PATS.length],
      kinds = Math.min(12, 3 + Math.ceil(n * 0.9)),
      want = size(n);
    const base =
      want <= 45
        ? 5
        : want <= 90
          ? 6
          : want <= 150
            ? 7
            : want <= 210
              ? 8
              : want <= 300
                ? 9
                : 10;
    let cap = Math.min(12, 3 + (n >> 2));
    for (C = base; ; C++) {
      T = layout(want, r, cap, pat[1]);
      if (T.length >= want) break;
      if (C >= 10) {
        if (cap > 80) break;
        C = base - 1;
        cap += 4;
      }
    } // shape too small for every tile: first a bigger board, then taller piles
    while (T.length % 3) T.pop();
    const N = T.length,
      ks = [];
    for (let i = 0; i < N / 3; i++) ks.push(i % kinds);
    const tk = shuf(ks, r);
    // Every level is solvable: fruit are dealt in a valid clearing order (always take a free tile), 3 of a kind at a time.
    const up = T.map(() => []),
      dn = T.map(() => []);
    for (let i = 0; i < N; i++)
      for (let j = 0; j < N; j++)
        if (
          T[j].l > T[i].l &&
          Math.abs(T[j].x - T[i].x) < 1 &&
          Math.abs(T[j].y - T[i].y) < 1
        ) {
          up[i].push(j);
          dn[j].push(i);
        }
    const cnt = up.map((a) => a.length),
      free = [];
    cnt.forEach((c, i) => {
      if (!c) free.push(i);
    });
    for (let j = 0; free.length; j++) {
      const f = free.splice((r() * free.length) | 0, 1)[0];
      T[f].k = tk[(j / 3) | 0];
      dn[f].forEach((b) => {
        if (--cnt[b] === 0) free.push(b);
      });
    }
    const B = $("t_board");
    B.style.aspectRatio = C + "/" + (C + 1);
    B.style.setProperty("--fs", (54 / C).toFixed(2) + "cqw");
    render();
  }
  function render() {
    $("t_board").innerHTML = T.filter((t) => t.s === "b")
      .sort((a, b) => a.l - b.l)
      .map(
        (t) =>
          `<div class="t-tile${blocked(t) ? " blk" : ""}" data-i="${T.indexOf(t)}" style="left:${(t.x / C) * 100}%;top:${(t.y / (C + 1)) * 100}%;width:${100 / C}%;height:${100 / (C + 1)}%;z-index:${t.l + 1}"><div class="t-face">${E[t.k]}</div></div>`,
      )
      .join("");
    $("t_tray").innerHTML = Array.from({ length: 7 }, (_, i) => {
      const t = tray[i];
      return `<div class="t-slot">${t ? `<div class="t-face${t.pop ? " pop" : ""}">${E[t.k]}</div>` : ""}</div>`;
    }).join("");
    $("t_lvl").textContent = lvl;
    $("t_left").textContent =
      T.filter((t) => t.s === "b").length + tray.length + " tiles left";
    $("t_undo").textContent = "↩ Undo (" + pw.u + ")";
    $("t_shuf").textContent = "🔀 Shuffle (" + pw.s + ")";
    $("t_out").textContent = "📤 Move out (" + pw.o + ")";
  }
  function end(win) {
    over = true;
    $("t_ovt").textContent = win
      ? "🎉 Level " + lvl + " cleared!"
      : "😵 Tray is full!";
    const b = $("t_ovb");
    b.textContent = win ? "Next level ▶" : "Try again";
    b.onclick = () => start(win ? lvl + 1 : lvl);
    $("t_ov").classList.remove("hide");
    if (win) {
      sv.lvl = Math.max(sv.lvl, lvl + 1);
      persist();
      window.GH && GH.submit("tile", sv.lvl - 1);
    }
  }
  $("t_board").onclick = (e) => {
    const el = e.target.closest(".t-tile");
    if (!el || over || busy) return;
    const t = T[+el.dataset.i];
    if (blocked(t) || tray.length >= 7) return;
    t.s = "t";
    hist.push(t);
    const p = tray.map((x) => x.k).lastIndexOf(t.k);
    p < 0 ? tray.push(t) : tray.splice(p + 1, 0, t);
    const m = tray.filter((x) => x.k === t.k).slice(0, 3);
    if (m.length === 3) {
      busy = true;
      m.forEach((x) => (x.pop = 1));
      render();
      setTimeout(() => {
        m.forEach((x) => (x.s = "x"));
        tray = tray.filter((x) => x.s === "t");
        busy = false;
        render();
        if (!T.some((x) => x.s !== "x")) end(true);
      }, 260);
    } else {
      render();
      if (tray.length >= 7) end(false);
    }
  };
  $("t_undo").onclick = () => {
    if (over || busy || !pw.u) return;
    while (hist.length && hist[hist.length - 1].s !== "t") hist.pop();
    const t = hist.pop();
    if (!t) return;
    tray.splice(tray.indexOf(t), 1);
    t.s = "b";
    pw.u--;
    render();
  };
  $("t_shuf").onclick = () => {
    if (over || busy || !pw.s) return;
    const b = T.filter((t) => t.s === "b"),
      k = shuf(
        b.map((t) => t.k),
        Math.random,
      );
    b.forEach((t, i) => (t.k = k[i]));
    pw.s--;
    render();
  };
  $("t_out").onclick = () => {
    if (over || busy || !pw.o || !tray.length) return;
    const t = tray.shift(),
      R = C + 1; // the leftmost tray tile goes back to a random spot, landing on top of whatever is there
    t.x = ((Math.random() * (C * 2 - 1)) | 0) / 2;
    t.y = ((Math.random() * (R * 2 - 1)) | 0) / 2;
    t.l = 0;
    for (const o of T)
      if (
        o.s === "b" &&
        Math.abs(o.x - t.x) < 1 &&
        Math.abs(o.y - t.y) < 1 &&
        o.l >= t.l
      )
        t.l = o.l + 1;
    t.s = "b";
    pw.o--;
    render();
  };
  $("t_rst").onclick = () => start(lvl);
  window.tileStart = (n) => start(n || lvl);
  start(lvl);
})();
