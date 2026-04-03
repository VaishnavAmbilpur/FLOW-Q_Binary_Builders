"use client";

import ModernLanding from "@/components/ModernLanding";
import MobileLanding from "@/components/MobileLanding";
import { useIsMobile } from "@/hooks/useIsMobile";

export default function Home() {
  const isMobile = useIsMobile();

  return (
    <>
      {isMobile ? <MobileLanding /> : <ModernLanding />}
    </>
  );
}
