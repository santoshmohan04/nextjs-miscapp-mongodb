"use client";

import React, { useEffect, useState } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { useRouter } from "next/navigation";

export default function Header() {
  const [authed, setAuthed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const v = localStorage.getItem("auth");
      setAuthed(!!v);
    } catch (e) {
      setAuthed(false);
    }
  }, []);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    } catch (err) {
      // ignore
    }
    try {
      localStorage.removeItem("auth");
    } catch (e) {
      // ignore
    }
    setAuthed(false);
    router.push("/");
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
            {authed && <Nav.Link href="/">Recipes</Nav.Link>}
          </Nav>
          <Nav>
            {authed ? (
              <>
                <Nav.Link href="#" onClick={handleLogout}>
                  Logout
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link href="/login">Login</Nav.Link>
                <Nav.Link href="/signup">Signup</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
