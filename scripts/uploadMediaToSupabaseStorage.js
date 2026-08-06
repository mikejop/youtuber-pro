import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env file manually
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...valueParts] = trimmed.split('=');
      const val = valueParts.join('=').replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials missing in .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const BUCKET_NAME = 'media';
const PUBLIC_IMG_DIR = path.join(__dirname, '../public/img');

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.webm':
      return 'video/webm';
    case '.mp4':
      return 'video/mp4';
    case '.webp':
      return 'image/webp';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.svg':
      return 'image/svg+xml';
    default:
      return 'application/octet-stream';
  }
}

async function ensureBucket() {
  console.log(`🔍 Checking bucket "${BUCKET_NAME}"...`);
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.warn('⚠️ Warning listing buckets:', listError.message);
  }

  const existing = buckets?.find((b) => b.name === BUCKET_NAME);
  if (!existing) {
    console.log(`🚀 Creating public bucket "${BUCKET_NAME}"...`);
    const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      allowedMimeTypes: ['image/webp', 'image/png', 'image/jpeg', 'image/svg+xml', 'video/webm', 'video/mp4'],
    });

    if (createError) {
      console.warn('ℹ️ Bucket create note:', createError.message);
    } else {
      console.log(`✅ Bucket "${BUCKET_NAME}" created successfully.`);
    }
  } else {
    console.log(`✅ Bucket "${BUCKET_NAME}" already exists.`);
  }
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    if (file.startsWith('.')) return; // Ignore hidden files like .DS_Store
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (['.webp', '.webm', '.png', '.jpg', '.jpeg', '.svg', '.mp4'].includes(ext)) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

async function uploadFiles() {
  await ensureBucket();

  const allFiles = getAllFiles(PUBLIC_IMG_DIR);
  console.log(`\n📦 Found ${allFiles.length} media files to upload:\n`);

  for (const filePath of allFiles) {
    const relativePath = path.relative(PUBLIC_IMG_DIR, filePath).replace(/\\/g, '/');
    const fileBuffer = fs.readFileSync(filePath);
    const contentType = getMimeType(filePath);

    console.log(`⬆️ Uploading: ${relativePath} (${contentType})...`);

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(relativePath, fileBuffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error(`❌ Error uploading ${relativePath}:`, error.message);
    } else {
      const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(relativePath);
      console.log(`✅ Uploaded ${relativePath} -> ${urlData.publicUrl}`);
    }
  }

  console.log('\n🎉 All media files uploaded to Supabase Storage!');
}

uploadFiles().catch((err) => {
  console.error('❌ Script failed:', err);
  process.exit(1);
});
