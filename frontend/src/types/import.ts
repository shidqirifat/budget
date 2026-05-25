export interface ParsedRow {
  index: number;
  date: string;
  amount: string;
  type: string;
  category: string;
  sub_category: string;
  note: string;
}

export interface ReviewRow extends ParsedRow {
  status: "pending" | "ok" | "error";
  serverErrors?: string[];
}
