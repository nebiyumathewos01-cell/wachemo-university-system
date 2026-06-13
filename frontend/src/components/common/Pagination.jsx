import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Pagination = ({ page, pages, onPageChange }) => {
  if (pages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <FiChevronLeft className="h-4 w-4" />
      </button>

      {Array.from({ length: Math.min(pages, 7) }, (_, i) => {
        const p = i + 1;
        return (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
              p === page
                ? 'bg-primary-600 text-white'
                : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {p}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pages}
        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <FiChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Pagination;
