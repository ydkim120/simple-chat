export interface SystemError extends Error {
  code: string;
  message: string;
  status: number | string;
}