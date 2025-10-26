"use client";

import CloseButton from "react-bootstrap/CloseButton";
import Button from "react-bootstrap/Button";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addRecipe, updateRecipe } from "@/store/recipies/recipiesactions";
import { Recipe } from "@/store/recipies/recipiesreducers";

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
  onSaved?: (saved: Recipe) => void;
};

export default function AddRecipe({ onClose, initial = null, onSaved }: Props) {
  const dispatch = useDispatch();

  const [name, setName] = useState(initial?.name ?? "");
  const [imagePath, setImagePath] = useState(initial?.imagePath ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [ingredients, setIngredients] = useState<IngredientInput[]>(
    (initial?.ingredients?.map((i) => ({
      name: i.name,
      quantity: String(i.amount),
    })) as IngredientInput[]) ?? [{ name: "", quantity: "" }]
  );

  const removeIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const addIngredient = () => {
    setIngredients((prev) => [...prev, { name: "", quantity: "" }]);
  };

  const updateIngredient = (index: number, field: "name" | "quantity", value: string) => {
    setIngredients((prev) =>
      prev.map((ing, i) => (i === index ? { ...ing, [field]: value } : ing))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !description.trim() || !imagePath.trim()) {
      alert("Please fill name, description and image URL");
      return;
    }

    const filteredIngredients = ingredients
      .map((i) => ({ name: i.name.trim(), amount: Number(i.quantity) || 0 }))
      .filter((i) => i.name !== "");

    if (filteredIngredients.length === 0) {
      alert("Please add at least one ingredient with a name.");
      return;
    }

    const payload = { name, description, imagePath, ingredients: filteredIngredients };

    try {
      let saved: Recipe;
      if (initial?._id) {
        saved = await dispatch(updateRecipe(initial._id, payload) as any);
        alert("Recipe updated");
      } else {
        saved = await dispatch(addRecipe(payload) as any);
        setName("");
        setImagePath("");
        setDescription("");
        setIngredients([{ name: "", quantity: "" }]);
        alert("Recipe created");
      }

      if (onSaved) onSaved(saved);
      if (onClose) onClose();
    } catch (err: any) {
      console.error(err);
      alert("Error saving recipe: " + (err.message || err));
    }
  };

  return (
    <div className="row">
      <div className="col-7">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-control"
            />
          </div>

          <div className="form-group mt-3">
            <label htmlFor="imagePath">Image URL</label>
            <input
              id="imagePath"
              type="text"
              value={imagePath}
              onChange={(e) => setImagePath(e.target.value)}
              className="form-control"
            />
          </div>

          <div className="form-group mt-3">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-control"
            />
          </div>

          <div className="row mt-3">
            {ingredients.map((ingredient, index) => (
              <div className="row mb-3 align-items-center" key={index}>
                <div className="col-8">
                  <input
                    type="text"
                    placeholder="name"
                    value={ingredient.name}
                    onChange={(e) => updateIngredient(index, "name", e.target.value)}
                    className="form-control"
                  />
                </div>
                <div className="col-3">
                  <input
                    type="number"
                    placeholder="qty"
                    value={ingredient.quantity}
                    onChange={(e) => updateIngredient(index, "quantity", e.target.value)}
                    className="form-control"
                  />
                </div>
                <CloseButton onClick={() => removeIngredient(index)} />
              </div>
            ))}

            <div className="d-flex gap-2">
              <Button type="button" variant="success" onClick={addIngredient}>
                Add Ingredient
              </Button>
              <div className="ms-auto">
                <button type="submit" className="btn btn-success me-3" disabled={!name.trim()}>
                  Save
                </button>
                <button type="button" className="btn btn-danger" onClick={onClose}>
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
          <img src={imagePath} alt="Recipe Image" className="img-fluid" />
        ) : (
          <p>No image URL provided</p>
        )}
      </div>
    </div>
  );
}