export const DEFAULT_SIZE = {
  GROUP_HEADER_HEIGHT: 32,
  HEADER_HEIGTH: 32,
  FILTER_HEIGHT: 28,
  COLUMN_WIDTH: 160,
  ROW_HEIGHT: 28,
  FOOTER_HEIGHT: 32,
  CARD_FILTER_WIDTH: 160,
  CARD_FILTER_HEIGHT: 200,
  EXPANDED_ROW_HEIGHT: 250,
};

export const FILTER_ADVANCE_CONFIG = {
  none: 'None',
  equal: 'Equal',
  notEqual: 'Not Equal',
  startsWith: 'Starts with',
  endsWith: 'Ends with',
  contains: 'Contains',
  notContains: 'Not Contains',
} as const;

export const SESSION_STORAGE_KEY = {
  SEARCH_PER_COLUMN: 'search_per_column',
  FILTER_SELECTION_PER_COLUMN: 'filter_selection_per_column',
  FILTER_ADVANCE_PER_COLUMN: 'filter_advance_per_column',
};
