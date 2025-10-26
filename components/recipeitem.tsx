"use client";

import React, { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import AddRecipe from "./recipe/addrecipe";
import Pagination from "react-bootstrap/Pagination";

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
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 5;

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

  // refresh list when a recipe is created/updated elsewhere
  useEffect(() => {
    const handler = (e: Event) => {
      // re-run the fetch logic by setting loading then fetching
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
      // no need to set mounted false here; this handler runs per event
    };

    if (typeof window !== "undefined") {
      window.addEventListener("recipes:changed", handler);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("recipes:changed", handler);
      }
    };
  }, []);

  // reset to page 1 whenever the recipes array changes length (e.g., after create)
  useEffect(() => {
    setCurrentPage(1);
  }, [recipes?.length]);

  // handlers inside component so they can update local state
  async function handleDelete(id?: string | undefined) {
    if (!id) return;
    if (!confirm("Delete this recipe?")) return;
    try {
      const res = await fetch(`/api/recipes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      // update recipes and ensure current page remains valid
      const newRecipes = recipes?.filter((p) => p._id !== id) || null;
      setRecipes(newRecipes);
      const newTotalPages = Math.max(1, Math.ceil((newRecipes?.length || 0) / PAGE_SIZE));
      setCurrentPage((cur) => Math.min(cur, newTotalPages));
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

  const totalPages = Math.max(1, Math.ceil(recipes.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const displayedRecipes = recipes.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <div className="list-group">
  {displayedRecipes.map((r) => (
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
      <Pagination className="mt-3 d-flex justify-content-end">
        <Pagination.First disabled={currentPage === 1} onClick={() => setCurrentPage(1)} />
        <Pagination.Prev disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} />
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <Pagination.Item key={p} active={p === currentPage} onClick={() => setCurrentPage(p)}>
            {p}
          </Pagination.Item>
        ))}
        <Pagination.Next disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} />
        <Pagination.Last disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)} />
      </Pagination>
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
