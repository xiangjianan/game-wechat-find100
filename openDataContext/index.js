/**
 * 开放数据域入口文件
 * 使用共享 Canvas 渲染排行榜（微信推荐方式）
 *
 * 数据流：
 * 主域 postMessage('show') → 本文件 fetchFriendData → 渲染到 sharedCanvas
 * 主域 drawImage(sharedCanvas) 将结果绘制到主画布
 */

var sharedCanvas = null;
var ctx = null;
var isShow = false;
var friendData = null; // null = 加载中, [] = 暂无数据
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
    screenWidth = sysInfo.windowWidth;
    screenHeight = sysInfo.windowHeight;
    sharedCanvas.width = screenWidth;
    sharedCanvas.height = screenHeight;

    wx.onMessage(handleMessage);
    console.log('openDataContext: init success', screenWidth, screenHeight);
  } catch (e) {
    console.error('openDataContext: init failed', e);
  }
}

function handleMessage(message) {
  switch (message.type) {
    case 'show':
      isShow = true;
      scrollOffset = 0;
      render();
      fetchFriendData();
      break;
    case 'hide':
      isShow = false;
      clearCanvas();
      break;
    case 'refresh':
      if (isShow) {
        fetchFriendData();
      }
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
      friendData = res.data.map(function (item) {
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

      friendData.sort(function (a, b) { return b.hiddenScore - a.hiddenScore; });
      friendData.forEach(function (item, i) { item.rank = i + 1; });
      friendData = friendData.slice(0, 100);

      console.log('openDataContext: fetched', friendData.length, 'friends');
      render();
    },
    fail: function (error) {
      console.error('openDataContext: getFriendCloudStorage failed', error);
      // 只在首次（无缓存）时置空，避免覆盖已有缓存数据
      if (friendData === null) {
        friendData = [];
      }
      render();
    }
  });
}

function clearCanvas() {
  if (ctx) {
    ctx.clearRect(0, 0, sharedCanvas.width, sharedCanvas.height);
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
