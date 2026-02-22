"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Badge, Button, Card, Col, Form, Row, Spinner } from "react-bootstrap";

type Ingredient = {
  name: string;
  amount: number;
};

type Recipe = {
  _id: string;
  name: string;
  description: string;
  imagePath?: string;
  ingredients: Ingredient[];
  favorite?: boolean;
  tags?: string[];
};

type RecipesResponse = {
  success: boolean;
  data?: Recipe[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: {
    message?: string;
  };
};

function formatScaledAmount(amount: number, factor: number): string {
  const scaled = amount * factor;
  if (!Number.isFinite(scaled)) return "0";
  if (Math.abs(scaled - Math.round(scaled)) < 0.0001) return String(Math.round(scaled));
  return scaled.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
}

export default function RecipeFilterExample() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");
  const [tag, setTag] = useState("");
  const [favoriteFilter, setFavoriteFilter] = useState<"all" | "true" | "false">("all");
  const [appliedFilters, setAppliedFilters] = useState({
    q: "",
    tag: "",
    favoriteFilter: "all" as "all" | "true" | "false",
  });

  const [page, setPage] = useState(1);
  const [limit] = useState(6);
  const [totalPages, setTotalPages] = useState(1);

  const [scaleByRecipe, setScaleByRecipe] = useState<Record<string, number>>({});
  const [checklistMode, setChecklistMode] = useState<Record<string, boolean>>({});
  const [checkedIngredients, setCheckedIngredients] = useState<Record<string, Record<string, boolean>>>({});
  const lastFetchedQueryRef = useRef<string | null>(null);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));

    if (appliedFilters.q.trim()) params.set("q", appliedFilters.q.trim());
    if (appliedFilters.tag.trim()) params.set("tag", appliedFilters.tag.trim());
    if (appliedFilters.favoriteFilter !== "all") {
      params.set("favorite", appliedFilters.favoriteFilter);
    }

    return params.toString();
  }, [page, limit, appliedFilters]);

  const fetchRecipes = async (force = false) => {
    try {
      if (!force && lastFetchedQueryRef.current === queryString) {
        return;
      }

      lastFetchedQueryRef.current = queryString;
      setLoading(true);
      setError("");

      const response = await fetch(`/api/recipes?${queryString}`, {
        credentials: "include",
      });
      const result: RecipesResponse = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error?.message ?? "Failed to fetch recipes");
        setRecipes([]);
        setTotalPages(1);
        return;
      }

      setRecipes(Array.isArray(result.data) ? result.data : []);
      setTotalPages(result.meta?.totalPages ?? 1);
    } catch {
      setError("Failed to fetch recipes");
      setRecipes([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [queryString]);

  const applyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAppliedFilters({
      q: q.trim(),
      tag: tag.trim(),
      favoriteFilter,
    });
    setPage(1);
  };

  const toggleIngredientChecked = (recipeId: string, ingredientName: string) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [recipeId]: {
        ...(prev[recipeId] ?? {}),
        [ingredientName]: !(prev[recipeId]?.[ingredientName] ?? false),
      },
    }));
  };

  return (
    <div className="py-3">
      <Card className="mb-3">
        <Card.Body>
          <Form onSubmit={applyFilters}>
            <Row className="g-2 align-items-end">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Search by name</Form.Label>
                  <Form.Control
                    value={q}
                    onChange={(event) => setQ(event.target.value)}
                    placeholder="e.g. pasta"
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group>
                  <Form.Label>Tag</Form.Label>
                  <Form.Control
                    value={tag}
                    onChange={(event) => setTag(event.target.value)}
                    placeholder="e.g. dinner"
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group>
                  <Form.Label>Favorite</Form.Label>
                  <Form.Select
                    value={favoriteFilter}
                    onChange={(event) =>
                      setFavoriteFilter(event.target.value as "all" | "true" | "false")
                    }
                  >
                    <option value="all">All</option>
                    <option value="true">Favorites only</option>
                    <option value="false">Non-favorites</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={2}>
                <div className="d-flex gap-2">
                  <Button type="submit" className="w-100">
                    Apply
                  </Button>
                  <Button
                    variant="outline-secondary"
                    className="w-100"
                    onClick={() => {
                      setQ("");
                      setTag("");
                      setFavoriteFilter("all");
                      setAppliedFilters({
                        q: "",
                        tag: "",
                        favoriteFilter: "all",
                      });
                      setPage(1);
                    }}
                  >
                    Reset
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-4">
          <Spinner animation="border" />
        </div>
      ) : recipes.length === 0 ? (
        <Card>
          <Card.Body className="text-center text-muted">No recipes found.</Card.Body>
        </Card>
      ) : (
        <Row className="g-3">
          {recipes.map((recipe) => {
            const factor = scaleByRecipe[recipe._id] ?? 1;
            const ingredientCheckedMap = checkedIngredients[recipe._id] ?? {};
            const checklistEnabled = checklistMode[recipe._id] ?? false;

            return (
              <Col md={6} key={recipe._id}>
                <Card className="h-100">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Card.Title className="mb-0">{recipe.name}</Card.Title>
                      {recipe.favorite && (
                        <Badge bg="warning" text="dark">
                          Favorite
                        </Badge>
                      )}
                    </div>

                    <Card.Text className="text-muted">{recipe.description}</Card.Text>

                    <div className="d-flex flex-wrap gap-1 mb-3">
                      {(recipe.tags ?? []).map((recipeTag) => (
                        <Badge key={`${recipe._id}-${recipeTag}`} bg="secondary">
                          {recipeTag}
                        </Badge>
                      ))}
                    </div>

                    <div className="d-flex align-items-center gap-2 mb-3">
                      <Form.Label className="mb-0">Scale</Form.Label>
                      <Form.Control
                        type="number"
                        min={0.1}
                        step={0.1}
                        value={factor}
                        onChange={(event) => {
                          const next = Number(event.target.value);
                          setScaleByRecipe((prev) => ({
                            ...prev,
                            [recipe._id]: Number.isFinite(next) && next > 0 ? next : 1,
                          }));
                        }}
                        style={{ maxWidth: 90 }}
                      />

                      <Form.Check
                        type="switch"
                        id={`checklist-${recipe._id}`}
                        label="Checklist mode"
                        checked={checklistEnabled}
                        onChange={(event) =>
                          setChecklistMode((prev) => ({
                            ...prev,
                            [recipe._id]: event.target.checked,
                          }))
                        }
                      />
                    </div>

                    <ul className="list-group">
                      {(recipe.ingredients ?? []).map((ingredient) => {
                        const checked = ingredientCheckedMap[ingredient.name] ?? false;

                        return (
                          <li
                            key={`${recipe._id}-${ingredient.name}`}
                            className="list-group-item d-flex justify-content-between align-items-center"
                          >
                            <div className="d-flex align-items-center gap-2">
                              {checklistEnabled && (
                                <Form.Check
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() =>
                                    toggleIngredientChecked(recipe._id, ingredient.name)
                                  }
                                />
                              )}
                              <span
                                style={{
                                  textDecoration:
                                    checklistEnabled && checked ? "line-through" : "none",
                                }}
                              >
                                {ingredient.name}
                              </span>
                            </div>

                            <strong>{formatScaledAmount(ingredient.amount ?? 0, factor)}</strong>
                          </li>
                        );
                      })}
                    </ul>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      <div className="d-flex justify-content-center align-items-center gap-2 mt-4">
        <Button
          variant="outline-secondary"
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
        >
          Previous
        </Button>
        <span>
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline-secondary"
          disabled={page >= totalPages}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
