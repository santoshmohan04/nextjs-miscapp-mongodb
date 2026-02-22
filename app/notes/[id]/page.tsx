"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import ReactMarkdown from "react-markdown";
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

interface ApiResponse {
  success: boolean;
  data?: NoteItem;
  error?: {
    message?: string;
  };
}

export default function NoteDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [pinned, setPinned] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | undefined>(undefined);

  const id = useMemo(() => params?.id ?? "", [params]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchNote = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch(`/api/notes/${id}`, {
        credentials: "include",
      });
      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success || !result.data) {
        setErrorMessage(result.error?.message ?? "Failed to load note");
        return;
      }

      const note = result.data;
      setTitle(note.title ?? "");
      setContent(note.content ?? "");
      setTags(Array.isArray(note.tags) ? note.tags.join(", ") : "");
      setPinned(Boolean(note.pinned));
      setUpdatedAt(note.updatedAt);
    } catch {
      setErrorMessage("Failed to load note");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !id) return;
    fetchNote();
  }, [isAuthenticated, id]);

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      setErrorMessage("Title is required");
      return;
    }

    try {
      setSaving(true);
      setErrorMessage("");

      const response = await fetch(`/api/notes/${id}`, {
        method: "PUT",
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

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success || !result.data) {
        setErrorMessage(result.error?.message ?? "Failed to update note");
        return;
      }

      setUpdatedAt(result.data.updatedAt);
      setTags(Array.isArray(result.data.tags) ? result.data.tags.join(", ") : "");
    } catch {
      setErrorMessage("Failed to update note");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this note permanently?")) return;

    try {
      setDeleting(true);
      setErrorMessage("");

      const response = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setErrorMessage(result.error?.message ?? "Failed to delete note");
        return;
      }

      router.push("/notes");
    } catch {
      setErrorMessage("Failed to delete note");
    } finally {
      setDeleting(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <AppShell pageTitle="Loading...">
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
      </AppShell>
    );
  }

  return (
    <AppShell pageTitle="Note Detail">
    <div className="py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Note Detail</h3>
        <div className="d-flex gap-2">
          <Link href="/notes" className="btn btn-outline-secondary">
            Back to Notes
          </Link>
          <Button variant="outline-danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {errorMessage && (
        <Alert variant="danger" className="mb-3">
          {errorMessage}
        </Alert>
      )}

      <Form onSubmit={handleSave}>
        <Row className="g-3">
          <Col lg={6}>
            <Card>
              <Card.Header>Edit</Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Title</Form.Label>
                  <Form.Control
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Tags (comma separated)</Form.Label>
                  <Form.Control
                    value={tags}
                    onChange={(event) => setTags(event.target.value)}
                    placeholder="work, meeting"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Markdown Content</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={14}
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                  />
                </Form.Group>

                <div className="d-flex justify-content-between align-items-center">
                  <Form.Check
                    type="switch"
                    id="note-pinned"
                    label="Pinned"
                    checked={pinned}
                    onChange={(event) => setPinned(event.target.checked)}
                  />
                  <Button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6}>
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <span>Markdown Preview</span>
                {pinned && <Badge bg="warning" text="dark">Pinned</Badge>}
              </Card.Header>
              <Card.Body>
                <h4>{title || "Untitled"}</h4>
                <div className="d-flex flex-wrap gap-1 mb-3">
                  {tags
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean)
                    .map((tag) => (
                      <Badge key={tag} bg="secondary">
                        {tag}
                      </Badge>
                    ))}
                </div>

                <div style={{ minHeight: 320 }}>
                  {content.trim() ? (
                    <ReactMarkdown>{content}</ReactMarkdown>
                  ) : (
                    <p className="text-muted mb-0">Nothing to preview.</p>
                  )}
                </div>

                {updatedAt && (
                  <small className="text-muted d-block mt-3">
                    Last updated: {new Date(updatedAt).toLocaleString()}
                  </small>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
    </AppShell>
  );
}
