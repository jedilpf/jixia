// PaginationService - 分页服务
// 提供分页计算、数据切片、页码生成等功能

export interface PaginationConfig {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  maxPageButtons?: number;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  showTotal?: boolean;
  showPageSize?: boolean;
  pageSizeOptions?: number[];
}

export const DEFAULT_PAGINATION_CONFIG: Partial<PaginationConfig> = {
  currentPage: 1,
  pageSize: 10,
  maxPageButtons: 5,
  showFirstLast: true,
  showPrevNext: true,
  showTotal: true,
  showPageSize: true,
  pageSizeOptions: [10, 20, 50, 100],
};

export interface PaginationResult<T> {
  items: T[];
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  startIndex: number;
  endIndex: number;
  pageNumbers: (number | string)[];
}

export interface PageInfo {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export class PaginationService {
  // Calculate pagination result
  paginate<T>(items: T[], config: Partial<PaginationConfig> = {}): PaginationResult<T> {
    const fullConfig = { ...DEFAULT_PAGINATION_CONFIG, ...config } as Required<PaginationConfig>;
    const { currentPage, pageSize, maxPageButtons } = fullConfig;

    const totalItems = items.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safeCurrentPage = Math.max(1, Math.min(currentPage, totalPages));

    const startIndex = (safeCurrentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    const paginatedItems = items.slice(startIndex, endIndex);

    const pageNumbers = this.generatePageNumbers(safeCurrentPage, totalPages, maxPageButtons);

    return {
      items: paginatedItems,
      currentPage: safeCurrentPage,
      pageSize,
      totalItems,
      totalPages,
      hasPrevious: safeCurrentPage > 1,
      hasNext: safeCurrentPage < totalPages,
      startIndex,
      endIndex,
      pageNumbers,
    };
  }

  // Calculate pagination info without slicing data
  calculatePageInfo(config: Partial<PaginationConfig> = {}): PageInfo {
    const fullConfig = { ...DEFAULT_PAGINATION_CONFIG, ...config } as Required<PaginationConfig>;
    const { currentPage, pageSize, totalItems } = fullConfig;

    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safeCurrentPage = Math.max(1, Math.min(currentPage, totalPages));

    return {
      currentPage: safeCurrentPage,
      pageSize,
      totalItems,
      totalPages,
    };
  }

  // Generate page numbers for display
  generatePageNumbers(currentPage: number, totalPages: number, maxButtons: number = 5): (number | string)[] {
    if (totalPages <= maxButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [];
    const halfButtons = Math.floor(maxButtons / 2);

    let startPage = Math.max(1, currentPage - halfButtons);
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage < maxButtons - 1) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    // First page
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push("...");
      }
    }

    // Middle pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push("...");
      }
      pages.push(totalPages);
    }

    return pages;
  }

  // Get slice indices
  getSliceIndices(currentPage: number, pageSize: number, totalItems: number): { start: number; end: number } {
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safePage = Math.max(1, Math.min(currentPage, totalPages));

    return {
      start: (safePage - 1) * pageSize,
      end: Math.min(safePage * pageSize, totalItems),
    };
  }

  // Slice array with pagination
  slice<T>(items: T[], currentPage: number, pageSize: number): T[] {
    const { start, end } = this.getSliceIndices(currentPage, pageSize, items.length);
    return items.slice(start, end);
  }

  // Go to specific page
  goToPage(page: number, totalPages: number): number {
    return Math.max(1, Math.min(page, totalPages));
  }

  // Go to first page
  first(): number {
    return 1;
  }

  // Go to last page
  last(totalPages: number): number {
    return totalPages;
  }

  // Go to previous page
  previous(currentPage: number): number {
    return Math.max(1, currentPage - 1);
  }

  // Go to next page
  next(currentPage: number, totalPages: number): number {
    return Math.min(totalPages, currentPage + 1);
  }

  // Check if can go to previous page
  canGoPrevious(currentPage: number): boolean {
    return currentPage > 1;
  }

  // Check if can go to next page
  canGoNext(currentPage: number, totalPages: number): boolean {
    return currentPage < totalPages;
  }

  // Change page size and recalculate current page
  changePageSize(
    currentPage: number,
    oldPageSize: number,
    newPageSize: number,
    totalItems: number
  ): { newPage: number; newTotalPages: number } {
    const currentItemIndex = (currentPage - 1) * oldPageSize;
    const newPage = Math.floor(currentItemIndex / newPageSize) + 1;
    const newTotalPages = Math.ceil(totalItems / newPageSize);

    return {
      newPage: Math.min(newPage, newTotalPages),
      newTotalPages,
    };
  }

  // Get display range text (e.g., "1-10 of 100")
  getDisplayRange(currentPage: number, pageSize: number, totalItems: number): string {
    const { start, end } = this.getSliceIndices(currentPage, pageSize, totalItems);
    return `${start + 1}-${end} / ${totalItems}`;
  }

  // Get items for current page from cached data
  getPageItems<T>(
    allItems: T[],
    currentPage: number,
    pageSize: number
  ): { items: T[]; hasMore: boolean } {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const items = allItems.slice(start, end);

    return {
      items,
      hasMore: end < allItems.length,
    };
  }

  // Create pagination config for API request
  createRequestParams(currentPage: number, pageSize: number): { page: number; size: number; offset: number } {
    return {
      page: currentPage,
      size: pageSize,
      offset: (currentPage - 1) * pageSize,
    };
  }

  // Parse URL query params to pagination config
  parseQueryParams(params: URLSearchParams): Partial<PaginationConfig> {
    const page = parseInt(params.get("page") || "1", 10);
    const size = parseInt(params.get("size") || "10", 10);

    return {
      currentPage: isNaN(page) ? 1 : page,
      pageSize: isNaN(size) ? 10 : size,
    };
  }

  // Build URL query string from pagination config
  buildQueryString(config: Partial<PaginationConfig>): string {
    const params = new URLSearchParams();
    if (config.currentPage && config.currentPage > 1) {
      params.set("page", config.currentPage.toString());
    }
    if (config.pageSize && config.pageSize !== 10) {
      params.set("size", config.pageSize.toString());
    }
    return params.toString();
  }

  // Virtual scroll calculation
  calculateVirtualScroll(
    scrollTop: number,
    containerHeight: number,
    itemHeight: number,
    totalItems: number,
    overscan: number = 5
  ): {
    startIndex: number;
    endIndex: number;
    virtualHeight: number;
    offsetY: number;
    visibleItems: number;
  } {
    const visibleItems = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(totalItems, startIndex + visibleItems + overscan * 2);

    return {
      startIndex,
      endIndex,
      virtualHeight: totalItems * itemHeight,
      offsetY: startIndex * itemHeight,
      visibleItems,
    };
  }

  // Infinite scroll helpers
  calculateInfiniteScrollPage(scrollTop: number, itemHeight: number, pageSize: number): number {
    return Math.floor(scrollTop / (itemHeight * pageSize)) + 1;
  }

  shouldLoadMore(scrollTop: number, scrollHeight: number, clientHeight: number, threshold: number = 100): boolean {
    return scrollHeight - scrollTop - clientHeight < threshold;
  }
}

export const paginationService = new PaginationService();
