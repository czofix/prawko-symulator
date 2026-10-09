import { memo } from "react";
import type { Maneuver } from "../../domain/types";
import { localVertex, projectedPolygon, type Vertex } from "./projection";

type Face = { vertices: Vertex[]; fill: string; stroke?: string };
const paint = (color: string, light: number) => {
  const channels = color
    .slice(1)
    .match(/../g)!
    .map((part) => parseInt(part, 16));
  return `rgb(${channels.map((channel) => Math.round(light > 0 ? channel + (255 - channel) * light : channel * (1 + light))).join(" ")})`;
};
const box = (
  x1: number,
  x2: number,
  y1: number,
  y2: number,
  z1: number,
  z2: number,
  color: string,
): Face[] => [
  {
    vertices: [
      [x1, y1, z1],
      [x2, y1, z1],
      [x2, y1, z2],
      [x1, y1, z2],
    ],
    fill: paint(color, -0.25),
  },
  {
    vertices: [
      [x2, y2, z1],
      [x1, y2, z1],
      [x1, y2, z2],
      [x2, y2, z2],
    ],
    fill: paint(color, -0.17),
  },
  {
    vertices: [
      [x1, y2, z1],
      [x1, y1, z1],
      [x1, y1, z2],
      [x1, y2, z2],
    ],
    fill: paint(color, -0.32),
  },
  {
    vertices: [
      [x2, y1, z1],
      [x2, y2, z1],
      [x2, y2, z2],
      [x2, y1, z2],
    ],
    fill: paint(color, -0.1),
  },
  {
    vertices: [
      [x1, y1, z2],
      [x2, y1, z2],
      [x2, y2, z2],
      [x1, y2, z2],
    ],
    fill: paint(color, 0.18),
  },
];

