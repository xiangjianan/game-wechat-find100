/**
 * 开放数据域入口文件
 * 波普糖果风格排行榜
 */

let rankData = [];
let isShow = false;
let canvas = null;
let ctx = null;
let isLoading = false;

let safeTop = 44;

const config = {
  maxRank: 100,
  itemHeight: 52,
  headerHeight: 48,
  padX: 16,
  borderRadius: 18
};

function init() {
  try {
    canvas = wx.getSharedCanvas();
    ctx = canvas.getContext('2d');

    try {
      var sysInfo = wx.getSystemInfoSync();
      if (sysInfo.safeArea && sysInfo.safeArea.top > 0) {
        safeTop = sysInfo.safeArea.top;
      } else if (sysInfo.statusBarHeight > 0) {
        safeTop = sysInfo.statusBarHeight;
      }
    } catch (e) {}

    wx.onMessage(handleMessage);
  } catch (error) {}
}

function handleMessage(message) {
  switch (message.type) {
    case 'show':
      isShow = true;
      isLoading = true;
      render();
      fetchRankData();
      break;
    case 'hide':
      isShow = false;
      isLoading = false;
      clearCanvas();
      break;
    case 'click':
      handleClick(message.data.x, message.data.y);
      break;
  }
}

function fetchRankData() {
  wx.getFriendCloudStorage({
    keyList: ['numbersFound', 'time', 'hiddenScore'],
    success: (res) => {
      isLoading = false;
      rankData = res.data.map((item) => {
        const nf = item.KVDataList.find(kv => kv.key === 'numbersFound');
        const td = item.KVDataList.find(kv => kv.key === 'time');
        const hs = item.KVDataList.find(kv => kv.key === 'hiddenScore');
        return {
          rank: 0,
          avatarUrl: item.avatarUrl,
          nickname: item.nickname || '',
          numbersFound: nf ? parseInt(nf.value) : 0,
          time: td ? parseFloat(td.value) : 0,
          hiddenScore: hs ? parseInt(hs.value) : 0
        };
      });
      rankData.sort((a, b) => b.hiddenScore - a.hiddenScore);
      rankData.forEach((item, i) => { item.rank = i + 1; });
      rankData = rankData.slice(0, config.maxRank);
      render();
    },
    fail: () => {
      isLoading = false;
      rankData = [];
      render();
    }
  });
}

// --- 绘制辅助 ---

function roundRect(x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// --- 渲染 ---

function render() {
  if (!isShow || !ctx) return;
  clearCanvas();

  var W = canvas.width;
  var H = canvas.height;
  var px = config.padX;

  var headerY = safeTop + 10;
  var headerBottom = headerY + config.headerHeight;
  var cardY = headerBottom + 12;
  var cardH = H - cardY - 20;

  // 1) 背景渐变（和游戏一致）
  var bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#FFFAF5');
  bg.addColorStop(0.5, '#FFF3E8');
  bg.addColorStop(1, '#FFF7F0');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // 2) 标题行
  ctx.fillStyle = '#374151';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('排行榜', W / 2, headerY + config.headerHeight / 2);

  // 关闭按钮（标题栏左侧）
  var closeSize = 30;
  var closeX = px;
  var closeY = headerY + (config.headerHeight - closeSize) / 2;
  ctx.fillStyle = '#F97316';
  roundRect(closeX, closeY, closeSize, closeSize, 8);
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(closeX + 10, closeY + 10);
  ctx.lineTo(closeX + closeSize - 10, closeY + closeSize - 10);
  ctx.moveTo(closeX + closeSize - 10, closeY + 10);
  ctx.lineTo(closeX + 10, closeY + closeSize - 10);
  ctx.stroke();

  // 3) 内容卡片
  ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
  roundRect(px, cardY, W - px * 2, cardH, config.borderRadius);
  ctx.fill();
  ctx.strokeStyle = 'rgba(59, 130, 246, 0.1)';
  ctx.lineWidth = 1;
  roundRect(px, cardY, W - px * 2, cardH, config.borderRadius);
  ctx.stroke();

  // 列表区内部 padding
  var innerX = px + 12;
  var innerW = W - px * 2 - 24;
  var listY = cardY + 12;

  if (isLoading) {
    ctx.fillStyle = '#6B7280';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('加载中...', W / 2, cardY + cardH / 2);
  } else if (rankData.length === 0) {
    ctx.fillStyle = '#374151';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('暂无排行数据', W / 2, cardY + cardH / 2 - 12);
    ctx.fillStyle = '#9CA3AF';
    ctx.font = '13px sans-serif';
    ctx.fillText('完成一局游戏后即可上榜', W / 2, cardY + cardH / 2 + 16);
  } else {
    drawRankList(innerX, listY, innerW, cardY + cardH - 12);
  }
}

function drawRankList(x, startY, width, bottomY) {
  var itemH = config.itemHeight;
  var maxItems = Math.floor((bottomY - startY) / itemH);

  for (var i = 0; i < Math.min(rankData.length, maxItems); i++) {
    var item = rankData[i];
    var y = startY + i * itemH;
    drawRankItem(item, x, y, width, itemH, i === 0, i === Math.min(rankData.length, maxItems) - 1);
  }
}

function drawRankItem(item, x, y, width, height, isFirst, isLast) {
  // 前三名行背景高亮
  if (item.rank <= 3) {
    var medals = ['rgba(251, 191, 36, 0.08)', 'rgba(148, 163, 184, 0.08)', 'rgba(217, 119, 6, 0.06)'];
    ctx.fillStyle = medals[item.rank - 1];
    roundRect(x, y + 2, width, height - 4, 12);
    ctx.fill();
  }

  // 排名徽章
  var badgeSize = 26;
  var badgeX = x + 8;
  var badgeY = y + (height - badgeSize) / 2;
  if (item.rank <= 3) {
    var badgeColors = ['#FBBF24', '#94A3B8', '#D97706'];
    ctx.fillStyle = badgeColors[item.rank - 1];
  } else {
    ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
  }
  ctx.beginPath();
  ctx.arc(badgeX + badgeSize / 2, badgeY + badgeSize / 2, badgeSize / 2, 0, Math.PI * 2);
  ctx.fill();

  // 排名数字
  ctx.fillStyle = item.rank <= 3 ? '#FFFFFF' : '#6B7280';
  ctx.font = (item.rank <= 3 ? 'bold ' : '') + '13px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(item.rank.toString(), badgeX + badgeSize / 2, badgeY + badgeSize / 2);

  // 昵称
  ctx.fillStyle = '#374151';
  ctx.font = '15px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(truncateText(item.nickname, 7), x + 46, y + height / 2);

  // 成绩
  ctx.fillStyle = '#10B981';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText(item.numbersFound + '个 ' + item.time.toFixed(1) + '秒', x + width - 4, y + height / 2);
}

function handleClick(clickX, clickY) {
  var W = canvas.width;
  var px = config.padX;
  var headerY = safeTop + 10;
  var closeSize = 30;
  var closeX = px;
  var closeY = headerY + (config.headerHeight - closeSize) / 2;

  if (clickX >= closeX && clickX <= closeX + closeSize &&
      clickY >= closeY && clickY <= closeY + closeSize) {
    isShow = false;
    isLoading = false;
    clearCanvas();
    wx.postMessage({ type: 'close', data: {} });
  }
}

function clearCanvas() {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function truncateText(text, max) {
  if (!text) return '';
  if (text.length <= max) return text;
  return text.substring(0, max) + '...';
}

init();
