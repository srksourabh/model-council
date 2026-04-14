interface SidebarLabelProps {
  children: React.ReactNode;
  meta?: string;
}

export function SidebarLabel({ children, meta }: SidebarLabelProps) {
  return (
    <div className="sticky top-[128px] self-start">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7A7A7A]">
        {children}
      </p>
      {meta && (
        <p className="mt-2 font-mono text-xs text-[#7A7A7A]">{meta}</p>
      )}
    </div>
  );
}
