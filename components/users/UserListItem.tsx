// components/users/UserListItem.tsx
"use client";
import { Button } from "react-bootstrap";
import { PencilSquare, Trash } from "react-bootstrap-icons";

export default function UserListItem({ user, onEdit, onDelete }: any) {
  return (
    <div className="d-flex align-items-center p-2 border rounded mb-2 shadow-sm">
      <img
        src={user.profilepic}
        style={{
          width: 50,
          height: 50,
          borderRadius: "50%",
          objectFit: "cover",
          marginRight: 15,
        }}
      />

      <div className="flex-grow-1">
        <div className="fw-bold">{user.name}</div>
        <div className="text-muted">{user.email}</div>
      </div>

      <Button size="sm" variant="outline-primary" className="me-2" onClick={onEdit}>
        <PencilSquare />
      </Button>
      <Button size="sm" variant="outline-danger" onClick={onDelete}>
        <Trash />
      </Button>
    </div>
  );
}
