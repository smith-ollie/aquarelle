import { useState, useEffect } from "react";
import { Palette } from "./palette";

const colorSets = [
  ["F4F1DE", "E07A5F"],
  ["3D405B", "81B29A"],
  ["F2CC8F", "E07A5F"],
];

export default function PaletteAnimation() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % colorSets.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Palette colors={colorSets[index]} key={colorSets[index].toString()}>
      <div className="h-screen"></div>
    </Palette>
  );
}
