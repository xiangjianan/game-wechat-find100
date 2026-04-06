/**
 * ScoreManager tests
 * Run: node test/scoreManager.test.js
 *
 * Inline copy of ScoreManager logic for testing without ES module resolution.
 */

// ── ScoreManager logic (duplicated for testability without ESM) ──

const STORAGE_KEY = 'scoreHistory';
const MAX_SCORES_PER_LEVEL = 10;

function compareScores(a, b) {
  if (a.numbersFound !== b.numbersFound) {
    return b.numbersFound - a.numbersFound;
  }
  return a.timeSpent - b.timeSpent;
}

function isBetterScore(a, b) {
  if (!b) return true;
  if (!a) return false;
  return compareScores(a, b) < 0;
}

class ScoreManager {
  constructor(store) {
    this._store = store;
    this.scores = { 1: [], 2: [] };
    this.onHighScore = null;
    this.loadScores();
  }

  recordScore(level, numbersFound, timeSpent) {
    if (level !== 1 && level !== 2) {
      return { isNewHighScore: false, previousBest: null, currentBest: null, rank: -1 };
    }

    const entry = {
      numbersFound,
      timeSpent: Math.round(timeSpent * 100) / 100,
      timestamp: Date.now()
    };

    const previousBest = this.getHighScore(level);
    const previousBestCopy = previousBest ? { ...previousBest } : null;

    const scores = this.scores[level] || [];
    scores.push(entry);
    scores.sort(compareScores);
    this.scores[level] = scores.slice(0, MAX_SCORES_PER_LEVEL);

    const currentBest = this.getHighScore(level);
    const isNewHighScore = isBetterScore(entry, previousBestCopy);
    const rank = this.getRank(level, entry);

    this.saveScores();

    const isFirstScore = previousBestCopy === null;

    if (isNewHighScore && !isFirstScore && this.onHighScore) {
      this.onHighScore(level, entry, previousBestCopy);
    }

    return { isNewHighScore, previousBest: previousBestCopy, currentBest, rank };
  }

  getHighScore(level) {
    const scores = this.scores[level];
    if (!scores || scores.length === 0) return null;
    return { ...scores[0] };
  }

  getTopScores(level) {
    const scores = this.scores[level];
    if (!scores) return [];
    return scores.map(s => ({ ...s }));
  }

  getRank(level, entry) {
    const scores = this.scores[level];
    if (!scores) return -1;
    for (let i = 0; i < scores.length; i++) {
      if (scores[i].timestamp === entry.timestamp &&
          scores[i].numbersFound === entry.numbersFound &&
          scores[i].timeSpent === entry.timeSpent) {
        return i + 1;
      }
    }
    return -1;
  }

  saveScores() {
    this._store[STORAGE_KEY] = JSON.stringify(this.scores);
  }

  loadScores() {
    const saved = this._store[STORAGE_KEY];
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.scores = {
          1: Array.isArray(parsed[1]) ? parsed[1] : [],
          2: Array.isArray(parsed[2]) ? parsed[2] : []
        };
      } catch (e) {
        this.scores = { 1: [], 2: [] };
      }
    }
  }

  reset() {
    this.scores = { 1: [], 2: [] };
    this.saveScores();
  }
}

