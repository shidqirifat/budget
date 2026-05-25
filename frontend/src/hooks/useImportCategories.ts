import { useState, useEffect } from "react";
import { categoryService } from "@/services/category.service";

export function useImportCategories() {
  const [expenseCategories, setExpenseCategories] = useState<string[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<string[]>([]);

  useEffect(() => {
    categoryService
      .getAll()
      .then((res) => {
        const cats = res.data.data;
        setExpenseCategories(
          cats.filter((c) => c.type.name === "expense").map((c) => c.name),
        );
        setIncomeCategories(
          cats.filter((c) => c.type.name === "income").map((c) => c.name),
        );
      })
      .catch(() => {});
  }, []);

  return { expenseCategories, incomeCategories };
}
