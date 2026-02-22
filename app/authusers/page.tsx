"use client";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import AuthUsersList from "@/components/authuserslist";
import AppShell from "@/components/AppShell";

export default function AuthUsersPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [isAuthenticated, loading, router]);

  if (loading || !isAuthenticated) {
    return null;
  }
  return (
    <AppShell pageTitle="Admin - Users">
      <AuthUsersList />
    </AppShell>
  );
}
