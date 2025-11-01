"use client";

import { useState, useEffect } from "react";

export interface ItemsData {
  name: string;
  description: string;
  _id: string;
}

export default function MongoItems() {
  const [items, setItems] = useState<ItemsData[]>([]);
  const [form, setForm] = useState({ name: "", description: "" });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const res = await fetch("/api/items");
    const data = await res.json();
    setItems(data.data);
  };

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });
      fetchItems();
      setForm({ name: "", description: "" });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="container">
      <h1>Items</h1>
      <form onSubmit={handleSubmit} className="d-flex gap-2">
        <input
          name="name"
          placeholder="Item name"
          value={form.name}
          onChange={handleChange}
        />
        <input
          name="description"
          placeholder="Item description"
          value={form.description}
          onChange={handleChange}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={form.name === ""}
        >
          Add Item
        </button>
      </form>
      <div className="mt-3">
        <ul>
          {items.map((item) => (
            <li key={item._id}>
              {item.name} - {item.description}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
