"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Alert, Badge, Button, Card, Col, Form, Row, Spinner } from "react-bootstrap";
import AppShell from "@/components/AppShell";

interface NoteItem {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface NotesApiResponse {
  success: boolean;
  data?: NoteItem[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    count: number;
  };
  error?: {
    message?: string;
  };
}

export default function NotesListPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(8);
  const [totalPages, setTotalPages] = useState(1);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [isAuthenticated, authLoading, router]);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));

    if (search.trim()) params.set("search", search.trim());
    if (tagFilter.trim()) params.set("tag", tagFilter.trim());

    return params.toString();
  }, [page, limit, search, tagFilter]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch(`/api/notes?${queryString}`, {
        credentials: "include",
      });

      const result: NotesApiResponse = await response.json();

      if (!response.ok || !result.success) {
        setErrorMessage(result.error?.message ?? "Failed to fetch notes");
        setNotes([]);
        setTotalPages(1);
        return;
      }

      setNotes(Array.isArray(result.data) ? result.data : []);
      setTotalPages(result.meta?.totalPages ?? 1);
    } catch {
      setErrorMessage("Failed to fetch notes");
      setNotes([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchNotes();
  }, [isAuthenticated, queryString]);

  const resetCreateForm = () => {
    setTitle("");
    setContent("");
    setTags("");
    setPinned(false);
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      setErrorMessage("Title is required");
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");

      const response = await fetch("/api/notes", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          content,
          tags,
          pinned,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setErrorMessage(result.error?.message ?? "Failed to create note");
        return;
      }

      resetCreateForm();
      setPage(1);
      await fetchNotes();
    } catch {
      setErrorMessage("Failed to create note");
    } finally {
      setSaving(false);
    }
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    fetchNotes();
  };

  if (authLoading || !isAuthenticated) {
    return null;
  }

  return (
    <AppShell pageTitle="Notes">
    <div className="py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">My Notes</h3>
      </div>

      {errorMessage && (
        <Alert variant="danger" className="mb-3">
          {errorMessage}
        </Alert>
      )}

      <Card className="mb-4">
        <Card.Header>Create Note</Card.Header>
        <Card.Body>
          <Form onSubmit={handleCreate}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Note title"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Tags (comma separated)</Form.Label>
                  <Form.Control
                    value={tags}
                    onChange={(event) => setTags(event.target.value)}
                    placeholder="work, idea, personal"
                  />
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group>
                  <Form.Label>Content (Markdown)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    placeholder="Write markdown content..."
                  />
                </Form.Group>
              </Col>
              <Col xs={12} className="d-flex justify-content-between align-items-center">
                <Form.Check
                  type="switch"
                  id="create-note-pinned"
                  label="Pinned"
                  checked={pinned}
                  onChange={(event) => setPinned(event.target.checked)}
                />
                <Button type="submit" disabled={saving}>
                  {saving ? "Creating..." : "Create Note"}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <Card className="mb-3">
        <Card.Body>
          <Form onSubmit={handleSearchSubmit}>
            <Row className="g-2 align-items-end">
              <Col md={5}>
                <Form.Group>
                  <Form.Label>Search</Form.Label>
                  <Form.Control
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search title or content"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Filter by tag</Form.Label>
                  <Form.Control
                    value={tagFilter}
                    onChange={(event) => setTagFilter(event.target.value)}
                    placeholder="example: work"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <div className="d-flex gap-2">
                  <Button type="submit" className="w-100">
                    Apply
                  </Button>
                  <Button
                    variant="outline-secondary"
                    className="w-100"
                    onClick={() => {
                      setSearch("");
                      setTagFilter("");
                      setPage(1);
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {loading ? (
        <div className="text-center py-4">
          <Spinner animation="border" />
        </div>
      ) : notes.length === 0 ? (
        <Card>
          <Card.Body className="text-center text-muted">No notes found.</Card.Body>
        </Card>
      ) : (
        <Row className="g-3">
          {notes.map((note) => (
            <Col md={6} lg={4} key={note._id}>
              <Card className="h-100">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title className="mb-0 fs-5">{note.title}</Card.Title>
                    {note.pinned && <Badge bg="warning" text="dark">Pinned</Badge>}
                  </div>
                  <Card.Text className="text-muted" style={{ minHeight: 72 }}>
                    {note.content?.slice(0, 140) || "No content"}
                    {note.content && note.content.length > 140 ? "..." : ""}
                  </Card.Text>
                  <div className="d-flex flex-wrap gap-1 mb-3">
                    {note.tags?.map((tag) => (
                      <Badge key={`${note._id}-${tag}`} bg="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Link href={`/notes/${note._id}`} className="btn btn-outline-primary btn-sm">
                    Open Note
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <div className="d-flex justify-content-center align-items-center gap-2 mt-4">
        <Button variant="outline-secondary" disabled={page === 1} onClick={() => setPage((prev) => prev - 1)}>
          Previous
        </Button>
        <span>
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline-secondary"
          disabled={page >= totalPages}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Next
        </Button>
      </div>
    </div>
    </AppShell>
  );
}
