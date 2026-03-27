// SearchService - 搜索服务
// 提供搜索功能、过滤、排序、高亮等功能

export interface SearchConfig {
  query: string;
  fields: string[];
  caseSensitive?: boolean;
  exactMatch?: boolean;
  fuzzy?: boolean;
  threshold?: number;
}

export interface SearchResult<T> {
  item: T;
  score: number;
  matches: SearchMatch[];
}

export interface SearchMatch {
  field: string;
  indices: [number, number][];
  value: string;
}

export interface FilterConfig<T> {
  field: keyof T;
  operator: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "contains" | "startsWith" | "endsWith" | "in" | "between";
  value: unknown;
  value2?: unknown; // For between operator
}

export interface SortConfig<T> {
  field: keyof T;
  direction: "asc" | "desc";
}

export interface SearchOptions<T> {
  search?: SearchConfig;
  filters?: FilterConfig<T>[];
  sort?: SortConfig<T>;
  limit?: number;
  offset?: number;
}

export class SearchService {
  // Fuzzy search using Levenshtein distance
  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  // Calculate fuzzy match score (0-1, higher is better)
  private fuzzyScore(query: string, text: string): number {
    const distance = this.levenshteinDistance(
      query.toLowerCase(),
      text.toLowerCase()
    );
    const maxLength = Math.max(query.length, text.length);
    return 1 - distance / maxLength;
  }

  // Find match indices in text
  private findMatchIndices(
    query: string,
    text: string,
    caseSensitive: boolean
  ): [number, number][] {
    const indices: [number, number][] = [];
    const searchText = caseSensitive ? text : text.toLowerCase();
    const searchQuery = caseSensitive ? query : query.toLowerCase();

    let index = searchText.indexOf(searchQuery);
    while (index !== -1) {
      indices.push([index, index + query.length]);
      index = searchText.indexOf(searchQuery, index + 1);
    }

    return indices;
  }

  // Search items
  search<T extends Record<string, unknown>>(
    items: T[],
    config: SearchConfig
  ): SearchResult<T>[] {
    const {
      query,
      fields,
      caseSensitive = false,
      exactMatch = false,
      fuzzy = false,
      threshold = 0.6,
    } = config;

    if (!query.trim()) {
      return items.map((item) => ({
        item,
        score: 1,
        matches: [],
      }));
    }

    const results: SearchResult<T>[] = [];

    for (const item of items) {
      let totalScore = 0;
      const matches: SearchMatch[] = [];

      for (const field of fields) {
        const value = this.getFieldValue(item, field);
        if (value === undefined || value === null) continue;

        const strValue = String(value);
        let score = 0;
        let fieldMatches: [number, number][] = [];

        if (exactMatch) {
          const match = caseSensitive
            ? strValue === query
            : strValue.toLowerCase() === query.toLowerCase();
          if (match) {
            score = 1;
            fieldMatches = [[0, strValue.length]];
          }
        } else if (fuzzy) {
          score = this.fuzzyScore(query, strValue);
          if (score >= threshold) {
            // For fuzzy matches, highlight the best matching substring
            fieldMatches = this.findFuzzyMatchIndices(query, strValue);
          }
        } else {
          fieldMatches = this.findMatchIndices(query, strValue, caseSensitive);
          if (fieldMatches.length > 0) {
            score = Math.min(1, fieldMatches.length * 0.3 + 0.4);
          }
        }

        if (score > 0) {
          totalScore += score;
          matches.push({
            field,
            indices: fieldMatches,
            value: strValue,
          });
        }
      }

      if (matches.length > 0) {
        results.push({
          item,
          score: totalScore / matches.length,
          matches,
        });
      }
    }

    // Sort by score descending
    return results.sort((a, b) => b.score - a.score);
  }

  // Find fuzzy match indices (approximate)
  private findFuzzyMatchIndices(query: string, text: string): [number, number][] {
    const indices: [number, number][] = [];
    let textIndex = 0;
    let queryIndex = 0;
    let start = -1;

    while (queryIndex < query.length && textIndex < text.length) {
      if (text[textIndex].toLowerCase() === query[queryIndex].toLowerCase()) {
        if (start === -1) start = textIndex;
        queryIndex++;
      } else if (start !== -1) {
        indices.push([start, textIndex]);
        start = -1;
      }
      textIndex++;
    }

    if (start !== -1) {
      indices.push([start, textIndex]);
    }

    return indices.length > 0 ? indices : [[0, text.length]];
  }

  // Filter items
  filter<T extends Record<string, unknown>>(items: T[], filters: FilterConfig<T>[]): T[] {
    return items.filter((item) => {
      return filters.every((filter) => this.matchesFilter(item, filter));
    });
  }

