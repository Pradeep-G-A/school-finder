import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client using environment variables
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// --- GET (To fetch all schools) ---
export async function GET() {
  try {
    const results = await query({ query: "SELECT * FROM schools", values: [] });
    return NextResponse.json({ success: true, data: results });
  } catch (e) {
    console.error("API GET Error:", e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

// --- POST (Handles file upload to Supabase and adds a new school) ---
export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get('image');

    // Basic validation for required fields
    if (!file || !data.get('name')) {
      return NextResponse.json({ success: false, error: "Image and School Name are required fields." }, { status: 400 });
    }

    // Prepare the file for upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const imageName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;

    // 1. Upload the image to your Supabase Storage bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('school-images') // This must match the bucket name you created
      .upload(imageName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      // If the upload fails, throw an error
      throw new Error(`Supabase upload error: ${uploadError.message}`);
    }

    // 2. Get the public URL of the successfully uploaded image
    const { data: { publicUrl } } = supabase.storage
      .from('school-images')
      .getPublicUrl(imageName);

    // 3. Prepare all the school data, using the Supabase URL for the image
    const schoolData = {
      name: data.get('name'),
      address: data.get('address'),
      city: data.get('city'),
      state: data.get('state'),
      contact: data.get('contact'),
      email_id: data.get('email_id'),
      image: publicUrl, // <-- The public URL from Supabase is saved here
      website: data.get('website'),
      
      type: data.get('type'),
      board: data.get('board'),
    };

    // 4. Insert the school data into your TiDB Cloud database
    const result = await query({
      query: `INSERT INTO schools (name, address, city, state, contact, email_id, image, website, type, board) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      values: Object.values(schoolData),
    });

    if (result.affectedRows > 0) {
      return NextResponse.json({ success: true, message: "School added successfully" });
    } else {
      throw new Error("Failed to insert data into TiDB Cloud database.");
    }
  } catch (e) {
    console.error("API POST Error:", e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

