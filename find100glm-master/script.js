// 游戏配置
const CONFIG = {
    totalNumbers: 100,     // 总共需要点击的数字数量
    numLines: 8,           // 切割线条数
    initialTime: 5.0,      // 初始倒计时时间（秒）
    timeBonus: 5.0         // 每次正确点击增加的时间（秒）
};

// 游戏状态
let gameState = {
    currentNumber: 1,
    clickedNumbers: [],
    polygons: [],
    isPlaying: false,
    startTime: null,
    clickCount: 0,
    errorCount: 0,
    timeLeft: 5.0,         // 剩余时间（秒）
    timerInterval: null    // 倒计时定时器
};

// DOM元素
const gameSvg = document.getElementById('gameSvg');
const currentNumEl = document.getElementById('currentNum');
const progressEl = document.getElementById('progress');
const totalEl = document.getElementById('total');
const timerEl = document.getElementById('timer');
const startBtn = document.getElementById('startBtn');
const startOverlay = document.getElementById('startOverlay');
const resetBtn = document.getElementById('resetBtn');
const eyeModeBtn = document.getElementById('eyeModeBtn');
const winModal = document.getElementById('winModal');
const loseModal = document.getElementById('loseModal');

// 初始化游戏
function initGame() {
    gameState = {
        currentNumber: 1,
        clickedNumbers: [],
        polygons: [],
        isPlaying: false,
        startTime: null,
        clickCount: 0,
        errorCount: 0,
        timeLeft: CONFIG.initialTime,
        timerInterval: null
    };
    
    currentNumEl.textContent = '1';
    progressEl.textContent = '0';
    totalEl.textContent = CONFIG.totalNumbers;
    timerEl.textContent = CONFIG.initialTime.toFixed(1);
    timerEl.classList.remove('warning', 'danger');
    winModal.classList.remove('show');
    loseModal.classList.remove('show');
    startOverlay.classList.remove('hidden');
    
    gameSvg.innerHTML = '';
}

// 生成随机切割线
function generateCutLines(width, height) {
    const lines = [];
    
    // 生成随机直线（从矩形边缘到矩形边缘）
    for (let i = 0; i < CONFIG.numLines; i++) {
        // 随机选择起始边和结束边
        const startEdge = Math.floor(Math.random() * 4); // 0:上, 1:右, 2:下, 3:左
        const endEdge = Math.floor(Math.random() * 4);
        
        if (startEdge === endEdge) continue;
        
        let startX, startY, endX, endY;
        
        // 计算起始点
        switch(startEdge) {
            case 0: // 上边
                startX = Math.random() * width;
                startY = 0;
                break;
            case 1: // 右边
                startX = width;
                startY = Math.random() * height;
                break;
            case 2: // 下边
                startX = Math.random() * width;
                startY = height;
                break;
            case 3: // 左边
                startX = 0;
                startY = Math.random() * height;
                break;
        }
        
        // 计算结束点
        switch(endEdge) {
            case 0: // 上边
                endX = Math.random() * width;
                endY = 0;
                break;
            case 1: // 右边
                endX = width;
                endY = Math.random() * height;
                break;
            case 2: // 下边
                endX = Math.random() * width;
                endY = height;
                break;
            case 3: // 左边
                endX = 0;
                endY = Math.random() * height;
                break;
        }
        
        lines.push({ x1: startX, y1: startY, x2: endX, y2: endY });
    }
    
    return lines;
}

// 计算两条直线的交点
function lineIntersection(line1, line2) {
    const x1 = line1.x1, y1 = line1.y1, x2 = line1.x2, y2 = line1.y2;
    const x3 = line2.x1, y3 = line2.y1, x4 = line2.x2, y4 = line2.y2;
    
    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (Math.abs(denom) < 0.0001) return null; // 平行或重合
    
    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
    
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
        return {
            x: x1 + t * (x2 - x1),
            y: y1 + t * (y2 - y1)
        };
    }
    
    return null;
}

