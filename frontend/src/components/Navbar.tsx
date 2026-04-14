import Link from "next/link";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 h-20 border-b border-[#C7C7C7] bg-[#E3E2DE]/95 backdrop-blur-sm">
      <div className="mx-auto grid h-full max-w-7xl grid-cols-12 items-center gap-6 px-6 lg:px-12">
        <div className="col-span-3">
          <Link
            href="/"
            className="text-lg font-bold uppercase tracking-tight text-[#141414] no-underline"
          >
            Model Council
          </Link>
        </div>
        <div className="col-span-6" />
        <div className="col-span-3 flex items-center justify-end gap-6">
          <Link
            href="/history"
            className="text-sm font-semibold text-[#141414] no-underline hover:text-[#1351AA] transition-colors duration-300"
          >
            History
          </Link>
          <Link
            href="/about"
            className="text-sm font-semibold text-[#141414] no-underline hover:text-[#1351AA] transition-colors duration-300"
          >
            About
          </Link>
        </div>
      </div>
    </nav>
  );
}
