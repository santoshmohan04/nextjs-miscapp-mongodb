"use client";

import React, { useState } from "react";
import { Container, Row, Col, Offcanvas } from "react-bootstrap";
import Sidebar from "./Sidebar";
import Header from "./header";
import styles from "./appshell.module.css";

interface AppShellProps {
  children: React.ReactNode;
  pageTitle?: string;
}

export default function AppShell({ children, pageTitle }: AppShellProps) {
  const [showSidebar, setShowSidebar] = useState(false);

  const handleCloseSidebar = () => setShowSidebar(false);
  const handleShowSidebar = () => setShowSidebar(true);

  return (
    <div className={styles.appShellContainer}>
      {/* Header - Fixed at top */}
      <Header
        pageTitle={pageTitle}
        onMenuToggle={handleShowSidebar}
      />

      {/* Main Layout */}
      <Container fluid className={styles.mainContainer}>
        <Row className={styles.contentRow}>
          {/* Desktop Sidebar - Hidden on mobile */}
          <Col lg={2} className={`${styles.sidebarCol} d-none d-lg-block`}>
            <Sidebar onLinkClick={handleCloseSidebar} />
          </Col>

          {/* Mobile Offcanvas Sidebar */}
          <Offcanvas
            show={showSidebar}
            onHide={handleCloseSidebar}
            responsive="lg"
            placement="start"
            className={styles.offcanvasSidebar}
          >
            <Offcanvas.Header closeButton>
              <Offcanvas.Title className={styles.offcanvasTitle}>
                Menu
              </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body className={styles.offcanvasBody}>
              <Sidebar onLinkClick={handleCloseSidebar} />
            </Offcanvas.Body>
          </Offcanvas>

          {/* Main Content Area */}
          <Col lg={10} className={styles.contentCol}>
            <div className={styles.contentWrapper}>
              {children}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
