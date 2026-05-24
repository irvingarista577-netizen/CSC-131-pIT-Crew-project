interface FileSystemDirectoryHandle {
  readonly name: string;
}

interface Window {
  showDirectoryPicker?: (options?: {
    id?: string;
    mode?: "read" | "readwrite";
    startIn?: unknown;
  }) => Promise<FileSystemDirectoryHandle>;
}
