import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ result, onPage }) {
  if (!result) return null;
  const pages = Math.max(1, Math.ceil(result.total / result.pageSize));
  return (
    <div className="pagination">
      <span>Page <strong>{result.page}</strong> of {pages} <span className="pagination-total">· {result.total} total</span></span>
      <div>
        <button className="button button-secondary" disabled={result.page <= 1} onClick={() => onPage(Math.max(1, result.page - 1))}><ChevronLeft size={15} /> Previous</button>
        <button className="button button-secondary" disabled={result.page >= pages} onClick={() => onPage(Math.min(pages, result.page + 1))}>Next <ChevronRight size={15} /></button>
      </div>
    </div>
  );
}
