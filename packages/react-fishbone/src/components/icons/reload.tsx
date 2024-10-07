import { type SVGProps, forwardRef } from "react";

const ReloadIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, forwardedRef) => (
	<svg
		ref={forwardedRef}
		xmlns="http://www.w3.org/2000/svg"
		fill="currentColor"
		viewBox="0 0 16 16"
		{...props}
	>
		<title>reload</title>
		<path d="m15.09 2.595-1.007.787A7.482 7.482 0 0 0 8.176.5 7.494 7.494 0 0 0 .678 7.991a7.498 7.498 0 0 0 14.544 2.579.143.143 0 0 0-.087-.184l-1.013-.348a.143.143 0 0 0-.18.085 6.112 6.112 0 0 1-1.421 2.22 6.102 6.102 0 0 1-4.341 1.8 6.095 6.095 0 0 1-4.342-1.8A6.11 6.11 0 0 1 2.04 7.998a6.111 6.111 0 0 1 1.798-4.344 6.103 6.103 0 0 1 4.341-1.8 6.096 6.096 0 0 1 4.342 1.8c.176.176.342.364.496.56l-1.075.84a.144.144 0 0 0-.015.212c.019.02.043.033.069.04l3.135.767a.143.143 0 0 0 .177-.137l.014-3.23a.144.144 0 0 0-.232-.111Z" />
	</svg>
));

ReloadIcon.displayName = "ReloadIcon";
export default ReloadIcon;
