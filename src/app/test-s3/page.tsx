'use client';

import { useState } from 'react';

export default function TestS3Page() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/test/s3-upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      setResult(result);
      
      if (result.success) {
        console.log('Upload bem-sucedido:', result.imageUrl);
      } else {
        console.error('Erro no upload:', result.error);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      setResult({ success: false, error: 'Erro na requisição' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Teste Upload S3</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Selecione uma imagem:
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Enviando...' : 'Fazer Upload'}
        </button>

        {result && (
          <div className="mt-4 p-4 rounded-lg border">
            <h3 className="font-semibold mb-2">Resultado:</h3>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
            
            {result.success && result.imageUrl && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Imagem enviada:</p>
                <img 
                  src={result.imageUrl} 
                  alt="Upload resultado" 
                  className="max-w-full h-auto rounded border"
                  style={{ maxHeight: '200px' }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}