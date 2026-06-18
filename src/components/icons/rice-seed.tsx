import { type SVGProps } from "react";

interface RiceSeedIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export function RiceSeedIcon({
  size = 16,
  className,
  ...props
}: RiceSeedIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 128 128"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <defs>
        <ellipse id="seed" cx="0" cy="0" rx="4" ry="10" />
      </defs>
      <g fill="#D9B86C" stroke="#B08D3E" strokeWidth="0.5">
        <use href="#seed" x="64" y="30" transform="rotate(-25 64 30)" />
        <use href="#seed" x="52" y="40" transform="rotate(-15 52 40)" />
        <use href="#seed" x="76" y="40" transform="rotate(15 76 40)" />
        <use href="#seed" x="42" y="54" transform="rotate(-30 42 54)" />
        <use href="#seed" x="58" y="54" transform="rotate(-10 58 54)" />
        <use href="#seed" x="74" y="54" transform="rotate(10 74 54)" />
        <use href="#seed" x="90" y="54" transform="rotate(30 90 54)" />
        <use href="#seed" x="50" y="72" transform="rotate(-20 50 72)" />
        <use href="#seed" x="66" y="72" transform="rotate(0 66 72)" />
        <use href="#seed" x="82" y="72" transform="rotate(20 82 72)" />
      </g>
    </svg>
  );
}
