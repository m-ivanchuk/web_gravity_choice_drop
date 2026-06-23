const COLORS = ["#ffd7f0", "#e9ddff", "#7df4ff", "#ffdbe0", "#cbeee4", "#cbe6f6", "#fef0be", "#ffc5a1", "#d6cbf6"];

// --- DOM ELEMENTS ---
const viewSetup = document.getElementById('view-setup');
const viewRace = document.getElementById('view-race');
const viewWinner = document.getElementById('view-winner');

const choicesList = document.getElementById('choices-list');
const btnAddChoice = document.getElementById('add-choice-btn');
const btnStartRace = document.getElementById('start-race-btn');
const setupError = document.getElementById('setup-error');

const winnerNameEl = document.getElementById('winner-name');
const btnRaceAgain = document.getElementById('btn-race-again');
const btnBackSetup = document.getElementById('btn-back-setup');

const canvas = document.getElementById('race-canvas');
const ctx = canvas.getContext('2d');

const btnShowStats = document.getElementById('btn-show-stats');
const btnViewState = document.getElementById('btn-view-state');
const btnBackWinner = document.getElementById('btn-back-winner');
const statsModal = document.getElementById('stats-modal');
const btnCloseStats = document.getElementById('btn-close-stats');
const finalStatsList = document.getElementById('final-stats-list');

const liveStatsOverlay = document.getElementById('live-stats-overlay');
const btnToggleLiveStats = document.getElementById('btn-toggle-live-stats');
const btnCloseLiveStats = document.getElementById('btn-close-live-stats');
const liveStatsList = document.getElementById('live-stats-list');

// --- APP STATE ---
let options = []; // Array of { id, name, color }
let dots = []; // Array of Dot instances
let floors = [];
let animFrame;
let raceFinished = false;
let winnerDot = null;

// Config
const NUM_FLOORS = 35;
const FLOOR_THICKNESS = 6;
const DOT_RADIUS = 7;
const SPEED = 3.0;
const GRAVITY = 6.0;
const HOLE_WIDTH = 20;

// --- ANNOUNCER TICKER CODES ---
const ANNOUNCER_PHRASES = [
    "OH MY GOD! LOOK AT THEM GO! 💥",
    "TAKO KARATE executes a perfect gravity roll! 🐙",
    "Is that... a speed boost?! No, it's just gravity! 🚀",
    "UNBELIEVABLE! They are clashing on the platforms! ⚔️",
    "KA-POW! A massive collision redirects the leader! 💥",
    "Will they make it through the next gap? The tension is real! 😱",
    "Watch out for that hole! And... down they go! 🕳️",
    "Who will claim the ultimate victory tonight? 🏆",
    "The crowd is going absolutely wild! 📣",
    "A legendary battle of gravity and choices! ✨",
    "Look at that speed! They are slicing through the air! ⚡",
    "An absolute masterclass in vertical sliding! 📉",
    "Ouch! Bounced right off the edge! That's gotta hurt! 🤕",
    "The leader is dropping like a stone! 💎",
    "Nobody can predict where they will fall next! 🌀",
    "Hold onto your seats, folks! The drop is getting chaotic! 🎢",
    "Is it luck? Is it fate? No, it's physics! 🧬",
    "BOMBSHELL! A sudden bounce changes everything! 💣",
    "They are fighting for every pixel of space! 👾",
    "CRASH! Direct impact pushes the contender into a hole! 🕳️"
];

let commentatorInterval = null;

function startCommentator() {
    const ticker = document.getElementById('commentator-ticker');
    if (!ticker) return;

    ticker.textContent = "THE RACE HAS STARTED! GET READY TO DROP! ⚡";
    ticker.classList.remove('animate-marquee');
    void ticker.offsetWidth; // Trigger reflow to restart CSS animation
    ticker.classList.add('animate-marquee');

    if (commentatorInterval) clearInterval(commentatorInterval);

    commentatorInterval = setInterval(() => {
        if (raceFinished) {
            clearInterval(commentatorInterval);
            return;
        }
        const phrase = ANNOUNCER_PHRASES[Math.floor(Math.random() * ANNOUNCER_PHRASES.length)];
        
        ticker.classList.remove('animate-marquee');
        ticker.textContent = phrase;
        void ticker.offsetWidth; // Trigger reflow
        ticker.classList.add('animate-marquee');
    }, 4500);
}

