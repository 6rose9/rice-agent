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
        <ellipse id="seed" cx="0" cy="0" rx="4" ry="16" />
      </defs>
      <g fill="#e7b339" stroke="#c58c06" strokeWidth="0.5">
        <use href="#seed" x="70" y="15" transform="rotate(-25 64 30)" />
        <use href="#seed" x="50" y="20" transform="rotate(-15 52 40)" />
        <use href="#seed" x="75" y="30" transform="rotate(15 76 40)" />
        <use href="#seed" x="40" y="40" transform="rotate(-30 42 54)" />
        <use href="#seed" x="55" y="50" transform="rotate(-10 58 54)" />
        <use href="#seed" x="75" y="60" transform="rotate(10 74 54)" />
        <use href="#seed" x="90" y="70" transform="rotate(30 90 54)" />
        <use href="#seed" x="50" y="80" transform="rotate(-20 50 72)" />
        <use href="#seed" x="65" y="90" transform="rotate(0 66 72)" />
        <use href="#seed" x="90" y="100" transform="rotate(20 82 72)" />
      </g>
    </svg>
  );
}
