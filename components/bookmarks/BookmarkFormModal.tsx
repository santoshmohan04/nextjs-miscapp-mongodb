import { useState, useEffect, FormEvent } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { addBookmark, updateBookmark } from "@/store/bookmarks/actions";
import { Bookmark } from "@/store/bookmarks/types";

interface BookmarkFormModalProps {
  show: boolean;
  onClose: () => void;
  editing: Bookmark | null;
}

export default function BookmarkFormModal({
  show,
  onClose,
  editing,
}: BookmarkFormModalProps) {
  const dispatch = useDispatch<any>();

  const [form, setForm] = useState({
    title: "",
    link: "",
    description: "",
    category: "",
  });

  // Load data when editing
  useEffect(() => {
    if (editing) {
      setForm({
        title: editing.title,
        link: editing.link,
        description: editing.description,
        category: editing.category,
      });
    } else {
      setForm({
        title: "",
        link: "",
        description: "",
        category: "",
      });
    }
  }, [editing]);

  function submit(e: FormEvent) {
    e.preventDefault();

    if (editing) {
      // FIXED — correct argument format
      dispatch(updateBookmark(editing._id, form));
    } else {
      dispatch(addBookmark(form));
    }

    onClose();
  }

  return (
    <Modal show={show} onHide={onClose} centered>
      <Form onSubmit={submit}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editing ? "Edit Bookmark" : "Add Bookmark"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label>Title</Form.Label>
            <Form.Control
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Link</Form.Label>
            <Form.Control
              required
              value={form.link}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>Category</Form.Label>
            <Form.Control
              value={form.category}
              onChange={(e) =>
                setForm({ ...form, category: e.target.value })
              }
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}