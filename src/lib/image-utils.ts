/**
 * Compresses an image file in the browser before upload.
 * @param file The original File object.
 * @param maxSizeMB Maximum size in MB.
 * @param maxWidth Maximum width in pixels.
 * @returns A promise that resolves to the compressed File object.
 */
export async function compressImage(
    file: File, 
    maxSizeMB: number = 0.8, 
    maxWidth: number = 1920
): Promise<File> {
    // Se o arquivo for pequeno o suficiente, não precisa comprimir
    if (file.size <= maxSizeMB * 1024 * 1024) {
        return file;
    }

    console.log('⚙️ [ImageUtils] Comprimindo imagem:', file.name, (file.size / 1024 / 1024).toFixed(2) + 'MB');

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Redimensionar se maior que o limite
                if (width > maxWidth) {
                    const ratio = maxWidth / width;
                    width = maxWidth;
                    height = height * ratio;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) return reject(new Error('Canvas context not available'));
                
                ctx.drawImage(img, 0, 0, width, height);

                // Exportar como JPEG com qualidade ajustada (0.8 é um bom compromisso)
                canvas.toBlob(
                    (blob) => {
                        if (!blob) return reject(new Error('Canvas toBlob failed'));
                        
                        const compressedFile = new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        
                        console.log('✅ [ImageUtils] Compressão finalizada:', (compressedFile.size / 1024 / 1024).toFixed(2) + 'MB');
                        resolve(compressedFile);
                    },
                    'image/jpeg',
                    0.8 
                );
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}
