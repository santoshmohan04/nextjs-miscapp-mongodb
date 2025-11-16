// components/users/UserSkeleton.tsx
"use client";
import Skeleton from "react-loading-skeleton";

export function UserCardSkeleton() {
  return (
    <div className="shadow-sm rounded mb-3">
      <Skeleton height={200} />
      <Skeleton height={20} style={{ margin: 10 }} />
      <Skeleton height={20} width={150} style={{ marginLeft: 10 }} />
      <div className="p-2 d-flex justify-content-between">
        <Skeleton width={40} height={30} />
        <Skeleton width={40} height={30} />
      </div>
    </div>
  );
}

export function UserListSkeleton() {
  return (
    <div className="d-flex align-items-center p-2 border rounded mb-2">
      <Skeleton circle width={50} height={50} />
      <div className="ms-3 flex-grow-1">
        <Skeleton width={120} height={20} />
        <Skeleton width={200} height={18} />
      </div>
    </div>
  );
}
