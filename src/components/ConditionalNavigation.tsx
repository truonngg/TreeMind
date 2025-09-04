"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import GlobalNavigation from "./GlobalNavigation";

export default function ConditionalNavigation() {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Don't render anything on server-side or if not on client yet
  if (!isClient) {
    return null;
  }
  
  // Don't show navigation on the welcome page (root path)
  if (pathname === "/") {
    return null;
  }
  
  return <GlobalNavigation />;
}