  // Check if item matches filter
  private matchesFilter<T extends Record<string, unknown>>(
    item: T,
    filter: FilterConfig<T>
  ): boolean {
    const value = this.getFieldValue(item, filter.field as string);
    const filterValue = filter.value;

    switch (filter.operator) {
      case "eq":
        return value === filterValue;
      case "ne":
        return value !== filterValue;
      case "gt":
        return value > filterValue;
      case "gte":
        return value >= filterValue;
      case "lt":
        return value < filterValue;
      case "lte":
        return value <= filterValue;
      case "contains":
        if (typeof value === "string" && typeof filterValue === "string") {
          return value.toLowerCase().includes(filterValue.toLowerCase());
        }
        if (Array.isArray(value)) {
          return value.includes(filterValue);
        }
        return false;
      case "startsWith":
        if (typeof value === "string" && typeof filterValue === "string") {
          return value.toLowerCase().startsWith(filterValue.toLowerCase());
        }
        return false;
      case "endsWith":
        if (typeof value === "string" && typeof filterValue === "string") {
          return value.toLowerCase().endsWith(filterValue.toLowerCase());
        }
        return false;
      case "in":
        if (Array.isArray(filterValue)) {
          return filterValue.includes(value);
        }
        return false;
      case "between":
        if (filter.value2 !== undefined) {
          return value >= filterValue && value <= filter.value2;
        }
        return false;
      default:
        return true;
    }
  }

  // Sort items
  sort<T>(items: T[], sortConfig: SortConfig<T>): T[] {
    const { field, direction } = sortConfig;
    const multiplier = direction === "asc" ? 1 : -1;

    return [...items].sort((a, b) => {
      const aValue = this.getFieldValue(a as Record<string, unknown>, field as string);
      const bValue = this.getFieldValue(b as Record<string, unknown>, field as string);

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1 * multiplier;
      if (bValue === null || bValue === undefined) return -1 * multiplier;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return aValue.localeCompare(bValue) * multiplier;
      }

      return (aValue > bValue ? 1 : -1) * multiplier;
    });
  }

  // Combined search, filter, and sort
  query<T extends Record<string, unknown>>(
    items: T[],
    options: SearchOptions<T>
  ): { results: T[]; total: number } {
    let workingItems = [...items];

    // Apply search
    if (options.search && options.search.query) {
      const searchResults = this.search(workingItems, options.search);
      workingItems = searchResults.map((r) => r.item);
    }

    // Apply filters
    if (options.filters && options.filters.length > 0) {
      workingItems = this.filter(workingItems, options.filters);
    }

    const total = workingItems.length;

    // Apply sort
    if (options.sort) {
      workingItems = this.sort(workingItems, options.sort);
    }

    // Apply pagination
    const offset = options.offset || 0;
    const limit = options.limit || workingItems.length;
    workingItems = workingItems.slice(offset, offset + limit);

    return { results: workingItems, total };
  }

  // Get nested field value
  private getFieldValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split(".").reduce<unknown>((current, key) => {
      if (current === null || current === undefined) return undefined;
      return (current as Record<string, unknown>)[key];
    }, obj);
  }

  // Highlight matched text
  highlight(text: string, indices: [number, number][], tag = "mark"): string {
    if (!indices.length) return text;

    let result = "";
    let lastIndex = 0;

    for (const [start, end] of indices) {
      result += text.slice(lastIndex, start);
      result += `<${tag}>${text.slice(start, end)}</${tag}>`;
      lastIndex = end;
    }

    result += text.slice(lastIndex);
    return result;
  }

  // Debounce search
  debounce<T extends (...args: unknown[]) => unknown>(
    fn: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  }

  // Create search index for faster searching
  createIndex<T extends Record<string, unknown>>(
    items: T[],
    fields: string[]
  ): Map<string, T[]> {
    const index = new Map<string, T[]>();

    for (const item of items) {
      for (const field of fields) {
        const value = this.getFieldValue(item, field);
        if (value === undefined || value === null) continue;

        const words = String(value).toLowerCase().split(/\s+/);
        for (const word of words) {
          if (!index.has(word)) {
            index.set(word, []);
          }
          const list = index.get(word)!;
          if (!list.includes(item)) {
            list.push(item);
          }
        }
      }
    }

    return index;
  }

  // Search using pre-built index
  searchIndex<T>(index: Map<string, T[]>, query: string): T[] {
    const words = query.toLowerCase().split(/\s+/);
    const results = new Map<T, number>();

    for (const word of words) {
      for (const [key, items] of index) {
        if (key.includes(word)) {
          for (const item of items) {
            results.set(item, (results.get(item) || 0) + 1);
          }
        }
      }
    }

    return Array.from(results.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([item]) => item);
  }

  // Auto-complete suggestions
  getSuggestions(
    items: string[],
    query: string,
    limit: number = 5
  ): string[] {
    if (!query.trim()) return [];

    const scored = items.map((item) => ({
      item,
      score: this.fuzzyScore(query, item),
    }));

    return scored
      .filter((s) => s.score > 0.3)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((s) => s.item);
  }

  // Build search query from URL params
  parseQueryParams(params: URLSearchParams): Partial<SearchConfig> {
    return {
      query: params.get("q") || "",
      fields: params.get("fields")?.split(",") || [],
      caseSensitive: params.get("case") === "true",
      exactMatch: params.get("exact") === "true",
      fuzzy: params.get("fuzzy") === "true",
    };
  }

  // Build URL params from search config
  buildQueryString(config: SearchConfig): string {
    const params = new URLSearchParams();
    if (config.query) params.set("q", config.query);
    if (config.fields.length) params.set("fields", config.fields.join(","));
    if (config.caseSensitive) params.set("case", "true");
    if (config.exactMatch) params.set("exact", "true");
    if (config.fuzzy) params.set("fuzzy", "true");
    return params.toString();
  }
}

export const searchService = new SearchService();