// 使用改进的Voronoi图算法生成多边形区域
function generatePolygons(width, height) {
    const polygons = [];
    
    // 计算期望的每个区域面积
    const totalArea = width * height;
    const expectedArea = totalArea / CONFIG.totalNumbers;
    const minDistance = Math.sqrt(expectedArea) * 0.4; // 最小距离限制
    
    // 生成随机种子点，确保点之间有足够距离
    const points = [];
    let attempts = 0;
    const maxAttempts = 1000;
    
    while (points.length < CONFIG.totalNumbers && attempts < maxAttempts) {
        const newPoint = {
            x: Math.random() * width,
            y: Math.random() * height
        };
        
        // 检查与现有点的最小距离
        let minDist = Infinity;
        for (const p of points) {
            const dist = Math.sqrt(
                Math.pow(newPoint.x - p.x, 2) +
                Math.pow(newPoint.y - p.y, 2)
            );
            if (dist < minDist) {
                minDist = dist;
            }
        }
        
        // 如果距离足够大，则添加该点
        if (minDist >= minDistance || points.length === 0) {
            points.push(newPoint);
        }
        
        attempts++;
    }
    
    // 如果尝试次数过多，使用现有点
    if (points.length < CONFIG.totalNumbers) {
        console.warn('无法生成足够分散的点，使用现有点');
    }
    
    // 使用网格方法为每个点分配区域
    const gridSize = 4;
    const grid = [];
    
    // 确保覆盖整个区域，包括边界
    for (let x = 0; x <= width; x += gridSize) {
        for (let y = 0; y <= height; y += gridSize) {
            let minDist = Infinity;
            let nearestPoint = 0;
            
            for (let i = 0; i < points.length; i++) {
                const dist = Math.sqrt(
                    Math.pow(x - points[i].x, 2) + 
                    Math.pow(y - points[i].y, 2)
                );
                if (dist < minDist) {
                    minDist = dist;
                    nearestPoint = i;
                }
            }
            
            grid.push({ x, y, region: nearestPoint });
        }
    }
    
    // 为每个区域生成多边形
    for (let i = 0; i < points.length; i++) {
        const regionPoints = grid.filter(p => p.region === i);
        
        if (regionPoints.length === 0) continue;
        
        // 使用改进的凸包算法
        const hull = improvedConvexHull(regionPoints);
        
        if (hull.length >= 3) {
            // 计算多边形中心
            let centerX = 0, centerY = 0;
            hull.forEach(p => { centerX += p.x; centerY += p.y; });
            centerX /= hull.length;
            centerY /= hull.length;
            
            polygons.push({
                number: i + 1,
                points: hull,
                center: { x: centerX, y: centerY }
            });
        }
    }
    
    return polygons;
}

// 改进的凸包算法
function improvedConvexHull(points) {
    if (points.length < 3) return points;
    
    // 按x坐标排序
    const sorted = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
    
    // 使用Monotone Chain算法
    const upper = [];
    const lower = [];
    
    for (const p of sorted) {
        // 下凸包
        while (lower.length >= 2) {
            const a = lower[lower.length - 2];
            const b = lower[lower.length - 1];
            const cross = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
            if (cross <= 0) {
                lower.pop();
            } else {
                break;
            }
        }
        lower.push(p);
        
        // 上凸包
        while (upper.length >= 2) {
            const a = upper[upper.length - 2];
            const b = upper[upper.length - 1];
            const cross = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
            if (cross >= 0) {
                upper.pop();
            } else {
                break;
            }
        }
        upper.push(p);
    }
    
    // 合并上凸包和下凸包
    const hull = [...lower];
    for (let i = upper.length - 2; i >= 0; i--) {
        hull.push(upper[i]);
    }
    
    return hull;
}

