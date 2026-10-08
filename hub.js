// Game Hub: switches between Home, Sudoku and Tile Match, and shows progress stats.
(() => {
  const $ = (id) => document.getElementById(id),
    V = ["home", "sudoku", "tile"];
  function stats() {
    let s = {},
      t = {};
    try {
      s = JSON.parse(localStorage.getItem("sdk100") || "{}");
    } catch (e) {}
    try {
      t = JSON.parse(localStorage.getItem("tile1") || "{}");
    } catch (e) {}
    const n = Object.keys(s).length,
      l = t.lvl || 1;
    $("hs1").textContent = n;
    $("hs2").textContent = l;
    $("hp1").textContent = n + " / 200 solved";
    $("hp2").textContent = "Level " + l;
  }
  function go(v) {
    V.forEach((k) => $(k).classList.toggle("hide", k !== v));
    window.scrollTo(0, 0);
    if (v === "home") {
      stats();
      window.GH && GH.refresh();
    }
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-go]");
    if (b) go(b.dataset.go);
  });
  try {
    localStorage.setItem("gh_t", "1");
    localStorage.removeItem("gh_t");
  } catch (e) {
    $("h_warn").classList.remove("hide");
  } // storage blocked: progress cannot be saved
  stats();
  window.addEventListener("storage", stats);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) stats();
  }); // refresh when progress changes in another tab
})();
