
import { NextResponse } from 'next/server';

// Placeholder data - In a real app, fetch this from a database or CMS
const testimonialsData = [
  { id: 1, name: 'Aisha K.', quote: 'VolioLite made finding local volunteering so easy! I connected with a great cause.', avatar: 'https://picsum.photos/seed/aisha/80/80' },
  { id: 2, name: 'Timur B.', quote: 'Organizing events is much smoother now. The platform helps manage participants effectively.', avatar: 'https://picsum.photos/seed/timur/80/80' },
  { id: 3, name: 'Gulnara S.', quote: 'I love earning badges! It’s a fun way to see my contributions recognized.', avatar: 'https://picsum.photos/seed/gulnara/80/80' },
];

export async function GET(request: Request) {
  // Add latency to simulate network delay (optional)
  // await new Promise(resolve => setTimeout(resolve, 500));

  try {
    // In a real app, add logic for authentication, pagination, filtering etc.
    return NextResponse.json(testimonialsData);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json({ message: 'Failed to fetch testimonials' }, { status: 500 });
  }
}
