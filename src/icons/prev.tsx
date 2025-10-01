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
    <path d="M0 12c0 6.627 5.373 12 12 12s12-5.373 12-12S18.627 0 12 0 0 5.373 0 12m7.58 0 5.988-5.995 1.414 1.416L10.408 12l4.574 4.59-1.414 1.416z" />
  </svg>
);

export const PrevIcon = forwardRef(Icon);
