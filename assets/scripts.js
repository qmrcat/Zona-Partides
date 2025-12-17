const STORAGE_KEY = "marcadorPartides";
    const $ = (sel) => document.querySelector(sel);

    let games = loadGames();
    let currentGameId = null;
    let newGamePlayers = [];

    let undoTimer = null;
    let undoAction = null;

    const screenSetup = $("#screen-setup");
    const screenBoard = $("#screen-board");

    const gamesListEl = $("#games-list");
    const savedCountEl = $("#saved-count");
    const noGamesEl = $("#no-games");

    const newGameForm = $("#new-game-form");
    const gameNameInput = $("#game-name");
    const playerNameInput = $("#player-name");
    const addPlayerBtn = $("#add-player");
    const playersContainer = $("#players-container");
    const roundsInput = $("#rounds");
    const scoreModeCheckbox = $("#score-mode");
    const initialScoreInput = $("#initial-score");
    const initialScoreRow = $("#initial-score-row");


    const boardGameNameEl = $("#board-game-name");
    const boardMetaEl = $("#board-meta");
    const scoreTable = $("#score-table");
    const scoreThead = scoreTable.querySelector("thead");
    const scoreTbody = scoreTable.querySelector("tbody");
    const totalsSummaryEl = $("#totals-summary");

    const btnCloseGame = $("#btn-close-game");
    const btnDeleteGame = $("#btn-delete-game");
    const btnAddRound = $("#btn-add-round");
    const boardPlayerNameInput = $("#board-player-name");
    const btnBoardAddPlayer = $("#btn-board-add-player");

    let draggedPlayerIndex = null;


    // --- localStorage ---
    function loadGames() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error("Error llegint localStorage", e);
        return [];
      }
    }

    function saveGames() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
      renderGamesList();
    }

    function formatDate(dateStr) {
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return "";
      return d.toLocaleString("ca-ES", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      });
    }

    // --- Llista de partides ---
    function renderGamesList() {
      gamesListEl.innerHTML = "";

      if (!games.length) {
        noGamesEl.classList.remove("hidden");
      } else {
        noGamesEl.classList.add("hidden");
      }

      savedCountEl.textContent =
        games.length === 1 ? "1 partida" : `${games.length} partides`;

      games
        .slice()
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .forEach((game) => {
          const div = document.createElement("div");
          div.className = "game-item";

          const left = document.createElement("div");
          const title = document.createElement("div");
          title.textContent = game.name;
          title.style.fontSize = "0.9rem";
          title.style.fontWeight = "500";

          const meta = document.createElement("div");
          meta.className = "game-meta";
          const playersText =
            game.players.length === 1
              ? "1 jugador"
              : `${game.players.length} jugadors`;
          meta.textContent = `${playersText} · ${game.rounds} rondes · ${formatDate(
            game.updatedAt
          )}`;

          left.appendChild(title);
          left.appendChild(meta);

          const right = document.createElement("div");
          right.style.display = "flex";
          right.style.alignItems = "center";
          right.style.gap = "0.35rem";

          const openBtn = document.createElement("button");
          openBtn.className = "btn btn-outline";
          openBtn.textContent = "Obrir";
          openBtn.addEventListener("click", () => openGame(game.id));

          const delBtn = document.createElement("button");
          delBtn.className = "btn btn-danger";
          delBtn.textContent = "✕";
          delBtn.title = "Esborrar partida";
          delBtn.addEventListener("click", () => deleteGame(game.id));

          right.appendChild(openBtn);
          right.appendChild(delBtn);

          div.appendChild(left);
          div.appendChild(right);

          gamesListEl.appendChild(div);
        });
    }

    // --- Normalització de noms ---
    function normalizePlayerName(rawName, existingNames) {
      const base = rawName.trim();
      if (!base) return null;

      let candidate = base;
      let counter = 2;

      while (existingNames.includes(candidate)) {
        candidate = `${base} ${counter}`;
        counter++;
      }

      return candidate;
    }


    // --- Drag & Drop per ordenar jugadors ---
    function handleDragStart(e) {
      draggedPlayerIndex = parseInt(e.target.dataset.index);
      e.target.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
    }

    function handleDragOver(e) {
      if (e.preventDefault) {
        e.preventDefault();
      }
      e.dataTransfer.dropEffect = "move";
      return false;
    }

    function handleDragEnter(e) {
      const target = e.target.closest(".player-tag");
      if (target && target.classList.contains("player-tag")) {
        target.classList.add("drag-over");
      }
    }

    function handleDragLeave(e) {
      const target = e.target.closest(".player-tag");
      if (target && target.classList.contains("player-tag")) {
        target.classList.remove("drag-over");
      }
    }

    function handleDrop(e) {
      if (e.stopPropagation) {
        e.stopPropagation();
      }
      
      const target = e.target.closest(".player-tag");
      if (!target) return false;
      
      const dropIndex = parseInt(target.dataset.index);
      
      if (draggedPlayerIndex !== null && draggedPlayerIndex !== dropIndex) {
        // Reordenar l'array
        const draggedPlayer = newGamePlayers[draggedPlayerIndex];
        newGamePlayers.splice(draggedPlayerIndex, 1);
        
        // Ajustar l'índex si estem movent cap enrere
        const newIndex = draggedPlayerIndex < dropIndex ? dropIndex - 1 : dropIndex;
        newGamePlayers.splice(newIndex, 0, draggedPlayer);
        
        renderNewGamePlayers();
      }
      
      return false;
    }

    function handleDragEnd(e) {
      e.target.classList.remove("dragging");
      
      // Netejar totes les classes drag-over
      document.querySelectorAll(".player-tag").forEach(tag => {
        tag.classList.remove("drag-over");
      });
      
      draggedPlayerIndex = null;
    }    

    function renderNewGamePlayers() {
      playersContainer.innerHTML = "";
      if (!newGamePlayers.length) {
        playersContainer.innerHTML =
          '<span class="empty-note">Afegeix com a mínim un jugador.</span>';
        return;
      }

      newGamePlayers.forEach((name, idx) => {
        const tag = document.createElement("span");
        tag.className = "player-tag";
        tag.draggable = true;
        tag.dataset.index = idx;
        tag.style.display = "inline-flex";
        tag.style.alignItems = "center";
        tag.style.gap = "0.35rem";
        tag.style.paddingRight = "0.35rem";
        
        const nameSpan = document.createElement("span");
        nameSpan.textContent = name;
        
        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.textContent = "✕";
        removeBtn.style.border = "none";
        removeBtn.style.background = "transparent";
        removeBtn.style.color = "var(--danger)";
        removeBtn.style.cursor = "pointer";
        removeBtn.style.padding = "0";
        removeBtn.style.fontSize = "0.85rem";
        removeBtn.style.lineHeight = "1";
        removeBtn.title = `Eliminar ${name}`;
        
        removeBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          newGamePlayers.splice(idx, 1);
          renderNewGamePlayers();
        });
        
        // Events de drag & drop
        tag.addEventListener("dragstart", handleDragStart);
        tag.addEventListener("dragover", handleDragOver);
        tag.addEventListener("drop", handleDrop);
        tag.addEventListener("dragenter", handleDragEnter);
        tag.addEventListener("dragleave", handleDragLeave);
        tag.addEventListener("dragend", handleDragEnd);
        
        tag.appendChild(nameSpan);
        tag.appendChild(removeBtn);
        playersContainer.appendChild(tag);
      });
    }

    // Afegeix jugadors al formulari inicial (separats per comes)
    function addPlayersFromInput() {
      const raw = playerNameInput.value;
      if (!raw || !raw.trim()) return;

      const parts = raw.split(",").map((p) => p.trim()).filter((p) => p.length);
      if (!parts.length) return;

      parts.forEach((name) => {
        const normalized = normalizePlayerName(name, newGamePlayers);
        if (normalized) {
          newGamePlayers.push(normalized);
        }
      });

      playerNameInput.value = "";
      renderNewGamePlayers();
      playerNameInput.focus();
    }

    addPlayerBtn.addEventListener("click", () => {
      addPlayersFromInput();
    });

    playerNameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addPlayersFromInput();
      }
    });

    // --- Mostrar/amagar camp de puntuació inicial ---
    scoreModeCheckbox.addEventListener("change", () => {
      if (scoreModeCheckbox.checked) {
        initialScoreRow.style.display = "flex";
      } else {
        initialScoreRow.style.display = "none";
      }
    });

    // --- Creació de partida ---
    newGameForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = gameNameInput.value.trim();
      if (!name) {
        alert("Escriu un nom per a la partida.");
        return;
      }
      if (!newGamePlayers.length) {
        alert("Afegeix com a mínim un jugador.");
        return;
      }

      let rounds = parseInt(roundsInput.value, 10);
      if (!Number.isFinite(rounds) || rounds < 1) {
        rounds = 10;
      }

      const useInitialScore = scoreModeCheckbox.checked;
      let initialScore = null;
      
      if (useInitialScore) {
        initialScore = parseInt(initialScoreInput.value, 10);
        if (!Number.isFinite(initialScore) || initialScore < 1) {
          initialScore = 40;
        }
      }

      const now = new Date().toISOString();
      const id = `game-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const scores = newGamePlayers.map(() => Array(rounds).fill(null));

      const game = {
        id,
        name,
        players: [...newGamePlayers],
        rounds,
        scores,
        roundNames: Array(rounds).fill(null), // Noms personalitzats per rondes
        scoreMode: useInitialScore ? 'countdown' : 'accumulative', // Mode de puntuació
        initialScore: initialScore, // Puntuació inicial (null si mode acumulatiu)
        createdAt: now,
        updatedAt: now
      };

      games.push(game);
      saveGames();

      gameNameInput.value = "";
      roundsInput.value = "10";
      scoreModeCheckbox.checked = false;
      initialScoreInput.value = "40";
      initialScoreRow.style.display = "none";
      newGamePlayers = [];
      renderNewGamePlayers();

      openGame(id);
    });

    // --- Obrir / esborrar partida ---
    function openGame(id) {
      const game = games.find((g) => g.id === id);
      if (!game) return;

      currentGameId = id;
      renderBoard(game);

      screenSetup.classList.add("hidden");
      screenBoard.classList.remove("hidden");
    }

    async function deleteGame(id) {
      const game = games.find( (g) => g.id === id);
      if (!game) return;

      const ok = await UIModal.confirm(`Segur que vols esborrar la partida "${game.name}"?`);
      if (!ok) { return }

      games = games.filter((g) => g.id !== id);
      saveGames();

      if (currentGameId === id) {
        currentGameId = null;
        screenBoard.classList.add("hidden");
        screenSetup.classList.remove("hidden");
      }
    }

    btnCloseGame.addEventListener("click", () => {
      currentGameId = null;
      screenBoard.classList.add("hidden");
      screenSetup.classList.remove("hidden");
    });

    btnDeleteGame.addEventListener("click", () => {
      if (!currentGameId) return;
      deleteGame(currentGameId);
    });

    // --- Afegir ronda un cop creada la partida ---
    function addRoundToCurrentGame() {
      const game = games.find((g) => g.id === currentGameId);
      if (!game) return;

      game.rounds += 1;
      
      // Assegurar que roundNames existeix
      if (!game.roundNames) {
        game.roundNames = Array(game.rounds - 1).fill(null);
      }
      game.roundNames.push(null); // Afegir espai per al nom de la nova ronda

      game.scores.forEach((row, idx) => {
        if (!Array.isArray(row)) {
          game.scores[idx] = [];
        }
        while (game.scores[idx].length < game.rounds) {
          game.scores[idx].push(null);
        }
      });

      game.updatedAt = new Date().toISOString();
      saveGames();
      renderBoard(game);
    }

    btnAddRound.addEventListener("click", () => {
      addRoundToCurrentGame();
    });

    // --- Afegir jugadors un cop creada la partida ---
    function addPlayersToCurrentGameFromBoard() {
      const game = games.find((g) => g.id === currentGameId);
      if (!game) return;

      const raw = boardPlayerNameInput.value;
      if (!raw || !raw.trim()) return;

      const parts = raw.split(",").map((p) => p.trim()).filter((p) => p.length);
      if (!parts.length) return;

      parts.forEach((name) => {
        const normalized = normalizePlayerName(name, game.players);
        if (normalized) {
          game.players.push(normalized);
          const newRow = Array(game.rounds).fill(null);
          game.scores.push(newRow);
        }
      });

      game.updatedAt = new Date().toISOString();
      saveGames();
      renderBoard(game);

      boardPlayerNameInput.value = "";
      boardPlayerNameInput.focus();
    }

    btnBoardAddPlayer.addEventListener("click", () => {
      addPlayersToCurrentGameFromBoard();
    });

    boardPlayerNameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addPlayersToCurrentGameFromBoard();
      }
    });

    // --- Tauler de puntuacions (columnes = jugadors, files = rondes) ---
    function renderBoard(game) {
      boardGameNameEl.textContent = game.name;
      const playersText =
        game.players.length === 1
          ? "1 jugador"
          : `${game.players.length} jugadors`;
      
      let metaText = `${playersText} · ${game.rounds} rondes`;
      
      // Afegir indicació del mode de puntuació
      if (game.scoreMode === 'countdown' && game.initialScore) {
        metaText += ` · Inici: ${game.initialScore} punts`;
      }
      
      boardMetaEl.textContent = metaText;

      // Capçalera: fila 1 = Ronda + noms jugadors
      //            fila 2 = "Total" + totals per jugador
      scoreThead.innerHTML = "";

      const headerRow1 = document.createElement("tr");
      const thRound = document.createElement("th");
      thRound.className = "color-trasnparent";
      // thRound.textContent = "Ronda";
      thRound.textContent = "";
      headerRow1.appendChild(thRound);

      game.players.forEach((playerName, idx) => {
        const th = document.createElement("th");
        th.className = "player-cell";
        th.dataset.playerIndex = String(idx);

        const wrap = document.createElement("div");
        wrap.className = "th-player-wrap";

        const nameSpan = document.createElement("span");
        nameSpan.textContent = playerName;

        const dotsBtn = document.createElement("button");
        dotsBtn.type = "button";
        dotsBtn.className = "dots-btn";
        dotsBtn.textContent = "⋮";
        dotsBtn.title = "Opcions";
        dotsBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const rect = dotsBtn.getBoundingClientRect();
          showContextMenu(rect.left, rect.bottom + 5, [
            {
              icon: "🗑️",
              label: "Eliminar jugador",
              danger: true,
              action: () => deletePlayer(idx)
            }
          ]);
        });

        wrap.appendChild(nameSpan);
        // wrap.appendChild(delBtn);
        wrap.appendChild(dotsBtn); 
        th.appendChild(wrap);

        headerRow1.appendChild(th);
      });


      const headerRow2 = document.createElement("tr");
      const thTotalsLabel = document.createElement("th");
      // thTotalsLabel.textContent = "Total";
      thTotalsLabel.textContent = "";
      thTotalsLabel.className = "color-trasnparent";
      headerRow2.appendChild(thTotalsLabel);

      game.players.forEach((_, idx) => {
        const thTotal = document.createElement("th");
        thTotal.className = "total-cell";
        thTotal.dataset.playerIndex = String(idx);
        thTotal.setAttribute("data-total-for-player", String(idx));
        const total = calculatePlayerTotal(game, idx);
        thTotal.textContent = String(total);
        
        // Afegir classe negative si el total és negatiu
        if (total < 0) {
          thTotal.classList.add("negative");
        }
        
        headerRow2.appendChild(thTotal);
      });

      scoreThead.appendChild(headerRow1);
      scoreThead.appendChild(headerRow2);

      // Cos: una fila per ronda, cada columna és un jugador
      scoreTbody.innerHTML = "";

      for (let r = 0; r < game.rounds; r++) {
        const row = document.createElement("tr");

        const roundCell = document.createElement("td");

        const wrap = document.createElement("div");
        wrap.className = "round-label-wrap";

        const label = document.createElement("span");
        // label.style.cursor = "pointer";
        // label.title = "Clic per editar";
        
        // Inicialitzar roundNames si no existeix (per compatibilitat amb partides antigues)
        if (!game.roundNames) {
          game.roundNames = Array(game.rounds).fill(null);
        }
        
        const customName = game.roundNames[r];
        label.textContent = customName || `Ronda ${r + 1}`;

        const dotsBtn = document.createElement("button");
        dotsBtn.type = "button";
        dotsBtn.className = "dots-btn";
        dotsBtn.textContent = "⋮";
        dotsBtn.title = "Opcions";
        dotsBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          const rect = dotsBtn.getBoundingClientRect();
          showContextMenu(rect.left, rect.bottom + 5, [
            {
              icon: "✏️",
              label: "Editar nom",
              danger: false,
              action: async () => {
                const currentName = game.roundNames[r] || `Ronda ${r + 1}`;
                const newName = await UIModal.prompt(
                  `Escriu el nom per aquesta ronda:`,
                  {
                    title: "Editar nom de ronda",
                    defaultValue: currentName,
                    placeholder: `Ronda ${r + 1}`
                  }
                );
                
                if (newName !== null) {
                  const trimmed = newName.trim();
                  game.roundNames[r] = (trimmed && trimmed !== `Ronda ${r + 1}`) ? trimmed : null;
                  game.updatedAt = new Date().toISOString();
                  saveGames();
                  renderBoard(game);
                }
              }
            },
            {
              icon: "🗑️",
              label: "Eliminar ronda",
              danger: true,
              action: () => deleteRound(r)
            }
          ]);
        });

        wrap.appendChild(label);
        // wrap.appendChild(delBtn);
        wrap.appendChild(dotsBtn);
        roundCell.appendChild(wrap);

        row.appendChild(roundCell);


        game.players.forEach((_, pIndex) => {
          const cell = document.createElement("td");
          const input = document.createElement("input");
          input.type = "number";
          input.className = "round-input";
          input.inputMode = "numeric";
          input.setAttribute("data-player", String(pIndex));
          input.setAttribute("data-round", String(r));

          const value = game.scores?.[pIndex]?.[r];
          if (typeof value === "number") {
            input.value = String(value);
          }

          input.addEventListener("input", onScoreInput);

          cell.appendChild(input);
          row.appendChild(cell);
        });

        scoreTbody.appendChild(row);
      }

      renderTotalsSummary(game);
      highlightLeader(game);
      setupTouchRevealActions();
    }

    function onScoreInput(event) {
      const input = event.target;
      const pIndex = Number(input.getAttribute("data-player"));
      const rIndex = Number(input.getAttribute("data-round"));
      const raw = input.value.trim();

      const game = games.find((g) => g.id === currentGameId);
      if (!game) return;

      if (!game.scores[pIndex]) {
        game.scores[pIndex] = Array(game.rounds).fill(null);
      }

      if (raw === "") {
        game.scores[pIndex][rIndex] = null;
      } else {
        const num = Number(raw);
        game.scores[pIndex][rIndex] = Number.isFinite(num) ? num : null;
      }

      game.updatedAt = new Date().toISOString();
      saveGames();

      // Actualitza total del jugador (a la capçalera)
      const totalCell = scoreThead.querySelector(
        `[data-total-for-player="${pIndex}"]`
      );
      if (totalCell) {
        const total = calculatePlayerTotal(game, pIndex);
        totalCell.textContent = String(total);
        
        // Actualitzar classe negative
        if (total < 0) {
          totalCell.classList.add("negative");
        } else {
          totalCell.classList.remove("negative");
        }
      }

      renderTotalsSummary(game);
      highlightLeader(game);
    }

    function calculatePlayerTotal(game, playerIndex) {
      const row = game.scores?.[playerIndex] || [];
      const sum = row.reduce((sum, v) => (typeof v === "number" ? sum + v : sum), 0);
      
      // Si el joc té mode countdown, restem els punts de la puntuació inicial
      if (game.scoreMode === 'countdown' && game.initialScore) {
        return game.initialScore - sum;
      }
      
      return sum;
    }

    function renderTotalsSummary(game) {
      totalsSummaryEl.innerHTML = "";
      
      // Crear array amb jugadors i totals
      const playersWithTotals = game.players.map((name, idx) => ({
        name,
        idx,
        total: calculatePlayerTotal(game, idx)
      }));
      
      // Ordenar de major a menor (en mode countdown també és major a menor perquè el guanyador té més punts restants)
      playersWithTotals.sort((a, b) => b.total - a.total);
      
      // Renderitzar ordenat
      playersWithTotals.forEach(({ name, idx, total }) => {
        const span = document.createElement("span");
        span.className = "totals-pill";
        span.dataset.playerIndex = String(idx);
        span.textContent = `${name}: ${total}`;
        
        // Afegir estil per totals negatius
        if (total < 0) {
          span.style.color = "var(--danger)";
        }
        
        totalsSummaryEl.appendChild(span);
      });
    }

    // Ressalta el/s jugador/s amb més punts (o més punts restants en mode countdown)
    function highlightLeader(game) {
      const totals = game.players.map((_, idx) =>
        calculatePlayerTotal(game, idx)
      );
      if (!totals.length) return;

      // En mode countdown, el guanyador és qui té MÉS punts restants (menys punts perduts)
      // En mode acumulatiu, el guanyador és qui té més punts
      const bestScore = game.scoreMode === 'countdown' 
        ? Math.max(...totals)  // Més punts restants
        : Math.max(...totals); // Més punts acumulats
      
      const leaders = totals
        .map((t, idx) => ({ t, idx }))
        .filter(({ t }) => t === bestScore)
        .map(({ idx }) => idx);

      // Neteja classes anteriors
      scoreThead
        .querySelectorAll("[data-player-index]")
        .forEach((el) => el.classList.remove("winner"));
      totalsSummaryEl
        .querySelectorAll("[data-player-index]")
        .forEach((el) => el.classList.remove("winner"));

      // Aplica a noms, totals i resum
      leaders.forEach((idx) => {
        scoreThead
          .querySelectorAll(`[data-player-index="${idx}"]`)
          .forEach((el) => el.classList.add("winner"));
        totalsSummaryEl
          .querySelectorAll(`[data-player-index="${idx}"]`)
          .forEach((el) => el.classList.add("winner"));
      });
    }

    async function deletePlayer(playerIndex) {
      const game = games.find((g) => g.id === currentGameId);
      if (!game) return;
      
      const name = game.players[playerIndex];
      const ok = await UIModal.confirm(`Vols eliminar el jugador "${name}"?`);
      if (!ok) { return }
      
      const snapshot = deepClone(game);

      game.players.splice(playerIndex, 1);
      game.scores.splice(playerIndex, 1);

      game.updatedAt = new Date().toISOString();
      saveGames();

      // Si ja no queden jugadors, pots decidir què fer:
      // aquí simplement tornem a renderitzar (taula buida de jugadors)
      renderBoard(game);

      showUndoToast(`Jugador eliminat: ${name}`, () => restoreGameSnapshot(snapshot));
    }

    async function deleteRound(roundIndex) {
      const game = games.find((g) => g.id === currentGameId);
      if (!game) return;

      if (game.rounds <= 1) {
        alert("Com a mínim hi ha d'haver 1 ronda.");
        return;
      }

      const roundName = game.roundNames?.[roundIndex] || `Ronda ${roundIndex + 1}`;
      const ok = await UIModal.confirm(`Vols eliminar "${roundName}"?`);
      if (!ok) { return }

      const snapshot = deepClone(game);

      // Elimina només la ronda especificada
      game.scores.forEach(row => {
        if (Array.isArray(row)) row.splice(roundIndex, 1);
      });
      
      // Eliminar també el nom personalitzat de la ronda
      if (game.roundNames && Array.isArray(game.roundNames)) {
        game.roundNames.splice(roundIndex, 1);
      }
      
      game.rounds -= 1;

      game.updatedAt = new Date().toISOString();
      saveGames();
      renderBoard(game);

      showUndoToast(
        `Ronda eliminada: ${roundName}`,
        () => restoreGameSnapshot(snapshot)
      );
    }

    // --- ZONA HELPERS ---
    // --- Accions tàctils per mostrar els botons d'esborrar ---

function setupTouchRevealActions() {
  // Neteja (per si rerenderitzes)
  scoreTable.querySelectorAll(".actions-visible").forEach(el => el.classList.remove("actions-visible"));

  // Per mòbil: tocar el nom del jugador o l'etiqueta de ronda mostra el botó ✕
  const targets = scoreTable.querySelectorAll(".th-player-wrap, .round-label-wrap");

  targets.forEach((wrap) => {
    wrap.addEventListener("click", (e) => {
      // Si has clicat el botó ✕, no fem toggle aquí
      // if (e.target.closest(".icon-btn")) return;
      if (e.target.closest(".dots-btn")) return;

      // Tanca els altres
      targets.forEach(w => { if (w !== wrap) w.classList.remove("actions-visible"); });

      // Toggle d'aquest
      wrap.classList.toggle("actions-visible");
    });
  });

  // Tocar fora tanca
  document.addEventListener("click", (e) => {
    if (e.target.closest(".th-player-wrap") || e.target.closest(".round-label-wrap")) return;
    scoreTable.querySelectorAll(".actions-visible").forEach(el => el.classList.remove("actions-visible"));
  }, { once: true });
}

function deepClone(obj) {
  // modern: structuredClone, fallback JSON
  if (typeof structuredClone === "function") return structuredClone(obj);
  return JSON.parse(JSON.stringify(obj));
}

function showUndoToast(message, onUndo) {
  const toast = $("#undo-toast");
  toast.innerHTML = `
    <span class="msg">${message}</span>
    <button type="button" class="undo-btn">Desfer</button>
  `;
  toast.classList.remove("hidden");

  // Cancel·la un undo anterior
  if (undoTimer) clearTimeout(undoTimer);
  undoAction = onUndo;

  toast.querySelector(".undo-btn").onclick = () => {
    if (undoTimer) clearTimeout(undoTimer);
    toast.classList.add("hidden");
    const action = undoAction;
    undoAction = null;
    if (typeof action === "function") action();
  };

  undoTimer = setTimeout(() => {
    toast.classList.add("hidden");
    undoAction = null;
    undoTimer = null;
  }, 5000);
}

function restoreGameSnapshot(snapshot) {
  const idx = games.findIndex(g => g.id === snapshot.id);
  if (idx === -1) return;

  games[idx] = snapshot;
  saveGames();

  if (currentGameId === snapshot.id) {
    renderBoard(snapshot);
  }
}

// --- Funció per crear i mostrar menú contextual ---
function showContextMenu(x, y, items) {
  // Eliminar menú anterior si existeix
  const existingMenu = document.querySelector('.context-menu');
  if (existingMenu) {
    existingMenu.remove();
  }

  const menu = document.createElement('div');
  menu.className = 'context-menu';
  menu.style.position = 'fixed';
  menu.style.left = x + 'px';
  menu.style.top = y + 'px';

  items.forEach(item => {
    const menuItem = document.createElement('div');
    menuItem.className = 'context-menu-item' + (item.danger ? ' danger' : '');
    menuItem.textContent = item.icon + ' ' + item.label;
    menuItem.addEventListener('click', () => {
      item.action();
      menu.remove();
    });
    menu.appendChild(menuItem);
  });

  document.body.appendChild(menu);

  // Ajustar posició si es surt de la pantalla
  const rect = menu.getBoundingClientRect();
  if (rect.right > window.innerWidth) {
    menu.style.left = (x - rect.width) + 'px';
  }
  if (rect.bottom > window.innerHeight) {
    menu.style.top = (y - rect.height) + 'px';
  }

  // Tancar en clicar fora
  const closeMenu = (e) => {
    if (!menu.contains(e.target)) {
      menu.remove();
      document.removeEventListener('click', closeMenu);
    }
  };
  setTimeout(() => document.addEventListener('click', closeMenu), 0);
}

document.addEventListener("DOMContentLoaded", async () => {
    // --- Inicialització ---
    renderGamesList();
    renderNewGamePlayers();
    UIModal.initTheme();
    UIModal.setTheme("dark");
});