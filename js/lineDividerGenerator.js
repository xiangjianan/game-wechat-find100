import Polygon from './polygon';
import { COLORS } from './constants/colors';

export default class LineDividerGenerator {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.colors = COLORS.POLYGON_COLORS;
    this.minArea = 400;
    this.minWidth = 30;
  }

  generatePolygons(count, difficulty = 'normal') {
    const isMobile = this.width < 768;
    const headerHeight = isMobile ? 110 : 130;
    const footerHeight = isMobile ? 50 : 60;
    
    const bounds = {
      x: 0,
      y: headerHeight,
      width: this.width,
      height: this.height - headerHeight - footerHeight
    };

    const totalArea = bounds.width * bounds.height;
    const dynamicMinArea = Math.max(this.minArea, totalArea / count * 0.3);
    const dynamicMinWidth = Math.max(this.minWidth, Math.min(bounds.width, bounds.height) / Math.sqrt(count) * 0.4);

    let polygons = [{
      vertices: [
        { x: bounds.x, y: bounds.y },
        { x: bounds.x + bounds.width, y: bounds.y },
        { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
        { x: bounds.x, y: bounds.y + bounds.height }
      ]
    }];

    let attempts = 0;
    const maxAttempts = 5000;

    while (polygons.length < count && attempts < maxAttempts) {
      let maxArea = 0;
      let maxIndex = 0;
      for (let i = 0; i < polygons.length; i++) {
        const area = this.calculatePolygonArea(polygons[i].vertices);
        if (area > maxArea) {
          maxArea = area;
          maxIndex = i;
        }
      }

      if (maxArea < dynamicMinArea * 2) {
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

        if (area1 >= dynamicMinArea && area2 >= dynamicMinArea &&
            width1 >= dynamicMinWidth && width2 >= dynamicMinWidth) {
          polygons.splice(maxIndex, 1, ...splitResult);
        }
      }

      attempts++;
    }

    if (polygons.length < count) {
      const relaxedMinArea = dynamicMinArea * 0.6;
      const relaxedMinWidth = dynamicMinWidth * 0.7;
      
      attempts = 0;
      while (polygons.length < count && attempts < maxAttempts) {
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

    if (polygons.length > count) {
      polygons.sort((a, b) => this.calculatePolygonArea(b.vertices) - this.calculatePolygonArea(a.vertices));
      polygons = polygons.slice(0, count);
    }

    const result = [];
    const indices = Array.from({ length: polygons.length }, (_, i) => i);
    this.shuffleArray(indices);
    
    for (let i = 0; i < polygons.length; i++) {
      const polygonIndex = indices[i];
      const vertices = polygons[polygonIndex].vertices;
      const center = this.calculateCenter(vertices);
      
      result.push(new Polygon(
        vertices,
        i + 1,
        this.colors[i % this.colors.length]
      ));
    }

    return result;
  }

  generateRandomLine(bounds) {
    const angle = Math.random() * Math.PI * 2;
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    const t = Math.random() * (bounds.width + bounds.height);
    const perpX = -dy;
    const perpY = dx;
    const baseX = bounds.x + bounds.width / 2 + perpX * (t - (bounds.width + bounds.height) / 2);
    const baseY = bounds.y + bounds.height / 2 + perpY * (t - (bounds.width + bounds.height) / 2);
    const length = Math.max(bounds.width, bounds.height) * 2;
    
    return {
      type: 'diagonal',
      x1: baseX - dx * length / 2,
      y1: baseY - dy * length / 2,
      x2: baseX + dx * length / 2,
      y2: baseY + dy * length / 2
    };
  }

  splitPolygon(polygon, line) {
    const vertices = polygon.vertices;
    const newVertices1 = [];
    const newVertices2 = [];

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

      if ((currentSide > 0 && nextSide < 0) || (currentSide < 0 && nextSide > 0)) {
        const intersection = this.getLineIntersection(current, next, line);
        if (intersection) {
          newVertices1.push(intersection);
          newVertices2.push(intersection);
        }
      }
    }

    if (newVertices1.length < 3 || newVertices2.length < 3) {
      return [polygon];
    }

    return [
      { vertices: newVertices1 },
      { vertices: newVertices2 }
    ];
  }

  getPointSide(point, line) {
    const v1 = { x: line.x2 - line.x1, y: line.y2 - line.y1 };
    const v2 = { x: point.x - line.x1, y: point.y - line.y1 };
    return v1.x * v2.y - v1.y * v2.x;
  }

  getLineIntersection(p1, p2, line) {
    const intersection = this.getLineLineIntersection(
      p1.x, p1.y, p2.x, p2.y,
      line.x1, line.y1, line.x2, line.y2
    );
    if (intersection) {
      const t1 = p2.x !== p1.x
        ? (intersection.x - p1.x) / (p2.x - p1.x)
        : (intersection.y - p1.y) / (p2.y - p1.y);
      if (t1 >= 0 && t1 <= 1) {
        return intersection;
      }
    }
    return null;
  }

  getLineLineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (Math.abs(denom) < 1e-10) return null;

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;

    return {
      x: x1 + t * (x2 - x1),
      y: y1 + t * (y2 - y1)
    };
  }

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

  calculateMinWidth(vertices) {
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    
    for (const v of vertices) {
      if (v.x < minX) minX = v.x;
      if (v.x > maxX) maxX = v.x;
      if (v.y < minY) minY = v.y;
      if (v.y > maxY) maxY = v.y;
    }
    
    return Math.min(maxX - minX, maxY - minY);
  }

  calculateCenter(vertices) {
    let x = 0, y = 0;
    for (const vertex of vertices) {
      x += vertex.x;
      y += vertex.y;
    }
    return { x: x / vertices.length, y: y / vertices.length };
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}
