export type confirmDialog = {
  message: string,
  header: string,
  accept: function | undefined,
  reject: function | undefined
} | null

