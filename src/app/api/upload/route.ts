import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Validasi env Cloudinary sebelum proses
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.error('Upload error: Konfigurasi Cloudinary tidak lengkap', {
      cloudName: cloudName ? 'ada' : 'KOSONG',
      apiKey: apiKey ? 'ada' : 'KOSONG',
      apiSecret: apiSecret ? 'ada' : 'KOSONG',
    });
    return NextResponse.json(
      { error: 'Konfigurasi Cloudinary tidak lengkap di server' },
      { status: 500, headers: corsHeaders }
    );
  }

  // Konfigurasi Cloudinary langsung di sini (tidak pakai singleton global)
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Tidak ada file diunggah' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validasi tipe file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Tipe file tidak didukung: ${file.type}. Gunakan JPEG, PNG, WebP, GIF, atau SVG.` },
        { status: 400, headers: corsHeaders }
      );
    }

    // Batas ukuran 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Ukuran file terlalu besar. Maksimal 10MB.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'mh-assaodah/cms',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (!result) {
            reject(new Error('Cloudinary tidak mengembalikan hasil'));
          } else {
            resolve(result as { secure_url: string; public_id: string });
          }
        }
      ).end(buffer);
    });

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
    }, { headers: corsHeaders });

  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Upload error:', errMsg);
    return NextResponse.json(
      { error: `Gagal mengunggah file: ${errMsg}` },
      { status: 500, headers: corsHeaders }
    );
  }
}
