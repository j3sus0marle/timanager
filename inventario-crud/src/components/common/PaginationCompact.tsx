import React from "react";
import { Pagination } from "react-bootstrap";

interface PaginationCompactProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationCompact: React.FC<PaginationCompactProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  const pages = [1];
  if (currentPage > 2) pages.push(currentPage - 1);
  if (currentPage !== 1 && currentPage !== totalPages) pages.push(currentPage);
  if (currentPage < totalPages - 1) pages.push(currentPage + 1);
  if (totalPages !== 1) pages.push(totalPages);
  const uniquePages = Array.from(new Set(pages)).filter(p => p > 0 && p <= totalPages);

  return (
    <Pagination>
      <Pagination.Prev onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} />
      {uniquePages.map((page, idx) => (
        <React.Fragment key={page}>
          {idx > 0 && uniquePages[idx] - uniquePages[idx - 1] > 1 && <Pagination.Ellipsis disabled />}
          <Pagination.Item
            active={currentPage === page}
            onClick={() => onPageChange(page)}
          >
            {page}
          </Pagination.Item>
        </React.Fragment>
      ))}
      <Pagination.Next onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} />
    </Pagination>
  );
};

export default PaginationCompact;
