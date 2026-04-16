/**
 * 开放数据域入口文件
 * 仅负责获取好友数据并渲染列表到 sharedCanvas
 * 弹框框架（遮罩、标题、关闭按钮）由主域渲染
 *
 * 数据流：
 * 主域 postMessage('show') → 本文件 fetchFriendData → 渲染列表到 sharedCanvas
 * 主域 renderLeaderboard 绘制弹框框架 + drawImage(sharedCanvas) 叠加列表内容
 */

var sharedCanvas = null;
var ctx = null;
var isShow = false;
var friendData = null;     // null = 加载中, [] = 暂无数据
var selfScore = null;      // 主域上传的最新分数，用于覆盖缓存旧数据
var _backupFriendData = null;  // 每次打开排行榜前的数据备份（深拷贝），API 返回空时恢复
var scrollOffset = 0;
var touchStartY = 0;
var lastTouchY = 0;
var isTouching = false;
var screenWidth = 0;
var screenHeight = 0;
var safeAreaTop = 0;       // 与主域一致的 safeArea.top
var safeAreaBottom = 0;    // 与主域一致的 bottom inset
var avatarImages = {};     // 头像缓存: url -> { img, loaded }

function init() {
  try {
    sharedCanvas = wx.getSharedCanvas();
    ctx = sharedCanvas.getContext('2d');

    var sysInfo = wx.getSystemInfoSync();

    // 逻辑尺寸用于布局（与主域一致）
    screenWidth = sysInfo.screenWidth;
    screenHeight = sysInfo.screenHeight;

    // 安全区域（与主域 SAFE_AREA 计算方式一致）
    if (sysInfo.safeArea) {
      safeAreaTop = sysInfo.safeArea.top || 0;
      safeAreaBottom = screenHeight - (sysInfo.safeArea.bottom || screenHeight);
    }

    var pixelRatio = sysInfo.pixelRatio || 1;
    sharedCanvas.width = screenWidth * pixelRatio;
    sharedCanvas.height = screenHeight * pixelRatio;

    var sx = sharedCanvas.width / screenWidth;
    var sy = sharedCanvas.height / screenHeight;
    ctx.scale(sx, sy);

    wx.onMessage(handleMessage);
    console.log('openDataContext: init success', screenWidth, screenHeight,
      'canvas=' + sharedCanvas.width + 'x' + sharedCanvas.height,
      'dpr=' + pixelRatio, 'scale=' + sx.toFixed(2) + 'x' + sy.toFixed(2));
  } catch (e) {
    console.error('openDataContext: init failed', e);
  }
}

function handleMessage(message) {
  switch (message.type) {
    case 'show':
      isShow = true;
      scrollOffset = 0;
      if (friendData && friendData.length > 0) {
        _backupFriendData = deepCopyFriendData(friendData);
      } else {
        _backupFriendData = null;
      }
      friendData = null;
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
      selfScore = {
        numbersFound: message.numbersFound || 0,
        time: message.time || 0,
        hiddenScore: message.hiddenScore || 0,
        prevHiddenScore: message.prevHiddenScore != null ? message.prevHiddenScore : null,
        playerId: message.playerId || ''
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
    keyList: ['numbersFound', 'time', 'hiddenScore', 'playerId'],
    success: function (res) {
      var newData = res.data.map(function (item) {
        var nf = item.KVDataList.find(function (kv) { return kv.key === 'numbersFound'; });
        var td = item.KVDataList.find(function (kv) { return kv.key === 'time'; });
        var hs = item.KVDataList.find(function (kv) { return kv.key === 'hiddenScore'; });
        var pid = item.KVDataList.find(function (kv) { return kv.key === 'playerId'; });
        return {
          nickname: item.nickname || '',
          avatarUrl: item.avatarUrl || '',
          numbersFound: nf ? parseInt(nf.value) : 0,
          time: td ? parseFloat(td.value) : 0,
          hiddenScore: hs ? parseFloat(hs.value) : 0,
          playerId: pid ? pid.value : ''
        };
      });

      if (newData.length > 0) {
        friendData = newData;
        _backupFriendData = null;
      } else if (_backupFriendData && _backupFriendData.length > 0) {
        friendData = _backupFriendData;
      } else if (friendData === null) {
        friendData = newData;
      }

      applySelfScore();

      friendData.sort(function (a, b) { return b.hiddenScore - a.hiddenScore; });
      friendData.forEach(function (item, i) { item.rank = i + 1; });
      friendData = friendData.slice(0, 100);

      console.log('openDataContext: fetched', newData.length, 'friends, total', friendData.length);
      render();
    },
    fail: function (error) {
      console.error('openDataContext: getFriendCloudStorage failed', error);
      if (_backupFriendData && _backupFriendData.length > 0) {
        friendData = _backupFriendData;
      } else if (friendData === null) {
        friendData = [];
      }
      render();
    }
  });
}

