let canvas;
let ctx;
let devicePixelRatio = 1;
let safeArea = { top: 0, bottom: 0, left: 0, right: 0 };

if (typeof wx !== 'undefined' && typeof wx.createCanvas === 'function') {
  try {
    GameGlobal.canvas = wx.createCanvas();
    canvas = GameGlobal.canvas;
  } catch (e) {
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

if (typeof wx !== 'undefined' && typeof wx.getWindowInfo === 'function') {
  const info = wx.getWindowInfo();
  if (info.safeArea) {
    safeArea = {
      top: info.safeArea.top || 0,
      bottom: info.screenHeight - (info.safeArea.bottom || info.screenHeight),
      left: info.safeArea.left || 0,
      right: info.screenWidth - (info.safeArea.right || info.screenWidth)
    };
  }
} else if (typeof wx !== 'undefined' && typeof wx.getSystemInfoSync === 'function') {
  const info = wx.getSystemInfoSync();
  if (info.safeArea) {
    safeArea = {
      top: info.safeArea.top || 0,
      bottom: info.screenHeight - (info.safeArea.bottom || info.screenHeight),
      left: info.safeArea.left || 0,
      right: info.screenWidth - (info.safeArea.right || info.screenWidth)
    };
  }
} else if (typeof window !== 'undefined') {
  const style = getComputedStyle(document.documentElement);
  safeArea = {
    top: parseInt(style.getPropertyValue('--sat') || '0'),
    bottom: parseInt(style.getPropertyValue('--sab') || '0'),
    left: parseInt(style.getPropertyValue('--sal') || '0'),
    right: parseInt(style.getPropertyValue('--sar') || '0')
  };
}

if (typeof window !== 'undefined' && typeof window.devicePixelRatio !== 'undefined') {
  devicePixelRatio = window.devicePixelRatio || 1;
} else if (typeof wx !== 'undefined' && typeof wx.getSystemInfoSync === 'function') {
  const systemInfo = wx.getSystemInfoSync();
  devicePixelRatio = systemInfo.pixelRatio || 1;
}

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
}

ctx = canvas.getContext('2d', {
  antialias: true,
  alpha: false,
  desynchronized: false
});

if (ctx) {
  ctx.scale(devicePixelRatio, devicePixelRatio);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
}

export const SCREEN_WIDTH = logicalWidth;
export const SCREEN_HEIGHT = logicalHeight;
export const SAFE_AREA = safeArea;
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

export function getSafeArea() {
  return safeArea;
}
