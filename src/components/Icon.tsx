export function Icon({
  name,
  size = 20,
}: {
  name:
    | "road"
    | "arrow"
    | "play"
    | "pause"
    | "reset"
    | "chevron"
    | "check"
    | "close"
    | "book"
    | "layers"
    | "target"
    | "bulb"
    | "volume";
  size?: number;
}) {
  const paths: Record<string, string> = {
    road: "M5 21 9 3m6 0 4 18M12 3v3m0 4v4m0 4v3",
    arrow: "M4 12h16m-6-6 6 6-6 6",
    play: "m8 5 11 7-11 7Z",
    pause: "M8 5v14M16 5v14",
    reset: "M3 10a9 9 0 1 1 1 8M3 4v6h6",
    chevron: "m9 5 7 7-7 7",
    check: "m5 12 4 4L19 6",
    close: "m6 6 12 12M6 18 18 6",
    book: "M12 5v16M3 3l9 2 9-2v16l-9 2-9-2Z",
    layers: "m12 3 10 5-10 5L2 8Zm-10 9 10 5 10-5M2 17l10 5 10-5",
    target: "M21 12a9 9 0 1 1-9-9m0 4a5 5 0 1 0 5 5m-5 0 9-9m-4 0h4v4",
    bulb: "M9 18h6m-6 3h6M8 14a6 6 0 1 1 8 0l-1 2H9Z",
    volume: "m4 9 5 0 5-4v14l-5-4H4Zm13-2a7 7 0 0 1 0 10",
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
