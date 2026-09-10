/**
 * Límite de peso para las subidas de archivos/contenido.
 * El repositorio de medios (Cloudinary) está limitado, así que se restringe
 * el tamaño máximo por archivo. Actualmente: 200 MB.
 */

export const MAX_UPLOAD_SIZE_BYTES = 200 * 1024 * 1024; // 200 MB
export const MAX_UPLOAD_SIZE_LABEL = "200 MB";

/** Devuelve un mensaje de error si el archivo supera el límite, o null si está permitido. */
export function checkUploadSize(file: File, max = MAX_UPLOAD_SIZE_BYTES, label = MAX_UPLOAD_SIZE_LABEL): string | null {
    if (file.size > max) {
        return `El archivo supera el límite de ${label}.`;
    }
    return null;
}