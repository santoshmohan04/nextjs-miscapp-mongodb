"use client";

import RecipeItems from "./recipeitem";
import Modal from "react-bootstrap/Modal";
import React, { useState } from "react";
import AddRecipe from "./recipe/addrecipe";

export default function RecipeList() {
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const handleClose = () => {
    setShowAddRecipe(false);
  };

  const handleShow = () => {
    setShowAddRecipe(true);
  };
  return (
    <>
      <div className="row">
        <div className="col-xs-12">
          <button className="btn btn-success" onClick={() => handleShow()}>
            New Recipe
          </button>
        </div>
      </div>
      <hr />
      <div className="row">
        <div className="col-xs-12">
          <RecipeItems />
        </div>
      </div>
      <Modal size="lg" show={showAddRecipe} onHide={() => handleClose()}>
        <Modal.Header closeButton>
          <Modal.Title>Add Recipe</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AddRecipe onClose={() => handleClose()} />
        </Modal.Body>
      </Modal>
    </>
  );
}
