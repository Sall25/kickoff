import { memo } from "react";

type SvgProps = React.ComponentPropsWithoutRef<"svg">;

export const LinkIcon = memo(({ className, ...props }: SvgProps) => {
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
        d="M14.19 9.188a4.5 4.5 0 0 1 1.242 7.244l-4 4a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757a1 1 0 1 1 1.415 1.414l-1.758 1.757a2.5 2.5 0 1 0 3.536 3.536l4-4a2.5 2.5 0 0 0-.69-4.025 1 1 0 1 1 .862-1.805ZM9.81 14.812a4.5 4.5 0 0 1-1.242-7.244l4-4a4.5 4.5 0 0 1 6.364 6.364l-1.757 1.757a1 1 0 1 1-1.415-1.414l1.758-1.757a2.5 2.5 0 1 0-3.536-3.536l-4 4a2.5 2.5 0 0 0 .69 4.025 1 1 0 1 1-.862 1.805Z"
        fill="currentColor"
      ></path>
    </svg>
  );
});

LinkIcon.displayName = "LinkIcon";
