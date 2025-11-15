"use client";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  uploadProfilePic,
  changePassword,
  clearPasswordMessages,
} from "@/store/auth/authactions";
import { useToast } from "@/components/ToastMessage";

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user, loading, error, successMessage } = useSelector(
    (state: RootState) => state.auth
  );
  const { showToast } = useToast();

  // 🔹 Local state for form fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 🔹 Validation states
  const [isCurrentPasswordValid, setIsCurrentPasswordValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [doPasswordsMatch, setDoPasswordsMatch] = useState(false);

  // show password change form
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Profile picture upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // 🔹 Regex for validation
  const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;

  // 🔹 Run validation whenever values change
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }

    // 🔹 Validate password rules
    setIsCurrentPasswordValid(passwordRegex.test(currentPassword));
    setIsPasswordValid(passwordRegex.test(password));
    setDoPasswordsMatch(password !== "" && password === confirmPassword);
  }, [isAuthenticated, router, currentPassword, password, confirmPassword]);

  // ✅ Separate effect for success & error handling
  useEffect(() => {
    if (successMessage) {
      showToast(successMessage, "success");
      setCurrentPassword("");
      setPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
      // Optional: clear message after showing
      dispatch(clearPasswordMessages());
    }

    if (error) {
      showToast(error, "danger");
      dispatch(clearPasswordMessages());
    }
  }, [successMessage, error, dispatch]);

  const isFormValid =
    isCurrentPasswordValid && isPasswordValid && doPasswordsMatch;

  // ✅ Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      showToast("Please check your password rules or matching.", "warning");
      return;
    }

    dispatch(changePassword(currentPassword, password, confirmPassword));
  };

  // ✅ Show password change form
  const handleShowPasswordForm = () => {
    setShowPasswordForm(true);
  };

  // ✅ Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // ✅ Upload to backend (you can later store in MongoDB or S3)
  const handleUpload = async () => {
    if (!selectedFile) return showToast("Please select a file first!", "warning");

    setUploading(true);

    await dispatch(uploadProfilePic(selectedFile));

    setUploading(false);
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
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    {/* Left: Profile details */}
                    <div className="me-1 flex-grow-1">
                      <Card.Title>My Profile</Card.Title>
                      <div className="profile-details mb-3">
                        <p className="mb-1">
                          <strong>Username:</strong> {user.name}
                        </p>
                        <p className="mb-1">
                          <strong>Email:</strong> {user.email}
                        </p>
                        <p className="mb-3">
                          <strong>Last Updated:</strong>{" "}
                          {user.updatedAt
                            ? new Date(user.updatedAt).toLocaleString(
                                undefined,
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                            : "N/A"}
                        </p>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleShowPasswordForm}
                      >
                        Change Password
                      </Button>
                    </div>

                    {/* Right: Profile image */}
                    <div className="text-center">
                      <img
                        src={user.profilepic || "/default-avatar.png"}
                        alt="Profile"
                        style={{
                          width: "120px",
                          height: "120px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "2px solid #ddd",
                        }}
                      />
                      <Form.Group controlId="formFile" className="mb-2">
                        <Form.Control
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          size="sm"
                        />
                      </Form.Group>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleUpload}
                        disabled={uploading || !selectedFile}
                      >
                        {uploading ? "Uploading..." : "Upload Profile Pic"}
                      </Button>
                    </div>
                  </div>
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
                        controlId="formCurrentPassword"
                      >
                        <Form.Label column sm="4">
                          Current Password
                        </Form.Label>
                        <Col sm="8">
                          <Form.Control
                            type="password"
                            placeholder="Enter Current Password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            isInvalid={
                              currentPassword !== "" && !isCurrentPasswordValid
                            }
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
                        controlId="formPassword"
                      >
                        <Form.Label column sm="4">
                          New Password
                        </Form.Label>
                        <Col sm="8">
                          <Form.Control
                            type="password"
                            placeholder="Enter New Password"
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
