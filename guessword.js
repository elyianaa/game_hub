// Guess a Word: guess the hidden word one letter at a time, using the hint.
// The word list (wordList) lives in word.js.
(() => {
  const root = document.querySelector("#guess");
  const inputs = root.querySelector(".inputs");
  const hintLine = root.querySelector(".hint");
  const hintTag = root.querySelector(".hint span");
  const hintBtn = root.querySelector(".hint-btn");
  const livesTag = root.querySelector(".guess-left span");
  const wrongTag = root.querySelector(".wrong-letter span");
  const resetBtn = root.querySelector(".reset-btn");
  const typingInput = root.querySelector(".typing-input");
  const message = root.querySelector(".gw-message");

  // Game Hub counters on the home screen
  const countTag = document.querySelector("#hs4");
  const levelTag = document.querySelector("#hp4");

  // Game state
  let word = "";
  let maxGuesses = 0;
  let startGuesses = 0;
  let incorrectLetters = [];
  let correctLetters = [];
  let gameOver = false;
  let bag = []; // words not used yet, so the same word does not come back until all have been played

  const readSaved = () => {
    try {
      const saved = JSON.parse(localStorage.getItem("guessword1") || "{}");
      return Math.max(0, Number(saved.count) || 0);
    } catch (e) {
      return 0;
    }
  };

  let wordsGuessed = readSaved();

  function saveProgress() {
    try {
      localStorage.setItem(
        "guessword1",
        JSON.stringify({
          count: wordsGuessed,
          lvl: Math.floor(wordsGuessed / 10) + 1, // one level for every 10 words
        }),
      );
    } catch (e) {
      // Progress cannot be saved
    }
  }

  function nextWord() {
    if (bag.length === 0) {
      bag = [...wordList];
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [bag[i], bag[j]] = [bag[j], bag[i]];
      }
    }
    return bag.pop();
  }

  function updateHintBtn() {
    // opening the hint costs one guess, so it is locked on the last guess and when the round is over
    const locked = gameOver || maxGuesses <= 1;
    hintBtn.disabled = locked;
    hintBtn.textContent =
      !gameOver && maxGuesses <= 1
        ? "💡 Hint locked (last guess)"
        : "💡 Show hint (−1 guess)";
  }

  function setMessage(text, kind) {
    message.textContent = text;
    message.className = "gw-message" + (kind ? " " + kind : "");
  }

  function showLives() {
    // one heart for every guess left, a black heart for every guess used
    livesTag.textContent =
      "❤️".repeat(maxGuesses) +
      "🖤".repeat(startGuesses - maxGuesses) +
      "  " +
      maxGuesses;
  }

  function showWrongLetters() {
    wrongTag.innerHTML = "";

    if (incorrectLetters.length === 0) {
      wrongTag.textContent = "None";
      return;
    }

    incorrectLetters.forEach((letter) => {
      const chip = document.createElement("span");
      chip.className = "gw-chip";
      chip.textContent = letter.toUpperCase();
      wrongTag.appendChild(chip);
    });
  }

  // Start a new round
  function randomWord() {
    if (!Array.isArray(wordList) || wordList.length === 0) {
      setMessage("No words found. Please check word.js.", "bad");
      return;
    }

    const item = nextWord();

    word = item.word.toLowerCase();
    maxGuesses = word.length >= 5 ? 8 : 6;
    startGuesses = maxGuesses;

    correctLetters = [];
    incorrectLetters = [];
    gameOver = false;

    // the hint stays hidden until the player taps the Show hint button
    hintTag.textContent = item.hint || "No hint available";
    hintLine.classList.add("hide");
    hintBtn.classList.remove("hide");
    updateHintBtn();
    showLives();
    showWrongLetters();
    setMessage("");

    resetBtn.textContent = "New Word";
    typingInput.value = "";
    typingInput.disabled = false;

    // One box for every letter
    inputs.innerHTML = "";

    for (let i = 0; i < word.length; i++) {
      const box = document.createElement("input");

      box.type = "text";
      box.disabled = true;
      box.setAttribute("aria-label", `Letter ${i + 1}`);

      inputs.appendChild(box);
    }
  }

  // Process a guessed letter
  function initGame(event) {
    const key = event.target.value.toLowerCase();
    typingInput.value = "";

    if (gameOver || !/^[a-z]$/.test(key)) {
      return;
    }

    // Ignore letters that have already been guessed
    if (correctLetters.includes(key) || incorrectLetters.includes(key)) {
      return;
    }

    if (word.includes(key)) {
      correctLetters.push(key);

      const letterBoxes = inputs.querySelectorAll("input");

      for (let i = 0; i < word.length; i++) {
        if (word[i] === key) {
          letterBoxes[i].value = key.toUpperCase();
          letterBoxes[i].classList.add("hit");
        }
      }

      setMessage("Correct letter!", "ok");
    } else {
      incorrectLetters.push(key);
      maxGuesses--;

      setMessage("Not quite! Try another letter.", "bad");
    }

    showLives();
    showWrongLetters();
    updateHintBtn();

    // Check whether the word has been guessed
    const wordCompleted = [...new Set(word)].every((letter) =>
      correctLetters.includes(letter),
    );

    if (wordCompleted) {
      gameOver = true;

      // keep the highest count, even if another tab saved more
      wordsGuessed = Math.max(wordsGuessed, readSaved()) + 1;
      saveProgress();

      // Submit the score to the leaderboard (only if a nickname is saved)
      if (window.GH) {
        window.GH.submit("guess", wordsGuessed);
      }

      setMessage(`🎉 Correct! The word is ${word.toUpperCase()}.`, "ok");

      // Update the Game Hub counters
      if (countTag) countTag.textContent = wordsGuessed;
      if (levelTag) {
        levelTag.textContent = `Level ${Math.floor(wordsGuessed / 10) + 1}`;
      }

      typingInput.disabled = true;
      updateHintBtn();
    } else if (maxGuesses <= 0) {
      gameOver = true;

      setMessage(`Game over! The word was ${word.toUpperCase()}.`, "bad");

      // Reveal the letters that were missed
      const letterBoxes = inputs.querySelectorAll("input");

      for (let i = 0; i < word.length; i++) {
        if (!letterBoxes[i].value) {
          letterBoxes[i].value = word[i].toUpperCase();
          letterBoxes[i].classList.add("miss");
        }
      }

      typingInput.disabled = true;
      updateHintBtn();
    }
  }

  // New Word button
  resetBtn.addEventListener("click", () => {
    randomWord();
    typingInput.focus();
  });

  // Show hint button
  hintBtn.addEventListener("click", () => {
    if (gameOver || maxGuesses <= 1) return; // the hint costs one guess
    maxGuesses--;
    showLives();
    hintLine.classList.remove("hide");
    hintBtn.classList.add("hide");
    setMessage("Hint opened. It cost you one guess.");
  });

  // Typing input
  typingInput.addEventListener("input", initGame);

  // Tap the letter boxes to open the keyboard
  inputs.addEventListener("click", () => {
    if (!gameOver) {
      typingInput.focus();
    }
  });

  // Keyboard support, only while Guess a Word is visible
  document.addEventListener("keydown", (event) => {
    if (root.classList.contains("hide")) {
      return;
    }

    if (
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      event.target.matches("input, textarea, button, select")
    ) {
      return;
    }

    if (/^[a-zA-Z]$/.test(event.key) && !gameOver) {
      typingInput.value = event.key;
      typingInput.dispatchEvent(new Event("input", { bubbles: true }));
    }
  });

  // Start the first round
  randomWord();
})();
