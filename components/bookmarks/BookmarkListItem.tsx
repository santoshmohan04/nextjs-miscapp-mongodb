import { Button } from "react-bootstrap";
import { Star, StarFill } from "react-bootstrap-icons";
import { Bookmark } from "@/store/bookmarks/types";
import ThreeDotsMenu from "./ThreeDotsMenu";

interface BookmarkListItemProps {
  item: Bookmark;
  onEdit: (item: Bookmark) => void;
  onDelete: (id: string) => void;
  onFavorite: (id: string) => void;
}

export default function BookmarkListItem({
  item,
  onEdit,
  onDelete,
  onFavorite,
}: BookmarkListItemProps) {
  return (
    <div className="d-flex border rounded p-3 mb-3 align-items-start gap-3 bg-white shadow-sm">

      {/* Thumbnail */}
      <img
        src={item.thumbnail}
        alt="thumbnail"
        style={{
          width: 160,
          height: 100,
          objectFit: "cover",
          borderRadius: 8,
        }}
      />

      {/* Details */}
      <div className="flex-grow-1">
        <h4 className="fw-bold d-flex align-items-center gap-2 mb-1">
          {item.title}
          {item.favorite && <span><StarFill color="gold" /></span>}
        </h4>

        <p className="mb-1 text-muted">{item.description}</p>

        <div className="small text-muted mb-2">Category: <b>{item.category}</b></div>

        <a href={item.link} target="_blank" className="small">
          {item.link}
        </a>
      </div>

      {/* 3 dots menu */}
      <ThreeDotsMenu
        onEdit={onEdit}
        onDelete={onDelete}
        onFavorite={() => onFavorite(item._id)}
        favorite={item.favorite}
      />
    </div>
  );
}