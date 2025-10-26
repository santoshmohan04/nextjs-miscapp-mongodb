"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [authed, setAuthed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const v = localStorage.getItem("auth");
      if (v) {
        setAuthed(true);
        // redirect to the recipes route when authenticated
        router.push("/recipes");
      } else {
        // redirect to the login route when not authenticated
        router.push("/login");
      }
    } catch (e) {
      setAuthed(false);
      router.push("/login");
    }
  }, []);

  return <div>Redirecting…</div>;
}
