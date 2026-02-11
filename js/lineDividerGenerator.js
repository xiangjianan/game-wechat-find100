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
    // 最小宽度：确保能容纳文字（约30像素）
    this.minWidth = 30;
  }

  generatePolygons(count, difficulty = 'normal') {
    // 根据屏幕宽度动态调整header高度
    const isMobile = this.width < 768;
    const headerHeight = isMobile ? 70 : 80;
    
    const bounds = {
      x: 0,
      y: headerHeight,
      width: this.width,
      height: this.height - headerHeight
    };

    // 根据目标数量动态调整最小面积和最小宽度
    const totalArea = bounds.width * bounds.height;
    const dynamicMinArea = Math.max(this.minArea, totalArea / count * 0.3); // 至少是平均面积的30%
    const dynamicMinWidth = Math.max(this.minWidth, Math.min(bounds.width, bounds.height) / Math.sqrt(count) * 0.4);

    // 初始状态：一个矩形
    let polygons = [{
      vertices: [
        { x: bounds.x, y: bounds.y },
        { x: bounds.x + bounds.width, y: bounds.y },
        { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
        { x: bounds.x, y: bounds.y + bounds.height }
      ]
    }];

    // 使用递归分割方法
    let attempts = 0;
    const maxAttempts = 5000;

    while (polygons.length < count && attempts < maxAttempts) {
      // 找到面积最大的多边形
      let maxArea = 0;
      let maxIndex = 0;
      for (let i = 0; i < polygons.length; i++) {
        const area = this.calculatePolygonArea(polygons[i].vertices);
        if (area > maxArea) {
          maxArea = area;
          maxIndex = i;
        }
      }

      // 如果最大的多边形面积太小，无法继续分割
      if (maxArea < dynamicMinArea * 2) {
        break;
      }

      // 生成一条随机直线
      const line = this.generateRandomLine(bounds);
      
      // 尝试分割最大的多边形
      const polyToSplit = polygons[maxIndex];
      const splitResult = this.splitPolygon(polyToSplit, line);
      
      if (splitResult.length === 2) {
        // 检查分割后的两个多边形是否满足要求
        const area1 = this.calculatePolygonArea(splitResult[0].vertices);
        const area2 = this.calculatePolygonArea(splitResult[1].vertices);
        const width1 = this.calculateMinWidth(splitResult[0].vertices);
        const width2 = this.calculateMinWidth(splitResult[1].vertices);

        if (area1 >= dynamicMinArea && area2 >= dynamicMinArea &&
            width1 >= dynamicMinWidth && width2 >= dynamicMinWidth) {
          // 成功分割，替换原多边形
          polygons.splice(maxIndex, 1, ...splitResult);
        }
      }

      attempts++;
    }

    // 如果生成的多边形数量不足，尝试降低要求继续分割
    if (polygons.length < count) {
      const relaxedMinArea = dynamicMinArea * 0.6;
      const relaxedMinWidth = dynamicMinWidth * 0.7;
      
      attempts = 0;
      while (polygons.length < count && attempts < maxAttempts) {
        // 找到面积最大的多边形
        let maxArea = 0;
        let maxIndex = 0;
        for (let i = 0; i < polygons.length; i++) {
          const area = this.calculatePolygonArea(polygons[i].vertices);
          if (area > maxArea) {
            maxArea = area;
            maxIndex = i;
          }
        }

        if (maxArea < relaxedMinArea * 2) {
          break;
        }

        const line = this.generateRandomLine(bounds);
        const polyToSplit = polygons[maxIndex];
        const splitResult = this.splitPolygon(polyToSplit, line);
        
        if (splitResult.length === 2) {
          const area1 = this.calculatePolygonArea(splitResult[0].vertices);
          const area2 = this.calculatePolygonArea(splitResult[1].vertices);
          const width1 = this.calculateMinWidth(splitResult[0].vertices);
          const width2 = this.calculateMinWidth(splitResult[1].vertices);

          if (area1 >= relaxedMinArea && area2 >= relaxedMinArea &&
              width1 >= relaxedMinWidth && width2 >= relaxedMinWidth) {
            polygons.splice(maxIndex, 1, ...splitResult);
          }
        }

        attempts++;
      }
    }

    // 如果生成的多边形数量超过目标，移除一些小面积的多边形
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

  // 生成一条随机直线（具有随机旋转角度）
  generateRandomLine(bounds) {
    // 随机角度：0 到 360 度（0 到 2π 弧度）
    const angle = Math.random() * Math.PI * 2;
    
    // 计算直线的方向向量
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    
    // 随机选择直线的位置：在边界范围内随机选择一个点
    // 使用参数 t 来确定直线在垂直于方向向量方向上的位置
    const t = Math.random() * (bounds.width + bounds.height);
    
    // 计算直线上的一个参考点
    // 使用垂直于方向向量的向量来确定位置
    const perpX = -dy;
    const perpY = dx;
    
    // 计算直线的基准点（在边界范围内）
    const baseX = bounds.x + bounds.width / 2 + perpX * (t - (bounds.width + bounds.height) / 2);
    const baseY = bounds.y + bounds.height / 2 + perpY * (t - (bounds.width + bounds.height) / 2);
    
    // 计算直线与边界的交点，确保直线足够长
    const length = Math.max(bounds.width, bounds.height) * 2;
    
    return {
      type: 'diagonal',
      x1: baseX - dx * length / 2,
      y1: baseY - dy * length / 2,
      x2: baseX + dx * length / 2,
      y2: baseY + dy * length / 2
    };
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
    // 使用叉积计算点相对于直线的位置
    const v1 = { x: line.x2 - line.x1, y: line.y2 - line.y1 };
    const v2 = { x: point.x - line.x1, y: point.y - line.y1 };
    return v1.x * v2.y - v1.y * v2.x;
  }

  // 计算线段与直线的交点
  getLineIntersection(p1, p2, line) {
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

  // 计算多边形的最小宽度（确保能容纳文字）
  calculateMinWidth(vertices) {
    let minWidth = Infinity;
    const n = vertices.length;

    // 计算所有顶点之间的最小距离
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dx = vertices[i].x - vertices[j].x;
        const dy = vertices[i].y - vertices[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < minWidth) {
          minWidth = distance;
        }
      }
    }

    // 计算多边形的最小外接矩形宽度
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    for (const v of vertices) {
      if (v.x < minX) minX = v.x;
      if (v.x > maxX) maxX = v.x;
      if (v.y < minY) minY = v.y;
      if (v.y > maxY) maxY = v.y;
    }
    const rectWidth = maxX - minX;
    const rectHeight = maxY - minY;
    const minRectDim = Math.min(rectWidth, rectHeight);

    // 返回顶点间最小距离和最小矩形尺寸中的较小值
    return Math.min(minWidth, minRectDim);
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
