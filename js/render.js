let canvas;
let ctx;
let devicePixelRatio = 1;

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

if (typeof window !== 'undefined' && typeof window.devicePixelRatio !== 'undefined') {
  devicePixelRatio = window.devicePixelRatio || 1;
} else if (typeof wx !== 'undefined' && typeof wx.getSystemInfoSync === 'function') {
  const systemInfo = wx.getSystemInfoSync();
  devicePixelRatio = systemInfo.pixelRatio || 1;
}

console.log('Device pixel ratio:', devicePixelRatio);

const logicalWidth = windowInfo.screenWidth;
const logicalHeight = windowInfo.screenHeight;

canvas.width = logicalWidth * devicePixelRatio;
canvas.height = logicalHeight * devicePixelRatio;

if (typeof canvas.style !== 'undefined') {
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = logicalWidth + 'px';
  canvas.style.height = logicalHeight + 'px';
  canvas.style.touchAction = 'none';
  canvas.style.userSelect = 'none';
  canvas.style.webkitUserSelect = 'none';
  canvas.style.webkitTouchCallout = 'none';
  canvas.style.zIndex = '9999';
  canvas.style.imageRendering = 'optimizeQuality';
  canvas.style.imageRendering = '-webkit-optimize-contrast';
  console.log('Canvas styles applied');
}

ctx = canvas.getContext('2d', {
  alpha: true,
  desynchronized: false
});

if (ctx) {
  ctx.scale(devicePixelRatio, devicePixelRatio);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  console.log('Canvas context configured for high quality rendering');
}

export const SCREEN_WIDTH = logicalWidth;
export const SCREEN_HEIGHT = logicalHeight;
export const GAME_WIDTH_PERCENT = 1.0;
export const GAME_WIDTH = Math.floor(SCREEN_WIDTH * GAME_WIDTH_PERCENT);
export const GAME_HEIGHT = SCREEN_HEIGHT;
export const GAME_X = Math.floor((SCREEN_WIDTH - GAME_WIDTH) / 2);
export const GAME_Y = 0;

export function getCanvas() {
  return canvas;
}

export function getContext() {
  return ctx;
}

export function getDevicePixelRatio() {
  return devicePixelRatio;
}