function applySelfScore() {
  if (!selfScore || !friendData || friendData.length === 0) return;
  if (!selfScore.playerId) return;

  var updated = false;
  for (var i = 0; i < friendData.length; i++) {
    if (friendData[i].playerId === selfScore.playerId) {
      if (friendData[i].hiddenScore >= selfScore.hiddenScore) return;
      friendData[i].numbersFound = selfScore.numbersFound;
      friendData[i].time = selfScore.time;
      friendData[i].hiddenScore = selfScore.hiddenScore;
      console.log('openDataContext: applied selfScore to entry', i);
      updated = true;
      break;
    }
  }

  // 分数更新后重新排序并刷新排名
  if (updated) {
    friendData.sort(function (a, b) { return b.hiddenScore - a.hiddenScore; });
    friendData.forEach(function (item, idx) { item.rank = idx + 1; });
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

// 头像加载与绘制
function loadAvatar(url) {
  if (!url || avatarImages[url]) return;
  var entry = { img: null, loaded: false };
  avatarImages[url] = entry;
  var img = wx.createImage();
  img.onload = function () {
    entry.img = img;
    entry.loaded = true;
    if (isShow) render();
  };
  img.onerror = function () {
    // 加载失败不重试
  };
  img.src = url;
}

function drawAvatar(c, url, x, y, size) {
  if (!url) return false;
  loadAvatar(url);
  var cached = avatarImages[url];
  if (!cached || !cached.loaded || !cached.img) return false;

  c.save();
  c.beginPath();
  c.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  c.clip();
  c.drawImage(cached.img, x, y, size, size);
  c.restore();
  return true;
}

// 绘制头像占位符（灰色圆 + 首字）
function drawAvatarPlaceholder(c, nickname, x, y, size) {
  c.save();
  c.beginPath();
  c.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  c.fillStyle = '#E5E7EB';
  c.fill();
  c.fillStyle = '#9CA3AF';
  c.font = 'bold ' + (size * 0.45) + 'px Arial, sans-serif';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(nickname ? nickname.charAt(0) : '?', x + size / 2, y + size / 2);
  c.restore();
}

// 计算与主域一致的弹框布局参数
function getLayout(isMobile) {
  var topSafe = Math.max(safeAreaTop, isMobile ? 44 : 0);
  var bottomSafe = Math.max(safeAreaBottom, isMobile ? 34 : 0);
  var modalWidth = isMobile ? screenWidth - 20 : Math.min(500, screenWidth - 40);
  var modalHeight = isMobile ? screenHeight - topSafe - bottomSafe - 20 : screenHeight - 80;
  var modalX = (screenWidth - modalWidth) / 2;
  var modalY = isMobile ? topSafe + 10 : (screenHeight - modalHeight) / 2;
  return { modalX: modalX, modalY: modalY, modalWidth: modalWidth, modalHeight: modalHeight };
}

function render() {
  if (!isShow || !ctx) return;
  clearCanvas();

  if (!friendData || friendData.length === 0) return;

  var isMobile = screenWidth < 768;
  var layout = getLayout(isMobile);
  renderList(layout.modalX, layout.modalY, layout.modalWidth, layout.modalHeight, isMobile);
}

function renderList(modalX, modalY, modalWidth, modalHeight, isMobile) {
  var listStartY = modalY + (isMobile ? 90 : 110);
  var closeBtnSpace = isMobile ? 70 : 80;
  var listEndY = modalY + modalHeight - closeBtnSpace;
  var listHeight = listEndY - listStartY;
  var itemHeight = isMobile ? 70 : 80;
  var itemPadding = isMobile ? 8 : 10;
  var itemWidth = modalWidth - (isMobile ? 20 : 30);
  var itemX = modalX + (isMobile ? 10 : 15);
  var medals = ['#FBBF24', '#3B82F6', '#10B981'];

  var totalHeight = friendData.length * (itemHeight + itemPadding);
  var maxScroll = Math.max(0, totalHeight - listHeight);
  if (scrollOffset < 0) scrollOffset = 0;
  if (scrollOffset > maxScroll) scrollOffset = maxScroll;

  ctx.save();
  ctx.beginPath();
  ctx.rect(modalX, listStartY - 10, modalWidth, listHeight + 10);
  ctx.clip();

  for (var i = 0; i < friendData.length; i++) {
    var friend = friendData[i];
    var itemY = listStartY + i * (itemHeight + itemPadding) - scrollOffset;

    if (itemY + itemHeight < listStartY || itemY > listEndY) continue;

    var isTop3 = i < 3;
    var bgColor = isTop3 ? '#FFFCF5' : 'rgba(255, 255, 255, 0.94)';

    drawBrutalismRect(ctx, itemX, itemY, itemWidth, itemHeight, bgColor, {
      shadowOffset: isTop3 ? 4 : 2,
      borderWidth: isTop3 ? 3 : 2
    });

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

    // 头像
    var avatarSize = isMobile ? 40 : 48;
    var avatarX = itemX + (isMobile ? 36 : 44);
    var avatarY = itemY + (itemHeight - avatarSize) / 2;

    if (!drawAvatar(ctx, friend.avatarUrl, avatarX, avatarY, avatarSize)) {
      drawAvatarPlaceholder(ctx, friend.nickname, avatarX, avatarY, avatarSize);
    }

    var infoX = avatarX + avatarSize + (isMobile ? 10 : 12);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#374151';
    ctx.font = 'bold ' + (isMobile ? 16 : 18) + 'px "Arial Black", Arial, sans-serif';
    ctx.fillText(truncate(friend.nickname, 8), infoX, itemY + (isMobile ? 24 : 28));

    ctx.fillStyle = '#6B7280';
    ctx.font = (isMobile ? 12 : 14) + 'px Arial, sans-serif';
    ctx.fillText(
      '\u627e\u5230 ' + friend.numbersFound + ' \u4e2a \u00b7 \u7528\u65f6 ' + friend.time.toFixed(1) + ' \u79d2',
      infoX, itemY + (isMobile ? 48 : 54)
    );
  }

  ctx.restore();
}

function drawBrutalismRect(c, x, y, w, h, fill, options) {
  var radius = options.radius !== undefined ? options.radius : 18;
  var shadowOffset = options.shadowOffset || 0;
  var borderWidth = options.borderWidth || 0;

  if (shadowOffset > 0) {
    c.shadowColor = 'rgba(0, 0, 0, 0.08)';
    c.shadowBlur = shadowOffset * 2;
    c.shadowOffsetY = shadowOffset;
  }

  c.fillStyle = fill;
  roundRect(c, x, y, w, h, radius);
  c.fill();

  c.shadowBlur = 0;
  c.shadowOffsetY = 0;
  c.shadowColor = 'transparent';

  if (borderWidth > 0) {
    c.strokeStyle = 'rgba(59, 130, 246, 0.1)';
    c.lineWidth = borderWidth;
    roundRect(c, x, y, w, h, radius);
    c.stroke();
  }
}

function roundRect(c, x, y, w, h, radius) {
  if (radius === 0) {
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x + w, y);
    c.lineTo(x + w, y + h);
    c.lineTo(x, y + h);
    c.closePath();
  } else {
    c.beginPath();
    c.moveTo(x + radius, y);
    c.lineTo(x + w - radius, y);
    c.quadraticCurveTo(x + w, y, x + w, y + radius);
    c.lineTo(x + w, y + h - radius);
    c.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    c.lineTo(x + radius, y + h);
    c.quadraticCurveTo(x, y + h, x, y + h - radius);
    c.lineTo(x, y + radius);
    c.quadraticCurveTo(x, y, x + radius, y);
    c.closePath();
  }
}

function truncate(text, max) {
  if (!text) return '';
  if (text.length <= max) return text;
  return text.substring(0, max) + '...';
}

function deepCopyFriendData(data) {
  return data.map(function (item) {
    return {
      nickname: item.nickname,
      avatarUrl: item.avatarUrl,
      numbersFound: item.numbersFound,
      time: item.time,
      hiddenScore: item.hiddenScore,
      playerId: item.playerId,
      rank: item.rank
    };
  });
}

init();
