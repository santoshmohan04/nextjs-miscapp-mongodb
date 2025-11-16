"use client";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import BookmarksList from "@/components/bookmarks/bookmarkslist";

export default function BookmarksListPage() {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }
  return <BookmarksList />;
}