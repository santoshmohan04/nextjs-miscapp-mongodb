"use client";

import { Provider } from "react-redux";
import { store } from "./store";
import { useEffect, useRef } from "react";
import { restoreSession } from "@/store/auth/authactions";

export function Providers({ children }: { children: React.ReactNode }) {
  const hasRestoredSession = useRef(false);

  useEffect(() => {
    if (hasRestoredSession.current) return;
    hasRestoredSession.current = true;
    store.dispatch<any>(restoreSession());
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
