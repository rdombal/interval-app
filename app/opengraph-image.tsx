import { ImageResponse } from "next/og";

// Link-preview card (Notion bookmarks, iMessage, LinkedIn). Drawn in code so
// it always matches the app's phase colours.
export const alt = "Interval: build & run interval workouts";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SKY = "#38bdf8";
const ROSE = "#f23a64";
const GREEN = "#34d399";
const BLUE = "#3b82f6";

// A Norwegian 4x4: warm up, 4 x (4 min hard + 3 min easy), cool down.
const SEGMENTS: [string, number][] = [
  [SKY, 10],
  ...Array.from({ length: 4 }, () => [
    [ROSE, 4],
    [GREEN, 3],
  ] as [string, number][]).flat(),
  [BLUE, 5],
];

export default function OpengraphImage() {
  const total = SEGMENTS.reduce((s, [, m]) => s + m, 0);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "linear-gradient(135deg, #effdf4 0%, #ffffff 55%, #fff1f3 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: "linear-gradient(135deg, #36d57f, #079650)",
              color: "white",
              fontSize: 44,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            I
          </div>
          <div style={{ fontSize: 44, fontWeight: 800, color: "#171717" }}>Interval</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 68, fontWeight: 800, color: "#171717", lineHeight: 1.05 }}>
            Interval workouts without fighting your watch.
          </div>
          <div style={{ fontSize: 30, color: "#525252" }}>
            Tabata, Norwegian 4×4, 10-20-30 and more. Or build your own.
          </div>
        </div>

        <div style={{ display: "flex", width: "100%", height: 28, borderRadius: 14, overflow: "hidden" }}>
          {SEGMENTS.map(([color, mins], i) => (
            <div key={i} style={{ width: `${(mins / total) * 100}%`, height: "100%", background: color }} />
          ))}
        </div>
      </div>
    ),
    size,
  );
}
