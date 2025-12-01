import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'rsvp-counts.json');

export async function GET() {
  try {
    const fileContent = await fs.readFile(dataFilePath, 'utf-8');
    const data = JSON.parse(fileContent);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading RSVP counts:', error);
    return NextResponse.json(
      { weeklyRSVPCounts: {}, error: 'Failed to load RSVP counts' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { weeklyRSVPCounts } = body;

    // Read the existing file to preserve metadata
    const fileContent = await fs.readFile(dataFilePath, 'utf-8');
    const existingData = JSON.parse(fileContent);

    // Update the RSVP counts while preserving the structure
    const updatedData = {
      ...existingData,
      weeklyRSVPCounts
    };

    // Write back to file
    await fs.writeFile(
      dataFilePath,
      JSON.stringify(updatedData, null, 2),
      'utf-8'
    );

    return NextResponse.json({ success: true, message: 'RSVP counts saved successfully' });
  } catch (error) {
    console.error('Error saving RSVP counts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save RSVP counts' },
      { status: 500 }
    );
  }
}

