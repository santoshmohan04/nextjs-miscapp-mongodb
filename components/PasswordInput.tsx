"use client";

import { useState } from "react";
import Form from "react-bootstrap/Form";
import { EyeFill, EyeSlashFill } from "react-bootstrap-icons";

export default function PasswordInput({ register, error, placeholder }: any) {
  const [show, setShow] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <Form.Control
        type={show ? "text" : "password"}
        placeholder={placeholder}
        {...register}
        isInvalid={!!error}
      />
      <span
        onClick={() => setShow(!show)}
        style={{
          position: "absolute",
          right: 10,
          top: "50%",
          transform: "translateY(-50%)",
          cursor: "pointer",
        }}
      >
        {show ? <EyeSlashFill /> : <EyeFill />}
      </span>

      {error && (
        <Form.Control.Feedback type="invalid">
          {error.message}
        </Form.Control.Feedback>
      )}
    </div>
  );
}
