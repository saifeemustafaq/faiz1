import fs from 'fs/promises';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

const DATA_DIR = path.join(process.cwd(), 'data');

// Helper to read JSON file
async function readJSONFile(filename: string) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return null;
  }
}

// Helper to write JSON file
async function writeJSONFile(filename: string, data: any) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    return false;
  }
}

// GET /api/data?type=products
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type');

  if (!type) {
    return NextResponse.json({ error: 'Type parameter required' }, { status: 400 });
  }

  const fileMap: Record<string, string> = {
    products: 'products.json',
    categories: 'categories.json',
    stores: 'stores.json',
    units: 'units.json',
    recipients: 'recipients.json',
    locations: 'locations.json',
    roles: 'roles.json',
    users: 'users.json',
    menus: 'menus.json',
    events: 'events.json',
    rsvpSettings: 'rsvp-settings.json',
    recipientRsvps: 'recipient-rsvps.json',
    carts: 'carts.json',
    'new-additions': 'new-additions.json',
    'extra-items': 'extra-items.json',
    recipes: 'recipes.json',
  };

  const filename = fileMap[type];
  if (!filename) {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  const data = await readJSONFile(filename);
  if (!data) {
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/data?type=products
export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type');

  if (!type) {
    return NextResponse.json({ error: 'Type parameter required' }, { status: 400 });
  }

  const fileMap: Record<string, string> = {
    products: 'products.json',
    categories: 'categories.json',
    stores: 'stores.json',
    units: 'units.json',
    recipients: 'recipients.json',
    locations: 'locations.json',
    roles: 'roles.json',
    users: 'users.json',
    menus: 'menus.json',
    events: 'events.json',
    rsvpSettings: 'rsvp-settings.json',
    recipientRsvps: 'recipient-rsvps.json',
    carts: 'carts.json',
    'new-additions': 'new-additions.json',
    'extra-items': 'extra-items.json',
    recipes: 'recipes.json',
  };

  const filename = fileMap[type];
  if (!filename) {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const success = await writeJSONFile(filename, body);

    if (!success) {
      return NextResponse.json({ error: 'Failed to write data' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Data saved successfully' });
  } catch (error) {
    console.error('Error saving data:', error);
    return NextResponse.json({ error: 'Invalid JSON data' }, { status: 400 });
  }
}

