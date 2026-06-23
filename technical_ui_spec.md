# Choice Drop — Technical UI Specification 📱🛠️

This document describes the exact technical structure, screens, user controls, and canvas mechanics of the **Choice Drop** randomizer app. Use this spec sheet to ensure the generated design matches the actual functional layouts and dynamic states implemented in the code.

---

## 1. Application Overview
The app is a client-side decision randomizer where options are animated as falling dots dropping through a randomized vertical grid of platforms (floors) down to a finish line. 
- It operates as a **single-page application** with three state-switched views (`view-setup`, `view-race`, `view-winner`) and one dialog modal (`stats-modal`).
- All views are controlled by a static global header.

---

## 2. Global Header / Navigation Component
The header remains fixed at the top of the viewport across all states. It contains:
1.  **Logo / Brand Area**: Displays the app name: "Choice Drop".
2.  **State-Dependent Action Buttons**:
    *   `#btn-back-winner` (Hidden by default; visible only when viewing the frozen canvas after a race): Returns the user to the Winner screen.
    *   `#btn-toggle-live-stats` (Visible only during the active race state): Toggles the visibility of the real-time leaderboard overlay.

---

## 3. Screen Specs & Interactive Elements

### 📋 Screen 1: Setup View (`#view-setup`)
The entry screen where users input the list of contenders.

*   **Header Title**: A headline text (e.g., "Enter Your Choices").
*   **Sidebar Info Card**: A static text panel explaining the game rules.
*   **Contender List Container (`#choices-list`)**: 
    *   A dynamic list of text input fields representing contender options.
    *   Each field displays a numbering label ("Contender 01", "Contender 02").
    *   Each row features a **Delete Button** on the right.
    *   *Constraint*: The app initializes with 2 rows. The user cannot delete rows if only 2 remain.
*   **"Add Another Choice" Button (`#add-choice-btn`)**: Appends a new input row to the list and focuses it.
*   **"Start the Race" Button (`#start-race-btn`)**: Validates the input list (needs at least 2 non-empty values) and transitions to the Race View.
*   **Error Banner (`#setup-error`)**: Appears below the start button if validation fails (e.g. fewer than 2 choices provided).

---

### 🏁 Screen 2: Active Race View (`#view-race`)
The simulation screen featuring the HTML5 canvas and the live stats panel.

*   **Interactive Simulation Canvas (`#race-canvas`)**:
    *   An HTML5 Canvas element that dynamically resizes to fill its container.
    *   **Platforms (Floors)**: Renders 35 horizontal platforms spaced evenly. Platforms have randomly generated holes for the dots to fall through. The bottom-most platform has no holes and acts as the **Finish Zone**.
    *   **Contender Dots**: Renders circles representing the inputs. Each circle draws the first initial of its contender's name in its center.
    *   **Physics Loop**: Dots start at the top, slide horizontally along platforms, collide with borders and other dots, and fall down through holes under simulated gravity.
    *   **Trails (Traces)**: Each dot leaves a trailing dashed path of its movement history. The leading dot's trail is drawn as a thick, prominent ribbon.
*   **Live Leaderboard Panel (`#live-stats-overlay`)**:
    *   A floating panel overlaying the canvas (closable via a "close" icon or the header button).
    *   Dynamically lists all contenders in real-time, sorted by their vertical position (highest drop percentage).
    *   Each row displays: rank number (1st, 2nd, 3rd...), contender name, progress percentage, and a visual progress bar.

---

### 🏆 Screen 3: Winner View (`#view-winner`)
Appears automatically 1 second after a dot lands on the finish line.

*   **Winner Announcement**: A prominent display block showcasing the winning contender's name (e.g. "Winner: Option A").
*   **Control Actions**:
    *   **"Race Again" Button (`#btn-race-again`)**: Instantly restarts the race simulation using the exact same contenders on a newly generated platform layout.
    *   **"Results Table" Button (`#btn-show-stats`)**: Opens the final results dialog overlay.
    *   **"View Arena" Button (`#btn-view-state`)**: Transitions to the Race screen, allowing the user to view the frozen canvas, trajectories, and final positions of all dots.
    *   **"Back to Setup" Button (`#btn-back-setup`)**: Returns the user to the Setup screen to enter new options.

---

## 4. Dialog Component: Final Results Modal (`#stats-modal`)
An overlay modal that opens on top of the Winner screen.

*   **Title**: "Race Results".
*   **Close Trigger**: A close button (cross icon) in the top-right, or clicking outside the modal boundaries.
*   **Results List**:
    *   A vertical list containing final standings for all contenders, sorted by performance.
    *   Each row displays: final placement badge ("WINNER", "2nd", "3rd", "4th"...), contender name, the index of the deepest platform reached ("Floor X"), and the total drop percentage.
