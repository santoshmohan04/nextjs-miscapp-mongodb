"use client";

import React from "react";
import { Nav, Badge } from "react-bootstrap";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  Heart,
  Bookmark,
  ChatDots,
  FileText,
  Person,
  GearFill,
} from "react-bootstrap-icons";
import styles from "./sidebar.module.css";

interface SidebarProps {
  onLinkClick?: () => void;
}

export default function Sidebar({ onLinkClick }: SidebarProps) {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user && "role" in user ? (user as any).role === "admin" : false;

  const menuItems = [
    {
      label: "Recipes",
      href: "/recipes",
      icon: Heart,
      badge: null,
    },
    {
      label: "Bookmarks",
      href: "/bookmarkslist",
      icon: Bookmark,
      badge: null,
    },
    {
      label: "Chat",
      href: "/chatapp",
      icon: ChatDots,
      badge: null,
    },
    {
      label: "Notes",
      href: "/docs",
      icon: FileText,
      badge: null,
    },
    {
      label: "Profile",
      href: "/profile",
      icon: Person,
      badge: null,
    },
    ...(isAdmin
      ? [
          {
            label: "Admin",
            href: "/authusers",
            icon: GearFill,
            badge: "Admin" as const,
          },
        ]
      : []),
  ];

  return (
    <div className={styles.sidebarContainer}>
      <div className={styles.sidebarBrand}>
        <h5 className={styles.brandText}>Menu</h5>
      </div>

      <Nav className={`${styles.navMenu} flex-column`}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              className={styles.navItem}
            >
              <Icon className={styles.navIcon} />
              <span className={styles.navLabel}>{item.label}</span>
              {item.badge && (
                <Badge
                  bg="danger"
                  className={styles.badge}
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </Nav>

      <div className={styles.sidebarFooter}>
        <div className={styles.userInfo}>
          {user && (
            <>
              <p className={styles.userName}>{user.name || "User"}</p>
              <small className={styles.userEmail}>{user.email}</small>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
