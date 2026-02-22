"use client";

import { useState, useEffect } from "react";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Card from "react-bootstrap/Card";
import Login from "@/components/auth/LoginForm";
import Signup from "@/components/auth/SignupForm";

export default function AuthPage() {
  const [key, setKey] = useState("login");

  return (
    <div className="container">
    <div
      style={{
        maxWidth: "450px",
        margin: "60px auto",
      }}
    >
      <Card className="shadow-lg p-4 rounded-4">
        <Tabs
          id="auth-tabs"
          activeKey={key}
          onSelect={(k) => setKey(k || "login")}
          className="mb-3"
          justify
        >
          <Tab eventKey="login" title="Login">
            <Login />
          </Tab>

          <Tab eventKey="signup" title="Signup">
            <Signup />
          </Tab>
        </Tabs>
      </Card>
    </div>
    </div>
  );
}
