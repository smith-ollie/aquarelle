import * as React from "react";
import type { SVGProps } from "react";
import { type Ref, forwardRef } from "react";

const Icon = (props: SVGProps<SVGSVGElement>, ref: Ref<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    ref={ref}
    {...props}
  >
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0m-1.568 18.005L9.018 16.59 13.592 12 9.018 7.421l1.414-1.416L16.42 12z" />
  </svg>
);

export const NextIcon = forwardRef(Icon);
