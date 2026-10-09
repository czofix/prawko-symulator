// One orthographic camera for the road, vehicle meshes and roadside furniture.
// Movement remains in the scenario's original road coordinates.
const camera = {
  a: 0.94,
  b: -0.28,
  c: 0.342,
  d: 0.77,
  x: -84.6,
  y: 177,
  height: 0.88,
};
export const groundTransform = `matrix(${camera.a} ${camera.b} ${camera.c} ${camera.d} ${camera.x} ${camera.y})`;
export type Vertex = readonly [number, number, number];
export function project(x: number, y: number, z = 0) {
  return {
    x: camera.a * x + camera.c * y + camera.x,
    y: camera.b * x + camera.d * y + camera.y - z * camera.height,
  };
}
export function localVertex(vertex: Vertex, angle: number): Vertex {
  const radians = (angle * Math.PI) / 180;
  return [
    vertex[0] * Math.cos(radians) - vertex[1] * Math.sin(radians),
    vertex[0] * Math.sin(radians) + vertex[1] * Math.cos(radians),
    vertex[2],
  ];
}
export function projectedPolygon(vertices: readonly Vertex[], angle = 0) {
  return vertices
    .map((vertex) => {
      const [x, y, z] = localVertex(vertex, angle);
      const point = project(x, y, z);
      return `${(point.x - camera.x).toFixed(2)},${(point.y - camera.y).toFixed(2)}`;
    })
    .join(" ");
}
