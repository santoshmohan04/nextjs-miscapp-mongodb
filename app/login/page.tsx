"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema } from "@/utils/validationSchemas";
import { useRouter } from "next/navigation";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import { RootState, AppDispatch } from "@/store/store";
import { loginRequest } from "@/store/auth/authactions";

interface LoginFormData {
  email: string;
  password: string;
}

export default function Login() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { loading, error, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/recipes");
    }
  }, [isAuthenticated, router]);

  const onSubmit = (data: LoginFormData) => {
    dispatch(loginRequest(data.email, data.password));
  };

  if (!mounted) return null;

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto" }}>
      <h2 className="mb-4">Login</h2>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Form.Group className="mb-3" controlId="formEmail">
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

        <Form.Group className="mb-3" controlId="formPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            autoComplete="off"
            {...register("password")}
            isInvalid={!!errors.password}
          />
          <Form.Control.Feedback type="invalid">
            {errors.password?.message}
          </Form.Control.Feedback>
        </Form.Group>

        {error && <Alert variant="danger">{error}</Alert>}
        {loading && <Alert variant="info">Logging in...</Alert>}

        <Button variant="primary" type="submit" disabled={!isValid || loading}>
          Login
        </Button>
      </Form>
    </div>
  );
}
