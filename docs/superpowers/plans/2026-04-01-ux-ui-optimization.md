# UX/UI Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split monolithic ui.js into modular components, fix critical UX issues, add dark mode, settings, and visual enhancements.

**Architecture:** Decompose ui.js (~4000 lines) into ~20 focused modules under `js/ui/`. Each module owns one responsibility. The `UI` main class (index.js) coordinates sub-modules while preserving the identical external interface consumed by `FindGameMain`.

**Tech Stack:** ES modules, Canvas 2D API, WeChat Mini Game runtime (wx APIs), no frameworks.

---

## File Structure

```
js/ui/
├── index.js                 # UI main class - orchestrator
├── helpers/
│   ├── animation.js         # lerp, easing, spring physics
│   ├── drawing.js           # roundRect, drawCard, shared canvas utils
│   └── scrollManager.js     # Reusable scroll with inertia
├── components/
│   └── Button.js            # Primary + card button rendering + touch feedback
├── screens/
│   ├── MenuScreen.js        # Main menu rendering
│   └── GameHUD.js           # Game HUD (header, footer, hint, combo)
├── overlays/
│   ├── Modal.js             # Generic modal system
│   ├── InstructionsModal.js # Rules overlay
│   ├── ShopPanel.js         # Shop overlay
│   ├── SkillsPanel.js       # Skills overlay
│   └── AchievementsPanel.js # Achievements overlay
└── effects/
    ├── FloatingText.js      # Floating text effects
    ├── ComboDisplay.js      # Combo visualization
    ├── Notification.js      # Achievement + reward notifications
    └── EggEffect.js         # Easter egg effects
```

Additional files modified:
- `js/constants/colors.js` — add dark mode scheme + settings-aware getter
- `js/polygon.js` — fix renderText with save/restore + touch feedback
- `js/findGameMain.js` — import path change + countdown support
- `js/gameManager.js` — countdown state support
- `js/soundManager.js` — remove console.log, add combo sound
- `js/settingsManager.js` — NEW: persistent settings

---

## Phase 1: Foundation

### Task 1: Create helper modules

**Files:**
- Create: `js/ui/helpers/animation.js`
- Create: `js/ui/helpers/drawing.js`
- Create: `js/ui/helpers/scrollManager.js`

- [ ] Step 1: Create `animation.js` with lerp, easing functions, spring physics
- [ ] Step 2: Create `drawing.js` with roundRect, drawRoundedRect, lightenColor, darkenColor
- [ ] Step 3: Create `scrollManager.js` with ScrollState class
- [ ] Step 4: Commit

### Task 2: Create Button component

**Files:**
- Create: `js/ui/components/Button.js`

- [ ] Step 1: Extract drawPrimaryButton and drawCardButton into Button class
- [ ] Step 2: Add touch feedback (0.95x scale on touchstart, spring back on touchend)
- [ ] Step 3: Commit

### Task 3: Create effect modules

**Files:**
- Create: `js/ui/effects/FloatingText.js`
- Create: `js/ui/effects/ComboDisplay.js`
- Create: `js/ui/effects/Notification.js`
- Create: `js/ui/effects/EggEffect.js`

- [ ] Step 1: Create FloatingText module
- [ ] Step 2: Create ComboDisplay module (with low-combo visibility)
- [ ] Step 3: Create Notification module
- [ ] Step 4: Create EggEffect module
- [ ] Step 5: Commit

### Task 4: Create overlay modules

**Files:**
- Create: `js/ui/overlays/Modal.js`
- Create: `js/ui/overlays/InstructionsModal.js`
- Create: `js/ui/overlays/ShopPanel.js`
- Create: `js/ui/overlays/SkillsPanel.js`
- Create: `js/ui/overlays/AchievementsPanel.js`

- [ ] Step 1: Create generic Modal with improved animation
- [ ] Step 2: Create InstructionsModal with penalty rules
- [ ] Step 3: Create ShopPanel with ScrollManager
- [ ] Step 4: Create SkillsPanel with ScrollManager
- [ ] Step 5: Create AchievementsPanel with ScrollManager
- [ ] Step 6: Commit

