// components/users/UserFormModal.tsx
"use client";

import {
  Modal,
  Form,
  Button,
  Row,
  Col,
  Spinner
} from "react-bootstrap";

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";

import {
  addAuthUser,
  updateAuthUser,
} from "@/store/authusers/authusersactions";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/utils/firebaseConfig";

import { useToast } from "@/components/ToastMessage";

export default function UserFormModal({ show, onHide, editingUser }: any) {
  const dispatch = useDispatch<any>();
  const { showToast } = useToast();

  // ----------------------------
  // FORM STATE
  // ----------------------------
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    profilepic: "",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // ----------------------------
  // LOAD USER DATA FOR EDIT MODE
  // ----------------------------
  useEffect(() => {
    if (editingUser) {
      setForm({
        name: editingUser.name,
        email: editingUser.email,
        password: "",
        confirmPassword: "",
        profilepic: editingUser.profilepic || "",
      });

      setPreview(editingUser.profilepic || null);
      setSelectedFile(null);
    } else {
      setForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        profilepic: "",
      });

      setPreview(null);
      setSelectedFile(null);
    }
  }, [editingUser, show]);

  // ----------------------------
  // FILE HANDLER
  // ----------------------------
  function handleFileChange(e: any) {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  }

  // ----------------------------
  // SUBMIT HANDLER
  // ----------------------------
  async function handleSubmit(e: any) {
    e.preventDefault();

    setSaving(true);

    try {
      if (form.password && form.password !== form.confirmPassword) {
        showToast("Passwords do not match", "warning");
        setSaving(false);
        return;
      }

      let profilePicURL = form.profilepic;

      // -------- Upload new image if selected --------
      if (selectedFile) {
        try {
          setUploading(true);

          const storageRef = ref(
            storage,
            `authusers/${Date.now()}-${selectedFile.name}`
          );
          const snapshot = await uploadBytes(storageRef, selectedFile);

          profilePicURL = await getDownloadURL(snapshot.ref);
        } catch {
          showToast("Image upload failed", "danger");
          setSaving(false);
          return;
        } finally {
          setUploading(false);
        }
      }

      // -------- Build Payload --------
      const payload: any = {
        name: form.name,
        email: form.email,
        profilepic: profilePicURL,
      };

      // Create (password required)
      if (!editingUser) {
        payload.password = form.password;
      }

      // Edit (password optional)
      if (editingUser && form.password) {
        payload.password = form.password;
      }

      // -------- Dispatch Action --------
      if (editingUser) {
        await dispatch(updateAuthUser(editingUser._id, payload));
        showToast("User updated successfully", "success");
      } else {
        await dispatch(addAuthUser(payload));
        showToast("User created successfully", "success");
      }

      onHide();
    } catch {
      showToast("Something went wrong!", "danger");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{editingUser ? "Edit User" : "Create User"}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Row>
            {/* LEFT SIDE */}
            <Col md={7}>
              <Form.Group className="mb-2">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>
                  Password {editingUser ? "(optional)" : ""}
                </Form.Label>
                <Form.Control
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm({ ...form, confirmPassword: e.target.value })
                  }
                />
              </Form.Group>
            </Col>

            {/* RIGHT SIDE */}
            <Col md={5} className="text-center">
              <Form.Label>Profile Picture</Form.Label>

              <div className="mb-3">
                {preview || form.profilepic ? (
                  <img
                    src={preview || form.profilepic}
                    alt="preview"
                    style={{
                      width: 150,
                      height: 150,
                      objectFit: "cover",
                      borderRadius: "50%",
                      border: "2px solid #ccc",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 150,
                      height: 150,
                      background: "#eee",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "2px solid #ccc",
                    }}
                  >
                    No Image
                  </div>
                )}
              </div>

              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            disabled={saving || uploading}
          >
            {saving || uploading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                />{" "}
                {editingUser ? "Updating..." : "Creating..."}
              </>
            ) : editingUser ? (
              "Update"
            ) : (
              "Create"
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}