"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { useToast } from "@/components/ToastMessage";
import { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import axios from "axios";

const forgotSchema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
});

interface ForgotFormData {
  email: string;
}

export default function ForgotPasswordPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ForgotFormData>({
    resolver: yupResolver(forgotSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: ForgotFormData) => {
    try {
      setLoading(true);

      const res = await axios.post("/api/auth/forgot-password", data, {
        withCredentials: true,
      });

      showToast(res.data.message || "Email sent!", "success", 3000);
    } catch (err: any) {
      showToast(
        err.response?.data?.error || "Something went wrong",
        "danger",
        3000
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto" }}>
      <h2 className="mb-4">Forgot Password</h2>

      <Form onSubmit={handleSubmit(onSubmit)}>
        {/* Email */}
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter your email"
            {...register("email")}
            isInvalid={!!errors.email}
          />
          <Form.Control.Feedback type="invalid">
            {errors.email?.message}
          </Form.Control.Feedback>
        </Form.Group>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-100 d-flex align-items-center justify-content-center"
          disabled={!isValid || loading}
        >
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />{" "}
              Sending...
            </>
          ) : (
            "Send Reset Link"
          )}
        </Button>
      </Form>
    </div>
  );
}
