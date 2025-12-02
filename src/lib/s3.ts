import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// É crucial definir estas variáveis de ambiente
const AWS_REGION = process.env.AWS_REGION || "us-east-1"; // Região padrão
const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

// Verificar se as variáveis de ambiente estão definidas
if (!process.env.AWS_ACCESS_KEY_ID) {
  console.warn('⚠️  AWS_ACCESS_KEY_ID não está definido');
}
if (!process.env.AWS_SECRET_ACCESS_KEY) {
  console.warn('⚠️  AWS_SECRET_ACCESS_KEY não está definido');
}
if (!AWS_S3_BUCKET_NAME) {
  console.warn('⚠️  AWS_S3_BUCKET_NAME não está definido');
}

const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadFileToS3(file: File): Promise<string> {
  console.log('🔧 uploadFileToS3 chamado:', { fileName: file.name, fileSize: file.size });
  
  if (!AWS_S3_BUCKET_NAME) {
    throw new Error("AWS_S3_BUCKET_NAME environment variable is not set.");
  }
  
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error("AWS credentials are not configured properly.");
  }

  const fileExtension = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
  const uploadParams = {
    Bucket: AWS_S3_BUCKET_NAME,
    Key: `vault-images/${fileName}`, // Armazenar imagens em uma pasta 'vault-images'
    Body: Buffer.from(await file.arrayBuffer()), // Converter File para Buffer
    ContentType: file.type,
  };

  try {
    await s3Client.send(new PutObjectCommand(uploadParams));
    return `https://${AWS_S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
  } catch (error) {
    console.error("Erro ao fazer upload do arquivo para o S3:", error);
    throw new Error("Falha ao fazer upload da imagem para o S3.");
  }
}

export async function deleteFileFromS3(fileUrl: string): Promise<void> {
    if (!AWS_S3_BUCKET_NAME) {
        throw new Error("AWS_S3_BUCKET_NAME environment variable is not set.");
    }

    // Verificar se a URL é do nosso bucket S3
    if (!fileUrl.includes(`${AWS_S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com`)) {
        console.warn(`URL não é do nosso bucket S3: ${fileUrl}`);
        return;
    }

    // Extrair a chave do arquivo da URL
    const urlParts = fileUrl.split('/');
    const bucketIndex = urlParts.findIndex(part => part.includes(`${AWS_S3_BUCKET_NAME}.s3`));
    if (bucketIndex === -1) {
        console.warn(`Não foi possível extrair a chave do S3 da URL: ${fileUrl}`);
        return;
    }
    
    const key = urlParts.slice(bucketIndex + 1).join('/');

    const deleteParams = {
        Bucket: AWS_S3_BUCKET_NAME,
        Key: key,
    };

    try {
        await s3Client.send(new DeleteObjectCommand(deleteParams));
    } catch (error) {
        console.error("Erro ao deletar arquivo do S3:", error);
        // Não lançar erro aqui, pois a exclusão pode falhar, mas a operação principal pode ter sucesso.
    }
}
