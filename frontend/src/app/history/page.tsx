"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { GridSection } from "@/components/GridSection";
import { SidebarLabel } from "@/components/SidebarLabel";

interface SessionSummary {
  id: string;
  question: string;
  status: string;
  confidence: string | null;
  created_at: string;
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/sessions?limit=50`)
      .then((r) => r.json())
      .then((data) => {
        setSessions(data.sessions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />
      <GridSection className="min-h-[80vh]">
        <div className="col-span-12 lg:col-span-3">
          <SidebarLabel>History</SidebarLabel>
        </div>
        <div className="col-span-12 lg:col-span-9">
          <h1 className="text-5xl font-bold leading-[0.9] tracking-[-0.03em] mb-12">
            PAST
            <br />
            SESSIONS
          </h1>

          {loading ? (
            <p className="text-sm text-[#7A7A7A]">Loading...</p>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-[#7A7A7A]">
              No sessions yet.{" "}
              <Link href="/" className="text-[#1351AA] underline">
                Ask the Council something.
              </Link>
            </p>
          ) : (
            <div>
              {sessions.map((s, i) => (
                <Link
                  key={s.id}
                  href={`/session?id=${s.id}`}
                  className="group flex items-start gap-6 border-t border-[#C7C7C7] py-6 no-underline"
                >
                  <span className="font-mono text-sm text-[#7A7A7A]">
                    {String(i + 1).padStart(3, "0")}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-xl lg:text-2xl font-bold text-[#141414] group-hover:text-[#1351AA] transition-colors duration-300">
                      {s.question}
                    </h3>
                    <div className="mt-1 flex gap-4 text-xs text-[#7A7A7A]">
                      <span>{new Date(s.created_at).toLocaleDateString()}</span>
                      <span className="uppercase">{s.status}</span>
                      {s.confidence && (
                        <span className="uppercase">{s.confidence}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </GridSection>
    </>
  );
}
