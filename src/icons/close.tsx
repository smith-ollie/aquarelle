import * as React from "react";
import type { SVGProps } from "react";

const Icon = (
  props: SVGProps<SVGSVGElement>,
  ref: React.Ref<SVGSVGElement>
) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fillRule="evenodd"
    strokeLinejoin="round"
    strokeMiterlimit={2}
    clipRule="evenodd"
    viewBox="0 0 24 24"
    ref={ref}
    {...props}
  >
    <path
      fillRule="nonzero"
      d="M21 3.998c0-.478-.379-1-1-1H4c-.62 0-1 .519-1 1v16c0 .621.52 1 1 1h16c.478 0 1-.379 1-1zm-8.991 6.932 2.717-2.718a.75.75 0 1 1 1.062 1.062l-2.718 2.717 2.728 2.728a.75.75 0 1 1-1.061 1.062l-2.728-2.728-2.728 2.728a.75.75 0 0 1-1.061-1.062l2.728-2.728-2.722-2.722a.75.75 0 0 1 1.061-1.061z"
    />
  </svg>
);

export const CloseIcon = React.forwardRef(Icon);
