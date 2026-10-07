// Optional global leaderboard using a Google Sheet + Apps Script (see README).
// Paste your Apps Script Web app URL below. Leave it empty to hide the leaderboard.
const API_URL =
  "https://script.google.com/macros/s/AKfycbxBWzBKk6MM5OgfzzhkGkxabAZ_BTKdqA-NWjcUTHc3K5zud9rt1rSkXVnwZJZg5guR/exec";
(() => {
  const $ = (id) => document.getElementById(id),
    on = !!API_URL;
  const UNIT = {
    sudoku: "Score = levels solved",
    tile: "Score = highest level cleared",
  };
  let game = "sudoku";
  const lsGet = (k) => {
    try {
      return localStorage.getItem(k) || "";
    } catch (e) {
      return "";
    }
  };
  let mem = ""; // fallback if the browser blocks localStorage (e.g. private mode)
  const nick = () => lsGet("gh_name") || mem;
  const call = async (q) =>
    (await fetch(API_URL + "?" + new URLSearchParams(q))).json();
  function progress(g) {
    try {
      return g === "sudoku"
        ? Object.keys(JSON.parse(lsGet("sdk100") || "{}")).length
        : Math.max(0, (JSON.parse(lsGet("tile1") || "{}").lvl || 1) - 1);
    } catch (e) {
      return 0;
    }
  }
  async function submit(g, score) {
    if (!on || !nick() || !(score > 0)) return null;
    try {
      const r = await call({ action: "submit", game: g, name: nick(), score });
      if (g === game) load();
      return !!r.ok;
    } catch (e) {
      return false;
    }
  }
  function render(list) {
    const box = $("lb_list"),
      me = nick().toLowerCase();
    box.textContent = "";
    if (!list.length) {
      box.textContent = "No scores yet. Be the first!";
      return;
    }
    list.forEach((x, i) => {
      const r = document.createElement("div"),
        a = document.createElement("span"),
        b = document.createElement("span"),
        c = document.createElement("b");
      r.className = "lb-row" + (x.name.toLowerCase() === me ? " me" : "");
      a.textContent = ["🥇", "🥈", "🥉"][i] || i + 1;
      b.textContent = x.name;
      c.textContent = x.score;
      r.append(a, b, c);
      box.appendChild(r);
    });
  }
  async function load() {
    if (!on) return;
    $("lb_unit").textContent = UNIT[game];
    $("lb_list").textContent = "Loading…";
    try {
      const r = await call({ action: "top", game });
      if (!r.ok) throw 0;
      render(r.list);
    } catch (e) {
      $("lb_list").textContent = "Could not load the ranking. Try again later.";
    }
  }
  window.GH = { submit, refresh: load }; // used by sudoku.js, tile.js and hub.js (all optional)
  if (!on) return;
  $("lb_card").classList.remove("hide");
  $("lb_name").value = nick();
  $("lb_card").addEventListener("click", (e) => {
    const g = e.target.dataset && e.target.dataset.g;
    if (!g) return;
    game = g;
    document
      .querySelectorAll("#lb_card [data-g]")
      .forEach((b) => b.classList.toggle("on", b === e.target));
    load();
  });
  $("lb_save").onclick = async () => {
    const n = $("lb_name")
      .value.replace(/[<>"'`\\]/g, "")
      .trim()
      .slice(0, 15);
    if (!n) return;
    mem = n;
    try {
      localStorage.setItem("gh_name", n);
    } catch (e) {}
    $("lb_save").textContent = "Saving…";
    await submit("sudoku", progress("sudoku"));
    await submit("tile", progress("tile")); // sync existing progress
    $("lb_save").textContent = "Saved ✓";
    setTimeout(() => ($("lb_save").textContent = "Save"), 1500);
    load();
  };
  load();
})();
