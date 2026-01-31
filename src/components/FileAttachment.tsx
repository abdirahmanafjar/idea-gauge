import { useRef } from "react";
import { Paperclip, X, FileText, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AttachedFile {
  id: string;
  file: File;
  preview?: string;
}

interface FileAttachmentProps {
  files: AttachedFile[];
  onFilesChange: (files: AttachedFile[]) => void;
  disabled?: boolean;
}

export const FileAttachment = ({ files, onFilesChange, disabled }: FileAttachmentProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    const newFiles: AttachedFile[] = selectedFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
    }));
    
    onFilesChange([...files, ...newFiles]);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (id: string) => {
    const fileToRemove = files.find(f => f.id === id);
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    onFilesChange(files.filter(f => f.id !== id));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt"
          className="hidden"
          onChange={handleFileSelect}
          disabled={disabled}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="gap-2"
        >
          <Paperclip className="h-4 w-4" />
          Attach Files
        </Button>
        {files.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {files.length} file{files.length > 1 ? "s" : ""} attached
          </span>
        )}
      </div>
      
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((f) => (
            <div
              key={f.id}
              className="group relative flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-2 text-sm"
            >
              {f.preview ? (
                <img 
                  src={f.preview} 
                  alt={f.file.name}
                  className="h-8 w-8 rounded object-cover"
                />
              ) : f.file.type.includes("image") ? (
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
              ) : (
                <FileText className="h-4 w-4 text-muted-foreground" />
              )}
              <div className="flex flex-col">
                <span className="max-w-[120px] truncate text-foreground">{f.file.name}</span>
                <span className="text-xs text-muted-foreground">{formatFileSize(f.file.size)}</span>
              </div>
              <button
                type="button"
                onClick={() => removeFile(f.id)}
                className="ml-2 rounded-full p-1 hover:bg-destructive/20 transition-colors"
                disabled={disabled}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileAttachment;
