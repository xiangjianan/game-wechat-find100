let canvas;

if (typeof wx !== 'undefined' && typeof wx.createCanvas === 'function') {
  try {
    GameGlobal.canvas = wx.createCanvas();
    canvas = GameGlobal.canvas;
  } catch (e) {
    console.error('Failed to create wx canvas:', e);
    canvas = document.createElement('canvas');
    canvas.id = 'gameCanvas';
    document.body.appendChild(canvas);
    GameGlobal.canvas = canvas;
  }
} else {
  canvas = document.createElement('canvas');
  canvas.id = 'gameCanvas';
  document.body.appendChild(canvas);
  GameGlobal.canvas = canvas;
}

const windowInfo = (typeof wx !== 'undefined' && typeof wx.getWindowInfo === 'function') 
  ? wx.getWindowInfo() 
  : (typeof wx !== 'undefined' && typeof wx.getSystemInfoSync === 'function') 
    ? wx.getSystemInfoSync() 
    : { screenWidth: window.innerWidth, screenHeight: window.innerHeight };

canvas.width = windowInfo.screenWidth;
canvas.height = windowInfo.screenHeight;

export const SCREEN_WIDTH = windowInfo.screenWidth;
export const SCREEN_HEIGHT = windowInfo.screenHeight;