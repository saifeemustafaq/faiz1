import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  displayUntil?: string;
}

// GET /api/announcements/active - Get only active announcements for public display
export async function GET(request: NextRequest) {
  try {
    const filePath = path.join(DATA_DIR, 'announcements.json');
    const data = await fs.readFile(filePath, 'utf-8');
    const { announcements } = JSON.parse(data);

    // Filter for active announcements
    const now = new Date();
    const activeAnnouncements = announcements.filter((ann: Announcement) => {
      if (!ann.isActive) return false;
      
      // Check if announcement has expired
      if (ann.displayUntil) {
        const displayUntil = new Date(ann.displayUntil);
        if (displayUntil < now) return false;
      }
      
      return true;
    });

    // Sort by updated date (newest first)
    activeAnnouncements.sort((a: Announcement, b: Announcement) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return NextResponse.json({ announcements: activeAnnouncements });
  } catch (error) {
    console.error('Error fetching active announcements:', error);
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
  }
}

