const COLORS = ["#ffdbe0", "#cbeee4", "#cbe6f6", "#fef0be", "#ffc5a1", "#d6cbf6", "#f6cbd6", "#cbf6db", "#f6ecb8"];

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

// --- VIEW MANAGEMENT ---
function switchView(view) {
    [viewSetup, viewRace, viewWinner].forEach(v => v.classList.remove('active'));
    view.classList.add('active');
}

// --- SETUP SCREEN LOGIC ---
let choiceCounter = 1;

function createChoiceRow(initialValue = "") {
    const row = document.createElement('div');
    row.className = "bg-[#ffffff] rounded-2xl p-1 border-2.5 border-[#2f2d29] shadow-[3px_3px_0px_#2f2d29] focus-within:shadow-[5px_5px_0px_#2f2d29] focus-within:translate-x-[-2px] focus-within:translate-y-[-2px] transition-kawaii choice-row relative group";
    const n = choiceCounter++;

    row.innerHTML = `
        <div class="relative flex items-center justify-between">
            <div class="relative flex-grow">
                <label class="absolute left-4 top-3 text-[10px] font-extrabold uppercase tracking-widest text-[#615e58]">Contender ${String(n).padStart(2, '0')}</label>
                <input class="w-full bg-transparent border-none pt-8 pb-3 px-4 text-[#2f2d29] focus:ring-0 placeholder:text-[#2f2d29]/30 headline-font text-lg font-bold choice-input outline-none" placeholder="Enter option..." type="text" value="${initialValue}" />
            </div>
            <button class="remove-btn text-[#2f2d29] hover:text-[#ff8383] transition-colors p-4 mx-1">
                <span class="material-symbols-outlined transition-transform active:scale-90">delete</span>
            </button>
        </div>
    `;

    row.querySelector('.remove-btn').addEventListener('click', () => {
        if (choicesList.children.length > 2) {
            row.remove();
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
            ctx.fillStyle = "#2f2d29";
            ctx.fillRect(0, this.y, canvasWidth, 2.5);
            
            // Draw bottom border
            ctx.fillRect(0, this.y + Math.max(20, FLOOR_THICKNESS * 3) - 2.5, canvasWidth, 2.5);

            // Draw text
            ctx.fillStyle = "#2f2d29";
            ctx.font = "bold 12px 'Fredoka'";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("🏁 FINISH ZONE 🏁", canvasWidth / 2, this.y + Math.max(20, FLOOR_THICKNESS * 3) / 2 + 1);
            return;
        }

        // Draw regular floors as solid boards with dark borders
        ctx.fillStyle = "#fef0be"; // Pastel Yellow base
        let thickness = Math.max(8, FLOOR_THICKNESS); // Make them slightly thicker for a solid look
        
        let startX = 0;
        let sortedHoles = [...this.holes].sort((a, b) => a.x - b.x);

        for (let h of sortedHoles) {
            let len = h.x - startX;
            if (len > 0) {
                // Fill
                ctx.fillStyle = "#fef0be";
                ctx.fillRect(startX, this.y, len, thickness);
                // Stroke
                ctx.fillStyle = "#2f2d29";
                ctx.fillRect(startX, this.y, len, 2.5); // Top border
                ctx.fillRect(startX, this.y + thickness - 2.5, len, 2.5); // Bottom border
                if (startX > 0) {
                    ctx.fillRect(startX, this.y, 2.5, thickness); // Left edge
                }
                ctx.fillRect(h.x - 2.5, this.y, 2.5, thickness); // Right edge (before hole)
            }
            startX = h.x + h.width;
        }
        
        // Fill remaining segment
        let remainingLen = canvasWidth - startX;
        if (remainingLen > 0) {
            ctx.fillStyle = "#fef0be";
            ctx.fillRect(startX, this.y, remainingLen, thickness);
            ctx.fillStyle = "#2f2d29";
            ctx.fillRect(startX, this.y, remainingLen, 2.5);
            ctx.fillRect(startX, this.y + thickness - 2.5, remainingLen, 2.5);
            ctx.fillRect(startX, this.y, 2.5, thickness); // Left edge of remaining segment
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

        ctx.beginPath();
        if (isWinnerTrace) {
            ctx.setLineDash([]);
            ctx.lineWidth = 3.5;
            ctx.strokeStyle = "#ffffff"; // Light solid outline for winner trace (visible on dark canvas)
        } else {
            ctx.setLineDash([3, 5]);
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = this.option.color; // Color dashed outline for others
        }

        ctx.moveTo(this.history[0].x, this.history[0].y);
        for (let i = 1; i < this.history.length; i++) {
            ctx.lineTo(this.history[i].x, this.history[i].y);
        }
        ctx.stroke();
        ctx.closePath();

        // If winner trace, draw an inner color line for a nice sticker stripe effect
        if (isWinnerTrace) {
            ctx.beginPath();
            ctx.setLineDash([]);
            ctx.lineWidth = 2;
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
        ctx.strokeStyle = "#2f2d29";
        ctx.stroke();
        ctx.closePath();

        // Draw small initial inside using Fredoka font
        ctx.fillStyle = "#2f2d29";
        ctx.font = "bold 9px 'Fredoka'";
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
        card.className = "bg-[#ffffff] p-2 rounded-xl border-2 border-[#2f2d29] shadow-[2px_2px_0px_#2f2d29] relative overflow-hidden transition-all duration-300";

        card.innerHTML = `
            <div class="flex justify-between items-center mb-1.5">
                <span class="headline-font font-bold text-xs text-[#2f2d29] uppercase w-full truncate">
                    <span style="color: ${d.option.color}; -webkit-text-stroke: 0.5px #2f2d29;" class="mr-1 font-black">${index + 1}.</span> ${d.option.name}
                </span>
                <span class="text-[9px] font-black px-1.5 py-0.5 rounded-lg border border-[#2f2d29] shadow-[1px_1px_0px_#2f2d29] shrink-0" style="background-color: ${d.option.color}">${pct}%</span>
            </div>
            <div class="w-full bg-[#faf7f2] h-2.5 rounded-full border border-[#2f2d29] overflow-hidden">
                <div class="h-full rounded-full transition-all duration-300 border-r border-[#2f2d29]" style="width: ${pct}%; background-color: ${d.option.color};"></div>
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

        let positionText = ["1st", "2nd", "3rd"][index] || `${index + 1}th`;
        if (index === 0) positionText = "WINNER";

        const card = document.createElement('div');
        card.className = "bg-[#ffffff] p-4 rounded-2xl border-2.5 border-[#2f2d29] relative overflow-hidden flex items-center justify-between shadow-[3px_3px_0px_#2f2d29]";
        if (index === 0) {
            card.className += " bg-pastel-yellow shadow-[4px_4px_0px_#2f2d29]";
        }

        card.innerHTML = `
            <div class="flex items-center gap-4 overflow-hidden max-w-[70%]">
                <span class="text-xs font-black uppercase w-16 shrink-0 py-0.5 px-2 rounded-lg border border-[#2f2d29] text-center shadow-[1px_1px_0px_#2f2d29]" style="background-color: ${d.option.color}">${positionText}</span>
                <span class="headline-font font-bold text-lg text-[#2f2d29] truncate">${d.option.name}</span>
            </div>
            <div class="text-right">
                <span class="text-[9px] text-[#615e58] font-bold uppercase tracking-wider block">Floor ${d.floorIndex + 1}</span>
                <span class="text-xs font-black truncate uppercase block mt-0.5" style="color: ${d.option.color}; -webkit-text-stroke: 0.3px #2f2d29;">${pct}% Drop</span>
            </div>
        `;
        finalStatsList.appendChild(card);
    });
}

// --- WINNER LOGIC ---

function declareWinner(winningOption) {
    winnerNameEl.textContent = winningOption.name;
    winnerNameEl.style.color = winningOption.color;
    winnerNameEl.style.textShadow = `2px 2px 0px #2f2d29`;

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