function stopCommentator(winnerName = "") {
    if (commentatorInterval) clearInterval(commentatorInterval);
    const ticker = document.getElementById('commentator-ticker');
    if (ticker) {
        ticker.classList.remove('animate-marquee');
        ticker.textContent = winnerName ? `🏆 WE HAVE A WINNER: ${winnerName.toUpperCase()}! CELEBRATION TIME! 🎉` : "The race has finished!";
    }
}

// --- VIEW MANAGEMENT ---
function switchView(view) {
    [viewSetup, viewRace, viewWinner].forEach(v => v.classList.remove('active'));
    view.classList.add('active');
}

// --- SETUP SCREEN LOGIC ---
let choiceCounter = 1;

function reindexRows() {
    const rows = choicesList.querySelectorAll('.choice-row');
    rows.forEach((row, i) => {
        const badge = row.querySelector('.choice-badge');
        if (badge) {
            badge.textContent = `#${String(i + 1).padStart(2, '0')}`;
            badge.style.transform = `rotate(${(i % 2 === 0 ? -4 : 4)}deg)`;
        }
    });
    choiceCounter = rows.length + 1;
}

function createChoiceRow(initialValue = "") {
    const row = document.createElement('div');
    row.className = "relative group choice-row mt-4";
    const n = choiceCounter++;
    const rot = (Math.random() * 8 - 4).toFixed(1);

    row.innerHTML = `
        <div class="choice-badge absolute -left-3 -top-3 bg-on-surface text-surface px-3 py-1 font-label text-sm font-black rotate-[${rot}deg] z-10 rounded-lg border-2 border-on-surface">#${String(n).padStart(2, '0')}</div>
        <div class="flex items-center gap-4">
            <input class="w-full px-8 py-5 rounded-full border-4 border-on-surface bg-[#ffffff] font-bold text-lg text-on-surface placeholder:text-on-surface-variant/40 shadow-[6px_6px_0px_0px_rgba(28,27,27,1)] focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all choice-input" placeholder="Enter contender name..." type="text" value="${initialValue}"/>
            <button class="remove-btn material-symbols-outlined text-error text-3xl p-2 hover:scale-125 transition-transform flex-shrink-0">delete</button>
        </div>
    `;

    row.querySelector('.remove-btn').addEventListener('click', () => {
        if (choicesList.children.length > 2) {
            row.remove();
            reindexRows();
        } else {
            showError("Minimum 2 choices required.");
        }
    });

    choicesList.appendChild(row);
}

function showError(msg) {
    setupError.textContent = msg;
    setupError.style.opacity = 1;
    setTimeout(() => { setupError.style.opacity = 0; }, 3000);
}

function initSetup() {
    choicesList.innerHTML = '';
    choiceCounter = 1;
    createChoiceRow("");
    createChoiceRow("");
    switchView(viewSetup);
}

btnAddChoice.addEventListener('click', () => {
    createChoiceRow();
    const inputs = choicesList.querySelectorAll('.choice-input');
    if (inputs.length > 0) {
        inputs[inputs.length - 1].focus();
    }
});

btnStartRace.addEventListener('click', () => {
    const inputs = Array.from(choicesList.querySelectorAll('.choice-input')).map(inp => inp.value.trim());
    const validInputs = inputs.filter(val => val.length > 0);

    if (validInputs.length < 2) {
        showError("Please enter at least 2 contenders.");
        return;
    }

    options = validInputs.map((name, i) => ({
        id: i,
        name: name,
        color: COLORS[i % COLORS.length]
    }));

    startRace();
});


// --- RACE LOGIC ---

class Floor {
    constructor(y, isFinishLine = false) {
        this.y = y;
        this.isFinishLine = isFinishLine;
        this.holes = [];
    }

