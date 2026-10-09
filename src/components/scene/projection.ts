// One orthographic camera for the road, vehicle meshes and roadside furniture.
// Movement remains in the scenario's original road coordinates.
export const groundTransform = "matrix(0.94 -0.28 0.342 0.77 -84.6 177)";
export type Vertex = readonly [number, number, number];
export function project(x: number, y: number, z = 0) {
  return {
    x: 0.94 * x + 0.342 * y - 84.6,
    y: -0.28 * x + 0.77 * y + 177 - z * 0.88,
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
      return `${(0.94 * x + 0.342 * y).toFixed(2)},${(-0.28 * x + 0.77 * y - z * 0.88).toFixed(2)}`;
    })
    .join(" ");
}
