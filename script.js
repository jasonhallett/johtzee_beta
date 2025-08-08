const GAME_VERSION = "1.0.4 8/8/25"; // NEW: Define your game version here

let isMuted = false;
let glowInterval;

function playSound(name) {
  if (isMuted) {
    return;
  }
  const map = {
    "welcome": "sounds/welcome.mp3", // NEW: Add welcome sound
    "audio-dice-1": "sounds/dice-roll-1.mp3",
    "audio-dice-2": "sounds/dice-roll-2.mp3",
    "audio-dice-3": "sounds/dice-roll-3.mp3",
    "audio-dice-4": "sounds/dice-roll-4.mp3",
    "audio-dice-5": "sounds/dice-roll-5.mp3",
    "fullhouse": "sounds/fullhouse.mp3",
    "smallstraight": "sounds/smallstraight.mp3",
    "largestraight": "sounds/largestraight.mp3",
    "johtzee": "sounds/johtzee.mp3",
    "gameover": "sounds/gameover.mp3", // NEW: Add the game over sound
  };
  const file = map[name];
  if (!file) return;
  const a = new Audio(file);
  a.play().catch(err => console.warn("Audio play failed:", file, err));
}

function cycleGlow() {
    clearInterval(glowInterval);
    const possibleButtons = document.querySelectorAll('#category-buttons button.possible');
    if (possibleButtons.length === 0) return;

    let currentIndex = 0;
    
    function setGlow() {
        possibleButtons.forEach(btn => btn.classList.remove('glow-active'));
        possibleButtons[currentIndex].classList.add('glow-active');
        currentIndex = (currentIndex + 1) % possibleButtons.length;
    }

    setGlow(); // Start immediately
    glowInterval = setInterval(setGlow, 800);
}

