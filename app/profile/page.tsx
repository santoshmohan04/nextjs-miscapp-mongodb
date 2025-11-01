"use client";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );

  // 🔹 Local state for form fields
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 🔹 Validation states
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [doPasswordsMatch, setDoPasswordsMatch] = useState(false);

  // show password change form
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // 🔹 Regex for validation
  const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;

  // 🔹 Run validation whenever values change
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
    setIsPasswordValid(passwordRegex.test(password));
    setDoPasswordsMatch(password !== "" && password === confirmPassword);
  }, [isAuthenticated, router, password, confirmPassword]);

  const isFormValid = isPasswordValid && doPasswordsMatch;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      // handle password update logic here
      alert("Password updated successfully!");
    }
  };

  const handleShowPasswordForm = () => {
    setShowPasswordForm(true);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mt-5">
      <h1></h1>
      {user && (
        <>
          <Row className="g-4">
            <Col md={6}>
              <Card style={{ width: "40rem" }}>
                <Card.Body>
                  <Card.Title>My Profile</Card.Title>
                  <Card.Text>
                    <div className="profile-details">
                      <div>
                        <strong>Username:</strong> {user.name}
                      </div>
                      <div>
                        <strong>Email:</strong> {user.email}
                      </div>
                      <div>
                        <strong>Last Updated:</strong> {user.updatedAt}
                      </div>
                    </div>
                  </Card.Text>
                  <Card.Link>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleShowPasswordForm}
                    >
                      Change Password
                    </Button>
                  </Card.Link>
                </Card.Body>
              </Card>
            </Col>
            {showPasswordForm && (
              <Col md={6}>
                <Card style={{ width: "40rem" }}>
                  <Card.Body>
                    <Form>
                      <Card.Title className="mb-3">Change Password</Card.Title>
                      <Form.Group
                        as={Row}
                        className="mb-3"
                        controlId="formPassword"
                      >
                        <Form.Label column sm="4">
                          Password
                        </Form.Label>
                        <Col sm="8">
                          <Form.Control
                            type="password"
                            placeholder="Enter Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            isInvalid={password !== "" && !isPasswordValid}
                          />
                          <Form.Control.Feedback type="invalid">
                            Password must be at least 8 characters, contain one
                            uppercase letter and one special character.
                          </Form.Control.Feedback>
                        </Col>
                      </Form.Group>

                      <Form.Group
                        as={Row}
                        className="mb-3"
                        controlId="formConfirmPassword"
                      >
                        <Form.Label column sm="4">
                          Confirm Password
                        </Form.Label>
                        <Col sm="8">
                          <Form.Control
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            isInvalid={
                              confirmPassword !== "" && !doPasswordsMatch
                            }
                          />
                          <Form.Control.Feedback type="invalid">
                            Passwords do not match.
                          </Form.Control.Feedback>
                        </Col>
                      </Form.Group>
                      {/* Submit Button */}
                      <Button
                        variant="success"
                        size="sm"
                        type="submit"
                        disabled={!isFormValid}
                        onClick={handleSubmit}
                      >
                        Update Password
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
            )}
          </Row>
        </>
      )}
    </div>
  );
}
