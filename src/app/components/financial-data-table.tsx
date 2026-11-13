import { useEffect, useId, useMemo, useState, type ReactNode } from 'react';
import { Button } from './ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

export interface FinancialDataColumn<T> {
  id: string;
  header: string;
  sortValue: (row: T) => string | number;
  cell: (row: T) => ReactNode;
  className?: string;
}

interface FinancialDataTableProps<T> {
  rows: readonly T[];
  columns: readonly FinancialDataColumn<T>[];
  getRowId: (row: T) => string;
  emptyMessage: string;
  renderActions?: (row: T) => ReactNode;
}

const PAGE_SIZE_OPTIONS = [25, 50, 100];

export function FinancialDataTable<T>({
  rows,
  columns,
  getRowId,
  emptyMessage,
  renderActions,
}: FinancialDataTableProps<T>) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [sort, setSort] = useState({ columnId: 'date', direction: 'desc' as const });
  const pageSizeId = useId();

  const sortedRows = useMemo(() => {
    const column = columns.find((item) => item.id === sort.columnId);
    if (!column) return rows;

    return [...rows].sort((left, right) => {
      const leftValue = column.sortValue(left);
      const rightValue = column.sortValue(right);
      const comparison = typeof leftValue === 'number' && typeof rightValue === 'number'
        ? leftValue - rightValue
        : String(leftValue).localeCompare(String(rightValue), undefined, {
          numeric: true,
          sensitivity: 'base',
        });

      return sort.direction === 'asc' ? comparison : -comparison;
    });
  }, [columns, rows, sort]);

  useEffect(() => {
    setPage(0);
  }, [rows, pageSize]);

  const totalPages = Math.ceil(sortedRows.length / pageSize);
  const currentPage = Math.min(page, Math.max(0, totalPages - 1));
  const pageRows = useMemo(
    () => sortedRows.slice(currentPage * pageSize, (currentPage + 1) * pageSize),
    [currentPage, pageSize, sortedRows],
  );
  const firstItem = sortedRows.length === 0 ? 0 : currentPage * pageSize + 1;
  const lastItem = Math.min((currentPage + 1) * pageSize, sortedRows.length);

  const toggleSort = (columnId: string) => {
    setSort((current) => ({
      columnId,
      direction: current.columnId === columnId && current.direction === 'asc' ? 'desc' : 'asc',
    }));
    setPage(0);
  };

  return (
    <div className="space-y-3">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column.id}
                className={column.className}
                aria-sort={sort.columnId === column.id
                  ? sort.direction === 'asc' ? 'ascending' : 'descending'
                  : 'none'}
              >
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="fw-medium text-nowrap gap-1"
                  onClick={() => toggleSort(column.id)}
                  aria-label={`Sort by ${column.header}${sort.columnId === column.id
                    ? sort.direction === 'asc' ? ', ascending' : ', descending'
                    : ''}`}
                >
                  {column.header}
                  {sort.columnId === column.id && (
                    <span aria-hidden="true">{sort.direction === 'asc' ? '↑' : '↓'}</span>
                  )}
                </Button>
              </TableHead>
            ))}
            {renderActions && <TableHead className="text-end">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageRows.length > 0 ? pageRows.map((row) => (
            <TableRow key={getRowId(row)}>
              {columns.map((column) => (
                <TableCell key={column.id} className={column.className}>
                  {column.cell(row)}
                </TableCell>
              ))}
              {renderActions && (
                <TableCell className="text-end">
                  <div className="d-flex justify-content-end gap-1">{renderActions(row)}</div>
                </TableCell>
              )}
            </TableRow>
          )) : (
            <TableRow>
              <TableCell
                colSpan={columns.length + (renderActions ? 1 : 0)}
                className="app-h-24 text-center fg-2"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="d-flex flex-column gap-3 text-sm fg-2 sm:flex-row sm:align-items-center sm:justify-content-between">
        <div className="d-flex align-items-center gap-2">
          <label htmlFor={pageSizeId}>Rows per page</label>
          <select
            id={pageSizeId}
            className="form-control form-control-sm w-auto"
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value));
              setPage(0);
            }}
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <span>{firstItem}-{lastItem} of {sortedRows.length}</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage === 0}
            onClick={() => setPage(0)}
          >
            First
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage === 0}
            onClick={() => setPage((value) => Math.max(0, value - 1))}
          >
            Previous
          </Button>
          <span className="app-min-w-20 text-center">
            Page {totalPages === 0 ? 0 : currentPage + 1} of {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={totalPages === 0 || currentPage >= totalPages - 1}
            onClick={() => setPage((value) => Math.min(totalPages - 1, value + 1))}
          >
            Next
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={totalPages === 0 || currentPage >= totalPages - 1}
            onClick={() => setPage(Math.max(0, totalPages - 1))}
          >
            Last
          </Button>
        </div>
      </div>
    </div>
  );
}
