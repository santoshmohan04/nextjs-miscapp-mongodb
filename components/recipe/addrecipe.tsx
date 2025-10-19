"use client";

import CloseButton from "react-bootstrap/CloseButton";
import Button from "react-bootstrap/Button";
import React, { useState } from "react";

type IngredientInput = { name: string; quantity: string };

type InitialRecipe = {
  _id?: string;
  name?: string;
  description?: string;
  imagePath?: string;
  ingredients?: { name: string; amount: number }[];
};

type Props = {
  onClose?: () => void;
  initial?: InitialRecipe | null;
  onSaved?: (saved: any) => void;
};

export default function AddRecipe({ onClose, initial = null, onSaved }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [imagePath, setImagePath] = useState(initial?.imagePath ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [ingrediants, setIngrediants] = useState<IngredientInput[]>(
    (initial?.ingredients?.map((i) => ({
      name: i.name,
      quantity: String(i.amount),
    })) as IngredientInput[]) ?? [{ name: "", quantity: "" }]
  );

  const removeIngrediant = (index: number) => {
    const list = [...ingrediants];
    list.splice(index, 1);
    setIngrediants(list);
  };

  const addIngrediant = () => {
    setIngrediants([...ingrediants, { name: "", quantity: "" }]);
  };

  const updateIngrediant = (
    index: number,
    field: "name" | "quantity",
    value: string
  ) => {
    const list = [...ingrediants];
    list[index] = { ...list[index], [field]: value };
    setIngrediants(list);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // basic client-side validation
    if (!name.trim() || !description.trim() || !imagePath.trim()) {
      alert("Please fill name, description and image URL");
      return;
    }

    // normalize and filter out empty ingredient rows
    const filteredIngredients = ingrediants
      .map((i) => ({
        name: i.name?.trim() ?? "",
        amount: Number(i.quantity) || 0,
      }))
      .filter((i) => i.name !== "");

    if (filteredIngredients.length === 0) {
      alert("Please add at least one ingredient with a name.");
      return;
    }

    const payload = {
      name,
      description,
      imagePath,
      ingredients: filteredIngredients,
    };

    try {
      const method = initial?._id ? "PUT" : "POST";
      const url = initial?._id ? `/api/recipes/${initial._id}` : "/api/recipes";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const saved = await res.json();
      // reset form on create
      if (method === "POST") {
        setName("");
        setImagePath("");
        setDescription("");
        setIngrediants([{ name: "", quantity: "" }]);
        alert("Recipe created");
      } else {
        alert("Recipe updated");
      }
      if (onSaved) onSaved(saved);
      // notify other components that recipes changed so they can refresh
      try {
        // use a DOM CustomEvent so client components can listen globally
        if (typeof window !== "undefined" && "CustomEvent" in window) {
          window.dispatchEvent(
            new CustomEvent("recipes:changed", { detail: { saved } })
          );
        }
      } catch (e) {
        // noop
      }
      if (onClose) onClose();
    } catch (err: any) {
      console.error(err);
      alert("Error saving recipe: " + (err.message || err));
    }
  };
  return (
    <>
      <div className="row">
        <div className="col-7">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-control"
                />
              </div>
            </div>
            <div className="row mt-3">
              <div className="form-group">
                <label htmlFor="imagePath">Image URL</label>
                <input
                  type="text"
                  id="imagePath"
                  value={imagePath}
                  onChange={(e) => setImagePath(e.target.value)}
                  className="form-control"
                />
              </div>
            </div>
            <div className="row mt-3">
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-control"
                ></textarea>
              </div>
            </div>
            <div className="row mt-3">
              {ingrediants.map((ingrediant, index) => (
                <div className="row mb-3 align-items-center" key={index}>
                  <div className="col-8">
                    <input
                      type="text"
                      placeholder="name"
                      value={ingrediant.name}
                      onChange={(e) =>
                        updateIngrediant(index, "name", e.target.value)
                      }
                      className="form-control"
                    />
                  </div>
                  <div className="col-3">
                    <input
                      type="number"
                      placeholder="qty"
                      value={ingrediant.quantity}
                      onChange={(e) =>
                        updateIngrediant(index, "quantity", e.target.value)
                      }
                      className="form-control"
                    />
                  </div>
                  <CloseButton onClick={() => removeIngrediant(index)} />
                </div>
              ))}
              <div className="d-flex gap-2">
                <Button
                  type="button"
                  variant="success"
                  onClick={() => addIngrediant()}
                >
                  Add Ingredient
                </Button>
                <div className="ms-auto">
                  <button
                    type="submit"
                    className="btn btn-success me-3"
                    disabled={!name.trim()}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => (onClose ? onClose() : undefined)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
        <div className="col-5">
          <h5>Image Preview</h5>
          {imagePath.trim() ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imagePath} alt="Recipe Image" className="img-fluid" />
          ) : (
            <p>No image URL provided</p>
          )}
        </div>
      </div>
    </>
  );
}
