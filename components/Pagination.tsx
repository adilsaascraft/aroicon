"use client";

import React from "react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const maxVisible = 4; // Show only 1…4 pages

  const pages: number[] = [];
  let start = Math.max(1, currentPage - 1);
  let end = Math.min(totalPages, start + maxVisible - 1);

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex justify-center items-center gap-2 mt-6">
      {/* PREVIOUS */}
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded border disabled:opacity-40 hover:bg-gray-100"
      >
        Prev
      </button>

      {/* PAGE NUMBERS */}
      {start > 1 && <span className="px-2">...</span>}

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 rounded border hover:bg-gray-100 ${
            page === currentPage ? "bg-blue-600 text-white border-blue-600" : ""
          }`}
        >
          {page}
        </button>
      ))}

      {end < totalPages && <span className="px-2">...</span>}

      {/* NEXT */}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded border disabled:opacity-40 hover:bg-gray-100"
      >
        Next
      </button>
    </div>
  );
}
