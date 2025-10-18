"use client";

import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import AddRecipe from "./recipe/addrecipe";

type Ingredient = { name: string; amount: number };
type Recipe = {
  _id?: string;
  name: string;
  description?: string;
  imagePath?: string;
  ingredients?: Ingredient[];
};

export default function RecipeItems() {
  const [recipes, setRecipes] = useState<Recipe[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Recipe | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch("/api/recipes")
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        if (mounted) setRecipes(data);
      })
      .catch((err: any) => {
        if (mounted) setError(err.message || String(err));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // handlers inside component so they can update local state
  async function handleDelete(id?: string | undefined) {
    if (!id) return;
    if (!confirm("Delete this recipe?")) return;
    try {
      const res = await fetch(`/api/recipes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      setRecipes((prev) => prev?.filter((p) => p._id !== id) || null);
    } catch (err: any) {
      alert("Delete failed: " + (err.message || err));
    }
  }

  function handleSave(saved: Recipe) {
    setRecipes(
      (prev) => prev?.map((p) => (p._id === saved._id ? saved : p)) || null
    );
  }

  if (loading) return <div>Loading recipes…</div>;
  if (error) return <div className="text-danger">Error: {error}</div>;
  if (!recipes || recipes.length === 0) return <div>No recipes found</div>;

  return (
    <div className="list-group">
      {recipes.map((r) => (
        <div
          key={r._id || r.name}
          className="list-group-item d-flex align-items-stretch"
          style={{ gap: "1rem" }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="d-flex justify-content-between align-items-start">
              <h4 className="mb-1">{r.name}</h4>
              <div>
                <button
                  className="btn btn-sm btn-outline-primary me-2"
                  onClick={() => {
                    setEditing(r);
                    setShowEditModal(true);
                  }}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={async () => await handleDelete(r._id)}
                >
                  Delete
                </button>
              </div>
            </div>

            <p
              className="mb-2"
              style={{
                whiteSpace: "pre-wrap",
                overflowWrap: "anywhere",
                wordBreak: "break-word",
                marginBottom: "0.5rem",
              }}
            >
              {r.description}
            </p>
            {r.ingredients && r.ingredients.length > 0 && (
              <small className="text-muted">
                Ingredients: {r.ingredients.map((i) => i.name).join(", ")}
              </small>
            )}
          </div>
          {r.imagePath ? (
            // eslint-disable-next-line @next/next/no-img-element
            <div style={{ width: 140, height: "100%", display: "flex" }}>
              <img
                src={r.imagePath}
                alt={r.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: 6,
                }}
              />
            </div>
          ) : null}
        </div>
      ))}
      <Modal
        size="lg"
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Recipe</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editing && (
            <AddRecipe
              initial={editing}
              onSaved={handleSave}
              onClose={() => setShowEditModal(false)}
            />
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}
