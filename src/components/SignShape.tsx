import type { RoadSign } from "../domain/types";
export function SignShape({ type }: { type: RoadSign["type"] }) {
  if (type === "yield")
    return (
      <path
        d="M-18 -15H18L0 18Z"
        fill="#ffe981"
        stroke="#c43d36"
        strokeWidth="4"
        strokeLinejoin="round"
      />
    );
  if (type === "priority")
    return (
      <>
        <path d="M0 -21 21 0 0 21 -21 0Z" fill="#f6f8ef" />
        <path d="M0 -16 16 0 0 16 -16 0Z" fill="#ffd66d" stroke="#33404c" />
      </>
    );
  if (type === "stop")
    return (
      <>
        <path
          d="M-9 -21H9L21 -9V9L9 21H-9L-21 9V-9Z"
          fill="#b93642"
          stroke="#fff"
          strokeWidth="2"
        />
        <text
          textAnchor="middle"
          y="4"
          fontSize="11"
          fontWeight="800"
          fill="white"
        >
          STOP
        </text>
      </>
    );
  if (type === "crossing")
    return (
      <>
        <rect
          x="-21"
          y="-21"
          width="42"
          height="42"
          rx="2"
          fill="#347ace"
          stroke="white"
          strokeWidth="2"
        />
        <path d="M0 -17 18 16H-18Z" fill="#fff" />
        <circle cy="-5" r="3" fill="#193744" />
        <path
          d="m0-2-4 6 5 3m-1-6 6 5m-6 0-5 7m6-6 5 6M-12 15h24"
          fill="none"
          stroke="#193744"
          strokeWidth="2"
        />
      </>
    );
  if (type === "cycleCrossing") return <><rect x="-21" y="-21" width="42" height="42" rx="2" fill="#347ace" stroke="white" strokeWidth="2"/><path d="M0 -17 18 16H-18Z" fill="white"/><g fill="none" stroke="#193744" strokeWidth="1.8"><circle cx="-8" cy="10" r="5"/><circle cx="8" cy="10" r="5"/><path d="M-8 10-3 1 3 10H-8m5-9H4l4 9M-5-2h5M3-3h4"/></g></>;
  if (type === "roundabout")
    return (
      <>
        <circle r="20" fill="#347ace" stroke="white" strokeWidth="2" />
        {[0, 120, 240].map((angle) => (
          <g key={angle} transform={`rotate(${angle})`}>
            <path
              d="M12 5 A13 13 0 0 0 4 -12"
              stroke="white"
              fill="none"
              strokeWidth="2.5"
            />
            <path d="M1 -13 8 -14 5 -7Z" fill="white" />
          </g>
        ))}
      </>
    );
  return (
    <>
      <rect x="-24" y="-22" width="48" height="44" rx="3" fill="#f4eedc" />
      <path d="M0 -18V18M-19 0H19" stroke="#27343e" strokeWidth="2" />
      <path d="M0 18V0H-19" fill="none" stroke="#27343e" strokeWidth="7" />
    </>
  );
}