document.addEventListener("DOMContentLoaded", () => {
        // We will add the welcome sound to play on the first user interaction
        let firstInteraction = true;
        document.body.addEventListener('click', () => {
            if (firstInteraction && !isMuted) {
                playSound("welcome");
                firstInteraction = false;
            }
        }, { once: true }); // Use { once: true } to ensure it only runs once

        // NEW: Trigger the logo animation
        const logoSetup = document.getElementById('jotzee-logo-setup');
        if (logoSetup) {
            logoSetup.classList.add('logo-animate-in');
        }

        // NEW: Display the game version
        const versionDisplay = document.getElementById('version-display');
        if (versionDisplay) {
            versionDisplay.textContent = `v${GAME_VERSION}`;
        }

        const categories = [ "Ones","Twos","Threes","Fours","Fives","Sixes","3 of a Kind","4 of a Kind","Full House","Small Straight","Large Straight","Johtzee","Chance" ];
        const AI_NAMES = [ "Ace Andy", "All-in Alice", "Action Alan", "Ante Annie", "Arctic Archie", "Blackjack Billy", "Bonus Bobby", "Baccarat Becky", "Big Bet Ben", "Blazing Brenda", "Casino Carl", "Cashout Cathy", "Craps Craig", "Cardsharp Carla", "Chip Charlie", "Dealer Dave", "Double-down Dana", "Dicey Diana", "Diamond Doug", "Draw Derek", "Eightball Eddie", "Emerald Emma", "Even-Money Eva", "Encore Eric", "Easy Ed", "Flush Frank", "Fullhouse Fiona", "Five-card Fred", "Fast Fingers Frances", "Fortune Faith", "Gamble Gary", "Golden Gloria", "Go-for-it Greg", "Grandstand Gina", "Glitter Gus", "Highroller Hank", "Hotshot Holly", "House Howard", "High-Stakes Hannah", "Hardway Harry", "Inside Izzy", "Instant-Income Irene", "Icy Ivan", "Incredible Ingrid", "Insurance Ian", "Jackpot Jack", "Jotzee Jason", "Joker Joe", "Jinxed Jenny", "Jackpot Jill", "Keno Ken", "Kingpin Kim", "Keep-Betting Kevin", "Krupier Kyle", "Kitty Kat Kelsey", "Lucky Larry", "Lounge Liz", "Lowball Louie", "Loaded Lola", "Last-Call Lance", "Money Mike", "Marker Mary", "Midnight Molly", "Mirage Max", "Mega Millions Mandy", "No-Limit Nick", "Neon Nancy", "Nudge Nate", "Nightcap Nina", "Number Nine Norman", "Odds-On Oscar", "Open-Table Olivia", "Outlaw Owen", "Onyx Opal", "One-More-Spin Omar", "Pitboss Pete", "Payout Patty", "Pair Paul", "Pokerface Penny", "Push Patrick", "Quick-Draw Quinn", "Queenie Quinn", "Quarter-Bet Quentin", "Quiet Quinton", "Quads Quentin", "Roulette Rita", "Risky Ricky", "Raise Rachel", "River Ron", "Royal Flush Rosa", "Slots Sally", "Snake-Eyes Sam", "Showdown Shelly", "Shuffle Shane", "Streaky Steve", "Texas Terry", "Tabletop Tina", "Triple-Trey Trevor", "Turn-Card Tanya", "Tip-Taker Tom", "Upcard Ursula", "Uptown Ulysses", "Under-the-Gun Uma", "Unlucky Ulrich", "Uno Ursula", "Vegas Virginia", "Velvet Vince", "VLT Veronica", "VIP Victor", "Voodoo Valerie", "Wildcard Walter", "Win-it Wendy", "Whales William", "Wheelspin Wanda", "Wager Wade", "Xtra-Chips Xavier", "Xtreme Xena", "Xcuse-Me Xander", "Xo-Xo Xavier", "Xit-the-Table Ximena", "Yo-Eleven Yvonne", "Yardage Yanni", "Youngblood Yuri", "Yolo Yolanda", "Yachtclub Yvette", "Zero-Zero Zack", "Zigzag Zelda", "Zillionaire Zoe", "Zipline Zane", "Zesty Zora" ];
        const pipPositions = { 1: [[50, 50]], 2: [[25, 25], [75, 75]], 3: [[25, 25], [50, 50], [75, 75]], 4: [[25, 25], [25, 75], [75, 25], [75, 75]], 5: [[25, 25], [25, 75], [75, 25], [75, 75], [50, 50]], 6: [[25, 25], [25, 75], [75, 25], [75, 75], [50, 25], [50, 75]] };
        let players = [];
        let gameHistory = [];
        let currentPlayerIndex = 0;
        let currentDice = [0,0,0,0,0];
        let heldDice = [false, false, false, false, false];
        let rollCount = 0;
        let rolling = false;
        let johtzeeCelebratedThisTurn = false;
        
        const jotzeeLogoSetup = document.getElementById('jotzee-logo-setup');
        const jotzeeLogoGame = document.getElementById('jotzee-logo-game');
        
        if (jotzeeLogoGame) jotzeeLogoGame.style.display = 'none';
        
        const muteButton = document.getElementById('mute-button');
        
        if (muteButton) {
            muteButton.addEventListener('click', () => {
                isMuted = !isMuted;
                muteButton.textContent = isMuted ? '🔇' : '🔊';
            });
        }

        const $ = sel => document.querySelector(sel);
        const countValues = arr => arr.reduce((acc, v) => (acc[v] = (acc[v] || 0) + 1, acc), {});
        const total = arr => arr.reduce((a, b) => a + b, 0);
        const isJohtzee = d => d.length === 5 && d[0] > 0 && Object.values(countValues(d)).includes(5);

        // const playSound = id => { const el = $(`#${id}`); if (el) { el.currentTime = 0; el.play().catch(() => {}); } };
        // const showJotzeeBanner = () => { };

        function openModal(title, contentHTML, showGameButtons = false) {
            $("#modal-title").textContent = title;
            $("#modal-body").innerHTML = contentHTML;
            $("#game-over-buttons").style.display = showGameButtons ? 'flex' : 'none';
            $("#modal-close-btn").style.display = showGameButtons ? 'none' : 'block';
            $("#log-modal").style.display = "flex";
        }
        function closeModal() {
            $("#log-modal").style.display = "none";
        }

        function drawDie(value) {
            const dieDiv = document.createElement('div');
            if (value > 0) { pipPositions[value].forEach(pos => { const pip = document.createElement('span'); pip.className = 'pip'; pip.style.left = `${pos[0]}%`; pip.style.top = `${pos[1]}%`; pip.style.transform = `translate(-50%, -50%)`; dieDiv.appendChild(pip); }); }
            return dieDiv;
        }
        function renderDice() {
            const diceDisplay = $("#dice-display");
            const player = players[currentPlayerIndex];
            if (player) {
                diceDisplay.classList.toggle('large-dice', player.needsLargeDice);
            }
            diceDisplay.innerHTML = "";
            for(let i=0; i<5; i++) {
                const dieWrapper = document.createElement('div');
                dieWrapper.className = 'die';
                if(heldDice[i]) dieWrapper.classList.add('held');
                if(rolling && !heldDice[i]) dieWrapper.classList.add('rolling');
                const dieFace = drawDie(currentDice[i]);
                dieWrapper.appendChild(dieFace);
                dieWrapper.onclick = () => toggleHold(i);
                diceDisplay.appendChild(dieWrapper);
            }
        }
        function renderPlayerList() {
            const list = $("#player-list");
            list.innerHTML = "";
            players.forEach((p, i) => {
                const row = document.createElement("div");
                row.className = 'player-list-item';
                const nameSpan = document.createElement('span');
                nameSpan.textContent = p.name;
                row.appendChild(nameSpan);
                const del = document.createElement("button");
                // The new button style will use the class to create the 'X'
                del.className = "delete-dice-button"; 
                del.textContent = " "; // Set to a space or empty string so the 'X' from CSS is visible
                del.onclick = () => { players.splice(i, 1); renderPlayerList(); renderScorecards(); updateStartButtonState(); };
                row.appendChild(del);
                list.appendChild(row);
            });
            updateStartButtonState();
        }
        function renderScorecards() {
            const container = $("#scorecard-container");
            const featuredContainer = $("#current-player-card-column");
            container.innerHTML = "";
            
            // Clear existing featured card and log buttons before re-rendering
            const existingFeaturedCard = featuredContainer.querySelector('.scorecard');
            const existingLogButtons = featuredContainer.querySelector('#log-buttons');
            
            if (existingFeaturedCard) {
                existingFeaturedCard.remove();
            }
            
            if (existingLogButtons) {
                existingLogButtons.remove();
            }

            if (players.length === 0) return;
            players.forEach((player, index) => {
                const div = document.createElement("div");
                div.className = "scorecard";
                div.dataset.playerIndex = index;
                const upperCats = ["Ones", "Twos", "Threes", "Fours", "Fives", "Sixes"];
                const upperTotal = upperCats.reduce((s, c) => s + (player.scores[c] || 0), 0);
                const bonus = upperTotal >= 63 ? 35 : 0;
                const johtzeeBonus = (player.johtzeeBonusCount || 0) * 100;
                const totalScore = Object.values(player.scores).reduce((a, b) => a + b, 0) + bonus + johtzeeBonus;
                div.innerHTML = `<h3>${player.name}</h3>`;
                
                // Upper section
                upperCats.forEach(cat => {
                    div.innerHTML += `<div class="score-row"><span>${cat}</span><span>${player.scores[cat] != null ? player.scores[cat] : "-"}</span></div>`;
                });

                // Add Upper Total and Upper Bonus
                div.innerHTML += `<div class="score-row line-separator" style="margin-top:10px;"><strong>Upper Total</strong><span>${upperTotal}</span></div>`;
                div.innerHTML += `<div class="score-row line-separator"><strong>Upper Bonus</strong><span>${bonus}</span></div>`;
                
                // Lower section
                const lowerCats = ["3 of a Kind", "4 of a Kind", "Full House", "Small Straight", "Large Straight", "Johtzee"];
                lowerCats.forEach(cat => {
                     let categoryDisplay = cat;
                    if (cat === "Johtzee") {
                        div.innerHTML += `<div class="score-row"><span>${categoryDisplay}</span><span>${player.scores[cat] != null ? player.scores[cat] : "-"}</span></div>`;
                        div.innerHTML += `<div class="score-row"><strong>Johtzee Bonus</strong><span>${johtzeeBonus}</span></div>`;
                    } else {
                        div.innerHTML += `<div class="score-row"><span>${categoryDisplay}</span><span>${player.scores[cat] != null ? player.scores[cat] : "-"}</span></div>`;
                    }
                });
                
                // Chance and Total
                div.innerHTML += `<div class="score-row line-separator"><span>Chance</span><span>${player.scores["Chance"] != null ? player.scores["Chance"] : "-"}</span></div>`;
                div.innerHTML += `<div class="score-row"><strong>Total</strong><span>${totalScore}</span></div>`;


                if(index === currentPlayerIndex) { 
                    const featuredCard = div.cloneNode(true); 
                    featuredCard.classList.add("featured-card"); 
                    featuredContainer.appendChild(featuredCard); 
                    
                    // Re-append the log buttons under the featured card
                    const logButtonsDiv = document.createElement('div');
                    logButtonsDiv.id = 'log-buttons';
                    logButtonsDiv.innerHTML = `
                        <button id="view-score-log">Score Log</button>
                        <button id="view-game-log">Game History</button>
                        <button id="mute-button">🔊</button>
                    `;
                    featuredContainer.appendChild(logButtonsDiv);

                    // Re-add event listeners for the new buttons
                    logButtonsDiv.querySelector("#view-score-log").addEventListener("click", () => {
                        openModal("Current Score Log", `<ul>${$("#history-log").innerHTML}</ul>`);
                    });
                    logButtonsDiv.querySelector("#view-game-log").addEventListener("click", () => {
                        let content = '<ul>';
                        if (gameHistory.length === 0) { content += '<li>No completed games yet.</li>'; } 
                        else { gameHistory.forEach((game, index) => { let scoreText = game.scores.map(s => `${s.name}: ${s.score}`).join(', '); content += `<li><strong>Game ${index + 1}:</strong> ${scoreText} (Winner: ${game.winner.name})</li>`; }); }
                        content += '</ul>';
                        openModal("Game History", content);
                    });
                     // Re-add event listener for the mute button
                    logButtonsDiv.querySelector("#mute-button").addEventListener('click', () => {
                        isMuted = !isMuted;
                        logButtonsDiv.querySelector("#mute-button").textContent = isMuted ? '🔇' : '🔊';
                    });
                } else { container.appendChild(div); }
            });
        }
        function renderCategoryButtons() {
            clearInterval(glowInterval);
            const div = $("#category-buttons");
            const player = players[currentPlayerIndex];
            div.classList.toggle('ai-turn', player.isAI);
            div.innerHTML = ""; 
            if (players.length === 0 || rollCount === 0) return;
            div.innerHTML = `<div>Choose a category</div>`;
            
            const upperCategories = ["Ones", "Twos", "Threes", "Fours", "Fives", "Sixes"];
            const lowerCategories = ["3 of a Kind", "4 of a Kind", "Full House", "Small Straight", "Large Straight"];
            const finalCategories = ["Johtzee", "Chance"];

            const availableButtons = [];
            
            const createButtonRow = (cats) => {
                const rowDiv = document.createElement('div');
                rowDiv.className = 'button-row';
                cats.forEach(cat => {
                    if (!player.usedCategories.has(cat)) {
                        const btn = document.createElement("button");
                        const score = calculateScore(cat, currentDice, player);
                        btn.textContent = `${cat} (${score})`;
                        if (score > 0) { 
                            btn.classList.add('possible'); 
                            if (!player.isAI) {
                                availableButtons.push(btn);
                            }
                        }
                        btn.onclick = () => { 
                            clearInterval(glowInterval);
                            if(!player.isAI) applyScore(currentPlayerIndex, cat, score); 
                        };
                        rowDiv.appendChild(btn);
                    }
                });
                if (rowDiv.children.length > 0) {
                    div.appendChild(rowDiv);
                }
            };
            
            createButtonRow(upperCategories);
            createButtonRow(lowerCategories);
            createButtonRow(finalCategories);

            if (availableButtons.length > 0 && !player.isAI) {
                let currentIndex = 0;
                function setGlow() {
                    availableButtons.forEach(btn => btn.classList.remove('glow-active'));
                    availableButtons[currentIndex].classList.add('glow-active');
                    currentIndex = (currentIndex + 1) % availableButtons.length;
                }
                setGlow();
                glowInterval = setInterval(setGlow, 800);
            }
        }
        function updateStatusDisplays() {
            $("#roll-counter").textContent = `Roll ${rollCount}/3`;
            const turnTitle = $("#turn-title-display");
            if (players[currentPlayerIndex]) {
                turnTitle.textContent = `${players[currentPlayerIndex].name}'s Turn`;
            } else {
                turnTitle.textContent = "";
            }
        }
        function animateTurnTitle() {
            const turnTitle = $("#turn-title-display");
            turnTitle.classList.remove('animate-turn');
            void turnTitle.offsetWidth; // Trigger a browser reflow
            turnTitle.classList.add('animate-turn');
        }
        
        // NEW: Function to check for human player and enable/disable the start button
        function updateStartButtonState() {
            const hasHumanPlayer = players.some(p => !p.isAI);
            $("#start-game").disabled = !hasHumanPlayer;
        }

        function addPlayer() {
            const name = $("#player-name").value.trim();
            if (!name) return;
            const needsLargeDice = $("#large-dice-checkbox").checked;
            players.push({ name, scores: {}, usedCategories: new Set(), johtzeeBonusCount: 0, isAI: false, needsLargeDice });
            $("#player-name").value = "";
            $("#large-dice-checkbox").checked = false;
            renderPlayerList();
            renderScorecards();
            updateStartButtonState(); // NEW: Check button state after adding a player
        }
        const addAIPlayer = () => { const pool = AI_NAMES.filter(n => !new Set(players.filter(p=>p.isAI).map(p=>p.name)).has(n)); const name = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : "AI Player"; players.push({ name, scores: {}, usedCategories: new Set(), johtzeeBonusCount: 0, isAI: true, needsLargeDice: false }); renderPlayerList(); renderScorecards(); updateStartButtonState(); };
        
        function startNewRound() {
            document.querySelectorAll('audio').forEach(audio => { audio.play(); audio.pause(); });
            $("#setup-section").style.display = "none";
            $("#game-ui").style.display = "block";

            // Adjust container width for game
            $(".container").style.maxWidth = '1200px';
            
            // Hide the logo on the setup screen
            if (jotzeeLogoSetup) {
                jotzeeLogoSetup.style.display = 'none';
            }
            // Show the logo on the game screen
            if (jotzeeLogoGame) {
                jotzeeLogoGame.style.display = 'block';
            }

            players.forEach(p => { p.scores = {}; p.usedCategories = new Set(); p.johtzeeBonusCount = 0; });
            currentPlayerIndex = 0;
            $("#history-log").innerHTML = "";
            closeModal();
            nextTurn(true);
        }

function rollDice() {
    clearInterval(glowInterval); // Stop glowing on new roll
    
    if (rolling || rollCount >= 3) return;
    rolling = true;
    rollCount++;

    const diceSoundKey = `audio-dice-${heldDice.filter(h => !h).length || 5}`;
    console.log("Attempting to play sound for roll:", diceSoundKey);
    playSound(diceSoundKey);

    const player = players[currentPlayerIndex];

    // Disable the roll button while rolling
    $("#roll-button").disabled = true;

    let animationCounter = 0;
    const animationInterval = setInterval(() => {
        for (let i = 0; i < 5; i++) {
            if (!heldDice[i]) currentDice[i] = Math.floor(Math.random() * 6) + 1;
        }
        renderDice();
        animationCounter++;
        if (animationCounter > 8) {
            clearInterval(animationInterval);
            
            const isScoredJohtzee = player.scores["Johtzee"] === 50;
            const isJohtzeeRoll = isJohtzee(currentDice);
            const hasUsedJohtzeeCat = player.usedCategories.has("Johtzee");

            if (isJohtzeeRoll && (isScoredJohtzee || !hasUsedJohtzeeCat)) {
                if (!johtzeeCelebratedThisTurn) {
                    johtzeeCelebratedThisTurn = true;
                    console.log("Attempting to play sound for JOHTZEE:", "johtzee");
                    playSound('johtzee');
                }
            } else if (!player.usedCategories.has("Large Straight") && calculateScore("Large Straight", currentDice, player) > 0) {
                playSound('largestraight');
            } else if (!player.usedCategories.has("Small Straight") && calculateScore("Small Straight", currentDice, player) > 0) {
                playSound('smallstraight');
            } else if (!player.usedCategories.has("Full House") && calculateScore("Full House", currentDice, player) > 0) {
                playSound('fullhouse');
            }
            
            rolling = false;
            updateStatusDisplays();
            renderCategoryButtons();

            // Re-enable the roll button after rolling stops
            if (rollCount < 3) {
                 $("#roll-button").disabled = false;
            }
        }
    }, 100);
}

        const toggleHold = i => { if (rollCount > 0 && !rolling) { heldDice[i] = !heldDice[i]; renderDice(); } };
        function calculateScore(category, dice, player) {
            const counts = countValues(dice), values = Object.values(counts), t = total(dice), uniqueSorted = [...new Set(dice)].sort().join('');
            if (isJohtzee(dice) && player.scores["Johtzee"] === 50) { if (player.usedCategories.has(["Ones","Twos","Threes","Fours","Fives","Sixes"][dice[0]-1])) { if (category === "Full House") return 25; if (category === "Small Straight") return 30; if (category === "Large Straight") return 40; } }
            switch(category) { case "Ones": return (counts[1]||0)*1; case "Twos": return (counts[2]||0)*2; case "Threes": return (counts[3]||0)*3; case "Fours": return (counts[4]||0)*4; case "Fives": return (counts[5]||0)*5; case "Sixes": return (counts[6]||0)*6; case "3 of a Kind": return values.some(v=>v>=3) ? t : 0; case "4 of a Kind": return values.some(v=>v>=4) ? t : 0; case "Full House": return values.includes(3) && values.includes(2) ? 25 : 0; case "Small Straight": return /1234|2345|3456/.test(uniqueSorted) ? 30 : 0; case "Large Straight": return /12345|23456/.test(uniqueSorted) ? 40 : 0; case "Johtzee": return isJohtzee(dice) ? 50 : 0; case "Chance": return t; default: return 0; }
        }
        function applyScore(playerIdx, category, score) {
            const player = players[playerIdx];
            if (isJohtzee(currentDice) && player.scores["Johtzee"] === 50) player.johtzeeBonusCount = (player.johtzeeBonusCount || 0) + 1;
            player.scores[category] = score;
            player.usedCategories.add(category);
            const li = document.createElement("li");
            li.textContent = `${player.name} scored ${score} in ${category}`;
            $("#history-log").prepend(li);
            if (players.every(p => p.usedCategories.size === 13)) endGame(); else nextTurn();
        }
        function nextTurn(isFirstTurn = false) {
            if (!isFirstTurn) currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
            rollCount = 0;
            currentDice = [0,0,0,0,0];
            heldDice.fill(false);
            johtzeeCelebratedThisTurn = false;
            
            // Show roll button for human players, hide for AI
            if (players[currentPlayerIndex].isAI) {
                $("#roll-button").style.display = "none";
            } else {
                $("#roll-button").style.display = "inline-block";
            }

            $("#roll-button").disabled = false;
            renderDice();
            renderScorecards();
            updateStatusDisplays();
            animateTurnTitle(); // Animate the title only on turn change
            renderCategoryButtons(); 
            if (players[currentPlayerIndex].isAI) { setTimeout(handleAITurn, 1000); }
        }
        function endGame() {
            let gameResult = { scores: [] };
            let winner = { score: -1, name: "" };
            let scoreListHTML = `<ul>`;
            players.forEach(p => {
                const upperTotal = ["Ones","Twos","Threes","Fours","Fives","Sixes"].reduce((s,c)=>s+(p.scores[c]||0),0);
                const score = Object.values(p.scores).reduce((a, b) => a + b, 0) + (upperTotal >= 63 ? 35 : 0) + ((p.johtzeeBonusCount||0)*100);
                gameResult.scores.push({ name: p.name, score });
                scoreListHTML += `<li>${p.name}: <strong>${score}</strong> points</li>`;
                if (score > winner.score) winner = { name: p.name, score };
            });
            scoreListHTML += `</ul>`;
            gameResult.winner = winner;
            gameHistory.push(gameResult);
            
            const contentHTML = `
                <div style="text-align: center;">
                    <h3 style="color:#fff;">The game is over!</h3>
                    <p style="font-size: 1.2rem; font-weight: bold; color: #ffd700;">Congratulations to the winner: ${winner.name}!</p>
                    <p style="font-size: 1.1rem; color: #fff;">Final Scores:</p>
                    ${scoreListHTML}
                </div>
            `;
            
            playSound('gameover');
            openModal("Game Over", contentHTML, true);
        }
        function handleAITurn() {
             $("#roll-button").style.display = "none";
            if (rollCount < 3) {
                rollDice();
                setTimeout(() => {
                    const counts = countValues(currentDice);
                    const entries = Object.entries(counts).sort((a,b) => b[1]-a[1]);
                    const targetFace = entries.length > 0 && entries[0][1] > 1 ? parseInt(entries[0][0], 10) : 0;
                    heldDice.fill(false);
                    if(targetFace > 0) { for (let i = 0; i < 5; i++) { if (currentDice[i] === targetFace) heldDice[i] = true; } }
                    renderDice();
                    setTimeout(handleAITurn, 1500); 
                }, 1200); 
            } else {
                let best = { score: -1, cat: 'Chance' }; 
                categories.filter(cat => !["Upper Total", "Upper Bonus", "Johtzee Bonus"].includes(cat) && !players[currentPlayerIndex].usedCategories.has(cat)).forEach(cat => {
                    const score = calculateScore(cat, currentDice, players[currentPlayerIndex]);
                    if (score > best.score) best = { cat, score };
                });
                document.querySelectorAll('#category-buttons button').forEach(btn => { if (btn.textContent.startsWith(best.cat)) { btn.classList.add('chosen-by-ai'); } });
                setTimeout(() => { applyScore(currentPlayerIndex, best.cat, best.score); }, 800);
            }
        }
        
        function resetToSetup() {
            $("#game-ui").style.display = "none";
            $("#setup-section").style.display = "block";
            
            // Adjust container width back for setup
            $(".container").style.maxWidth = '540px'; 
            
            // Hide the logo on the game screen and show on setup
            if (jotzeeLogoGame) {
                jotzeeLogoGame.style.display = 'none';
            }
            if (jotzeeLogoSetup) {
                jotzeeLogoSetup.style.display = 'block';
            }

            players = [];
            gameHistory = [];
            renderPlayerList();
            renderScorecards();
            closeModal();
            updateStartButtonState(); // NEW: Check button state on reset
        }
        
        $("#add-player").addEventListener("click", addPlayer);
        $("#ai-button").addEventListener("click", addAIPlayer);
        $("#start-game").addEventListener("click", startNewRound);

        // Event listeners for buttons inside the modal, which are now always present in the HTML
        $("#play-again-btn").addEventListener("click", startNewRound);
        $("#new-game-btn").addEventListener("click", resetToSetup);
        
        $("#roll-button").addEventListener("click", rollDice);
        $("#modal-close-btn").addEventListener("click", closeModal);
        $("#log-modal").addEventListener("click", (e) => { if(e.target === e.currentTarget) closeModal(); });
    
        // Initial setup for the container width
        resetToSetup();
        
        // NEW: Initial state of the "Start Game" button is disabled
        $("#start-game").disabled = true;
});