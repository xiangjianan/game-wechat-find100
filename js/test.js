import Polygon from './polygon';
import PolygonGenerator from './polygonGenerator';

export function testPolygon() {
  console.log('Testing Polygon class...');
  
  const vertices = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 }
  ];
  
  const polygon = new Polygon(vertices, 1, '#FF0000');
  
  console.log('Center:', polygon.getCenter());
  console.log('Area:', polygon.getArea());
  console.log('Contains point (50, 50):', polygon.containsPoint({ x: 50, y: 50 }));
  console.log('Contains point (150, 150):', polygon.containsPoint({ x: 150, y: 150 }));
  
  console.log('Polygon test completed!');
}

export function testPolygonGenerator() {
  console.log('Testing PolygonGenerator class...');
  
  const generator = new PolygonGenerator(400, 600);
  const polygons = generator.generatePolygons(5, 'easy');
  
  console.log('Generated polygons:', polygons.length);
  
  for (let i = 0; i < polygons.length; i++) {
    console.log(`Polygon ${i + 1}:`);
    console.log('  Number:', polygons[i].number);
    console.log('  Vertices:', polygons[i].vertices.length);
    console.log('  Area:', polygons[i].getArea());
    console.log('  Center:', polygons[i].getCenter());
  }
  
  console.log('PolygonGenerator test completed!');
}

export function runAllTests() {
  console.log('Running all tests...');
  testPolygon();
  testPolygonGenerator();
  console.log('All tests completed!');
}
