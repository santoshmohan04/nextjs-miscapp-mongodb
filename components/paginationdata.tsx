"use client";

import React, { useState } from "react";

type PaginationDataProps = {
  data: any[]; // Replace 'any' with a specific type if known
  currentpage: number;
  itemsPerPage: number;
  changePage: (page: number) => void;
};

export default function PaginationData({
  data,
  currentpage,
  itemsPerPage,
  changePage,
}: PaginationDataProps) {
  const [totalPages] = useState(Math.ceil(data.length / itemsPerPage));
  return (
    <>
      <nav aria-label="Page navigation example" className="mt-4">
        <ul className="pagination justify-content-center">
          {[...Array(totalPages)].map((_, i) => {
            const pageNum = i + 1;
            return (
              <li
                key={pageNum}
                className={`page-item ${
                  pageNum === currentpage ? "active" : ""
                }`}
              >
                <a
                  className="page-link"
                  href="#"
                  onClick={() => changePage(pageNum)}
                >
                  {pageNum}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
