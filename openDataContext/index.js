/**
 * 开放数据域入口文件
 * 使用共享 Canvas 渲染排行榜（微信推荐方式）
 *
 * 数据流：
 * 主域 postMessage('show') → 本文件 fetchFriendData → 渲染到 sharedCanvas
 * 主域 drawImage(sharedCanvas) 将结果绘制到主画布
 *
 * 不主动 resize sharedCanvas，而是根据其实际尺寸自适应缩放，
 * 避免 resize 不生效时 ctx.scale(dpr) 导致内容溢出画布。
 */

var sharedCanvas = null;
var ctx = null;
var isShow = false;
var friendData = null; // null = 加载中, [] = 暂无数据
var _prevFriendData = null;  // 打开排行榜前的数据备份，API 返回空时恢复
var selfScore = null;  // 主域上传的最新分数，用于覆盖缓存旧数据
var scrollOffset = 0;
var touchStartY = 0;
var lastTouchY = 0;
var isTouching = false;
var screenWidth = 0;
var screenHeight = 0;

function init() {
  try {
    sharedCanvas = wx.getSharedCanvas();
    ctx = sharedCanvas.getContext('2d');

    var sysInfo = wx.getSystemInfoSync();

    // 逻辑尺寸用于布局（与主域一致）
    screenWidth = sysInfo.screenWidth;
    screenHeight = sysInfo.screenHeight;

    // 自适应缩放：将逻辑坐标映射到 sharedCanvas 实际像素
    // 无论平台是否支持 resize，内容都能正确填满画布
    var sx = sharedCanvas.width / screenWidth;
    var sy = sharedCanvas.height / screenHeight;
    ctx.scale(sx, sy);

    wx.onMessage(handleMessage);
    console.log('openDataContext: init success', screenWidth, screenHeight,
      'canvas=' + sharedCanvas.width + 'x' + sharedCanvas.height,
      'scale=' + sx.toFixed(2) + 'x' + sy.toFixed(2));
  } catch (e) {
    console.error('openDataContext: init failed', e);
  }
}

function handleMessage(message) {
  switch (message.type) {
    case 'show':
      isShow = true;
      scrollOffset = 0;
      _prevFriendData = friendData;  // 备份已有数据
      friendData = null;             // 显示加载中
      render();
      fetchFriendData();
      break;
    case 'hide':
      isShow = false;
      clearCanvas();
      break;
    case 'refresh':
      fetchFriendData();
      break;
    case 'selfScore':
      // 主域上传分数后发送的最新成绩，用于覆盖 API 缓存旧数据
      selfScore = {
        numbersFound: message.numbersFound || 0,
        time: message.time || 0,
        hiddenScore: message.hiddenScore || 0
      };
      applySelfScore();
      if (isShow) render();
      break;
    case 'touchStart':
      isTouching = true;
      touchStartY = message.y;
      lastTouchY = message.y;
      break;
    case 'touchMove':
      if (!isTouching) return;
      var deltaY = lastTouchY - message.y;
      lastTouchY = message.y;
      scrollOffset += deltaY;
      render();
      break;
    case 'touchEnd':
      isTouching = false;
      break;
  }
}

function fetchFriendData() {
  wx.getFriendCloudStorage({
    keyList: ['numbersFound', 'time', 'hiddenScore'],
    success: function (res) {
      var newData = res.data.map(function (item) {
        var nf = item.KVDataList.find(function (kv) { return kv.key === 'numbersFound'; });
        var td = item.KVDataList.find(function (kv) { return kv.key === 'time'; });
        var hs = item.KVDataList.find(function (kv) { return kv.key === 'hiddenScore'; });
        return {
          nickname: item.nickname || '',
          avatarUrl: item.avatarUrl || '',
          numbersFound: nf ? parseInt(nf.value) : 0,
          time: td ? parseFloat(td.value) : 0,
          hiddenScore: hs ? parseFloat(hs.value) : 0
        };
      });

      // API 返回有效数据时使用新数据；返回空数据时恢复备份
      if (newData.length > 0) {
        friendData = newData;
        _prevFriendData = null;  // 数据有效，清除备份
      } else if (_prevFriendData && _prevFriendData.length > 0) {
        friendData = _prevFriendData;  // 恢复备份
      } else {
        friendData = newData;  // 确实没有数据
      }

      applySelfScore();

      friendData.sort(function (a, b) { return b.hiddenScore - a.hiddenScore; });
      friendData.forEach(function (item, i) { item.rank = i + 1; });
      friendData = friendData.slice(0, 100);

      console.log('openDataContext: fetched', newData.length, 'friends, current total', friendData.length);
      render();
    },
    fail: function (error) {
      console.error('openDataContext: getFriendCloudStorage failed', error);
      if (friendData === null) {
        friendData = [];
      }
      render();
    }
  });
}

