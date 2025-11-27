"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { restoreSession } from "@/store/auth/authActions";

export default function Home() {
  const router = useRouter();
  const dispatch = useDispatch<any>();

  const { isAuthenticated, loading } = useSelector(
    (state: RootState) => state.auth
  );

  // Restore session on page load
  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  // Redirect once session state is known
  useEffect(() => {
    if (loading) return; // Wait until restoreSession finishes

    if (isAuthenticated) {
      router.push("/recipes");
    } else {
      router.push("/auth");
    }
  }, [isAuthenticated, loading, router]);

  return <div>Redirecting…</div>;
}
