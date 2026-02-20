// components/bookmarks/ThreeDotsMenu.tsx
"use client";
import { useState } from "react";
import { ThreeDotsVertical, PencilSquare, Trash, Star, StarFill } from "react-bootstrap-icons";

export default function ThreeDotsMenu({ onEdit, onDelete, onFavorite, favorite }: any) {
  const [open, setOpen] = useState(false);

  return (
    <div className="position-relative">
      <div
        style={{ cursor: "pointer" }}
        onClick={() => setOpen(!open)}
        className="p-1"
      >
        <ThreeDotsVertical size={20} />
      </div>

      {open && (
        <div
          className="position-absolute bg-white shadow rounded p-2"
          style={{ right: 0, top: 25, zIndex: 10, width: 140 }}
        >
          <div className="dropdown-item d-flex align-items-center gap-2" onClick={onEdit}>
            <PencilSquare /> Edit
          </div>
          <div className="dropdown-item d-flex align-items-center gap-2" onClick={onDelete}>
            <Trash /> Delete
          </div>
          <div className="dropdown-item d-flex align-items-center gap-2" onClick={onFavorite}>
            {favorite ? <StarFill color="gold" /> : <Star />} Favorite
          </div>
        </div>
      )}
    </div>
  );
}
