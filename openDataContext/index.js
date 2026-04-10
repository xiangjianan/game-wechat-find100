/**
 * 开放数据域入口文件
 * 获取好友排行数据后回传给主域渲染
 */

let isShow = false;

function init() {
  try {
    wx.onMessage(handleMessage);
  } catch (error) {}
}

function handleMessage(message) {
  switch (message.type) {
    case 'show':
      isShow = true;
      fetchFriendData();
      break;
    case 'hide':
      isShow = false;
      break;
  }
}

function fetchFriendData() {
  wx.getFriendCloudStorage({
    keyList: ['numbersFound', 'time', 'hiddenScore'],
    success: (res) => {
      var data = res.data.map((item) => {
        var nf = item.KVDataList.find(kv => kv.key === 'numbersFound');
        var td = item.KVDataList.find(kv => kv.key === 'time');
        var hs = item.KVDataList.find(kv => kv.key === 'hiddenScore');
        return {
          nickname: item.nickname || '',
          avatarUrl: item.avatarUrl || '',
          numbersFound: nf ? parseInt(nf.value) : 0,
          time: td ? parseFloat(td.value) : 0,
          hiddenScore: hs ? parseInt(hs.value) : 0
        };
      });

      data.sort((a, b) => b.hiddenScore - a.hiddenScore);
      data.forEach((item, i) => { item.rank = i + 1; });
      data = data.slice(0, 100);

      sendToMain({ type: 'friendData', data: data });
    },
    fail: (error) => {
      sendToMain({ type: 'friendData', data: [] });
    }
  });
}

function sendToMain(message) {
  try {
    if (typeof wx !== 'undefined' && typeof wx.postMessage === 'function') {
      wx.postMessage(message);
    }
  } catch (e) {}
}

init();
