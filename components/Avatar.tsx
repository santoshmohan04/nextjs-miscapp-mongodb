"use client";

import React from "react";
import Image from "next/image";
import styles from "./avatar.module.css";

interface AvatarProps {
  avatarKey?: string;
  profilepic?: string;
  name?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Avatar({
  avatarKey,
  profilepic,
  name = "User",
  size = "md",
  className = "",
}: AvatarProps) {
  const sizeMap = {
    sm: 48,
    md: 80,
    lg: 120,
  };

  const pixelSize = sizeMap[size];

  // Priority: avatarKey > profilepic > initials
  if (avatarKey) {
    return (
      <div
        className={`${styles.avatar} ${styles[`size-${size}`]} ${className}`}
        title={name}
      >
        <Image
          src={`/avatars/${avatarKey}.svg`}
          alt={name}
          width={pixelSize}
          height={pixelSize}
          unoptimized
        />
      </div>
    );
  }

  if (profilepic) {
    return (
      <div
        className={`${styles.avatar} ${styles[`size-${size}`]} ${className}`}
        title={name}
      >
        <Image
          src={profilepic}
          alt={name}
          width={pixelSize}
          height={pixelSize}
          className={styles.profilePic}
        />
      </div>
    );
  }

  // Initials fallback
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const colors = [
    "#667eea",
    "#764ba2",
    "#f093fb",
    "#f5576c",
    "#4facfe",
    "#00f2fe",
    "#fa709a",
    "#fee140",
  ];
  const charCode = name.charCodeAt(0);
  const bgColor = colors[charCode % colors.length];

  return (
    <div
      className={`${styles.avatar} ${styles[`size-${size}`]} ${className}`}
      title={name}
      style={{
        backgroundColor: bgColor,
      }}
    >
      <span className={styles.initials}>{initials}</span>
    </div>
  );
}
