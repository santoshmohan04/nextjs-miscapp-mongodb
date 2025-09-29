import { useState } from 'react';

export default function PaginationData({
  data,
  currentpage,
  itemsPerPage,
  changePage,
}) {
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
                  pageNum === currentpage ? 'active' : ''
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
