import { motion } from "motion/react";
import "../styles/global.css";

const colors = [
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

const rectWidth = 100 / colors.length;
const middleIndex = (colors.length - 1) / 2; // Adjusted for even-length arrays

export const Palette = ({ children }: React.PropsWithChildren<{}>) => {
  return (
    <header className="w-full bg-[linear-gradient(to_right,#e76f51_0%,#e76f51_50%,#264653_50%,#264653_100%)] flex justify-center ">
      <div className="flex justify-center w-full relative container">
        <svg className="absolute inset-y-0 h-full w-full  ">
          <defs>
            <clipPath id="rectangles-clip">
              {[...Array(colors.length)].map((_, index) => {
                const distanceFromMiddle = Math.abs(index - middleIndex);
                const normalizedDistance = distanceFromMiddle / middleIndex;
                const yPosition = 1.0 - normalizedDistance * 0;

                return (
                  <rect
                    key={`base-rect-${index}`}
                    fill={"white"}
                    stroke="0"
                    width={`${rectWidth}%`}
                    height={`${yPosition * 100}%`} // Rectangles within the symbol use nominalHeight
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
                    height={"100%"} // Rectangles within the symbol use nominalHeight
                    x={`${index * rectWidth}%`}
                  />
                );
              })}
            </symbol>

            {/*
              Filter for the distortion effect.
              It performs turbulence, blur, and displacement.
              Crucially, this filter does NOT handle any clipping or compositing
              to define sharp edges; those are handled by external clipPaths.
            */}
            <filter
              id="distorted-blur-effect"
              x="0%"
              y="0%"
              width="100%"
              height="100%"
            >
              {/* Step 1: Create the turbulence noise to act as our displacement map */}
              <feTurbulence
                baseFrequency="0.05"
                type="fractalNoise"
                numOctaves="10"
                result="noiseMap"
              />
              {/* Step 2: Create a standard blur on the input graphic (SourceGraphic) */}
              <motion.feGaussianBlur
                in="SourceGraphic"
                // stdDeviation="100"
                animate={{ stdDeviation: 15 }}
                initial={{ stdDeviation: 0 }}
                transition={{ duration: 5, ease: "easeInOut", delay: 2 }}
                result="blurredSource"
              />

              {/* Step 3: Use the noise map to displace the blurred image */}
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

            {/*
            Layer 1: The main distorted content.
            This <g> element applies the `distorted-blur-effect` filter and
            the `rectangles-clip` to the `base-rectangles` symbol.
            The `width="100%" height="100%"` on <use> makes it fill the parent SVG.
          */}
            <g filter="url(#distorted-blur-effect)">
              <use href="#colored-rectangles" width="100%" height="100%" />
            </g>
          </g>

          {/*
            Layer 2: The sharp, unfiltered top edge.
            This <g> element is rendered on top of Layer 1. It references the
            `base-rectangles` (unfiltered) and uses the `top-edge-strip-clip`
            to only show its very top section. This creates a crisp,
            un-displaced line that covers any blurred or displaced pixels
            from Layer 1 at the very top.
          */}
        </svg>
        <div className="container py-3 justify-center flex mx-auto h-full relative">
          <span className="font-Blackout text-4xl text-black leading-[1.2] py-2">
            &nbsp;Oliver Smith&nbsp;
          </span>
        </div>
      </div>
      {children}
    </header>
  );
};
