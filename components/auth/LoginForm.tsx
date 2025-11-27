"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema } from "@/utils/validationSchemas";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { loginRequest } from "@/store/auth/authActions";
import { useRouter } from "next/navigation";

import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";

import PasswordInput from "@/components/PasswordInput";
import { useToast } from "@/components/ToastMessage";

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginForm() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { showToast } = useToast();

  const { loading, error, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    mode: "onChange",
  });

  // Redirect after login
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/recipes");
    }
  }, [isAuthenticated]);

  // Show toast on error
  useEffect(() => {
    if (error) {
      showToast(error, "danger", 3000);
    }
  }, [error, showToast]);

  const onSubmit = (data: LoginFormData) => {
    dispatch(loginRequest(data.email, data.password));
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      {/* Email */}
      <Form.Group className="mb-3">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          placeholder="Enter email"
          autoComplete="off"
          {...register("email")}
          isInvalid={!!errors.email}
        />
        <Form.Control.Feedback type="invalid">
          {errors.email?.message}
        </Form.Control.Feedback>
      </Form.Group>

      {/* Password */}
      <Form.Group className="mb-4">
        <Form.Label>Password</Form.Label>
        <PasswordInput
          register={register("password")}
          error={errors.password}
          placeholder="Enter password"
        />
      </Form.Group>

      {/* Submit Button */}
      <Button
        variant="primary"
        type="submit"
        className="w-100 d-flex align-items-center justify-content-center"
        disabled={!isValid || loading}
      >
        {loading ? (
          <>
            <Spinner animation="border" size="sm" className="me-2" />
            Logging in...
          </>
        ) : (
          "Login"
        )}
      </Button>
    </Form>
  );
}
