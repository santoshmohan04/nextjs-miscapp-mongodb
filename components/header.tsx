"use client";

import React from "react";
import {
  Navbar,
  Container,
  Nav,
  Dropdown,
  Image,
} from "react-bootstrap";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { logoutUser } from "@/store/auth/authactions";
import { List } from "react-bootstrap-icons";
import ThemeToggle from "./ThemeToggle";
import styles from "./header.module.css";

interface HeaderProps {
  pageTitle?: string;
  onMenuToggle?: () => void;
}

const UserMenuToggle = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ children, onClick, className, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={[styles.dropdownToggle, className].filter(Boolean).join(" ")}
    onClick={(event) => {
      event.preventDefault();
      onClick?.(event);
    }}
    {...props}
  >
    {children}
  </button>
));

UserMenuToggle.displayName = "UserMenuToggle";

export default function Header({ pageTitle, onMenuToggle }: HeaderProps) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(logoutUser(router));
  };

  const getAvatarBgColor = () => {
    if (!user?.name) return "primary";
    const colors = ["primary", "success", "danger", "warning", "info"];
    const charCode = user.name.charCodeAt(0);
    return colors[charCode % colors.length];
  };

  const getInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Navbar
      expand="lg"
      collapseOnSelect
      className={styles.header}
      sticky="top"
    >
      <Container fluid className={styles.headerContainer}>
        {/* Mobile Menu Toggle + Brand */}
        <div className={styles.headerStart}>
          {isAuthenticated && (
            <button
              className={`${styles.menuToggleBtn} d-lg-none`}
              onClick={onMenuToggle}
              aria-label="Toggle menu"
            >
              <List size={24} />
            </button>
          )}
          <Navbar.Brand as={Link} href="/" className={styles.brand}>
            Misc Apps
          </Navbar.Brand>
        </div>

        {/* Page Title - Centered on desktop */}
        {pageTitle && (
          <div className={`${styles.pageTitle} d-none d-lg-block`}>
            <h4>{pageTitle}</h4>
          </div>
        )}

        {/* Auth Section - Right aligned */}
        <Nav className={styles.navEnd}>
          <div className={styles.actionsGroup}>
            <ThemeToggle />
            {isAuthenticated ? (
            <Dropdown align="end" className={styles.userDropdown}>
              <Dropdown.Toggle
                as={UserMenuToggle}
                id="user-dropdown"
                aria-label="Open user menu"
              >
                <div className={styles.avatarContainer}>
                  {user?.avatarKey ? (
                    <Image
                      src={`/avatars/${user.avatarKey}.svg`}
                      alt="User avatar"
                      className={styles.avatarImage}
                      roundedCircle
                    />
                  ) : user?.profilepic ? (
                    <Image
                      src={user.profilepic}
                      alt="User avatar"
                      className={styles.avatarImage}
                      roundedCircle
                    />
                  ) : (
                    <div
                      className={`${styles.avatarPlaceholder} bg-${getAvatarBgColor()}`}
                    >
                      <span className={styles.avatarInitials}>
                        {getInitials()}
                      </span>
                    </div>
                  )}
                </div>
              </Dropdown.Toggle>

              <Dropdown.Menu className={styles.dropdownMenu}>
                <Dropdown.Item disabled className={styles.userHeader}>
                  <small className="d-block text-muted">Signed in as</small>
                  <strong>{user?.name || "User"}</strong>
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item as={Link} href="/profile">
                  My Profile
                </Dropdown.Item>
                <Dropdown.Item as={Link} href="/profile">
                  Change Password
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout}>
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <>
              <Nav.Link as={Link} href="/auth" className={styles.authLink}>
                Login
              </Nav.Link>
              <Nav.Link as={Link} href="/auth" className={styles.authLink}>
                Signup
              </Nav.Link>
            </>
          )}
            </div>
        </Nav>
      </Container>
    </Navbar>
  );
}
