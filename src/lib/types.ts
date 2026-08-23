export type NavAccount = {
  id: string;
  name: string;
  role: "ADMIN" | "MEMBER";
  level: number;
} | null;