    generateHoles(canvasWidth, numHoles = 2) {
        if (this.isFinishLine) return; // Finish line has no holes

        for (let i = 0; i < numHoles; i++) {
            // Keep holes somewhat away from edges and other holes
            let maxAttempts = 10;
            while (maxAttempts-- > 0) {
                let hx = 20 + Math.random() * (canvasWidth - HOLE_WIDTH - 40);
                // Check overlap
                let overlap = this.holes.some(h => Math.abs(h.x - hx) < HOLE_WIDTH + 20);
                if (!overlap) {
                    this.holes.push({ x: hx, width: HOLE_WIDTH });
                    break;
                }
            }
        }
    }

    draw(ctx, canvasWidth) {
        if (this.isFinishLine) {
            // Draw a cute finish zone using mint and checker pattern
            ctx.fillStyle = "#cbeee4"; // Pastel Mint background
            ctx.fillRect(0, this.y, canvasWidth, Math.max(20, FLOOR_THICKNESS * 3));
            
            // Draw top border
            ctx.fillStyle = "#1c1b1b";
            ctx.fillRect(0, this.y, canvasWidth, 2.5);
            
            // Draw bottom border
            ctx.fillRect(0, this.y + Math.max(20, FLOOR_THICKNESS * 3) - 2.5, canvasWidth, 2.5);

            // Draw text
            ctx.fillStyle = "#1c1b1b";
            ctx.font = "bold 12px 'Bricolage Grotesque'";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("🏁 FINISH ZONE 🏁", canvasWidth / 2, this.y + Math.max(20, FLOOR_THICKNESS * 3) / 2 + 1);
            return;
        }

        let thickness = Math.max(8, FLOOR_THICKNESS);
        let startX = 0;
        let sortedHoles = [...this.holes].sort((a, b) => a.x - b.x);

        ctx.strokeStyle = "#1c1b1b";
        ctx.lineWidth = thickness;
        ctx.lineCap = "round";

        for (let h of sortedHoles) {
            let len = h.x - startX;
            if (len > 0) {
                let x1 = startX === 0 ? 0 : startX + thickness / 2;
                let x2 = h.x - thickness / 2;
                if (x2 > x1) {
                    ctx.beginPath();
                    ctx.moveTo(x1, this.y + thickness / 2);
                    ctx.lineTo(x2, this.y + thickness / 2);
                    ctx.stroke();
                }
            }
            startX = h.x + h.width;
        }
        
        let remainingLen = canvasWidth - startX;
        if (remainingLen > 0) {
            let x1 = startX === 0 ? 0 : startX + thickness / 2;
            let x2 = canvasWidth;
            if (x2 > x1) {
                ctx.beginPath();
                ctx.moveTo(x1, this.y + thickness / 2);
                ctx.lineTo(x2, this.y + thickness / 2);
                ctx.stroke();
            }
        }
    }
}

class Dot {
    constructor(option, canvasWidth, canvasHeight) {
        this.option = option;
        this.radius = DOT_RADIUS;
        // Start randomly on top floor
        this.x = this.radius + 10 + Math.random() * (canvasWidth - this.radius * 2 - 20);
        this.y = 0; // Will be set to floor 0

        let scaleX = canvasWidth / 400;
        let scaleY = canvasHeight / 600;

        this.vx = (Math.random() > 0.5 ? 1 : -1) * (SPEED * scaleX * (0.6 + Math.random() * 0.2));
        this.vy = 0;
        this.gravity = GRAVITY * scaleY;

        this.floorIndex = 0;
        this.state = "running"; // running, falling

        this.history = [];
    }