// 渲染多边形
function renderPolygons() {
    const width = gameSvg.clientWidth;
    const height = gameSvg.clientHeight;
    
    gameSvg.innerHTML = '';
    
    gameState.polygons.forEach(poly => {
        // 创建多边形路径
        const pathData = poly.points.map((p, i) => 
            `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
        ).join(' ') + ' Z';
        
        // 创建多边形元素
        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        polygon.setAttribute('d', pathData);
        polygon.setAttribute('class', 'polygon');
        polygon.dataset.number = poly.number;
        
        polygon.addEventListener('click', (e) => handlePolygonClick(poly.number, polygon));
        
        gameSvg.appendChild(polygon);
        
        // 创建数字文本
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', poly.center.x);
        text.setAttribute('y', poly.center.y);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.setAttribute('class', 'polygon-text');
        text.textContent = poly.number;
        
        gameSvg.appendChild(text);
    });
}

// 处理多边形点击
function handlePolygonClick(number, element) {
    if (!gameState.isPlaying) {
        return;
    }
    
    if (gameState.clickedNumbers.includes(number)) {
        return; // 已经点击过的
    }
    
    gameState.clickCount++;
    
    if (number === gameState.currentNumber) {
        // 正确点击
        element.classList.add('clicked');
        gameState.clickedNumbers.push(number);
        gameState.currentNumber++;
        
        // 增加时间
        gameState.timeLeft += CONFIG.timeBonus;
        timerEl.textContent = gameState.timeLeft.toFixed(1);
        timerEl.classList.remove('warning', 'danger');
        
        currentNumEl.textContent = gameState.currentNumber;
        progressEl.textContent = gameState.clickedNumbers.length;
        
        // 检查是否通关
        if (gameState.clickedNumbers.length === CONFIG.totalNumbers) {
            endGame(true);
        }
    } else {
        // 错误点击
        gameState.errorCount++;
        element.classList.add('shake');
        setTimeout(() => {
            element.classList.remove('shake');
        }, 500);
        
        // 扣除时间
        gameState.timeLeft -= CONFIG.timeBonus;
        if (gameState.timeLeft < 0) {
            gameState.timeLeft = 0;
        }
        timerEl.textContent = gameState.timeLeft.toFixed(1);
        
        // 退一个选中的图形
        if (gameState.clickedNumbers.length > 0) {
            const lastNumber = gameState.clickedNumbers.pop();
            gameState.currentNumber--;
            
            // 移除最后一个选中图形的样式
            const lastElement = document.querySelector(`.polygon[data-number="${lastNumber}"]`);
            if (lastElement) {
                lastElement.classList.remove('clicked');
            }
            
            currentNumEl.textContent = gameState.currentNumber;
            progressEl.textContent = gameState.clickedNumbers.length;
        }
    }
}

// 开始游戏
// 更新倒计时
function updateTimer() {
    gameState.timeLeft -= 0.1;
    
    // 更新显示
    timerEl.textContent = gameState.timeLeft.toFixed(1);
    
    // 更新样式
    timerEl.classList.remove('warning', 'danger');
    if (gameState.timeLeft <= 2.0) {
        timerEl.classList.add('danger');
    } else if (gameState.timeLeft <= 3.0) {
        timerEl.classList.add('warning');
    }
    
    // 检查时间是否用完
    if (gameState.timeLeft <= 0) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
        endGame(false);
    }
}

function startGame() {
    // 清除旧的定时器
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
    
    initGame();
    gameState.isPlaying = true;
    gameState.startTime = Date.now();
    
    // 隐藏开始按钮覆盖层
    startOverlay.classList.add('hidden');
    
    const width = gameSvg.clientWidth;
    const height = gameSvg.clientHeight;
    
    // 生成多边形
    gameState.polygons = generatePolygons(width, height);
    
    // 确保有足够的多边形
    while (gameState.polygons.length < CONFIG.totalNumbers) {
        gameState.polygons = generatePolygons(width, height);
    }
    
    // 只保留前CONFIG.totalNumbers个多边形
    gameState.polygons = gameState.polygons.slice(0, CONFIG.totalNumbers);
    
    renderPolygons();
    
    // 启动倒计时
    gameState.timerInterval = setInterval(updateTimer, 100);
}

// 智商评估函数
function getIQRank(timeInSeconds) {
    if (timeInSeconds <= 300) {
        return { level: '智商超绝', color: '#FFD700', icon: '👑' };
    } else if (timeInSeconds <= 600) {
        return { level: '智商优秀', color: '#FFA500', icon: '🌟' };
    } else if (timeInSeconds <= 900) {
        return { level: '智商良好', color: '#4CAF50', icon: '👍' };
    } else if (timeInSeconds <= 1200) {
        return { level: '智商普通', color: '#2196F3', icon: '😊' };
    } else {
        return { level: '智商一般', color: '#9E9E9E', icon: '🙂' };
    }
}

// 结束游戏
function endGame(won) {
    gameState.isPlaying = false;
    
    // 停止倒计时
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    if (won) {
        const endTime = Date.now();
        const totalTime = Math.floor((endTime - gameState.startTime) / 1000);
        const iqRank = getIQRank(totalTime);
        
        document.getElementById('finalTime').textContent = totalTime;
        document.getElementById('finalClicks').textContent = gameState.clickCount;
        document.getElementById('finalErrors').textContent = gameState.errorCount;
        document.getElementById('iqLevel').textContent = iqRank.level;
        document.getElementById('iqIcon').textContent = iqRank.icon;
        document.getElementById('iqLevel').style.color = iqRank.color;
        
        setTimeout(() => {
            winModal.classList.add('show');
        }, 500);
    } else {
        // 游戏失败
        const endTime = Date.now();
        const totalTime = Math.floor((endTime - gameState.startTime) / 1000);
        
        document.getElementById('loseProgress').textContent = gameState.clickedNumbers.length;
        document.getElementById('loseTotal').textContent = CONFIG.totalNumbers;
        document.getElementById('loseTime').textContent = totalTime;
        
        setTimeout(() => {
            loseModal.classList.add('show');
        }, 500);
    }
}

// 重置游戏
function resetGame() {
    startGame();
}

// 切换护眼模式
function toggleEyeMode() {
    document.body.classList.toggle('eye-mode');
    eyeModeBtn.classList.toggle('active');
}

// 事件监听
resetBtn.addEventListener('click', resetGame);
eyeModeBtn.addEventListener('click', toggleEyeMode);
startBtn.addEventListener('click', startGame);

// 页面加载时初始化游戏
window.addEventListener('DOMContentLoaded', initGame);
