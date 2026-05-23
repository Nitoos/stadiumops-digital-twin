"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PersonaPicker } from "@/components/PersonaPicker";

export default function Home() {
  const router = useRouter();
  const [done, setDone] = useState(false);
  if (done) { router.push("/plan"); return null; }
  return <PersonaPicker onDone={() => setDone(true)} />;
}
