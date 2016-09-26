/**
 * Duplicates Storage's properties for future backward compatibility
 */
export interface WebStorage extends Storage {
  length: number;
  clear(): void;
  getItem(key: string): any;
  key(index: number): string;
  removeItem(key: string): void;
  setItem(key: string, data: string): void;
  [key: string]: any;
  [index: number]: string;
}