    update(canvasWidth) {
        if (this.state === "falling") {
            this.y += this.gravity;

            let nextFloor = floors[this.floorIndex + 1];
            if (!nextFloor) {
                // reached beyond logic, shouldn't happen if finish line restricts
                return;
            }

            // Check if landed
            if (this.y + this.radius >= nextFloor.y) {
                this.y = nextFloor.y - this.radius;
                this.floorIndex++;
                this.state = "running";

                // Random bounce direction on landing
                if (Math.random() > 0.5) this.vx *= -1;

                // If landed on finish floor -> Win condition
                if (nextFloor.isFinishLine) {
                    if (!raceFinished) {
                        raceFinished = true;
                        winnerDot = this;
                        declareWinner(this.option);
                    }
                }
            }
        }
        else if (this.state === "running") {
            this.x += this.vx;

            // Edge collisions
            if (this.x - this.radius <= 0) {
                this.x = this.radius;
                this.vx *= -1;
            } else if (this.x + this.radius >= canvasWidth) {
                this.x = canvasWidth - this.radius;
                this.vx *= -1;
            }

            // Check holes
            let currentFloor = floors[this.floorIndex];
            if (!currentFloor.isFinishLine) {
                for (let h of currentFloor.holes) {
                    // Tolerance so it drops smoothly
                    if (this.x > h.x + this.radius * 0.5 && this.x < h.x + h.width - this.radius * 0.5) {
                        this.state = "falling";
                        break;
                    }
                }
            }
        }

        // Track the dot's path
        this.history.push({ x: this.x, y: this.y });
    }

    drawTrace(ctx, timestamp = 0) {
        if (this.history.length < 2) return;

        let isWinnerTrace = (winnerDot === this);

        if (isWinnerTrace) {
            // Draw outer dark stroke
            ctx.beginPath();
            ctx.setLineDash([]);
            ctx.lineWidth = 4.5;
            ctx.strokeStyle = "#2f2d29";
            ctx.moveTo(this.history[0].x, this.history[0].y);
            for (let i = 1; i < this.history.length; i++) {
                ctx.lineTo(this.history[i].x, this.history[i].y);
            }
            ctx.stroke();
            ctx.closePath();

            // Draw inner color stroke
            ctx.beginPath();
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = this.option.color;
            ctx.moveTo(this.history[0].x, this.history[0].y);
            for (let i = 1; i < this.history.length; i++) {
                ctx.lineTo(this.history[i].x, this.history[i].y);
            }
            ctx.stroke();
            ctx.closePath();
        } else {
            // Draw outer dark dashed line
            ctx.beginPath();
            ctx.setLineDash([3, 5]);
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = "#2f2d29";
            ctx.moveTo(this.history[0].x, this.history[0].y);
            for (let i = 1; i < this.history.length; i++) {
                ctx.lineTo(this.history[i].x, this.history[i].y);
            }
            ctx.stroke();
            ctx.closePath();

            // Draw inner colored dashed line
            ctx.beginPath();
            ctx.setLineDash([3, 5]);
            ctx.lineWidth = 1.0;
            ctx.strokeStyle = this.option.color;
            ctx.moveTo(this.history[0].x, this.history[0].y);
            for (let i = 1; i < this.history.length; i++) {
                ctx.lineTo(this.history[i].x, this.history[i].y);
            }
            ctx.stroke();
            ctx.closePath();
        }

        ctx.setLineDash([]);
    }

    draw(ctx) {
        // Draw the dot body
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.option.color;
        ctx.fill();
        
        // Draw the dark border (Neo-Brutalism sticker look)
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = "#1c1b1b";
        ctx.stroke();
        ctx.closePath();

        // Draw small initial inside using Bricolage Grotesque font
        ctx.fillStyle = "#1c1b1b";
        ctx.font = "bold 9px 'Bricolage Grotesque'";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        let initial = this.option.name.substring(0, 1).toUpperCase();
        ctx.fillText(initial, this.x, this.y + 0.5);
    }
}

function startRace() {
    raceFinished = false;
    winnerDot = null;
    dots = [];
    floors = [];

    switchView(viewRace);

    // Resize canvas based on container
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const w = canvas.width;
    const h = canvas.height;

    // Generate floors
    const floorSpacing = h / (NUM_FLOORS + 1);
    for (let i = 0; i < NUM_FLOORS; i++) {
        let isFinish = (i === NUM_FLOORS - 1);
        let fy = floorSpacing * (i + 1);

        let floor = new Floor(fy, isFinish);

        // More holes in bottom floors to speed up ending, 
        // fewer holes in top so dots spread out first.
        let numHoles = isFinish ? 0 : Math.floor(2 + Math.random() * 3);
        floor.generateHoles(w, numHoles);

        floors.push(floor);
    }

    // Initialize dots
    const topFloorY = floors[0].y;
    for (let opt of options) {
        let dot = new Dot(opt, w, h);
        dot.y = topFloorY - dot.radius; // sit on top floor
        dots.push(dot);
    }

    // No live stats rendered by default. Toggle button is visible!
    liveStatsOverlay.classList.add('hidden');
    btnToggleLiveStats.classList.remove('hidden');

    // Hide 'back to results' button during the race if it was open
    btnBackWinner.classList.add('hidden');

    startCommentator();

    if (animFrame) cancelAnimationFrame(animFrame);
    animFrame = requestAnimationFrame(gameLoop);
}

