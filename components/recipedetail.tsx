import Dropdown from "react-bootstrap/Dropdown";
import React from "react";

export default function RecipeDetail() {
  return (
    <>
      <div className="row">
        <div className="col-xs-12">
          <img alt="" className="img-responsive" />
        </div>
      </div>
      <div className="row">
        <div className="col-xs-12">
          <h1></h1>
        </div>
      </div>
      <div className="row">
        <div className="col-xs-12">
          <Dropdown>
            <Dropdown.Toggle variant="success" id="dropdown-basic">
              Manage Recipe
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item href="#/action-1">To Shopping List</Dropdown.Item>
              <Dropdown.Item href="#/action-2">Edit Recipe</Dropdown.Item>
              <Dropdown.Item href="#/action-3">Delete Recipe</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
      <div className="row">
        <div className="col-xs-12"></div>
      </div>
      <div className="row">
        <div className="col-xs-12">
          <ul className="list-group">
            <li className="list-group-item"></li>
          </ul>
        </div>
      </div>
    </>
  );
}
