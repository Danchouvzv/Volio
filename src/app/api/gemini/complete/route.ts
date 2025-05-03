import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Limit for requests per minute per user
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 1000; // 1 minute

// In-memory rate limiting (replace with Redis in production)
const rateLimitCache = new Map<string, { count: number, timestamp: number }>();

/**
 * POST /api/gemini/complete
 * Send a prompt to Gemini API and get a response
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting
    const userId = session.user.id;
    const now = Date.now();
    const userRateLimit = rateLimitCache.get(userId);

    if (userRateLimit) {
      // Reset counter if window has passed
      if (now - userRateLimit.timestamp > RATE_WINDOW_MS) {
        rateLimitCache.set(userId, { count: 1, timestamp: now });
      } else if (userRateLimit.count >= RATE_LIMIT) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Try again later.' },
          { status: 429 }
        );
      } else {
        // Increment counter
        rateLimitCache.set(userId, {
          count: userRateLimit.count + 1,
          timestamp: userRateLimit.timestamp
        });
      }
    } else {
      // First request in this window
      rateLimitCache.set(userId, { count: 1, timestamp: now });
    }

    // Get request body
    const { prompt, type, contextData, locale } = await req.json();

    // Validate inputs
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 });
    }

    if (!type || !['command', 'rewrite', 'reply'].includes(type)) {
      return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
    }

    // Get Gemini API key from environment variables
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Gemini API key not found');
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    // Prepare prompt based on type
    let fullPrompt = '';
    
    switch (type) {
      case 'command':
        fullPrompt = `You are Volio, a volunteering platform assistant.
Given the user query: "${prompt}", suggest up to 3 helpful actions they can take.
Respond with a JSON array of command objects with the following structure:
[{
  "id": "unique-id",
  "name": "Command name, short and actionable",
  "description": "Brief description of what this command does",
  "url": "Relative URL to navigate to (starting with /)",
  "category": "ai"
}]
Keep the responses relevant to volunteering, events, connections, badges, or platform usage.
Response language: ${locale || 'en'}`;
        break;
      
      case 'rewrite':
        fullPrompt = `Rewrite the following invitation text in a friendly, approachable tone. 
Keep it concise (max 280 characters), enthusiastic, and engaging.
Language: ${locale || 'en'}

Original text:
"${prompt}"`;
        break;
      
      case 'reply':
        fullPrompt = `Given the following chat conversation, suggest 2-3 short, natural replies that the user might want to send.
Responses should be authentic, conversational, and relevant to the volunteering context.
Output format: JSON array of strings. Example: ["Sure, I'd love to help!", "When is the event?"]
Language: ${locale || 'en'}

Chat history:
${prompt}`;
        break;
      
      default:
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    // Call Gemini API (note: this is a demonstration/placeholder)
    try {
      // For now, return mock responses since we haven't integrated the actual API call yet
      // In production, you would make a fetch request to the Gemini API here
      
      // Mock responses for demonstration
      let mockResponse: any;
      
      switch (type) {
        case 'command':
          mockResponse = [
            {
              id: 'cmd-1',
              name: locale === 'ru' ? 'Найти ближайшие события' : 
                    locale === 'kz' ? 'Жақын іс-шараларды табу' : 
                    'Find nearby events',
              description: locale === 'ru' ? 'Поиск волонтерских возможностей в вашем районе' : 
                          locale === 'kz' ? 'Cіздің ауданыңыздағы еріктілік мүмкіндіктерін іздеу' : 
                          'Search for volunteering opportunities in your area',
              url: '/events?nearby=true',
              category: 'ai'
            }
          ];
          break;
        
        case 'rewrite':
          mockResponse = locale === 'ru' ? 
            'Привет! Мы организуем волонтерское мероприятие и будем рады видеть тебя. Твои навыки будут очень полезны. Присоединишься к нам?' : 
            locale === 'kz' ? 
            'Сәлем! Біз еріктілер іс-шарасын ұйымдастырып жатырмыз және сізді көргенімізге қуаныштымыз. Сіздің дағдыларыңыз өте пайдалы болады. Бізге қосыласыз ба?' :
            'Hey there! We\'re organizing a volunteer event and would love to have you join us. Your skills would be super helpful. Are you in?';
          break;
        
        case 'reply':
          mockResponse = locale === 'ru' ? 
            ['Конечно, я могу помочь!', 'Когда состоится это мероприятие?', 'Мне нужно больше информации'] : 
            locale === 'kz' ? 
            ['Әрине, мен көмектесе аламын!', 'Бұл іс-шара қашан болады?', 'Маған көбірек ақпарат керек'] :
            ['Sure, I can help!', 'When is this event taking place?', 'I need more information'];
          break;
      }

      return NextResponse.json({ result: mockResponse });
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return NextResponse.json(
        { error: 'Failed to generate response' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error in Gemini API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 