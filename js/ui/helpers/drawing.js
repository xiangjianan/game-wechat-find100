// Draw a rounded rectangle path
export function roundRect(ctx, x, y, width, height, radius) {
  if (radius === 0) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.closePath();
  } else {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
}

// Lighten a hex color
export function lightenColor(color, amount) {
  const hex = color.replace('#', '');
  const r = Math.min(255, parseInt(hex.substr(0, 2), 16) + Math.floor(255 * amount));
  const g = Math.min(255, parseInt(hex.substr(2, 2), 16) + Math.floor(255 * amount));
  const b = Math.min(255, parseInt(hex.substr(4, 2), 16) + Math.floor(255 * amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Darken a hex color
export function darkenColor(color, amount) {
  const hex = color.replace('#', '');
  const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - Math.floor(255 * amount));
  const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - Math.floor(255 * amount));
  const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - Math.floor(255 * amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Draw icon shapes (book, cart, lightning, trophy, share)
export function drawIcon(ctx, icon, iconCenterX, iconCenterY, isMobile, iconColor) {
  const s = isMobile ? 10 : 12;
  ctx.lineWidth = isMobile ? 1.5 : 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (icon === 'book') {
    ctx.strokeStyle = iconColor || '#F59E0B';
    ctx.beginPath();
    ctx.moveTo(iconCenterX, iconCenterY - s * 0.8);
    ctx.quadraticCurveTo(iconCenterX - s * 0.2, iconCenterY - s * 0.6, iconCenterX - s, iconCenterY - s * 0.5);
    ctx.lineTo(iconCenterX - s, iconCenterY + s * 0.7);
    ctx.quadraticCurveTo(iconCenterX - s * 0.2, iconCenterY + s * 0.5, iconCenterX, iconCenterY + s * 0.8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(iconCenterX, iconCenterY - s * 0.8);
    ctx.quadraticCurveTo(iconCenterX + s * 0.2, iconCenterY - s * 0.6, iconCenterX + s, iconCenterY - s * 0.5);
    ctx.lineTo(iconCenterX + s, iconCenterY + s * 0.7);
    ctx.quadraticCurveTo(iconCenterX + s * 0.2, iconCenterY + s * 0.5, iconCenterX, iconCenterY + s * 0.8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(iconCenterX, iconCenterY - s * 0.8);
    ctx.lineTo(iconCenterX, iconCenterY + s * 0.8);
    ctx.stroke();
  } else if (icon === 'cart') {
    ctx.strokeStyle = iconColor || '#3B82F6';
    ctx.beginPath();
    ctx.moveTo(iconCenterX - s * 0.7, iconCenterY - s * 0.1);
    ctx.quadraticCurveTo(iconCenterX - s * 0.7, iconCenterY + s, iconCenterX, iconCenterY + s);
    ctx.quadraticCurveTo(iconCenterX + s * 0.7, iconCenterY + s, iconCenterX + s * 0.7, iconCenterY - s * 0.1);
    ctx.lineTo(iconCenterX + s * 0.5, iconCenterY - s * 0.1);
    ctx.lineTo(iconCenterX - s * 0.5, iconCenterY - s * 0.1);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(iconCenterX, iconCenterY - s * 0.35, s * 0.4, Math.PI * 0.15, Math.PI * 0.85);
    ctx.stroke();
  } else if (icon === 'lightning') {
    ctx.strokeStyle = iconColor || '#10B981';
    ctx.beginPath();
    ctx.moveTo(iconCenterX + s * 0.1, iconCenterY - s);
    ctx.lineTo(iconCenterX - s * 0.3, iconCenterY - s * 0.05);
    ctx.lineTo(iconCenterX + s * 0.15, iconCenterY + s * 0.05);
    ctx.lineTo(iconCenterX - s * 0.1, iconCenterY + s);
    ctx.lineTo(iconCenterX + s * 0.35, iconCenterY - s * 0.05);
    ctx.lineTo(iconCenterX - s * 0.1, iconCenterY + s * 0.05);
    ctx.stroke();
  } else if (icon === 'trophy') {
    ctx.strokeStyle = iconColor || '#EC4899';
    ctx.beginPath();
    ctx.moveTo(iconCenterX - s * 0.55, iconCenterY - s * 0.7);
    ctx.lineTo(iconCenterX + s * 0.55, iconCenterY - s * 0.7);
    ctx.lineTo(iconCenterX + s * 0.45, iconCenterY + s * 0.1);
    ctx.quadraticCurveTo(iconCenterX, iconCenterY + s * 0.4, iconCenterX - s * 0.45, iconCenterY + s * 0.1);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(iconCenterX - s * 0.55, iconCenterY - s * 0.55);
    ctx.quadraticCurveTo(iconCenterX - s, iconCenterY - s * 0.3, iconCenterX - s * 0.55, iconCenterY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(iconCenterX + s * 0.55, iconCenterY - s * 0.55);
    ctx.quadraticCurveTo(iconCenterX + s, iconCenterY - s * 0.3, iconCenterX + s * 0.55, iconCenterY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(iconCenterX - s * 0.15, iconCenterY + s * 0.3);
    ctx.lineTo(iconCenterX + s * 0.15, iconCenterY + s * 0.3);
    ctx.moveTo(iconCenterX, iconCenterY + s * 0.3);
    ctx.lineTo(iconCenterX, iconCenterY + s * 0.55);
    ctx.moveTo(iconCenterX - s * 0.35, iconCenterY + s * 0.55);
    ctx.lineTo(iconCenterX + s * 0.35, iconCenterY + s * 0.55);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(iconCenterX, iconCenterY - s * 0.25, s * 0.12, 0, Math.PI * 2);
    ctx.stroke();
  } else if (icon === 'share') {
    ctx.strokeStyle = iconColor || '#8B5CF6';
    ctx.beginPath();
    ctx.arc(iconCenterX - s * 0.55, iconCenterY + s * 0.3, s * 0.2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(iconCenterX + s * 0.4, iconCenterY - s * 0.5, s * 0.2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(iconCenterX + s * 0.4, iconCenterY + s * 0.3, s * 0.2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(iconCenterX - s * 0.38, iconCenterY + s * 0.2);
    ctx.lineTo(iconCenterX + s * 0.24, iconCenterY - s * 0.38);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(iconCenterX - s * 0.38, iconCenterY + s * 0.35);
    ctx.lineTo(iconCenterX + s * 0.24, iconCenterY + s * 0.28);
    ctx.stroke();
  } else if (icon === 'gear') {
    // Settings gear icon
    ctx.strokeStyle = iconColor || '#64748B';
    const outerR = s * 0.8;
    const innerR = s * 0.45;
    const teeth = 6;
    ctx.beginPath();
    for (let i = 0; i < teeth; i++) {
      const angle1 = (i / teeth) * Math.PI * 2 - Math.PI / 2;
      const angle2 = ((i + 0.35) / teeth) * Math.PI * 2 - Math.PI / 2;
      const angle3 = ((i + 0.5) / teeth) * Math.PI * 2 - Math.PI / 2;
      const angle4 = ((i + 0.85) / teeth) * Math.PI * 2 - Math.PI / 2;
      if (i === 0) {
        ctx.moveTo(iconCenterX + Math.cos(angle1) * outerR, iconCenterY + Math.sin(angle1) * outerR);
      }
      ctx.lineTo(iconCenterX + Math.cos(angle2) * outerR, iconCenterY + Math.sin(angle2) * outerR);
      ctx.lineTo(iconCenterX + Math.cos(angle3) * innerR, iconCenterY + Math.sin(angle3) * innerR);
      ctx.lineTo(iconCenterX + Math.cos(angle4) * innerR, iconCenterY + Math.sin(angle4) * innerR);
    }
    ctx.closePath();
    ctx.stroke();
    // Center circle
    ctx.beginPath();
    ctx.arc(iconCenterX, iconCenterY, s * 0.25, 0, Math.PI * 2);
    ctx.stroke();
  }
}

// Draw a rounded rect filled
export function fillRoundRect(ctx, x, y, width, height, radius, fillColor) {
  ctx.fillStyle = fillColor;
  roundRect(ctx, x, y, width, height, radius);
  ctx.fill();
}

// Draw a rounded rect stroked
export function strokeRoundRect(ctx, x, y, width, height, radius, strokeColor, lineWidth = 1) {
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = lineWidth;
  roundRect(ctx, x, y, width, height, radius);
  ctx.stroke();
}

// Draw a brutalism-styled rounded rect with optional shadow and border
export function drawBrutalismRect(ctx, scheme, x, y, width, height, fillColor, options = {}) {
  const radius = options.radius !== undefined ? options.radius : 12;

  if (options.shadowOffset > 0) {
    ctx.shadowColor = scheme.shadow;
    ctx.shadowBlur = options.shadowOffset * 2;
    ctx.shadowOffsetY = options.shadowOffset;
  }

  ctx.fillStyle = fillColor;
  roundRect(ctx, x, y, width, height, radius);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.shadowColor = 'transparent';

  if (options.borderWidth > 0) {
    ctx.strokeStyle = scheme.glassBorder;
    ctx.lineWidth = options.borderWidth;
    roundRect(ctx, x, y, width, height, radius);
    ctx.stroke();
  }
}
