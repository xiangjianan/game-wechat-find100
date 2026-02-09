import VoronoiGenerator from './voronoiGenerator';

export function testVoronoiGenerator() {
  console.log('Testing VoronoiGenerator...');
  
  const generator = new VoronoiGenerator(400, 600);
  const polygons = generator.generatePolygons(10, 'normal');
  
  console.log('Generated polygons:', polygons.length);
  
  let totalArea = 0;
  for (let i = 0; i < polygons.length; i++) {
    const poly = polygons[i];
    console.log(`Polygon ${i + 1}:`);
    console.log('  Number:', poly.number);
    console.log('  Vertices:', poly.vertices.length);
    console.log('  Center:', poly.center);
    
    const area = calculatePolygonArea(poly.vertices);
    totalArea += area;
    console.log('  Area:', area);
  }
  
  console.log('Total area:', totalArea);
  console.log('Expected area:', 400 * 600);
  console.log('Coverage:', (totalArea / (400 * 600) * 100).toFixed(2) + '%');
  
  console.log('VoronoiGenerator test completed!');
}

function calculatePolygonArea(vertices) {
  let area = 0;
  const n = vertices.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += vertices[i].x * vertices[j].y;
    area -= vertices[j].x * vertices[i].y;
  }
  return Math.abs(area / 2);
}

export function testConvexHull() {
  console.log('Testing convex hull algorithm...');
  
  const points = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
    { x: 0, y: 10 },
    { x: 5, y: 5 },
    { x: 2, y: 2 },
    { x: 8, y: 8 }
  ];
  
  const generator = new VoronoiGenerator(100, 100);
  const hull = generator.improvedConvexHull(points);
  
  console.log('Original points:', points.length);
  console.log('Convex hull points:', hull.length);
  console.log('Hull vertices:', hull);
  
  console.log('Convex hull test completed!');
}

export function runAllTests() {
  console.log('Running all Voronoi tests...');
  testVoronoiGenerator();
  testConvexHull();
  console.log('All tests completed!');
}
