import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada file diunggah' }, { status: 400, headers: corsHeaders });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'mh-assaodah/cms',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else if (!result) {
            reject(new Error('Cloudinary did not return a result'));
          } else {
            resolve(result);
          }
        }
      ).end(buffer);
    }) as { secure_url: string; public_id: string };

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
    }, { headers: corsHeaders });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Gagal mengunggah file ke Cloudinary' },
      { status: 500, headers: corsHeaders }
    );
  }
}
