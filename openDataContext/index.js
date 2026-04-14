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
var friendData = null;     // null = 加载中, [] = 暂无数据
var selfScore = null;      // 主域上传的最新分数，用于覆盖缓存旧数据
var _backupFriendData = null;  // 每次打开排行榜前的数据备份（深拷贝），API 返回空时恢复
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
    var pixelRatio = sysInfo.pixelRatio || 1;

    // 将 sharedCanvas resize 到物理像素尺寸，确保文字以高分辨率渲染
    // 避免 drawImage 时因画布过小被拉伸导致文字模糊
    sharedCanvas.width = screenWidth * pixelRatio;
    sharedCanvas.height = screenHeight * pixelRatio;

    // 自适应缩放：将逻辑坐标映射到 sharedCanvas 实际像素
    // 如果 resize 生效，sx/sy 等于 pixelRatio（高分辨率）
    // 如果 resize 未生效，仍按实际尺寸映射（降级但不溢出）
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
      // 深拷贝备份数据，防止 in-place 修改污染备份
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
        // API 返回有效数据，直接使用
        friendData = newData;
        _backupFriendData = null;
      } else if (_backupFriendData && _backupFriendData.length > 0) {
        // API 返回空（缓存问题），恢复备份
        friendData = _backupFriendData;
      } else if (friendData === null) {
        // 确实没有数据（首次加载、无备份）
        friendData = newData;
      }
      // else: friendData 已有数据且 API 返回空，保留现有数据不动

      applySelfScore();

      friendData.sort(function (a, b) { return b.hiddenScore - a.hiddenScore; });
      friendData.forEach(function (item, i) { item.rank = i + 1; });
      friendData = friendData.slice(0, 100);

      console.log('openDataContext: fetched', newData.length, 'friends, total', friendData.length);
      render();
    },
    fail: function (error) {
      console.error('openDataContext: getFriendCloudStorage failed', error);
      // API 调用失败，尝试恢复备份
      if (_backupFriendData && _backupFriendData.length > 0) {
        friendData = _backupFriendData;
      } else if (friendData === null) {
        friendData = [];
      }
      render();
    }
  });
}

// 用主域上传的最新分数覆盖 friendData 中当前用户的条目
// 通过唯一 playerId 精确匹配当前用户，避免误匹配其他好友
function applySelfScore() {
  if (!selfScore || !friendData || friendData.length === 0) return;
  if (!selfScore.playerId) return; // 无 playerId，无法可靠匹配，跳过

  for (var i = 0; i < friendData.length; i++) {
    if (friendData[i].playerId === selfScore.playerId) {
      if (friendData[i].hiddenScore >= selfScore.hiddenScore) return; // 分数已是最新
      friendData[i].numbersFound = selfScore.numbersFound;
      friendData[i].time = selfScore.time;
      friendData[i].hiddenScore = selfScore.hiddenScore;
      console.log('openDataContext: applied selfScore to entry', i);
      return;
    }
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
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(0, 0, screenWidth, screenHeight);

  // ── Modal ──
  var modalWidth = isMobile ? screenWidth - 20 : Math.min(500, screenWidth - 40);
  var modalHeight = isMobile ? screenHeight - topSafe - bottomSafe - 20 : screenHeight - 80;
  var modalX = (screenWidth - modalWidth) / 2;
  var modalY = isMobile ? topSafe + 10 : (screenHeight - modalHeight) / 2;

  drawBrutalismRect(ctx, modalX, modalY, modalWidth, modalHeight, 'rgba(255, 255, 255, 0.94)', {
    shadowOffset: 8,
    borderWidth: 0
  });

  // ── Title ──
  var titleY = modalY + (isMobile ? 40 : 50);
  ctx.fillStyle = '#374151';
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

    var infoX = itemX + (isMobile ? 38 : 46);
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

// 与主域 drawBrutalismRect 一致的圆角矩形绘制
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
