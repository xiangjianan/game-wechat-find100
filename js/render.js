let canvas;

if (typeof wx !== 'undefined' && typeof wx.createCanvas === 'function') {
  try {
    GameGlobal.canvas = wx.createCanvas();
    canvas = GameGlobal.canvas;
    console.log('Canvas created using wx.createCanvas');
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
  console.log('Canvas created using document.createElement');
}

const windowInfo = (typeof wx !== 'undefined' && typeof wx.getWindowInfo === 'function') 
  ? wx.getWindowInfo() 
  : (typeof wx !== 'undefined' && typeof wx.getSystemInfoSync === 'function') 
    ? wx.getSystemInfoSync() 
    : { screenWidth: window.innerWidth, screenHeight: window.innerHeight };

canvas.width = windowInfo.screenWidth;
canvas.height = windowInfo.screenHeight;

if (typeof canvas.style !== 'undefined') {
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.touchAction = 'none';
  canvas.style.userSelect = 'none';
  canvas.style.webkitUserSelect = 'none';
  canvas.style.webkitTouchCallout = 'none';
  canvas.style.zIndex = '9999';
  console.log('Canvas styles applied');
}

export const SCREEN_WIDTH = windowInfo.screenWidth;
export const SCREEN_HEIGHT = windowInfo.screenHeight;
export const GAME_WIDTH_PERCENT = 1.0;
export const GAME_WIDTH = Math.floor(SCREEN_WIDTH * GAME_WIDTH_PERCENT);
export const GAME_HEIGHT = SCREEN_HEIGHT;
export const GAME_X = Math.floor((SCREEN_WIDTH - GAME_WIDTH) / 2);
export const GAME_Y = 0;