import dayjs from "@/utils/dayjs";

export const CATEGORY_COLORS = [
  "#E05C5C",
  "#2A9D5C",
  "#E8A040",
  "#5C8AE0",
  "#40C4BE",
  "#A05CE0",
  "#E05CA0",
  "#E8A05C",
  "#5CE0D8",
  "#9D5C2A",
];

export function monthShort(m: string) {
  return dayjs(m + "-01").format("MMM");
}

export function monthLabel(m: string) {
  return dayjs(m + "-01").format("MMMM YYYY");
}
