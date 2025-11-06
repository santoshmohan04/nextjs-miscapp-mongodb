"use client";
import { RootState } from "@/store/store";
import {
  Row,
  Col,
  Card,
  Button,
  Modal,
  Form,
  Pagination,
  InputGroup,
  FormControl,
} from "react-bootstrap";
import { PencilSquare, Trash, PlusLg } from "react-bootstrap-icons";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAuthUsers,
  addAuthUser,
  updateAuthUser,
  removeAuthUser,
} from "@/store/authusers/authusersactions";

export default function AuthUsersList() {
  const dispatch = useDispatch<any>();
  const { users, meta, loading } = useSelector(
    (state: RootState) => state.authUsers
  );
  const [page, setPage] = useState(1);
  const limit = 12;
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    profilepic: "",
  });
  const [q, setQ] = useState("");

  useEffect(() => {
    dispatch(fetchAuthUsers(page, limit, q));
  }, [dispatch, page, q]);

  function openCreate() {
    setEditing(null);
    setForm({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      profilepic: "",
    });
    setShowModal(true);
  }

  function openEdit(user: any) {
    setEditing(user);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      confirmPassword: "",
      profilepic: user.profilepic || "",
    });
    setShowModal(true);
  }

  function submitForm(e: React.FormEvent) {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    if (editing) {
      dispatch(
        updateAuthUser(editing._id, {
          name: form.name,
          email: form.email,
          profilePic: form.profilepic,
          ...(form.password ? { password: form.password } : {}),
        })
      );
    } else {
      dispatch(
        addAuthUser({
          name: form.name,
          email: form.email,
          password: form.password,
          profilePic: form.profilepic,
        })
      );
    }
    setShowModal(false);
  }

  function onDelete(id: string) {
    if (!confirm("Delete user?")) return;
    dispatch(removeAuthUser(id));
  }

  const totalPages = meta ? Math.ceil(meta.total / meta.limit) : 1;

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Auth Users</h3>
        <div>
          <InputGroup>
            <FormControl
              placeholder="Search name..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <Button variant="outline-secondary" onClick={() => setPage(1)}>
              Search
            </Button>
          </InputGroup>
        </div>
        <Button variant="primary" onClick={openCreate}>
          <PlusLg /> Create
        </Button>
      </div>

      <Row>
        {loading && <div>Loading...</div>}
        {!loading && users.length === 0 && <p>No users found.</p>}
        {users.map((u: any) => (
          <Col key={u._id} md={3} className="mb-4">
            <Card className="h-100">
              <Card.Img
                variant="top"
                src={
                  u.profilepic
                    ? u.profilepic
                    : "https://www.pngitem.com/pimgs/m/579-5798505_user-placeholder-svg-hd-png-download.png"
                }
                style={{ height: 160, objectFit: "cover" }}
              />
              <Card.Body>
                <Card.Title>{u.name}</Card.Title>
                <Card.Text className="text-truncate">{u.email}</Card.Text>
              </Card.Body>
              <Card.Footer className="d-flex justify-content-between">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => openEdit(u)}
                >
                  <PencilSquare />
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => onDelete(u._id)}
                >
                  <Trash />
                </Button>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>

      <div className="d-flex justify-content-center">
        <Pagination>
          <Pagination.First onClick={() => setPage(1)} disabled={page === 1} />
          <Pagination.Prev
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
          />
          {Array.from({ length: totalPages })
            .slice(Math.max(0, page - 3), page + 2)
            .map((_, idx) => {
              const p = idx + Math.max(1, page - 3);
              return (
                <Pagination.Item
                  key={p}
                  active={p === page}
                  onClick={() => setPage(p)}
                >
                  {p}
                </Pagination.Item>
              );
            })}
          <Pagination.Next
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
          />
          <Pagination.Last
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
          />
        </Pagination>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Form onSubmit={submitForm}>
          <Modal.Header closeButton>
            <Modal.Title>{editing ? "Edit User" : "Create User"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-2">
              <Form.Label>Name</Form.Label>
              <Form.Control
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Email</Form.Label>
              <Form.Control
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>
                Password {editing ? "(leave blank to keep)" : ""}
              </Form.Label>
              <Form.Control
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
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
            <Form.Group className="mb-2">
              <Form.Label>Profile Pic URL</Form.Label>
              <Form.Control
                value={form.profilepic}
                onChange={(e) =>
                  setForm({ ...form, profilepic: e.target.value })
                }
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editing ? "Update" : "Create"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
