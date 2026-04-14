interface GridSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function GridSection({ children, className = "" }: GridSectionProps) {
  return (
    <section
      className={`grid grid-cols-12 gap-6 border-t border-[#C7C7C7] px-6 py-12 lg:px-12 ${className}`}
    >
      {children}
    </section>
  );
}
