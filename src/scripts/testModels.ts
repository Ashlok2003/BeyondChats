
import dotenv from 'dotenv';

dotenv.config();

async function listModels() {
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set');
    return;
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    console.log('Fetching models from:', url.replace(apiKey, 'HIDDEN_KEY'));

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      console.error('API Error:', JSON.stringify(data.error, null, 2));
    } else if (data.models) {
      console.log('Available Models:');
      data.models.forEach((m: any) => console.log(` - ${m.name}`));
    } else {
      console.log('Unexpected response:', data);
    }

  } catch (error) {
    console.error('Fatal error:', error);
  }
}

listModels();
