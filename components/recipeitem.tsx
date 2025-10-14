import React from "react";
export default function RecipeItems() {
  return (
    <a className="list-group-item clearfix">
      <div className="float-start text-wrap" style={{ width: "25rem" }}>
        <h4 className="list-group-item-heading"></h4>
        <p className="list-group-item-text"></p>
      </div>
      <span className="float-end">
        <img alt="" className="img-responsive" />
      </span>
    </a>
  );
}
