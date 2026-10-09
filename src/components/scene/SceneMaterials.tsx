import { memo } from "react";
export const SceneMaterials = memo(function SceneMaterials({
  id,
}: {
  id: string;
}) {
  return (
    <defs>
      <filter
        id={`${id}-soft-shadow`}
        x="-50%"
        y="-50%"
        width="200%"
        height="200%"
      >
        <feGaussianBlur stdDeviation="2.2" />
      </filter>
      <pattern
        id={`${id}-asphalt`}
        width="80"
        height="80"
        patternUnits="userSpaceOnUse"
      >
        <rect width="80" height="80" fill="#62635e" />
        {Array.from({ length: 90 }, (_, i) => (
          <circle
            key={i}
            cx={(i * 37.3) % 80}
            cy={(i * 19.7 + i * i * 0.3) % 80}
            r={i % 3 === 0 ? 0.75 : 0.35}
            fill={i % 2 ? "#93928a" : "#353d3b"}
            opacity=".32"
          />
        ))}
      </pattern>
      <pattern
        id={`${id}-grass`}
        width="90"
        height="90"
        patternUnits="userSpaceOnUse"
      >
        <rect width="90" height="90" fill="#809262" />
        {Array.from({ length: 120 }, (_, i) => (
          <path
            key={i}
            d={`M${(i * 23.731 + i * i * 0.119) % 90} ${(i * 43.311 + i * i * 0.273) % 90}l${i % 2 ? 2 : -2} -3`}
            stroke={["#acb582", "#657b50", "#bec792", "#4d6944"][i % 4]}
            strokeWidth={i % 3 === 0 ? 1.5 : 0.8}
            opacity=".4"
          />
        ))}
        {Array.from({ length: 12 }, (_, i) => (
          <circle
            key={i}
            cx={(i * 37) % 90}
            cy={(i * 53) % 90}
            r=".8"
            fill="#d9ce8b"
            opacity=".6"
          />
        ))}
      </pattern>
      <pattern
        id={`${id}-paving`}
        width="20"
        height="20"
        patternUnits="userSpaceOnUse"
      >
        <rect width="20" height="20" fill="#c4c5b9" />
        <path
          d="M0 0H20V20H0ZM10 0V20"
          fill="none"
          stroke="#b0b3a8"
          strokeWidth=".7"
        />
        <path d="M1 1H19M1 1V19" stroke="#d8d9ce" strokeWidth=".7" />
      </pattern>
      <radialGradient id={`${id}-tree`} cx="32%" cy="25%" r="80%">
        <stop stopColor="#a4b671" />
        <stop offset=".5" stopColor="#647e45" />
        <stop offset="1" stopColor="#34543b" />
      </radialGradient>
      <linearGradient id={`${id}-light`} x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#fff6cf" stopOpacity=".1" />
        <stop offset="1" stopColor="#142b2a" stopOpacity=".08" />
      </linearGradient>
    </defs>
  );
});
