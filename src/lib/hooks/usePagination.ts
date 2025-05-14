import { useMemo, useState } from "react";

export function usePagination<T>(
  data: T[],
  itemsPerPage = 10,
  filterFn?: (item: T) => boolean
) {
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    return filterFn ? data.filter(filterFn) : data;
  }, [data, filterFn]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const maxPageButtons = 5;

  const startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
  const endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
  const pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirst, indexOfLast);

  return {
    currentPage,
    setCurrentPage,
    totalPages,
    pageNumbers,
    currentData,
    filteredCount: filteredData.length,
  };
}