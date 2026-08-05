import imageCompression from "browser-image-compression";

export type UploadPhase = "idle" | "compressing" | "uploading";

/**
 * Compresses image files before uploading to Supabase Storage.
 * Bypasses compression for non-image files such as PDFs.
 *
 * @param file The original File selected by the user
 * @param onPhaseChange Callback to update UX loading text ("compressing" | "uploading")
 * @returns The compressed File (or original File if not an image)
 */
export async function compressFileIfImage(
  file: File,
  onPhaseChange?: (phase: "compressing" | "uploading") => void
): Promise<File> {
  // IF the file is an image, compress it using browser-image-compression
  if (file.type && file.type.startsWith("image/")) {
    if (onPhaseChange) onPhaseChange("compressing");
    try {
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1280,
        useWebWorker: true,
      };
      const compressedBlob = await imageCompression(file, options);
      const compressedFile = new File([compressedBlob], file.name, {
        type: file.type,
        lastModified: Date.now(),
      });
      if (onPhaseChange) onPhaseChange("uploading");
      return compressedFile;
    } catch (error: any) {
      console.error("Error during image compression:", error);
      throw new Error(
        error?.message || "Gagal mengompresi gambar. Silakan coba file lain."
      );
    }
  }

  // IF the file is a PDF (e.g., for certificates), BYPASS the compression and upload the original file directly
  if (onPhaseChange) onPhaseChange("uploading");
  return file;
}
