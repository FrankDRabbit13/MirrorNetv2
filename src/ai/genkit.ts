
/**
 * @fileoverview This file initializes and a configures the Genkit AI instance.
 * It sets up the necessary plugins, such as the Google AI plugin.
 * It is configured to fetch the GEMINI_API_KEY from Google Cloud Secret Manager.
 */
import {genkit, GenkitError} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {SecretManagerServiceClient} from '@google-cloud/secret-manager';

// Helper function to fetch the secret from Google Cloud Secret Manager
async function getApiKey(): Promise<string> {
  // If the key is already in the environment, use it. This allows local development to work.
  if (process.env.GEMINI_API_KEY) {
    console.log('Using GEMINI_API_KEY from environment variable.');
    return process.env.GEMINI_API_KEY;
  }

  // If in a Google Cloud environment, fetch the secret directly.
  try {
    console.log('GEMINI_API_KEY not in env, fetching from Secret Manager...');
    const client = new SecretManagerServiceClient();
    const secretName = 'projects/mirrornet-96cce/secrets/GEMINI_API_KEY/versions/latest';
    console.log(`Accessing secret version: ${secretName}`);
    
    const [version] = await client.accessSecretVersion({name: secretName});
    
    const apiKey = version.payload?.data?.toString();
    if (!apiKey) {
      console.error('Secret payload is empty or undefined.');
      throw new Error('Secret payload is empty.');
    }
    console.log('Successfully fetched API key from Secret Manager.');
    return apiKey;
  } catch (error: any) {
    console.error('!!! FAILED TO FETCH API KEY FROM SECRET MANAGER !!!');
    console.error('Error Code:', error.code);
    console.error('Error Details:', error.details);
    console.error('Full Error:', JSON.stringify(error, null, 2));
    throw new GenkitError({
      status: 'UNAVAILABLE',
      message:
        `Could not fetch GEMINI_API_KEY from Secret Manager. ` +
        `Please check the server logs for detailed error information.`,
    });
  }
}

// Initialize the Genkit AI instance with the Google AI plugin.
// This must be wrapped in an async function to handle the API key retrieval.
async function initializeGenkit() {
  const apiKey = await getApiKey();
  return genkit({
    plugins: [
      googleAI({
        apiKey: apiKey,
      }),
    ],
  });
}

// We export the promise that resolves to the initialized 'ai' object.
// Next.js and modern bundlers can handle this async import.
export const ai = initializeGenkit();