// ── Test harness ──

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  \u2713 ${message}`);
  } else {
    failed++;
    console.log(`  \u2717 ${message}`);
  }
}

function assertEqual(actual, expected, message) {
  if (actual === expected) {
    passed++;
    console.log(`  \u2713 ${message}`);
  } else {
    failed++;
    console.log(`  \u2717 ${message} (expected ${expected}, got ${actual})`);
  }
}

// ── compareScores ──
console.log('\ncompareScores:');

assert(compareScores({ numbersFound: 5, timeSpent: 10 }, { numbersFound: 3, timeSpent: 5 }) < 0,
  '5 found beats 3 found regardless of time');

assert(compareScores({ numbersFound: 5, timeSpent: 8 }, { numbersFound: 5, timeSpent: 10 }) < 0,
  'shorter time wins when numbersFound equal');

assertEqual(compareScores({ numbersFound: 5, timeSpent: 10 }, { numbersFound: 5, timeSpent: 10 }), 0,
  'equal scores return 0');

// ── isBetterScore ──
console.log('\nisBetterScore:');

assert(isBetterScore({ numbersFound: 5, timeSpent: 10 }, null), 'any score beats null');
assert(!isBetterScore(null, { numbersFound: 5, timeSpent: 10 }), 'null does not beat existing score');
assert(isBetterScore({ numbersFound: 10, timeSpent: 20 }, { numbersFound: 5, timeSpent: 10 }),
  'higher numbersFound is better');
assert(isBetterScore({ numbersFound: 5, timeSpent: 8 }, { numbersFound: 5, timeSpent: 10 }),
  'same numbersFound, shorter time is better');
assert(!isBetterScore({ numbersFound: 5, timeSpent: 10 }, { numbersFound: 5, timeSpent: 8 }),
  'same numbersFound, longer time is not better');

// ── recordScore & top 10 ──
console.log('\nrecordScore & top 10:');

let store = {};
let sm = new ScoreManager(store);

let r1 = sm.recordScore(1, 5, 12.5);
assert(r1.isNewHighScore, 'first score is new high score');
assertEqual(r1.previousBest, null, 'first score has no previous best');
assertEqual(r1.rank, 1, 'first score is rank 1');

let r2 = sm.recordScore(1, 8, 15.0);
assert(r2.isNewHighScore, 'more numbers found is new high score');
assertEqual(r2.previousBest.numbersFound, 5, 'previous best was 5');

let r3 = sm.recordScore(1, 8, 10.0);
assert(r3.isNewHighScore, 'same numbers, faster time is new high score');
assertEqual(r3.rank, 1, 'rank 1 after better time');

let r4 = sm.recordScore(1, 3, 5.0);
assert(!r4.isNewHighScore, 'worse score is not new high score');

let top = sm.getTopScores(1);
assertEqual(top.length, 4, '4 scores recorded');
assertEqual(top[0].numbersFound, 8, 'top score has most numbers');
assertEqual(top[0].timeSpent, 10.0, 'top score has faster time for tie');

// ── max 10 scores ──
console.log('\nmax 10 scores:');

store = {};
sm = new ScoreManager(store);

for (let i = 0; i < 15; i++) {
  sm.recordScore(1, i + 1, 30 - i);
}

let top2 = sm.getTopScores(1);
assertEqual(top2.length, 10, 'only 10 scores kept');
assertEqual(top2[0].numbersFound, 15, 'highest numbers kept');

// ── separate levels ──
console.log('\nseparate levels:');

store = {};
sm = new ScoreManager(store);

sm.recordScore(1, 10, 5.0);
sm.recordScore(2, 5, 3.0);

let topL1 = sm.getTopScores(1);
let topL2 = sm.getTopScores(2);
assertEqual(topL1.length, 1, 'level 1 has 1 score');
assertEqual(topL2.length, 1, 'level 2 has 1 score');
assertEqual(topL1[0].numbersFound, 10, 'level 1 score is correct');
assertEqual(topL2[0].numbersFound, 5, 'level 2 score is correct');

// ── edge cases ──
console.log('\nedge cases:');

store = {};
sm = new ScoreManager(store);

let r0 = sm.recordScore(1, 0, 0.01);
assert(r0.isNewHighScore, 'zero numbers is high score when no history');
assertEqual(r0.rank, 1, 'rank 1 for zero numbers');

let rInv = sm.recordScore(3, 5, 10);
assert(!rInv.isNewHighScore, 'invalid level returns no high score');
assertEqual(rInv.rank, -1, 'invalid level returns rank -1');

let rFast = sm.recordScore(1, 1, 0.001);
assert(rFast.isNewHighScore, '1 number found beats 0');

// ── persistence ──
console.log('\npersistence:');

store = {};
sm = new ScoreManager(store);
sm.recordScore(1, 10, 5.0);
sm.recordScore(2, 100, 30.0);

// Simulate reload with same store
let sm6 = new ScoreManager(store);
assertEqual(sm6.getTopScores(1).length, 1, 'level 1 scores survive reload');
assertEqual(sm6.getTopScores(2).length, 1, 'level 2 scores survive reload');
assertEqual(sm6.getTopScores(1)[0].numbersFound, 10, 'level 1 data intact after reload');

// ── reset ──
console.log('\nreset:');

sm6.reset();
assertEqual(sm6.getTopScores(1).length, 0, 'level 1 empty after reset');
assertEqual(sm6.getTopScores(2).length, 0, 'level 2 empty after reset');

// ── high score callback ──
console.log('\nhigh score callback:');

store = {};
sm = new ScoreManager(store);
let callbackFired = false;
let callbackLevel = 0;
sm.onHighScore = (level) => {
  callbackFired = true;
  callbackLevel = level;
};

sm.recordScore(1, 5, 10);
assert(!callbackFired, 'callback does NOT fire on first score of a level');

callbackFired = false;
sm.recordScore(1, 8, 12);
assert(callbackFired, 'callback fires when beating previous best');
assertEqual(callbackLevel, 1, 'callback receives correct level');

callbackFired = false;
sm.recordScore(1, 3, 5);
assert(!callbackFired, 'callback does NOT fire for non-high-score');

callbackFired = false;
sm.recordScore(1, 8, 8);
assert(callbackFired, 'callback fires when beating same numbers with faster time');

// First score on level 2 also should NOT fire callback
callbackFired = false;
sm.recordScore(2, 10, 20);
assert(!callbackFired, 'callback does NOT fire on first score of level 2');

// But beating level 2 best should fire
callbackFired = false;
sm.recordScore(2, 15, 25);
assert(callbackFired, 'callback fires when beating level 2 best');

// ── Summary ──
console.log(`\n${'='.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('='.repeat(40));

if (failed > 0) {
  process.exit(1);
}
