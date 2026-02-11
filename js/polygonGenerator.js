import Polygon from './polygon';
import LineDividerGenerator from './lineDividerGenerator';

export default class PolygonGenerator {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.lineDividerGenerator = new LineDividerGenerator(width, height);
    this.colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8B500', '#FF6F61', '#6B5B95', '#88B04B', '#F7CAC9'
    ];
  }

  generatePolygons(count, difficulty = 'normal') {
    const polygons = [];
    
    const polygonData = this.lineDividerGenerator.generatePolygons(count, difficulty);
    
    for (let i = 0; i < polygonData.length; i++) {
      const data = polygonData[i];
      polygons.push(new Polygon(data.vertices, data.number, data.color));
    }
    
    return polygons;
  }
}
