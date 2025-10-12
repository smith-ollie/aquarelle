import { motion } from "motion/react";
import "../styles/global.css";

const defaultColors = [
  "264653",
  "275c62",
  "287271",
  "2a9d8f",
  "8ab17d",
  "e9c46a",
  "efb366",
  "f4a261",
  "ee8959",
  "e76f51",
].reverse(); // Reverse the order of colors

type PaletteProps = React.PropsWithChildren<{
  colors?: string[];
}>;

export const Palette = ({ children, colors = defaultColors }: PaletteProps) => {
  const rectWidth = 100 / colors.length;

  console.log(rectWidth);

  return (
    <div className="w-full relative">
      <svg className="absolute inset-y-0 h-full w-full">
        <defs>
          <clipPath id="rectangles-clip">
            {[...Array(colors.length)].map((_, index) => {
              return (
                <rect
                  key={`base-rect-${index}`}
                  fill={"white"}
                  stroke="0"
                  width={`${rectWidth}%`}
                  height="100%"
                  x={`${index * rectWidth}%`}
                />
              );
            })}
          </clipPath>

          <symbol id="colored-rectangles">
            {colors.map((color, index) => {
              return (
                <rect
                  key={`base-rect-${index}`}
                  fill={`#${color}`}
                  stroke="0"
                  width={`${rectWidth}%`}
                  height="100%"
                  x={`${index * rectWidth}%`}
                />
              );
            })}
          </symbol>

          <filter
            id="distorted-blur-effect"
            x="0%"
            y="0%"
            width="100%"
            height="100%"
          >
            <feTurbulence
              baseFrequency="0.05"
              type="fractalNoise"
              numOctaves="10"
              result="noiseMap"
            />
            <motion.feGaussianBlur
              in="SourceGraphic"
              animate={{ stdDeviation: 15 }}
              initial={{ stdDeviation: 0 }}
              transition={{ duration: 5, ease: "easeInOut", delay: 2 }}
              result="blurredSource"
            />
            <motion.feDisplacementMap
              in="blurredSource"
              in2="noiseMap"
              animate={{ attrScale: 500 }}
              initial={{ attrScale: 0 }}
              transition={{ duration: 5, ease: "easeInOut", delay: 1 }}
              xChannelSelector="R"
              yChannelSelector="R"
              result="blurredDisplaced"
            />
          </filter>
        </defs>

        <g clipPath="url(#rectangles-clip)" filter="url(#whiteTint8)">
          <g>
            <use href="#colored-rectangles" width="100%" height="100%" />
          </g>
          <g filter="url(#distorted-blur-effect)">
            <use href="#colored-rectangles" width="100%" height="100%" />
          </g>
        </g>
      </svg>
      {children}
    </div>
  );
};
