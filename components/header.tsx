"use client";

import React from "react";
import Container from "react-bootstrap/Container";
import Link from "next/link";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { logoutUser } from "@/store/auth/authactions";

export default function Header() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(logoutUser(router));
  };

  return (
    <Navbar
      collapseOnSelect
      expand="lg"
      className="bg-body-tertiary"
      bg="primary"
      data-bs-theme="dark"
    >
      <Container>
        <Navbar.Brand href="/">Misc Apps</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            {isAuthenticated && (
              <>
                <Nav.Link as={Link} href="/recipes">
                  Recipes
                </Nav.Link>
                <Nav.Link as={Link} href="/authusers">
                  Auth Users
                </Nav.Link>
                <Nav.Link as={Link} href="/bookmarkslist">
                  Bookmarks
                </Nav.Link>
              </>
            )}
          </Nav>
          <Nav>
            {isAuthenticated ? (
              <>
                <Nav.Link href="#" onClick={handleLogout}>
                  Logout
                </Nav.Link>
                <Nav.Link as={Link} href="/profile">
                  My Profile
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link as={Link} href="/login">
                  Login
                </Nav.Link>
                <Nav.Link as={Link} href="/signup">
                  Signup
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
