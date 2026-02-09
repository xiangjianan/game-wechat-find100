let canvas;

if (typeof wx !== 'undefined' && wx.createCanvas) {
  GameGlobal.canvas = wx.createCanvas();
  canvas = GameGlobal.canvas;
} else {
  canvas = document.createElement('canvas');
  canvas.id = 'gameCanvas';
  document.body.appendChild(canvas);
  GameGlobal.canvas = canvas;
}

const windowInfo = (typeof wx !== 'undefined' && wx.getWindowInfo) 
  ? wx.getWindowInfo() 
  : (typeof wx !== 'undefined' && wx.getSystemInfoSync) 
    ? wx.getSystemInfoSync() 
    : { screenWidth: window.innerWidth, screenHeight: window.innerHeight };

canvas.width = windowInfo.screenWidth;
canvas.height = windowInfo.screenHeight;

export const SCREEN_WIDTH = windowInfo.screenWidth;
export const SCREEN_HEIGHT = windowInfo.screenHeight;