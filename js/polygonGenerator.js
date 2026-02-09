import Polygon from './polygon';

export default class PolygonGenerator {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8B500', '#FF6F61', '#6B5B95', '#88B04B', '#F7CAC9'
    ];
  }

  generatePolygons(count, difficulty = 'normal') {
    const polygons = [];
    const bounds = {
      x: 50,
      y: 100,
      width: this.width - 100,
      height: this.height - 200
    };

    let currentPolygons = [{
      vertices: [
        { x: bounds.x, y: bounds.y },
        { x: bounds.x + bounds.width, y: bounds.y },
        { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
        { x: bounds.x, y: bounds.y + bounds.height }
      ]
    }];

    const cutCount = this.getCutCount(count, difficulty);
    
    for (let i = 0; i < cutCount; i++) {
      currentPolygons = this.cutPolygons(currentPolygons, bounds);
    }

    const shuffledPolygons = this.shuffleArray(currentPolygons);
    
    for (let i = 0; i < Math.min(count, shuffledPolygons.length); i++) {
      const color = this.colors[i % this.colors.length];
      polygons.push(new Polygon(shuffledPolygons[i].vertices, i + 1, color));
    }

    return polygons;
  }

  getCutCount(count, difficulty) {
    const baseCuts = Math.ceil(Math.log2(count));
    switch (difficulty) {
      case 'easy':
        return baseCuts;
      case 'normal':
        return baseCuts + 2;
      case 'hard':
        return baseCuts + 4;
      default:
        return baseCuts + 2;
    }
  }

  cutPolygons(polygons, bounds) {
    const newPolygons = [];
    
    for (const polygon of polygons) {
      const cutLine = this.generateRandomCutLine(bounds);
      const result = this.cutPolygon(polygon, cutLine);
      
      if (result.length === 2) {
        newPolygons.push(...result);
      } else {
        newPolygons.push(polygon);
      }
    }
    
    return newPolygons;
  }

  generateRandomCutLine(bounds) {
    const isHorizontal = Math.random() > 0.5;
    
    if (isHorizontal) {
      const y = bounds.y + Math.random() * bounds.height;
      return {
        type: 'horizontal',
        y: y,
        x1: bounds.x,
        x2: bounds.x + bounds.width
      };
    } else {
      const x = bounds.x + Math.random() * bounds.width;
      return {
        type: 'vertical',
        x: x,
        y1: bounds.y,
        y2: bounds.y + bounds.height
      };
    }
  }

  cutPolygon(polygon, cutLine) {
    const vertices = polygon.vertices;
    const newVertices1 = [];
    const newVertices2 = [];
    
    for (let i = 0; i < vertices.length; i++) {
      const current = vertices[i];
      const next = vertices[(i + 1) % vertices.length];
      
      const currentSide = this.getSide(current, cutLine);
      const nextSide = this.getSide(next, cutLine);
      
      if (currentSide >= 0) {
        newVertices1.push(current);
      }
      if (currentSide <= 0) {
        newVertices2.push(current);
      }
      
      if (currentSide * nextSide < 0) {
        const intersection = this.getIntersection(current, next, cutLine);
        newVertices1.push(intersection);
        newVertices2.push(intersection);
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

  getSide(point, cutLine) {
    if (cutLine.type === 'horizontal') {
      return point.y - cutLine.y;
    } else {
      return point.x - cutLine.x;
    }
  }

  getIntersection(p1, p2, cutLine) {
    if (cutLine.type === 'horizontal') {
      const t = (cutLine.y - p1.y) / (p2.y - p1.y);
      return {
        x: p1.x + t * (p2.x - p1.x),
        y: cutLine.y
      };
    } else {
      const t = (cutLine.x - p1.x) / (p2.x - p1.x);
      return {
        x: cutLine.x,
        y: p1.y + t * (p2.y - p1.y)
      };
    }
  }

  shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }
}