function resolveDotCollisions() {
    // Basic elastic 1D collision
    for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
            let d1 = dots[i];
            let d2 = dots[j];

            // Only collide if both are running and on the same floor
            if (d1.state === "running" && d2.state === "running" && d1.floorIndex === d2.floorIndex) {
                if (Math.abs(d1.x - d2.x) < d1.radius + d2.radius) {
                    // overlap resolve
                    let overlap = (d1.radius + d2.radius) - Math.abs(d1.x - d2.x);
                    if (d1.x < d2.x) {
                        d1.x -= overlap / 2;
                        d2.x += overlap / 2;
                    } else {
                        d1.x += overlap / 2;
                        d2.x -= overlap / 2;
                    }

                    // swap velocities
                    let tempVx = d1.vx;
                    d1.vx = d2.vx;
                    d2.vx = tempVx;
                }
            }
        }
    }
}

let lastStatsUpdate = 0;

function gameLoop(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let floor of floors) {
        floor.draw(ctx, canvas.width);
    }

    if (!raceFinished) {
        // Logic updates
        for (let dot of dots) {
            dot.update(canvas.width);
        }
        resolveDotCollisions();
    }

    // Render traces
    for (let dot of dots) {
        dot.drawTrace(ctx, timestamp);
    }

    // Render dots
    for (let dot of dots) {
        dot.draw(ctx);
    }

    // Throttled Live Stats update over the canvas
    if (!liveStatsOverlay.classList.contains('hidden') && !raceFinished) {
        if (timestamp - lastStatsUpdate > 250) {
            renderLiveStats();
            lastStatsUpdate = timestamp;
        }
    }

    animFrame = requestAnimationFrame(gameLoop);
}

function renderLiveStats() {
    let sortedDots = [...dots].sort((a, b) => b.y - a.y);
    liveStatsList.innerHTML = '';
    let maxDropY = canvas.height;
    if (floors.length > 0) {
        maxDropY = floors[floors.length - 1].y - DOT_RADIUS;
    }

    sortedDots.forEach((d, index) => {
        let pct = Math.floor((d.y / maxDropY) * 100);
        pct = Math.min(100, Math.max(0, pct));

        const card = document.createElement('div');
        card.className = "bg-[#ffffff] p-3 rounded-2xl border-4 border-on-surface shadow-[4px_4px_0px_0px_rgba(28,27,27,1)] relative overflow-hidden transition-all duration-300";

        card.innerHTML = `
            <div class="flex justify-between items-center mb-1.5">
                <span class="font-headline font-black text-sm text-on-surface uppercase w-full truncate">
                    <span style="color: ${d.option.color}; -webkit-text-stroke: 0.5px #1c1b1b;" class="mr-1 font-black">${index + 1}.</span> ${d.option.name}
                </span>
                <span class="text-[10px] font-black px-1.5 py-0.5 rounded-lg border-2 border-on-surface shadow-[2px_2px_0px_0px_rgba(28,27,27,1)] shrink-0" style="background-color: ${d.option.color}">${pct}%</span>
            </div>
            <div class="w-full bg-[#f6f3f2] h-4 rounded-full border-2 border-on-surface overflow-hidden">
                <div class="h-full rounded-full transition-all duration-300 border-r-2 border-on-surface" style="width: ${pct}%; background-color: ${d.option.color};"></div>
            </div>
        `;
        liveStatsList.appendChild(card);
    });
}

