type Variant = "primary" | "secondary";

interface PosterButtonProps {
  children: React.ReactNode;
  variant?: Variant;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}

export function PosterButton({
  children,
  variant = "primary",
  onClick,
  type = "button",
  disabled = false,
  className = "",
}: PosterButtonProps) {
  const base =
    "px-8 py-4 text-sm font-bold uppercase tracking-wider transition-colors duration-300 ease-linear cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const variants: Record<Variant, string> = {
    primary: "bg-[#1351AA] text-[#E3E2DE] hover:bg-[#141414]",
    secondary: "bg-[#141414] text-[#E3E2DE] hover:bg-[#1351AA]",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