// 用主域上传的最新分数覆盖 friendData 中对应条目
// 解决 getFriendCloudStorage 缓存导致当前用户分数不更新的问题
function applySelfScore() {
  if (!selfScore || !friendData || friendData.length === 0) return;

  // 查找当前用户：hiddenScore <= selfScore.hiddenScore 的条目中
  // 找 numbersFound + time 最接近的（即旧分数最接近新分数的）
  var bestIdx = -1;
  var bestDiff = Infinity;
  for (var i = 0; i < friendData.length; i++) {
    var entry = friendData[i];
    var diff = Math.abs(entry.hiddenScore - selfScore.hiddenScore);
    // 只看 hiddenScore 不超过 selfScore 的条目（排除分数更高的好友）
    if (entry.hiddenScore <= selfScore.hiddenScore && diff < bestDiff) {
      bestDiff = diff;
      bestIdx = i;
    }
  }

  if (bestIdx >= 0 && friendData[bestIdx].hiddenScore < selfScore.hiddenScore) {
    friendData[bestIdx].numbersFound = selfScore.numbersFound;
    friendData[bestIdx].time = selfScore.time;
    friendData[bestIdx].hiddenScore = selfScore.hiddenScore;
    console.log('openDataContext: applied selfScore to entry', bestIdx);
  }
}

function clearCanvas() {
  if (ctx) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, sharedCanvas.width, sharedCanvas.height);
    ctx.restore();
  }
}

function render() {
  if (!isShow || !ctx) return;
  clearCanvas();

  var isMobile = screenWidth < 768;
  var topSafe = isMobile ? 44 : 0;
  var bottomSafe = isMobile ? 34 : 0;

  // ── Background overlay ──
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(0, 0, screenWidth, screenHeight);

  // ── Modal ──
  var modalWidth = isMobile ? screenWidth - 20 : Math.min(500, screenWidth - 40);
  var modalHeight = isMobile ? screenHeight - topSafe - bottomSafe - 20 : screenHeight - 80;
  var modalX = (screenWidth - modalWidth) / 2;
  var modalY = isMobile ? topSafe + 10 : (screenHeight - modalHeight) / 2;

  drawBrutalRect(ctx, modalX, modalY, modalWidth, modalHeight, '#FFFFFF', 8, 3);

  // ── Title ──
  var titleY = modalY + (isMobile ? 40 : 50);
  ctx.fillStyle = '#1F2937';
  ctx.font = 'bold ' + (isMobile ? 28 : 34) + 'px "Arial Black", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('\u597d\u53cb\u6392\u884c\u699c', screenWidth / 2, titleY);

  var titleWidth = ctx.measureText('\u597d\u53cb\u6392\u884c\u699c').width;
  ctx.strokeStyle = '#FBBF24';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(screenWidth / 2 - titleWidth / 2 - 20, titleY + 25);
  ctx.lineTo(screenWidth / 2 + titleWidth / 2 + 20, titleY + 25);
  ctx.stroke();

  // ── Content ──
  if (friendData === null) {
    ctx.fillStyle = '#6B7280';
    ctx.font = (isMobile ? 16 : 18) + 'px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\u52a0\u8f7d\u4e2d...', screenWidth / 2, modalY + modalHeight / 2 - 10);
  } else if (friendData.length === 0) {
    ctx.fillStyle = '#6B7280';
    ctx.font = (isMobile ? 16 : 18) + 'px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\u6682\u65e0\u597d\u53cb\u6392\u884c\u6570\u636e', screenWidth / 2, modalY + modalHeight / 2 - 20);
    ctx.fillStyle = '#9CA3AF';
    ctx.font = (isMobile ? 13 : 14) + 'px Arial, sans-serif';
    ctx.fillText('\u5b8c\u6210\u4e00\u5c40\u6e38\u620f\u540e\u5373\u53ef\u4e0a\u699c', screenWidth / 2, modalY + modalHeight / 2 + 10);
  } else {
    renderList(modalX, modalY, modalWidth, modalHeight, isMobile);
  }
}

