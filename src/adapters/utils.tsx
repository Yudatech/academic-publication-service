export function formatDate(dateString: string) {
  if (!dateString) return "Unknown";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function colorScale(
  count: number,
  min: number,
  max: number,
  { hue = 217, sat = 90, lightMin = 35, lightMax = 80 } = {}
) {
  if (!isFinite(count) || min === max) {
    const mid = (lightMin + lightMax) / 2;
    return `hsl(${hue} ${sat}% ${mid}%)`;
  }
  const t = (count - min) / (max - min);
  const L = lightMax - t * (lightMax - lightMin);
  return `hsl(${hue} ${sat}% ${L}%)`;
}

export function makeBlueShades(counts: number[]) {
  if (!counts.length) return { fills: [], hovers: [], borders: [] };
  const min = Math.min(...counts);
  const max = Math.max(...counts);
  const fills = counts.map((c) => colorScale(c, min, max));
  const hovers = counts.map((c) =>
    colorScale(c, min, max, { lightMin: 28, lightMax: 74 })
  );
  const borders = counts.map((c) =>
    colorScale(c, min, max, { lightMin: 25, lightMax: 55 })
  );
  return { fills, hovers, borders };
}
