"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBookmarks,
  deleteBookmark,
  toggleFavorite,
} from "@/store/bookmarks/actions";

import {
  Button,
  InputGroup,
  FormControl,
  Pagination,
  Row,
  Col,
} from "react-bootstrap";
import { Grid3x3GapFill, ListUl, PlusLg } from "react-bootstrap-icons";

import BookmarkListItem from "@/components/bookmarks/BookmarkListItem";
import BookmarkCard from "@/components/bookmarks/BookmarkCard";
import BookmarkFormModal from "@/components/bookmarks/BookmarkFormModal";

export default function BookmarksPage() {
  const dispatch = useDispatch<any>();
  const { list = [], loading = false } = useSelector(
    (state: any) => state.bookmarks ?? {}
  );

  const [view, setView] = useState<"list" | "grid">("list");
  const [page, setPage] = useState(1);
  const limit = 6;

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchBookmarks());
  }, []);

  // Prevent failures
  const safeList = Array.isArray(list) ? list : [];

  const filtered = safeList.filter((b: any) =>
    b?.title?.toLowerCase().includes(search.toLowerCase())
  );

  // favorites on top
  const sorted = [
    ...filtered.filter((b: any) => b.favorite),
    ...filtered.filter((b: any) => !b.favorite),
  ];

  const totalPages = Math.max(1, Math.ceil(sorted.length / limit));
  const paginated = sorted.slice((page - 1) * limit, page * limit);

  function openCreate() {
    setEditing(null);
    setShowModal(true);
  }

  function openEdit(item: any) {
    setEditing(item);
    setShowModal(true);
  }

  const hasData = sorted.length > 0;

  return (
    <div
      className="container py-4"
      style={{
        maxHeight: "calc(100vh - 100px)",
        overflowY: "auto",
      }}
    >
      {/* TITLE */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold">My Bookmarks</h3>

        <Button variant="success" onClick={openCreate}>
          <PlusLg /> New Bookmark
        </Button>
      </div>

      {/* Show search + view buttons ONLY WHEN DATA EXISTS */}
      {hasData && (
        <div className="d-flex justify-content-between align-items-center mb-3">
          <InputGroup style={{ width: 350 }}>
            <FormControl
              placeholder="Search bookmarks..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </InputGroup>

          <div>
            <Button
              variant={view === "list" ? "primary" : "outline-primary"}
              className="me-2"
              onClick={() => setView("list")}
            >
              <ListUl />
            </Button>

            <Button
              variant={view === "grid" ? "primary" : "outline-primary"}
              onClick={() => setView("grid")}
            >
              <Grid3x3GapFill />
            </Button>
          </div>
        </div>
      )}

      {/* NO DATA MESSAGE */}
      {!loading && !hasData && (
        <div className="text-center py-5 text-muted fs-5">
          No bookmarks found. Click <strong>New Bookmark</strong> to add one.
        </div>
      )}

      {/* LIST VIEW */}
      {hasData && view === "list" && (
        <div>
          {paginated.map((item: any) => (
            <BookmarkListItem
              key={item._id}
              item={item}
              onEdit={() => openEdit(item)}
              onDelete={() => dispatch(deleteBookmark(item._id))}
              onFavorite={() => dispatch(toggleFavorite(item._id))}
            />
          ))}
        </div>
      )}

      {/* GRID VIEW */}
      {hasData && view === "grid" && (
        <Row>
          {paginated.map((item: any) => (
            <Col md={4} key={item._id} className="mb-4">
              <BookmarkCard
                item={item}
                onEdit={() => openEdit(item)}
                onDelete={() => dispatch(deleteBookmark(item._id))}
                onFavorite={() => dispatch(toggleFavorite(item._id))}
              />
            </Col>
          ))}
        </Row>
      )}

      {/* PAGINATION — Only show when list has data */}
      {hasData && (
        <div className="d-flex justify-content-center mt-3">
          <Pagination>
            <Pagination.First
              disabled={page === 1}
              onClick={() => setPage(1)}
            />
            <Pagination.Prev
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            />
            {[...Array(totalPages)].map((_, i) => (
              <Pagination.Item
                key={i + 1}
                active={page === i + 1}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </Pagination.Item>
            ))}

            <Pagination.Next
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            />
            <Pagination.Last
              disabled={page === totalPages}
              onClick={() => setPage(totalPages)}
            />
          </Pagination>
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <BookmarkFormModal
          show={showModal}
          editing={editing}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
