/**
 * 开放数据域入口文件
 * 负责处理排行榜的显示和交互
 */

// 排行榜数据
let rankData = [];
let isShow = false;
let canvas = null;
let ctx = null;
let isLoading = false;

// 排行榜配置
const config = {
  maxRank: 100,
  itemHeight: 50,
  headerHeight: 80,
  bgColor: '#1a1a2e',
  textColor: '#ffffff',
  itemColors: ['#FFD700', '#C0C0C0', '#CD7F32', '#ffffff'],
  highlightColor: '#4CAF50',
  closeBtnColor: '#FF4444'
};

/**
 * 初始化
 */
function init() {
  try {
    canvas = wx.getSharedCanvas();
    ctx = canvas.getContext('2d');
    console.log('OpenDataContext: init success, canvas size =', canvas.width, 'x', canvas.height);

    wx.onMessage(handleMessage);
  } catch (error) {
    console.error('OpenDataContext: init failed', error);
  }
}

/**
 * 处理来自主游戏的消息
 */
function handleMessage(message) {
  console.log('OpenDataContext: received message', message.type);
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
    default:
      break;
  }
}

/**
 * 获取排行榜数据
 */
function fetchRankData() {
  wx.getFriendCloudStorage({
    keyList: ['numbersFound', 'time', 'hiddenScore'],
    success: (res) => {
      console.log('OpenDataContext: getFriendCloudStorage success, count =', res.data.length);
      isLoading = false;
      rankData = res.data.map((item, index) => {
        const numbersFoundData = item.KVDataList.find(kv => kv.key === 'numbersFound');
        const timeData = item.KVDataList.find(kv => kv.key === 'time');
        const hiddenScoreData = item.KVDataList.find(kv => kv.key === 'hiddenScore');

        return {
          rank: index + 1,
          avatarUrl: item.avatarUrl,
          nickname: item.nickname,
          numbersFound: numbersFoundData ? parseInt(numbersFoundData.value) : 0,
          time: timeData ? parseFloat(timeData.value) : 0,
          hiddenScore: hiddenScoreData ? parseInt(hiddenScoreData.value) : 0,
          openid: item.openid
        };
      });

      // 按隐藏分数排序（分数从高到低）
      rankData.sort((a, b) => b.hiddenScore - a.hiddenScore);

      // 更新排名
      rankData.forEach((item, index) => {
        item.rank = index + 1;
      });

      // 只保留前N名
      rankData = rankData.slice(0, config.maxRank);

      render();
    },
    fail: (error) => {
      console.error('OpenDataContext: getFriendCloudStorage failed', error);
      isLoading = false;
      rankData = [];
      render();
    }
  });
}

/**
 * 渲染排行榜
 */
function render() {
  if (!isShow) {
    return;
  }
  if (!ctx) {
    console.error('OpenDataContext: ctx is null');
    return;
  }

  clearCanvas();

  var width = canvas.width;
  var height = canvas.height;

  console.log('OpenDataContext: render, size =', width, 'x', height, ', isLoading =', isLoading, ', dataCount =', rankData.length);

  // 绘制背景
  ctx.fillStyle = config.bgColor;
  ctx.fillRect(0, 0, width, height);

  // 绘制标题
  drawHeader(width);

  if (isLoading) {
    // 加载中提示
    ctx.fillStyle = config.textColor;
    ctx.font = '18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('加载中...', width / 2, config.headerHeight + 60);
  } else if (rankData.length === 0) {
    // 无数据提示
    ctx.fillStyle = config.textColor;
    ctx.font = '18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('暂无排行数据', width / 2, config.headerHeight + 60);
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#999999';
    ctx.fillText('完成一局游戏后即可上榜', width / 2, config.headerHeight + 90);
  } else {
    // 绘制排行榜列表
    drawRankList(width, height);
  }

  // 绘制关闭按钮
  drawCloseButton(width);
}

/**
 * 清空画布
 */
function clearCanvas() {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * 绘制标题栏
 */
function drawHeader(width) {
  // 标题背景
  ctx.fillStyle = '#16213e';
  ctx.fillRect(0, 0, width, config.headerHeight);

  // 标题文字
  ctx.fillStyle = config.textColor;
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('排行榜', width / 2, config.headerHeight / 2);

  // 分隔线
  ctx.strokeStyle = '#0f3460';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, config.headerHeight);
  ctx.lineTo(width, config.headerHeight);
  ctx.stroke();
}

/**
 * 绘制排行榜列表
 */
function drawRankList(width, height) {
  const startY = config.headerHeight + 10;
  const itemHeight = config.itemHeight;
  const maxItems = Math.floor((height - startY - 20) / itemHeight);

  for (let i = 0; i < Math.min(rankData.length, maxItems); i++) {
    const item = rankData[i];
    const y = startY + i * itemHeight;

    // 绘制每一行（跳过头像，避免异步加载问题）
    drawRankItem(item, y, width, itemHeight, i === 0);
  }
}

/**
 * 绘制单个排行榜项
 */
function drawRankItem(item, y, width, height, isFirst) {
  // 背景（第一名高亮）
  if (isFirst) {
    ctx.fillStyle = 'rgba(255, 215, 0, 0.1)';
    ctx.fillRect(0, y, width, height);
  }

  // 行分隔线
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(20, y + height);
  ctx.lineTo(width - 20, y + height);
  ctx.stroke();

  // 排名
  ctx.fillStyle = config.itemColors[Math.min(item.rank - 1, 3)];
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const rankText = item.rank <= 3 ? ['1st', '2nd', '3rd'][item.rank - 1] : item.rank.toString();
  ctx.fillText(rankText, 30, y + height / 2);

  // 昵称
  ctx.fillStyle = config.textColor;
  ctx.font = '16px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(truncateText(item.nickname, 8), 60, y + height / 2);

  // 找到数量和耗时
  ctx.fillStyle = config.highlightColor;
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText(item.numbersFound + '个 ' + item.time.toFixed(1) + '秒', width - 20, y + height / 2);
}

/**
 * 绘制关闭按钮
 */
function drawCloseButton(width) {
  const btnSize = 40;
  const x = width - btnSize;
  const y = 0;

  // 按钮
  ctx.fillStyle = config.closeBtnColor;
  ctx.beginPath();
  ctx.arc(x + btnSize / 2, y + btnSize / 2, btnSize / 2 - 5, 0, Math.PI * 2);
  ctx.fill();

  // X 符号
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + 12, y + 12);
  ctx.lineTo(x + 28, y + 28);
  ctx.moveTo(x + 28, y + 12);
  ctx.lineTo(x + 12, y + 28);
  ctx.stroke();
}

/**
 * 处理点击事件
 */
function handleClick(x, y) {
  var width = canvas.width;
  var btnSize = 40;

  // 检查是否点击了关闭按钮
  if (x >= width - btnSize && x <= width && y >= 0 && y <= btnSize) {
    isShow = false;
    isLoading = false;
    clearCanvas();
    // 通知主游戏关闭排行榜
    wx.postMessage({
      type: 'close',
      data: {}
    });
  }
}

/**
 * 截断文本
 */
function truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
}

// 初始化
init();
