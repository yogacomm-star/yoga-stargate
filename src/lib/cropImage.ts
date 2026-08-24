export type CroppedAreaPixels = { x: number; y: number; width: number; height: number };

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (err) => reject(err));
    image.src = url;
  });
}

// Disegna solo l'area selezionata dal ritaglio su un canvas e la esporta come JPEG:
// così l'admin carica esattamente l'inquadratura scelta, non l'immagine originale intera.
export async function getCroppedImageBlob(imageSrc: string, crop: CroppedAreaPixels, outputWidth = 1200): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const outputHeight = Math.round((outputWidth * crop.height) / crop.width);

  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas non supportato dal browser.");

  ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, outputWidth, outputHeight);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Impossibile generare l'immagine ritagliata."))),
      "image/jpeg",
      0.9
    );
  });
}
