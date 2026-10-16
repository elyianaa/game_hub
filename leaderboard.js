const API_URL =
  "https://script.google.com/macros/s/AKfycbxBWzBKk6MM5OgfzzhkGkxabAZ_BTKdqA-NWjcUTHc3K5zud9rt1rSkXVnwZJZg5guR/exec";

(() => {
  const $ = (id) => document.getElementById(id);
  const on = !!API_URL;

  const UNIT = {
    sudoku: "Score = levels solved",
    tile: "Score = highest level cleared",
    wordsearch: "Score = puzzles solved",
    guess: "Score = words guessed correctly",
  };

  let game = "sudoku";

  const lsGet = (key) => {
    try {
      return localStorage.getItem(key) || "";
    } catch (e) {
      return "";
    }
  };

  let mem = "";

  const nick = () => lsGet("gh_name") || mem;

  const call = async (params) =>
    (await fetch(API_URL + "?" + new URLSearchParams(params))).json();

  function progress(g) {
    try {
      if (g === "sudoku") {
        return Object.keys(JSON.parse(lsGet("sdk100") || "{}")).length;
      }

      if (g === "tile") {
        return Math.max(0, (JSON.parse(lsGet("tile1") || "{}").lvl || 1) - 1);
      }

      if (g === "wordsearch") {
        return Object.keys(JSON.parse(lsGet("ws1") || "{}")).length;
      }

      if (g === "guess") {
        const saved = JSON.parse(lsGet("guessword1") || "{}");

        return Math.max(0, Number(saved.count) || 0);
      }

      return 0;
    } catch (e) {
      return 0;
    }
  }

  async function submit(g, score) {
    if (!on || !nick() || !(score > 0)) return null;

    try {
      const result = await call({
        action: "submit",
        game: g,
        name: nick(),
        score,
      });

      if (g === game) load();

      return !!result.ok;
    } catch (e) {
      return false;
    }
  }

  function render(list) {
    const box = $("lb_list");
    const me = nick().toLowerCase();

    box.textContent = "";

    if (!list.length) {
      box.textContent = "No scores yet. Be the first!";
      return;
    }

    list.forEach((player, i) => {
      const row = document.createElement("div");
      const rank = document.createElement("span");
      const name = document.createElement("span");
      const score = document.createElement("b");

      row.className =
        "lb-row" + (player.name.toLowerCase() === me ? " me" : "");

      rank.textContent = ["🥇", "🥈", "🥉"][i] || i + 1;
      name.textContent = player.name;
      score.textContent = player.score;

      row.append(rank, name, score);
      box.appendChild(row);
    });
  }

  async function load() {
    if (!on) return;

    $("lb_unit").textContent = UNIT[game];
    $("lb_list").textContent = "Loading…";

    try {
      const result = await call({
        action: "top",
        game,
      });

      if (!result.ok) throw new Error("Could not load leaderboard");

      render(result.list);
    } catch (e) {
      $("lb_list").textContent = "Could not load the ranking. Try again later.";
    }
  }

  window.GH = {
    submit,
    refresh: load,
  };

  if (!on) return;

  $("lb_card").classList.remove("hide");
  $("lb_name").value = nick();

  $("lb_card").addEventListener("click", (event) => {
    const button = event.target.closest("[data-g]");
    if (!button) return;

    game = button.dataset.g;

    document.querySelectorAll("#lb_card [data-g]").forEach((tab) => {
      tab.classList.toggle("on", tab === button);
    });

    load();
  });

  $("lb_save").onclick = async () => {
    const name = $("lb_name")
      .value.replace(/[<>"'`\\]/g, "")
      .trim()
      .slice(0, 15);

    if (!name) return;

    mem = name;

    try {
      localStorage.setItem("gh_name", name);
    } catch (e) {}

    $("lb_save").textContent = "Saving…";
    $("lb_save").disabled = true;

    try {
      await submit("sudoku", progress("sudoku"));
      await submit("tile", progress("tile"));
      await submit("wordsearch", progress("wordsearch"));
      await submit("guess", progress("guess"));
    } finally {
      $("lb_save").disabled = false;
      $("lb_save").textContent = "Save";
    }

    await load();
  };

  load();
})();
