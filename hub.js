// Game Hub: Home, Sudoku, Tile Match, Word Search and Guess a Word
(() => {
  const $ = (id) => document.getElementById(id);
  const V = ["home", "sudoku", "tile", "wordsearch", "guess"];

  function readProgress(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || "{}");
    } catch (e) {
      return {};
    }
  }

  function stats() {
    const sudoku = Object.keys(readProgress("sdk100")).length;
    const tileLevel = readProgress("tile1").lvl || 1;
    const puzzles = Object.keys(readProgress("ws1")).length;
    const wordsGuessed = Math.max(
      0,
      Number(readProgress("guessword1").count) || 0,
    );
    const wordLevel = Math.floor(wordsGuessed / 10) + 1;

    $("hs1").textContent = sudoku;
    $("hs2").textContent = tileLevel;
    $("hs3").textContent = puzzles;
    $("hs4").textContent = wordsGuessed;

    $("hp1").textContent = sudoku + " / 300 solved";
    $("hp2").textContent = "Level " + tileLevel;
    $("hp3").textContent = puzzles + " / 100 solved";
    $("hp4").textContent = "Level " + wordLevel;
  }

  function go(v) {
    if (!V.includes(v)) return;

    V.forEach((k) => {
      $(k).classList.toggle("hide", k !== v);
    });

    window.scrollTo(0, 0);

    if (v === "home") {
      stats();
      window.GH && GH.refresh();
    }
  }

  document.addEventListener("click", (e) => {
    const button = e.target.closest("[data-go]");
    if (button) go(button.dataset.go);
  });

  // Check whether browser storage is available
  try {
    localStorage.setItem("gh_t", "1");
    localStorage.removeItem("gh_t");
  } catch (e) {
    $("h_warn").classList.remove("hide");
  }

  stats();

  window.addEventListener("storage", stats);

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) stats();
  });
})();