function renderList(modalX, modalY, modalWidth, modalHeight, isMobile) {
  var listStartY = modalY + (isMobile ? 80 : 95);
  var closeBtnSpace = isMobile ? 70 : 80;
  var listEndY = modalY + modalHeight - closeBtnSpace;
  var listHeight = listEndY - listStartY;
  var itemHeight = isMobile ? 56 : 64;
  var itemPadding = isMobile ? 6 : 8;
  var itemWidth = modalWidth - (isMobile ? 20 : 30);
  var itemX = modalX + (isMobile ? 10 : 15);
  var medals = ['#FBBF24', '#3B82F6', '#10B981'];

  // Clamp scroll
  var totalHeight = friendData.length * (itemHeight + itemPadding);
  var maxScroll = Math.max(0, totalHeight - listHeight);
  if (scrollOffset < 0) scrollOffset = 0;
  if (scrollOffset > maxScroll) scrollOffset = maxScroll;

  ctx.save();
  ctx.beginPath();
  ctx.rect(modalX, listStartY, modalWidth, listHeight);
  ctx.clip();

  for (var i = 0; i < friendData.length; i++) {
    var friend = friendData[i];
    var itemY = listStartY + i * (itemHeight + itemPadding) - scrollOffset;

    if (itemY + itemHeight < listStartY || itemY > listEndY) continue;

    var isTop3 = i < 3;

    // Item card
    drawBrutalRect(ctx, itemX, itemY, itemWidth, itemHeight,
      isTop3 ? '#FFFCF5' : '#FFFFFF',
      isTop3 ? 4 : 2,
      isTop3 ? 3 : 2);

    // Rank badge
    var rankX = itemX + (isMobile ? 14 : 18);
    var rankY = itemY + itemHeight / 2;

    if (isTop3) {
      ctx.beginPath();
      ctx.arc(rankX, rankY, isMobile ? 16 : 18, 0, Math.PI * 2);
      ctx.fillStyle = medals[i];
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
    } else {
      ctx.fillStyle = '#6B7280';
    }

    ctx.font = 'bold ' + (isMobile ? 14 : 16) + 'px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('' + (i + 1), rankX, rankY);

    // Nickname
    var infoX = itemX + (isMobile ? 38 : 46);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold ' + (isMobile ? 15 : 17) + 'px "Arial Black", Arial, sans-serif';
    ctx.fillText(truncate(friend.nickname, 8), infoX, itemY + (isMobile ? 20 : 22));

    // Score
    ctx.fillStyle = '#6B7280';
    ctx.font = (isMobile ? 12 : 14) + 'px Arial, sans-serif';
    ctx.fillText(
      '\u627e\u5230 ' + friend.numbersFound + ' \u4e2a \u00b7 \u7528\u65f6 ' + friend.time.toFixed(1) + ' \u79d2',
      infoX, itemY + (isMobile ? 40 : 44)
    );
  }

  ctx.restore();

  // Scroll indicator
  if (totalHeight > listHeight) {
    var barH = Math.max(30, listHeight * listHeight / totalHeight);
    var barY = listStartY + (scrollOffset / totalHeight) * (listHeight - barH);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.roundRect
      ? ctx.roundRect(modalX + modalWidth - 8, barY, 4, barH, 2)
      : ctx.rect(modalX + modalWidth - 8, barY, 4, barH);
    ctx.fill();
  }
}

function drawBrutalRect(c, x, y, w, h, fill, shadow, border) {
  // Shadow
  if (shadow > 0) {
    c.fillStyle = 'rgba(0, 0, 0, 0.15)';
    c.fillRect(x + shadow, y + shadow, w, h);
  }
  // Fill
  c.fillStyle = fill;
  c.fillRect(x, y, w, h);
  // Border
  if (border > 0) {
    c.strokeStyle = '#000000';
    c.lineWidth = border;
    c.strokeRect(x, y, w, h);
  }
}

function truncate(text, max) {
  if (!text) return '';
  if (text.length <= max) return text;
  return text.substring(0, max) + '...';
}

init();
