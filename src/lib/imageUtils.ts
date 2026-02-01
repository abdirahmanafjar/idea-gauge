import { AttachedFile } from "@/types/analysis";

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix to get just the base64 string
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const prepareFilesForAnalysis = async (files: AttachedFile[]): Promise<Array<{
  name: string;
  type: string;
  base64: string;
}>> => {
  const preparedFiles = await Promise.all(
    files
      .filter(f => f.file.type.startsWith('image/'))
      .map(async (f) => ({
        name: f.file.name,
        type: f.file.type,
        base64: await fileToBase64(f.file),
      }))
  );
  return preparedFiles;
};
