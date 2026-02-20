import { StarFill } from "react-bootstrap-icons";
import ThreeDotsMenu from "./ThreeDotsMenu";
import { Bookmark } from "@/store/bookmarks/types";

interface Props {
  item: Bookmark;
  onEdit: () => void;
  onDelete: () => void;
  onFavorite: (id: string) => void;
}

export default function BookmarkCard({ item, onEdit, onDelete, onFavorite }: Props) {
  return (
     <div className="card shadow-sm rounded overflow-hidden position-relative">
      
      {/* Three dots */}
      <div className="position-absolute" style={{ right: 10, top: 10 }}>
        <ThreeDotsMenu
          onEdit={onEdit}
          onDelete={onDelete}
          onFavorite={() => onFavorite(item._id)}
          favorite={item.favorite}
        />
      </div>

      {/* Thumbnail */}
      <img
        src={item.thumbnail}
        className="card-img-top"
        style={{ height: 180, objectFit: "cover" }}
        alt="thumbnail"
      />

      <div className="card-body">
        <h5 className="card-title fw-bold d-flex align-items-center gap-2">
          {item.title}
          {item.favorite && <StarFill color="gold" />}
        </h5>

        <p className="text-muted small">{item.description}</p>

        <div className="small text-muted mb-2">Category: <b>{item.category}</b></div>

        <a href={item.link} target="_blank" className="small fw-semibold">
          Visit website ↗
        </a>
      </div>
    </div>
  );
}
