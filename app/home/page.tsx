"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { Alert, Badge, Button, Card, Col, Row } from "react-bootstrap";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

type ActivityItem = {
  _id: string;
  type: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
};

type ApiSuccess<T> = {
  success: boolean;
  data?: T;
  meta?: Record<string, unknown>;
  error?: {
    message?: string;
  };
};

function getEntityHref(activity: ActivityItem): string {
  const entity = String(activity.entityType ?? "").toLowerCase();

  if (entity === "recipe") return "/recipes";
  if (entity === "bookmark") return "/bookmarkslist";
  if (entity === "note") return `/notes/${activity.entityId}`;

  return "/";
}

function getActivityLabel(activity: ActivityItem): string {
  const fromMetadata =
    (activity.metadata?.title as string | undefined) ||
    (activity.metadata?.name as string | undefined);

  if (fromMetadata) return fromMetadata;

  return `${activity.entityType} ${activity.type.toLowerCase().replaceAll("_", " ")}`;
}

function ActivitySkeleton() {
  return (
    <Card>
      <Card.Header>
        <Skeleton width={180} />
      </Card.Header>
      <Card.Body>
        <div className="d-flex flex-column gap-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx}>
              <Skeleton width="75%" />
              <Skeleton width="35%" />
            </div>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
}

function StatsSkeleton() {
  return (
    <Card className="mb-3">
      <Card.Header>
        <Skeleton width={120} />
      </Card.Header>
      <Card.Body>
        <div className="d-flex flex-column gap-3">
          <Skeleton height={32} />
          <Skeleton height={32} />
          <Skeleton height={32} />
        </div>
      </Card.Body>
    </Card>
  );
}

export default function HomeDashboardPage() {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [recipeTotal, setRecipeTotal] = useState(0);
  const [bookmarkTotal, setBookmarkTotal] = useState(0);
  const [noteTotal, setNoteTotal] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const [activityRes, recipeRes, bookmarkRes, noteRes] = await Promise.all([
          fetch("/api/activity?limit=10&page=1", { credentials: "include" }),
          fetch("/api/recipes?limit=1&page=1", { credentials: "include" }),
          fetch("/api/bookmarks", { credentials: "include" }),
          fetch("/api/notes?limit=1&page=1", { credentials: "include" }),
        ]);

        const [activityJson, recipeJson, bookmarkJson, noteJson] = (await Promise.all([
          activityRes.json(),
          recipeRes.json(),
          bookmarkRes.json(),
          noteRes.json(),
        ])) as [
          ApiSuccess<ActivityItem[]>,
          ApiSuccess<unknown[]>,
          ApiSuccess<unknown[]>,
          ApiSuccess<unknown[]>
        ];

        if (cancelled) return;

        if (!activityRes.ok || !recipeRes.ok || !bookmarkRes.ok || !noteRes.ok) {
          setError("Failed to load dashboard data");
          return;
        }

        setActivities(Array.isArray(activityJson.data) ? activityJson.data : []);

        setRecipeTotal(
          typeof recipeJson.meta?.total === "number"
            ? recipeJson.meta.total
            : Array.isArray(recipeJson.data)
              ? recipeJson.data.length
              : 0
        );

        setBookmarkTotal(
          typeof bookmarkJson.meta?.count === "number"
            ? bookmarkJson.meta.count
            : Array.isArray(bookmarkJson.data)
              ? bookmarkJson.data.length
              : 0
        );

        setNoteTotal(
          typeof noteJson.meta?.total === "number"
            ? noteJson.meta.total
            : Array.isArray(noteJson.data)
              ? noteJson.data.length
              : 0
        );
      } catch {
        if (!cancelled) {
          setError("Failed to load dashboard data");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const latest = useMemo(() => (activities.length ? activities[0] : null), [activities]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">Home Dashboard</h3>
      </div>

      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}

      <Row className="g-3">
        <Col lg={8}>
          {loading ? (
            <ActivitySkeleton />
          ) : (
            <Card className="h-100">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <span>Recent Activity</span>
                <Badge bg="secondary">Last 10</Badge>
              </Card.Header>
              <Card.Body>
                {activities.length === 0 ? (
                  <p className="text-muted mb-0">No activity yet.</p>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {activities.map((item) => (
                      <div key={item._id} className="d-flex justify-content-between align-items-start">
                        <div>
                          <div className="fw-semibold">{getActivityLabel(item)}</div>
                          <small className="text-muted">
                            {new Date(item.createdAt ?? Date.now()).toLocaleString()}
                          </small>
                        </div>
                        <Link href={getEntityHref(item)} className="btn btn-sm btn-outline-primary">
                          Open
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col lg={4}>
          {loading ? (
            <>
              <StatsSkeleton />
              <StatsSkeleton />
            </>
          ) : (
            <>
              <Card className="mb-3">
                <Card.Header>Quick Stats</Card.Header>
                <Card.Body>
                  <div className="d-flex flex-column gap-2">
                    <div className="d-flex justify-content-between">
                      <span>Total recipes</span>
                      <strong>{recipeTotal}</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Total bookmarks</span>
                      <strong>{bookmarkTotal}</strong>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span>Total notes</span>
                      <strong>{noteTotal}</strong>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              <Card>
                <Card.Header>Quick Actions</Card.Header>
                <Card.Body className="d-grid gap-2">
                  <Link href="/recipes" className="btn btn-outline-success">
                    Add / Manage Recipes
                  </Link>
                  <Link href="/bookmarkslist" className="btn btn-outline-primary">
                    Add / Manage Bookmarks
                  </Link>
                  <Link href="/notes" className="btn btn-outline-secondary">
                    Add / Manage Notes
                  </Link>
                  <Link href="/chatapp" className="btn btn-outline-dark">
                    Open Chat
                  </Link>
                </Card.Body>
              </Card>
            </>
          )}
        </Col>
      </Row>

      <Row className="g-3 mt-1">
        <Col xs={12}>
          {loading ? (
            <Card>
              <Card.Header>
                <Skeleton width={220} />
              </Card.Header>
              <Card.Body>
                <Skeleton count={2} />
              </Card.Body>
            </Card>
          ) : (
            <Card>
              <Card.Header>Continue Where You Left Off</Card.Header>
              <Card.Body>
                {!latest ? (
                  <p className="text-muted mb-0">No recent item found yet.</p>
                ) : (
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
                    <div>
                      <div className="fw-semibold">{getActivityLabel(latest)}</div>
                      <small className="text-muted">
                        {latest.type.replaceAll("_", " ")} • {new Date(latest.createdAt ?? Date.now()).toLocaleString()}
                      </small>
                    </div>
                    <Link href={getEntityHref(latest)} className="btn btn-primary">
                      Continue
                    </Link>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
}
