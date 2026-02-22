"use client";

import React, { useEffect } from "react";
import RecipeFilterExample from "@/components/recipe/RecipeFilterExample";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import AppShell from "@/components/AppShell";

export default function RecipesPage() {
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
    <AppShell pageTitle="Recipes">
      <RecipeFilterExample />
    </AppShell>
  );
}

