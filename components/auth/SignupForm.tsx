"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { signupSchema } from "@/utils/validationSchemas";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { registerUser } from "@/store/auth/authActions";
import { useRouter } from "next/navigation";

import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";

import PasswordInput from "@/components/PasswordInput";
import { useToast } from "@/components/ToastMessage";

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  reenterPassword: string;
}

export default function SignupForm() {
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
  } = useForm<SignupFormData>({
    resolver: yupResolver(signupSchema),
    mode: "onChange",
  });

  const onSubmit = (data: SignupFormData) => {
    dispatch(registerUser(data.name, data.email, data.password));
  };

  // Success redirect
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/recipes");
    }
  }, [isAuthenticated]);

  // Show toast for error
  useEffect(() => {
    if (error) showToast(error, "danger", 3000);
  }, [error, showToast]);

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      {/* Name */}
      <Form.Group className="mb-3">
        <Form.Label>Name</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter your name"
          {...register("name")}
          isInvalid={!!errors.name}
        />
        <Form.Control.Feedback type="invalid">
          {errors.name?.message}
        </Form.Control.Feedback>
      </Form.Group>

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

      {/* Password */}
      <Form.Group className="mb-3">
        <Form.Label>Password</Form.Label>
        <PasswordInput
          register={register("password")}
          error={errors.password}
          placeholder="Enter password"
        />
      </Form.Group>

      {/* Re-enter Password */}
      <Form.Group className="mb-4">
        <Form.Label>Re-enter Password</Form.Label>
        <PasswordInput
          register={register("reenterPassword")}
          error={errors.reenterPassword}
          placeholder="Confirm password"
        />
      </Form.Group>

      {/* Submit */}
      <Button
        variant="primary"
        type="submit"
        disabled={!isValid || loading}
        className="w-100 d-flex align-items-center justify-content-center"
      >
        {loading ? (
          <>
            <Spinner animation="border" size="sm" className="me-2" />
            Signing up...
          </>
        ) : (
          "Signup"
        )}
      </Button>
    </Form>
  );
}
