import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import path from 'path';
import { writeFile, mkdir, unlink } from 'fs/promises';

// Handler for GET requests to fetch all schools
export async function GET() {
  try {
    const results = await query({
      query: "SELECT * FROM schools", // Fetch all columns
      values: [],
    });
    return NextResponse.json({ success: true, data: results });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

// Handler for POST requests to add a new school
export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get('image');

    if (!file || !data.get('name') || !data.get('email_id')) {
        return NextResponse.json({ success: false, error: "Missing required fields." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const publicDir = path.join(process.cwd(), 'public');
    const imagesDir = path.join(publicDir, 'schoolImages');
    await mkdir(imagesDir, { recursive: true });
    const imageName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
    const imagePath = path.join(imagesDir, imageName);
    await writeFile(imagePath, buffer);
    const imageUrl = `/schoolImages/${imageName}`;

    const schoolData = {
      name: data.get('name'),
      address: data.get('address'),
      city: data.get('city'),
      state: data.get('state'),
      contact: data.get('contact'),
      email_id: data.get('email_id'),
      image: imageUrl,
      website: data.get('website'),
      board: data.get('board'),
    };

    const result = await query({
      query: `INSERT INTO schools 
              (name, address, city, state, contact, email_id, image, website, board) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      values: Object.values(schoolData),
    });

    if (result.affectedRows > 0) {
        return NextResponse.json({ success: true, message: "School added successfully" });
    } else {
        throw new Error("Failed to insert data into database.");
    }
  } catch (e) {
    console.error("API POST Error:", e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

// --- NEW FUNCTION TO HANDLE DELETION ---
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: "School ID is required." }, { status: 400 });
    }

    // Optional: Delete the associated image from the file system
    const [schoolToDelete] = await query({
      query: "SELECT image FROM schools WHERE id = ?",
      values: [id],
    });

    if (schoolToDelete && schoolToDelete.image) {
      const imagePath = path.join(process.cwd(), 'public', schoolToDelete.image);
      try {
        await unlink(imagePath); // Deletes the file
      } catch (fileError) {
        console.warn(`Could not delete image file: ${imagePath}`, fileError);
      }
    }

    // Delete the record from the database
    const deleteResult = await query({
      query: "DELETE FROM schools WHERE id = ?",
      values: [id],
    });

    if (deleteResult.affectedRows > 0) {
      return NextResponse.json({ success: true, message: "School deleted successfully." });
    } else {
      return NextResponse.json({ success: false, error: "School not found or already deleted." }, { status: 404 });
    }

  } catch (e) {
    console.error("API DELETE Error:", e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

