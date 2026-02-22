"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export default function Home() {
  const router = useRouter();

  const { isAuthenticated, loading } = useSelector(
    (state: RootState) => state.auth
  );

  // Redirect once session state is known
  useEffect(() => {
    if (loading) return; // Wait until restoreSession finishes

    if (isAuthenticated) {
      router.push("/home");
    } else {
      router.push("/auth");
    }
  }, [isAuthenticated, loading, router]);

  return <div>Redirecting…</div>;
}
