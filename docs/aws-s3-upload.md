
# AWS S3 Image Upload Documentation

This document provides a comprehensive overview of the AWS S3 image upload functionality in this project. It covers the configuration, the API endpoint, and the helper functions used for the upload process.

## 1. Overview

The image upload functionality allows administrators to upload images to an AWS S3 bucket. The process is designed to be secure and efficient, with features like authentication, validation, unique filename generation, and the use of presigned URLs for secure access.

## 2. Configuration

All the configuration for the S3 upload is centralized in the `lib/s3.ts` file within the `S3_CONFIG` object. Additionally, environment variables are used to store sensitive information.

### 2.1. Environment Variables

The following environment variables must be set in your `.env` file for the S3 upload to work:

```
AWS_REGION=your-aws-region
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_S3_BUCKET_NAME=your-s3-bucket-name
```

- `AWS_REGION`: The AWS region where your S3 bucket is located (e.g., "us-east-1").
- `AWS_ACCESS_KEY_ID`: Your AWS access key ID.
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret access key.
- `AWS_S3_BUCKET_NAME`: The name of the S3 bucket where the images will be stored.

### 2.2. S3_CONFIG Object (`lib/s3.ts`)

This object contains the following configurations:

- `BUCKET_NAME`: The name of the S3 bucket, taken from the environment variables.
- `REGION`: The AWS region, taken from the environment variables.
- `FOLDERS`: An object that defines the folder structure within the S3 bucket for better organization.
  - `BLOG_IMAGES`: For images used in blog posts.
  - `BLOG_THUMBNAILS`: For blog post thumbnails.
  - `PROFILE_IMAGES`: For user profile images.
  - `TEMP_UPLOADS`: For temporary uploads.
- `MAX_FILE_SIZE`: The maximum allowed file size for uploads, set to 10MB.
- `ALLOWED_TYPES`: An array of allowed MIME types for the images (e.g., 'image/jpeg', 'image/png').
- `getImageUrl(key: string)`: A helper function to get the direct URL of an image in the S3 bucket.

## 3. API Endpoint: `POST /api/admin/upload`

This is the main endpoint for handling image uploads. It is defined in `app/api/admin/upload/route.ts`.

### 3.1. Request

The endpoint expects a `POST` request with a `FormData` object containing:

- `file`: The image file to be uploaded.
- `folder`: (Optional) A string that specifies the destination folder in the S3 bucket. Possible values are "blog", "profile", and "thumbnail". If not provided, it defaults to "temp".

### 3.2. Process

1.  **Authentication:** The endpoint first verifies that the user is an authenticated administrator.
2.  **Credential Check:** It checks if the AWS credentials are configured in the environment variables.
3.  **File Validation:** It validates the uploaded file's type and size based on the `S3_CONFIG` settings.
4.  **Folder Determination:** It determines the target folder in the S3 bucket based on the `folder` parameter.
5.  **Unique Filename Generation:** It calls the `generateUniqueFileName` function to create a unique name for the file.
6.  **S3 Upload:** It uploads the file to the S3 bucket using a `PutObjectCommand`. It also adds metadata to the S3 object, including the original filename, the uploader's email/name, and the upload date.
7.  **Presigned URL Generation:** It generates a presigned URL for the uploaded image, which provides temporary public access to the file.
8.  **Response:** It returns a JSON response with the following information:
    ```json
    {
      "success": true,
      "fileName": "unique-file-name.jpg",
      "originalName": "original-file-name.jpg",
      "url": "presigned-url-for-the-image",
      "size": 123456,
      "type": "image/jpeg",
      "folder": "blog/posts/"
    }
    ```

## 4. Helper Functions (`lib/s3.ts`)

The `lib/s3.ts` file contains several helper functions that are used by the API endpoint.

### 4.1. `getS3Client()`

This function returns a singleton instance of the `S3Client`. This is an optimization to avoid creating a new S3 client for every request.

### 4.2. `generateUniqueFileName(originalName: string, folder: string)`

This function takes the original filename and the destination folder as input and generates a unique filename using a combination of a timestamp, a random string, and a sanitized version of the original filename. This prevents filename conflicts in the S3 bucket.

### 4.3. `getPresignedUrl(key: string, expiresIn: number = 3600 * 24 * 7)`

This function generates a presigned URL for an S3 object, which allows temporary public access to the object even if the bucket is private. The `expiresIn` parameter specifies the duration for which the URL is valid (default is 7 days).

## 5. Frontend Implementation

To use the image upload functionality on the frontend, you would typically have a file input field and a function that sends a `POST` request to the `/api/admin/upload` endpoint with the selected file.

Here is a basic example of how you might implement this in a React component:

```typescript
import { useState } from 'react';

function ImageUploader() {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'blog'); // Or any other folder

    try {
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setImageUrl(data.url);
      } else {
        console.error('Upload failed:', data.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {uploading && <p>Uploading...</p>}
      {imageUrl && <img src={imageUrl} alt="Uploaded image" />}
    </div>
  );
}
```
