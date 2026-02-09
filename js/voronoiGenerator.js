export default class VoronoiGenerator {
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

    const totalArea = bounds.width * bounds.height;
    const expectedArea = totalArea / count;
    const minDistance = Math.sqrt(expectedArea) * 0.4;

    const points = this.generateSeedPoints(count, bounds, minDistance);
    
    const gridSize = 4;
    const grid = this.generateGrid(bounds, gridSize, points);
    
    for (let i = 0; i < points.length; i++) {
      const regionPoints = grid.filter(p => p.region === i);
      
      if (regionPoints.length === 0) continue;
      
      const hull = this.improvedConvexHull(regionPoints);
      
      if (hull.length >= 3) {
        let centerX = 0, centerY = 0;
        hull.forEach(p => { centerX += p.x; centerY += p.y; });
        centerX /= hull.length;
        centerY /= hull.length;
        
        const color = this.colors[i % this.colors.length];
        polygons.push({
          vertices: hull,
          number: i + 1,
          color: color,
          center: { x: centerX, y: centerY }
        });
      }
    }
    
    return polygons;
  }

  generateSeedPoints(count, bounds, minDistance) {
    const points = [];
    let attempts = 0;
    const maxAttempts = 1000;
    
    while (points.length < count && attempts < maxAttempts) {
      const newPoint = {
        x: bounds.x + Math.random() * bounds.width,
        y: bounds.y + Math.random() * bounds.height
      };
      
      let minDist = Infinity;
      for (const p of points) {
        const dist = Math.sqrt(
          Math.pow(newPoint.x - p.x, 2) +
          Math.pow(newPoint.y - p.y, 2)
        );
        if (dist < minDist) {
          minDist = dist;
        }
      }
      
      if (minDist >= minDistance || points.length === 0) {
        points.push(newPoint);
      }
      
      attempts++;
    }
    
    return points;
  }

  generateGrid(bounds, gridSize, points) {
    const grid = [];
    
    for (let x = bounds.x; x <= bounds.x + bounds.width; x += gridSize) {
      for (let y = bounds.y; y <= bounds.y + bounds.height; y += gridSize) {
        let minDist = Infinity;
        let nearestPoint = 0;
        
        for (let i = 0; i < points.length; i++) {
          const dist = Math.sqrt(
            Math.pow(x - points[i].x, 2) + 
            Math.pow(y - points[i].y, 2)
          );
          if (dist < minDist) {
            minDist = dist;
            nearestPoint = i;
          }
        }
        
        grid.push({ x, y, region: nearestPoint });
      }
    }
    
    return grid;
  }

  improvedConvexHull(points) {
    if (points.length < 3) return points;
    
    const sorted = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
    
    const upper = [];
    const lower = [];
    
    for (const p of sorted) {
      while (lower.length >= 2) {
        const a = lower[lower.length - 2];
        const b = lower[lower.length - 1];
        const cross = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
        if (cross <= 0) {
          lower.pop();
        } else {
          break;
        }
      }
      lower.push(p);
      
      while (upper.length >= 2) {
        const a = upper[upper.length - 2];
        const b = upper[upper.length - 1];
        const cross = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
        if (cross >= 0) {
          upper.pop();
        } else {
          break;
        }
      }
      upper.push(p);
    }
    
    const hull = [...lower];
    for (let i = upper.length - 2; i >= 0; i--) {
      hull.push(upper[i]);
    }
    
    return hull;
  }
}
