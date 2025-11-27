"use client";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import ChatUI from "@/components/chatapp/chatui";

export default function ChatAppPage() {
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

  return (
    <div style={{ padding: 20 }}>
      <ChatUI />
    </div>
  );
}
