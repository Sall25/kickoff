import { memo } from "react";

type SvgProps = React.ComponentPropsWithoutRef<"svg">;

export const CopyIcon = memo(({ className, ...props }: SvgProps) => {
  return (
    <svg
      width="24"
      height="24"
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5 4a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1 1 1 0 1 1 0 2 3 3 0 0 1-3-3V5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3 1 1 0 1 1-2 0 1 1 0 0 0-1-1H5Zm5 3a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h9a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3h-9Zm-1 3a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1v-9Z"
        fill="currentColor"
      ></path>
    </svg>
  );
});

CopyIcon.displayName = "CopyIcon";
