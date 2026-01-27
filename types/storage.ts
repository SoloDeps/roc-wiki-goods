export interface AutoSaveStatus {
  status: "idle" | "loading" | "success" | "error";
  timestamp: number;
  message: string;
}
