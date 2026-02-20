"use client";

import { useEffect, useState } from "react";
import {
  Button,
  InputGroup,
  FormControl,
  Row,
  Col,
  Pagination,
} from "react-bootstrap";
import {
  PlusLg,
  Grid3x3GapFill,
  ListUl,
} from "react-bootstrap-icons";

import { useDispatch, useSelector } from "react-redux";

import {
  fetchAuthUsers,
  removeAuthUser,
} from "@/store/authusers/authusersactions";

import UserCard from "@/components/users/UserCard";
import UserListItem from "@/components/users/UserListItem";
import {
  UserCardSkeleton,
  UserListSkeleton,
} from "@/components/users/UserSkeleton";

import UserFormModal from "@/components/users/UserFormModal";
import { useToast } from "@/components/ToastMessage";

export default function AuthUsersPage() {
  const dispatch = useDispatch<any>();
  const { showToast } = useToast();

  // Redux state
  const { users, loading, meta } = useSelector((state: any) => state.authUsers);

  // UI state
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const limit = 12;

  // Fetch data
  useEffect(() => {
    dispatch(fetchAuthUsers(page, limit, q));
  }, [page, q, dispatch]);

  // Open Create modal
  function openCreate() {
    setEditingUser(null);
    setShowModal(true);
  }

  // Open Edit modal
  function openEdit(user: any) {
    setEditingUser(user);
    setShowModal(true);
  }

  // Delete user
  async function onDelete(id: string) {
    if (!confirm("Delete user permanently?")) return;
    await dispatch(removeAuthUser(id));
    showToast("User deleted successfully", "success");
  }

  // Pagination pages
  const totalPages = meta ? Math.ceil(meta.total / meta.limit) : 1;

  return (
    <div className="container py-4">

      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">

        <h3 className="fw-bold">Auth Users</h3>

        {/* Search */}
        <InputGroup style={{ width: 350 }}>
          <FormControl
            placeholder="Search name..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <Button variant="outline-secondary" onClick={() => setPage(1)}>
            Search
          </Button>
        </InputGroup>

        {/* View Toggle */}
        <div>
          <Button
            variant={view === "grid" ? "primary" : "outline-primary"}
            onClick={() => setView("grid")}
            className="me-2"
          >
            <Grid3x3GapFill />
          </Button>

          <Button
            variant={view === "list" ? "primary" : "outline-primary"}
            onClick={() => setView("list")}
          >
            <ListUl />
          </Button>
        </div>

        {/* Create Button */}
        <Button variant="primary" onClick={openCreate}>
          <PlusLg /> Create
        </Button>
      </div>

      <hr />

      {/* GRID or LIST VIEW */}
      {view === "grid" ? (
        <Row>
          {loading
            ? [...Array(8)].map((_, i) => (
                <Col key={i} md={3} className="mb-4">
                  <UserCardSkeleton />
                </Col>
              ))
            : users.map((u: any) => (
                <Col key={u._id} md={3} className="mb-4">
                  <UserCard
                    user={u}
                    onEdit={() => openEdit(u)}
                    onDelete={() => onDelete(u._id)}
                  />
                </Col>
              ))}
        </Row>
      ) : (
        <div>
          {loading
            ? [...Array(8)].map((_, i) => <UserListSkeleton key={i} />)
            : users.map((u: any) => (
                <UserListItem
                  key={u._id}
                  user={u}
                  onEdit={() => openEdit(u)}
                  onDelete={() => onDelete(u._id)}
                />
              ))}
        </div>
      )}

      {/* PAGINATION */}
      <div className="d-flex justify-content-center mt-4">
        <Pagination>
          <Pagination.First onClick={() => setPage(1)} disabled={page === 1} />
          <Pagination.Prev
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
          />

          {[...Array(totalPages)].map((_, i) => (
            <Pagination.Item
              key={i + 1}
              active={i + 1 === page}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </Pagination.Item>
          ))}

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

      {/* FORM MODAL */}
      {showModal && (
        <UserFormModal
          show={showModal}
          onHide={() => setShowModal(false)}
          editingUser={editingUser}
        />
      )}
    </div>
  );
}