### Task 5: Create screen modules

**Files:**
- Create: `js/ui/screens/MenuScreen.js`
- Create: `js/ui/screens/GameHUD.js`

- [ ] Step 1: Create MenuScreen (title, mode switcher, card buttons, floating orbs)
- [ ] Step 2: Create GameHUD (header, footer, hint button, timer improvements)
- [ ] Step 3: Commit

### Task 6: Create UI index.js (orchestrator)

**Files:**
- Create: `js/ui/index.js`
- Modify: `js/findGameMain.js` (import path)

- [ ] Step 1: Create index.js that imports and wires all sub-modules
- [ ] Step 2: Preserve identical external interface (all methods FindGameMain calls)
- [ ] Step 3: Update findGameMain.js import from `./ui` to `./ui/index.js`
- [ ] Step 4: Verify everything still works
- [ ] Step 5: Remove old `js/ui.js`
- [ ] Step 6: Commit

### Task 7: Add dark mode to colors.js

**Files:**
- Modify: `js/constants/colors.js`

- [ ] Step 1: Add COLOR_SCHEME_DARK object
- [ ] Step 2: Update getColorScheme() to accept mode parameter
- [ ] Step 3: Update COLORS getters to be mode-aware
- [ ] Step 4: Commit

### Task 8: Create SettingsManager

**Files:**
- Create: `js/settingsManager.js`
- Modify: `js/findGameMain.js`

- [ ] Step 1: Create SettingsManager with persistence (sound, vibration, dark mode)
- [ ] Step 2: Wire into FindGameMain
- [ ] Step 3: Commit

### Task 9: Fix polygon.js renderText

**Files:**
- Modify: `js/polygon.js`

- [ ] Step 1: Replace manual transform reset with ctx.save()/restore()
- [ ] Step 2: Add touch press visual feedback (scale + brightness)
- [ ] Step 3: Commit

### Task 10: Add timer countdown + urgency effects

**Files:**
- Modify: `js/gameManager.js`
- Modify: `js/ui/screens/GameHUD.js`

- [ ] Step 1: Add 3-2-1-GO countdown state to GameManager
- [ ] Step 2: Render countdown in GameHUD
- [ ] Step 3: Add timer pulse at <5s and edge flash at <3s
- [ ] Step 4: Commit

### Task 11: Add screen transitions

**Files:**
- Modify: `js/ui/index.js`
- Create: `js/ui/effects/ScreenTransition.js`

- [ ] Step 1: Create ScreenTransition module (fade, slide animations)
- [ ] Step 2: Add menu→game transition
- [ ] Step 3: Add panel slide-in/out transitions
- [ ] Step 4: Commit

### Task 12: Settings panel UI + clean up soundManager

**Files:**
- Modify: `js/ui/screens/GameHUD.js` (gear icon)
- Create: `js/ui/overlays/SettingsPanel.js`
- Modify: `js/soundManager.js`

- [ ] Step 1: Create SettingsPanel with toggle rendering
- [ ] Step 2: Add gear icon to GameHUD
- [ ] Step 3: Wire settings to SoundManager and VibrationManager
- [ ] Step 4: Remove console.log from soundManager.js
- [ ] Step 5: Commit

---

## Phase 2: Visual Upgrades (after Phase 1)

### Task 13: Visual micro-animations

- [ ] Star particles on correct click
- [ ] Crack lines on error
- [ ] Coin fly-to-HUD animation
- [ ] Commit

### Task 14: Instructions modal redesign

- [ ] Add step illustrations
- [ ] Mode explanation cards with icons
- [ ] Emphasize penalty rules
- [ ] Commit

### Task 15: Menu visual enhancements

- [ ] 3D perspective tilt on title cards
- [ ] Depth layers on floating orbs
- [ ] Shimmer sweep on card buttons
- [ ] Commit

---

## Phase 3: Polish

### Task 16: Best scores display
### Task 17: Accessibility improvements
### Task 18: Audio improvements
### Task 19: Performance optimization
