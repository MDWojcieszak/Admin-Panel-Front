export type Pagination = {
  skip: number;
  take: number;
};

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    /**
     * How the column shows in the phone layout, where each row is a card:
     * `title` is the card's heading (default: the first column), `actions`
     * goes to its top-right corner (default: a last column without a header),
     * `hidden` is left out, anything else is a labelled field.
     */
    mobile?: 'title' | 'actions' | 'hidden';
  }
}
