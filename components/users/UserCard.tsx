// components/users/UserCard.tsx
"use client";
import { Card, Button } from "react-bootstrap";
import { PencilSquare, Trash } from "react-bootstrap-icons";

export default function UserCard({ user, onEdit, onDelete }: any) {
  return (
    <Card className="shadow-sm user-card h-100">
      <img
        src={
          user.profilepic ||
          "https://www.pngitem.com/pimgs/m/579-5798505_user-placeholder-svg-hd-png-download.png"
        }
        alt={user.name}
        style={{
          width: "100%",
          height: 200,
          objectFit: "cover",
        }}
      />

      <Card.Body>
        <Card.Title className="mb-1">{user.name}</Card.Title>
        <Card.Text className="text-muted text-truncate">{user.email}</Card.Text>
      </Card.Body>

      <Card.Footer className="d-flex justify-content-between">
        <Button size="sm" variant="outline-primary" onClick={onEdit}>
          <PencilSquare />
        </Button>
        <Button size="sm" variant="outline-danger" onClick={onDelete}>
          <Trash />
        </Button>
      </Card.Footer>
    </Card>
  );
}