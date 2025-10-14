import React from "react";
import RecipeItems from "./recipeitem";

export default function RecipeList() {
  return (
    <>
      <div className="row">
        <div className="col-xs-12">
          <button className="btn btn-success">New Recipe</button>
        </div>
      </div>
      <hr />
      <div className="row">
        <div className="col-xs-12">
          <RecipeItems />
        </div>
      </div>
    </>
  );
}
