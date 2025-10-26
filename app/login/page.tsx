"use client";

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema } from '@/utils/validationSchemas';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';

type Props = {
  onSuccess?: () => void;
};

interface LoginFormData {
  email: string;
  password: string;
}

export default function Login({ onSuccess }: Props) {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: LoginFormData) => {
    setSubmitted(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json?.error || 'Login failed');
        return;
      }
      try {
        localStorage.setItem('auth', '1');
      } catch (e) {
        // ignore storage errors
      }
      if (onSuccess) onSuccess();
      router.push('/');
    } catch (err: any) {
      setErrorMsg(err.message || String(err));
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto' }}>
      <h2 className="mb-4">Login</h2>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Form.Group className="mb-3" controlId="formEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            {...register('email')}
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
            {...register('password')}
            isInvalid={!!errors.password}
          />
          <Form.Control.Feedback type="invalid">
            {errors.password?.message}
          </Form.Control.Feedback>
        </Form.Group>

        {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
        {submitted && !errorMsg && (
          <Alert variant="success">Form submitted successfully!</Alert>
        )}

        <Button variant="primary" type="submit" disabled={!isValid}>
          Login
        </Button>
      </Form>
    </div>
  );
}
