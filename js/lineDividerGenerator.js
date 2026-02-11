// 直线分割生成器 - 用多条直线分割矩形区域
export default class LineDividerGenerator {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8B500', '#FF6F61', '#6B5B95', '#88B04B', '#F7CAC9'
    ];
    // 最小面积：确保能容纳数字（约20x20像素）
    this.minArea = 400;
  }

  generatePolygons(count, difficulty = 'normal') {
    const bounds = {
      x: 0,
      y: 80,
      width: this.width,
      height: this.height - 80
    };

    // 初始状态：一个矩形
    let polygons = [{
      vertices: [
        { x: bounds.x, y: bounds.y },
        { x: bounds.x + bounds.width, y: bounds.y },
        { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
        { x: bounds.x, y: bounds.y + bounds.height }
      ]
    }];

    // 生成直线来分割多边形，直到达到目标数量
    let attempts = 0;
    const maxAttempts = 1000;

    while (polygons.length < count && attempts < maxAttempts) {
      // 生成一条随机直线
      const line = this.generateRandomLine(bounds);
      
      // 尝试用这条直线分割所有多边形
      const newPolygons = [];
      let didSplit = false;

      for (const poly of polygons) {
        const splitResult = this.splitPolygon(poly, line);
        
        if (splitResult.length === 2) {
          // 成功分割
          newPolygons.push(...splitResult);
          didSplit = true;
        } else {
          // 未分割，保留原多边形
          newPolygons.push(poly);
        }
      }

      // 检查所有多边形是否满足最小面积要求
      const allValid = newPolygons.every(p => this.calculatePolygonArea(p.vertices) >= this.minArea);

      if (didSplit && allValid) {
        polygons = newPolygons;
      }

      attempts++;
    }

    // 如果生成的多边形数量不足，移除一些小面积的多边形
    if (polygons.length > count) {
      polygons.sort((a, b) => this.calculatePolygonArea(b.vertices) - this.calculatePolygonArea(a.vertices));
      polygons = polygons.slice(0, count);
    }

    // 为每个多边形分配数字和颜色
    const result = [];
    for (let i = 0; i < polygons.length; i++) {
      const vertices = polygons[i].vertices;
      const center = this.calculateCenter(vertices);
      
      result.push({
        vertices: vertices,
        number: i + 1,
        color: this.colors[i % this.colors.length],
        center: center
      });
    }

    return result;
  }

  // 生成一条随机直线（水平、垂直或斜线）
  generateRandomLine(bounds) {
    const type = Math.floor(Math.random() * 3); // 0: 水平, 1: 垂直, 2: 斜线

    if (type === 0) {
      // 水平线
      const y = bounds.y + Math.random() * bounds.height;
      return {
        type: 'horizontal',
        y: y,
        x1: bounds.x,
        x2: bounds.x + bounds.width
      };
    } else if (type === 1) {
      // 垂直线
      const x = bounds.x + Math.random() * bounds.width;
      return {
        type: 'vertical',
        x: x,
        y1: bounds.y,
        y2: bounds.y + bounds.height
      };
    } else {
      // 斜线
      const angle = Math.random() * Math.PI; // 0 到 180 度
      const centerX = bounds.x + bounds.width / 2;
      const centerY = bounds.y + bounds.height / 2;
      
      // 计算斜线与边界的交点
      const dx = Math.cos(angle) * Math.max(bounds.width, bounds.height);
      const dy = Math.sin(angle) * Math.max(bounds.width, bounds.height);
      
      return {
        type: 'diagonal',
        x1: centerX - dx,
        y1: centerY - dy,
        x2: centerX + dx,
        y2: centerY + dy
      };
    }
  }

  // 用直线分割多边形
  splitPolygon(polygon, line) {
    const vertices = polygon.vertices;
    const newVertices1 = [];
    const newVertices2 = [];
    
    let lastSide = null;
    let lastPoint = null;

    for (let i = 0; i < vertices.length; i++) {
      const current = vertices[i];
      const next = vertices[(i + 1) % vertices.length];
      
      const currentSide = this.getPointSide(current, line);
      const nextSide = this.getPointSide(next, line);

      if (currentSide >= 0) {
        newVertices1.push(current);
      }
      if (currentSide <= 0) {
        newVertices2.push(current);
      }

      // 检查边是否与直线相交
      if ((currentSide > 0 && nextSide < 0) || (currentSide < 0 && nextSide > 0)) {
        const intersection = this.getLineIntersection(current, next, line);
        if (intersection) {
          newVertices1.push(intersection);
          newVertices2.push(intersection);
        }
      }
    }

    // 如果没有成功分割，返回原多边形
    if (newVertices1.length < 3 || newVertices2.length < 3) {
      return [polygon];
    }

    return [
      { vertices: newVertices1 },
      { vertices: newVertices2 }
    ];
  }

  // 获取点相对于直线的位置（正数在上方，负数在下方，0在直线上）
  getPointSide(point, line) {
    if (line.type === 'horizontal') {
      return point.y - line.y;
    } else if (line.type === 'vertical') {
      return point.x - line.x;
    } else {
      // 斜线：使用叉积计算
      const v1 = { x: line.x2 - line.x1, y: line.y2 - line.y1 };
      const v2 = { x: point.x - line.x1, y: point.y - line.y1 };
      return v1.x * v2.y - v1.y * v2.x;
    }
  }

  // 计算线段与直线的交点
  getLineIntersection(p1, p2, line) {
    if (line.type === 'horizontal') {
      // 水平线与线段的交点
      const t = (line.y - p1.y) / (p2.y - p1.y);
      if (t >= 0 && t <= 1) {
        return {
          x: p1.x + t * (p2.x - p1.x),
          y: line.y
        };
      }
    } else if (line.type === 'vertical') {
      // 垂直线与线段的交点
      const t = (line.x - p1.x) / (p2.x - p1.x);
      if (t >= 0 && t <= 1) {
        return {
          x: line.x,
          y: p1.y + t * (p2.y - p1.y)
        };
      }
    } else {
      // 斜线与线段的交点
      const intersection = this.getLineLineIntersection(
        p1.x, p1.y, p2.x, p2.y,
        line.x1, line.y1, line.x2, line.y2
      );
      if (intersection) {
        // 检查交点是否在线段上
        const t1 = p2.x !== p1.x
          ? (intersection.x - p1.x) / (p2.x - p1.x)
          : (intersection.y - p1.y) / (p2.y - p1.y);
        if (t1 >= 0 && t1 <= 1) {
          return intersection;
        }
      }
    }
    return null;
  }

  // 计算两条直线的交点
  getLineLineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (Math.abs(denom) < 1e-10) return null;

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

    return {
      x: x1 + t * (x2 - x1),
      y: y1 + t * (y2 - y1)
    };
  }

  // 计算多边形面积
  calculatePolygonArea(vertices) {
    let area = 0;
    const n = vertices.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += vertices[i].x * vertices[j].y;
      area -= vertices[j].x * vertices[i].y;
    }
    return Math.abs(area / 2);
  }

  // 计算多边形中心
  calculateCenter(vertices) {
    let x = 0, y = 0;
    for (const vertex of vertices) {
      x += vertex.x;
      y += vertex.y;
    }
    return { x: x / vertices.length, y: y / vertices.length };
  }
}
