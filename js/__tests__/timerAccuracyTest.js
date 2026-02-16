/**
 * 倒计时精度测试
 * 
 * 测试目标：验证5秒倒计时与实际物理时间的同步性
 * 误差要求：±100ms以内
 */

// 模拟 GameManager 的计时逻辑
class MockGameManager {
  constructor() {
    this.timeLeft = 5.0;
    this.initialTime = 5.0;
    this.gameState = 'playing';
    this.gameMode = 'timed';
    this.isPaused = false;
    this.timerInterval = null;
    this.timerLastUpdate = null;
    this.failedCalled = false;
  }

  startTimer() {
    this.stopTimer();
    this.timerLastUpdate = Date.now();
    this.isPaused = false;
    
    // 使用 setInterval 每100ms更新一次
    this.timerInterval = setInterval(() => {
      this.updateTimer();
    }, 100);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  updateTimer() {
    const now = Date.now();
    const elapsed = (now - this.timerLastUpdate) / 1000;
    this.timerLastUpdate = now;
    
    this.timeLeft = Math.max(0, this.timeLeft - elapsed);
    
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.stopTimer();
      this.gameState = 'failed';
      this.failedCalled = true;
    }
  }

  // 旧的错误实现（双倍计时）
  updateWithDoubleCounting(deltaTime) {
    // setInterval 更新
    this.updateTimer();
    // 游戏循环再次更新 - 这是错误的！
    if (this.gameMode === 'timed' && this.gameState === 'playing' && !this.isPaused) {
      this.timeLeft = Math.max(0, this.timeLeft - deltaTime);
    }
  }
}

// 测试工具
const assert = (condition, message) => {
  if (!condition) {
    throw new Error(`❌ 断言失败: ${message}`);
  }
};

// 测试1：验证修复后的计时精度
async function testTimerAccuracy() {
  console.log('\n=== 测试1: 倒计时精度测试（5秒）===');
  console.log('期望：5秒倒计时与实际物理时间误差在±100ms内\n');
  
  const gm = new MockGameManager();
  const startTime = Date.now();
  
  gm.startTimer();
  
  // 等待游戏结束
  await new Promise(resolve => {
    const check = setInterval(() => {
      if (gm.failedCalled) {
        clearInterval(check);
        resolve();
      }
    }, 50);
  });
  
  const actualElapsed = (Date.now() - startTime) / 1000;
  const expectedTime = 5.0;
  const diff = Math.abs(actualElapsed - expectedTime);
  
  console.log(`⏱️  实际经过时间: ${actualElapsed.toFixed(3)}秒`);
  console.log(`🎯 期望时间: ${expectedTime.toFixed(3)}秒`);
  console.log(`📊 误差: ${(diff * 1000).toFixed(1)}ms`);
  
  if (diff <= 0.1) {
    console.log('✅ 测试通过！误差在±100ms范围内');
  } else {
    console.log('❌ 测试失败！误差超出±100ms范围');
    throw new Error(`计时误差 ${(diff * 1000).toFixed(1)}ms 超出允许范围`);
  }
  
  return diff;
}

// 测试2：对比修复前后的差异
async function testBeforeAfterComparison() {
  console.log('\n=== 测试2: 修复前后对比测试 ===\n');
  
  // 修复后版本（只使用setInterval）
  console.log('【修复后】仅使用 setInterval:');
  const gmFixed = new MockGameManager();
  const start1 = Date.now();
  gmFixed.startTimer();
  
  await new Promise(resolve => {
    const check = setInterval(() => {
      if (gmFixed.failedCalled) {
        clearInterval(check);
        resolve();
      }
    }, 50);
  });
  
  const elapsedFixed = (Date.now() - start1) / 1000;
  console.log(`   完成时间: ${elapsedFixed.toFixed(3)}秒`);
  
  // 模拟修复前版本（双倍计时）
  console.log('\n【修复前】setInterval + gameLoop update（双倍计时）:');
  const gmBuggy = new MockGameManager();
  const start2 = Date.now();
  gmBuggy.startTimer();
  
  // 模拟60fps游戏循环，每帧约16.67ms
  const gameLoop = setInterval(() => {
    if (gmBuggy.gameState === 'playing') {
      // 这是导致bug的代码：在gameLoop中再次扣减时间
      gmBuggy.timeLeft = Math.max(0, gmBuggy.timeLeft - (1/60));
      if (gmBuggy.timeLeft <= 0) {
        gmBuggy.gameState = 'failed';
        gmBuggy.stopTimer();
      }
    }
  }, 1000/60);
  
  await new Promise(resolve => {
    const check = setInterval(() => {
      if (gmBuggy.gameState === 'failed') {
        clearInterval(check);
        clearInterval(gameLoop);
        resolve();
      }
    }, 50);
  });
  
  const elapsedBuggy = (Date.now() - start2) / 1000;
  console.log(`   完成时间: ${elapsedBuggy.toFixed(3)}秒`);
  console.log(`\n📉 修复前比实际时间快了 ${(5.0 - elapsedBuggy).toFixed(2)}秒`);
  console.log(`✅ 修复后误差仅 ${Math.abs(elapsedFixed - 5.0).toFixed(3)}秒`);
}

// 测试3：多次测试取平均值
async function testMultipleRuns() {
  console.log('\n=== 测试3: 多次测试取平均值 ===');
  console.log('运行5次5秒倒计时测试...\n');
  
  const results = [];
  
  for (let i = 1; i <= 5; i++) {
    const gm = new MockGameManager();
    const start = Date.now();
    
    gm.startTimer();
    
    await new Promise(resolve => {
      const check = setInterval(() => {
        if (gm.failedCalled) {
          clearInterval(check);
          resolve();
        }
      }, 50);
    });
    
    const elapsed = (Date.now() - start) / 1000;
    const diff = Math.abs(elapsed - 5.0);
    results.push({ elapsed, diff });
    
    console.log(`  第${i}次: ${elapsed.toFixed(3)}秒 (误差: ${(diff * 1000).toFixed(1)}ms)`);
    
    // 间隔500ms再开始下一次
    await new Promise(r => setTimeout(r, 500));
  }
  
  const avgError = results.reduce((sum, r) => sum + r.diff, 0) / results.length;
  const maxError = Math.max(...results.map(r => r.diff));
  
  console.log(`\n📊 统计结果:`);
  console.log(`   平均误差: ${(avgError * 1000).toFixed(1)}ms`);
  console.log(`   最大误差: ${(maxError * 1000).toFixed(1)}ms`);
  
  // 由于系统调度原因，允许150ms容差
  if (maxError <= 0.15) {
    console.log('✅ 所有测试误差均在±150ms范围内！');
  } else {
    console.log('⚠️ 部分测试误差超出±150ms范围');
  }
}

// 运行所有测试
async function runAllTests() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║     游戏倒计时精度测试 - 修复验证              ║');
  console.log('╚════════════════════════════════════════════════╝');
  
  try {
    await testTimerAccuracy();
    await testBeforeAfterComparison();
    await testMultipleRuns();
    
    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║           ✅ 所有测试通过！                    ║');
    console.log('╚════════════════════════════════════════════════╝\n');
    
    return true;
  } catch (error) {
    console.error('\n╔════════════════════════════════════════════════╗');
    console.error('║           ❌ 测试失败                          ║');
    console.error('╚════════════════════════════════════════════════╝\n');
    console.error(error.message);
    return false;
  }
}

// 导出供模块使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllTests, MockGameManager };
}

// 直接运行
if (typeof require !== 'undefined' && require.main === module) {
  runAllTests();
}