// A small actual 3D mesh, projected into SVG. Heading is applied before the
// camera projection, so wheels, glass, lamps and the body turn together.
export const VehicleModel = memo(function VehicleModel({
  angle,
  color,
  maneuver,
  indicating,
  id,
  shadowId,
}: {
  angle: number;
  color: string;
  maneuver: Maneuver;
  indicating: boolean;
  id: string;
  shadowId: string;
}) {
  const faces: Face[] = [];
  for (const side of [-1, 1]) {
    for (const axle of [-22, 22]) {
      const x = side * 17.5;
      const tire = Array.from({ length: 12 }, (_, i): Vertex => [
        x + side * 2,
        axle + Math.cos((i * Math.PI) / 6) * 7.5,
        7.5 + Math.sin((i * Math.PI) / 6) * 7.5,
      ]);
      faces.push(
        ...box(x - 2.5, x + 2.5, axle - 6, axle + 6, 2, 12, "#20252b"),
      );
      faces.push({ vertices: tire, fill: "#171c21", stroke: "#353d43" });
      faces.push({
        vertices: tire.map(([a, b, c]) => [
          a + side * 0.2,
          axle + (b - axle) * 0.62,
          7.5 + (c - 7.5) * 0.62,
        ]),
        fill: "#a7b3ba",
        stroke: "#d6dde0",
      });
      faces.push({
        vertices: tire.map(([a, b, c]) => [
          a + side * 0.4,
          axle + (b - axle) * 0.29,
          7.5 + (c - 7.5) * 0.29,
        ]),
        fill: "#4b5965",
      });
    }
  }
  const outline = [
    [-13, -36],
    [13, -36],
    [18, -29],
    [18, 27],
    [13, 34],
    [-13, 34],
    [-18, 27],
    [-18, -29],
  ];
  outline.forEach(([x, y], i) => {
    const [nx, ny] = outline[(i + 1) % outline.length];
    faces.push({
      vertices: [
        [x, y, 7],
        [nx, ny, 7],
        [nx, ny, 15],
        [x, y, 15],
      ],
      fill: paint(color, x < 0 ? -0.25 : -0.08),
      stroke: paint(color, -0.32),
    });
  });
  faces.push({
    vertices: [
      [-13, -36, 15],
      [13, -36, 15],
      [18, -29, 15],
      [15, -15, 15],
      [-15, -15, 15],
      [-18, -29, 15],
    ],
    fill: paint(color, 0.1),
    stroke: paint(color, -0.12),
  });
  faces.push({
    vertices: [
      [-15, 25, 15],
      [15, 25, 15],
      [18, 27, 15],
      [13, 34, 15],
      [-13, 34, 15],
      [-18, 27, 15],
    ],
    fill: paint(color, 0.15),
    stroke: paint(color, -0.12),
  });
  for (const side of [-1, 1])
    faces.push({
      vertices: [
        [side * 18, -29, 15],
        [side * 15, -15, 15],
        [side * 15, 25, 15],
        [side * 18, 27, 15],
      ],
      fill: paint(color, 0.1),
    });
  // Hood, bumper, radiator grille and a neutral registration plate.
  faces.push({
    vertices: [
      [-15, -29, 15.3],
      [15, -29, 15.3],
      [14, -16, 15.3],
      [-14, -16, 15.3],
    ],
    fill: paint(color, 0.24),
    stroke: paint(color, -0.12),
  });
  faces.push(...box(-11, 11, -36.3, -36, 8, 11, "#26323a"));
  faces.push(...box(-5, 5, -36.6, -36.4, 7.5, 10, "#edf1ed"));
  faces.push(...box(-5, 5, 34.1, 34.3, 7.5, 10, "#edf1ed"));
  // Cabin: sloped windscreen and rear window, a painted roof and side glass.
  faces.push({
    vertices: [
      [-15, -15, 15],
      [15, -15, 15],
      [12, -6, 27],
      [-12, -6, 27],
    ],
    fill: `url(#${id}-glass)`,
    stroke: "#263740",
  });
  faces.push({
    vertices: [
      [-12, 15, 27],
      [12, 15, 27],
      [15, 25, 15],
      [-15, 25, 15],
    ],
    fill: `url(#${id}-glass)`,
    stroke: "#263740",
  });
  for (const side of [-1, 1]) {
    const x = side * 15;
    faces.push({
      vertices: [
        [x, -14, 15],
        [side * 12, -6, 27],
        [side * 12, 15, 27],
        [x, 25, 15],
      ],
      fill: paint(color, -0.13),
    });
    faces.push({
      vertices: [
        [x + side * 0.15, -11, 17],
        [side * 12.5, -5, 25],
        [side * 12.5, 3, 25],
        [x + side * 0.15, 3, 17],
      ],
      fill: "#46616f",
      stroke: "#24343c",
    });
    faces.push({
      vertices: [
        [x + side * 0.15, 5, 17],
        [side * 12.5, 5, 25],
        [side * 12.5, 14, 25],
        [x + side * 0.15, 21, 17],
      ],
      fill: "#304952",
      stroke: "#263740",
    });
    faces.push(
      ...box(side < 0 ? -23 : 17, side < 0 ? -17 : 23, -14, -10, 15, 18, color),
    );
    faces.push(
      ...box(
        side < 0 ? -18.2 : 18,
        side < 0 ? -18 : 18.2,
        5,
        10,
        12,
        13,
        "#c7d0d2",
      ),
    );
  }
  faces.push({
    vertices: [
      [-12, -6, 27],
      [12, -6, 27],
      [12, 15, 27],
      [-12, 15, 27],
    ],
    fill: paint(color, 0.32),
    stroke: paint(color, -0.12),
  });
  faces.push({
    vertices: [
      [-11, -5, 27.2],
      [-8, -5, 27.2],
      [-8, 14, 27.2],
      [-11, 14, 27.2],
    ],
    fill: paint(color, 0.48),
  });
  for (const side of [-1, 1]) {
    faces.push({
      vertices: [
        [side * 7, -36.2, 12],
        [side * 13, -36.2, 12],
        [side * 17, -30, 14.7],
        [side * 9, -31, 15.2],
      ],
      fill: "#f4fbff",
      stroke: "#b6c8d0",
    });
    faces.push({
      vertices: [
        [side * 7, 34.2, 10],
        [side * 13, 34.2, 10],
        [side * 17, 29, 13],
        [side * 8, 30, 15],
      ],
      fill: "#bc2935",
      stroke: "#79242b",
    });
  }
  // Painter's order along the camera direction, independent of screen height.
  const depth = (face: Face) =>
    face.vertices.reduce((sum, v) => {
      const [x, y, z] = localVertex(v, angle);
      return sum - 0.3 * x + 0.83 * y + z * 0.82;
    }, 0) / face.vertices.length;
  faces.sort((a, b) => depth(a) - depth(b));
  return (
    <g aria-hidden="true" transform="scale(1.12)">
      <defs>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#abc8d5" />
          <stop offset=".32" stopColor="#456371" />
          <stop offset=".55" stopColor="#7293a1" />
          <stop offset="1" stopColor="#203744" />
        </linearGradient>
      </defs>
      <polygon
        points={projectedPolygon(
          [
            [-20, -34, 0],
            [19, -34, 0],
            [24, 31, 0],
            [13, 42, 0],
            [-23, 38, 0],
          ],
          angle,
        )}
        transform="translate(9 10)"
        fill="#172526"
        opacity=".3"
        filter={`url(#${shadowId}-soft-shadow)`}
      />
      {faces.map((face, i) => (
        <polygon
          key={i}
          points={projectedPolygon(face.vertices, angle)}
          fill={face.fill}
          stroke={face.stroke ?? face.fill}
          strokeWidth=".6"
          strokeLinejoin="round"
        />
      ))}
      {indicating &&
        [-29, 29].map((y) => {
          const side = maneuver === "left" ? -1 : 1;
          const points = projectedPolygon([[side * 17, y, 15]], angle)
            .split(",")
            .map(Number);
          return (
            <g key={y}>
              <circle
                cx={points[0]}
                cy={points[1]}
                r="7"
                fill="#ffb72d"
                opacity=".25"
              />
              <circle
                cx={points[0]}
                cy={points[1]}
                r="3.2"
                fill="#ffd255"
                stroke="#fff0b5"
                strokeWidth=".8"
              />
            </g>
          );
        })}
    </g>
  );
});