function renderFinalStats() {
    let sortedDots = [...dots].sort((a, b) => b.y - a.y);

    finalStatsList.innerHTML = '';
    let maxDropY = canvas.height;
    if (floors.length > 0) {
        maxDropY = floors[floors.length - 1].y - DOT_RADIUS;
    }

    sortedDots.forEach((d, index) => {
        let pct = Math.floor((d.y / maxDropY) * 100);
        pct = Math.min(100, Math.max(0, pct));

        let positionText = ["1", "2", "3"][index] || `${index + 1}`;
        let bgClass = "bg-surface-container";
        let placeBg = "#CD7F32"; // bronze
        if (index === 0) {
            bgClass = "bg-primary-fixed";
            placeBg = "#FFD700"; // gold
        } else if (index === 1) {
            bgClass = "bg-secondary-fixed";
            placeBg = "#C0C0C0"; // silver
        } else if (index === 2) {
            bgClass = "bg-tertiary-fixed";
            placeBg = "#CD7F32";
        }

        const card = document.createElement('div');
        card.className = `${bgClass} flex items-center gap-4 border-4 border-on-surface p-4 rounded-full shadow-[4px_4px_0px_0px_rgba(28,27,27,1)]`;

        card.innerHTML = `
            <div class="w-12 h-12 shrink-0 border-4 border-on-surface rounded-full flex items-center justify-center font-headline text-xl" style="background-color: ${placeBg}">${positionText}</div>
            <div class="flex-1 min-w-0">
                <div class="flex justify-between items-end mb-1">
                    <span class="font-headline text-lg uppercase truncate text-on-surface pr-2">${d.option.name}</span>
                    <span class="font-label text-xs font-black text-primary shrink-0">${d.floorIndex + 1} Floors (${pct}%)</span>
                </div>
                <div class="h-4 w-full bg-surface border-2 border-on-surface rounded-full overflow-hidden">
                    <div class="h-full rounded-full" style="width: ${pct}%; background-color: ${d.option.color}"></div>
                </div>
            </div>
        `;
        finalStatsList.appendChild(card);
    });
}

// --- WINNER LOGIC ---

function declareWinner(winningOption) {
    winnerNameEl.textContent = winningOption.name + " 🏆";
    winnerNameEl.style.color = winningOption.color;
    winnerNameEl.style.textShadow = `4px 4px 0px #1c1b1b`;
    stopCommentator(winningOption.name);

    // Render final stats
    renderFinalStats();

    // Hide active UI toggles
    btnToggleLiveStats.classList.add('hidden');
    liveStatsOverlay.classList.add('hidden');

    setTimeout(() => {
        switchView(viewWinner);
    }, 1000); // Wait 1s after hit before overlay
}

btnRaceAgain.addEventListener('click', () => {
    // Re-run with same options
    startRace();
});

btnBackSetup.addEventListener('click', () => {
    switchView(viewSetup);
});

btnShowStats.addEventListener('click', () => {
    statsModal.showModal();
});

btnCloseStats.addEventListener('click', () => {
    statsModal.close();
});

// Close modal when clicking outside
statsModal.addEventListener('click', (e) => {
    const dialogDimensions = statsModal.getBoundingClientRect();
    if (
        e.clientX < dialogDimensions.left ||
        e.clientX > dialogDimensions.right ||
        e.clientY < dialogDimensions.top ||
        e.clientY > dialogDimensions.bottom
    ) {
        statsModal.close();
    }
});

btnViewState.addEventListener('click', () => {
    switchView(viewRace);
    btnBackWinner.classList.remove('hidden');
});

btnBackWinner.addEventListener('click', () => {
    switchView(viewWinner);
    btnBackWinner.classList.add('hidden');
});

btnToggleLiveStats.addEventListener('click', () => {
    liveStatsOverlay.classList.remove('hidden');
    btnToggleLiveStats.classList.add('hidden');
});

btnCloseLiveStats.addEventListener('click', () => {
    liveStatsOverlay.classList.add('hidden');
    btnToggleLiveStats.classList.remove('hidden');
});


// INIT APP
initSetup();
