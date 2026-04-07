import { PipelineBox } from '../types/scenario';
import { ParsedBoxResult } from './prompts';

const DELAY_MS = 20;

/**
 * Simulates a server-sent stream by slowly typing out text chunks.
 */
async function streamText(text: string, onChunk: (chunk: string) => void) {
  // Break text into small chunks to simulate network streaming
  // We can vary chunk size randomly for realism (1 to 5 characters)
  let i = 0;
  while (i < text.length) {
    const chunkSize = Math.floor(Math.random() * 5) + 1;
    const chunk = text.substring(i, i + chunkSize);
    onChunk(chunk);
    i += chunkSize;
    
    // Add artificial delay
    await new Promise(resolve => setTimeout(resolve, DELAY_MS));
  }
}

/**
 * Converts a static saved PipelineBox to a ParsedBoxResult
 * and artificially streams a string back to the UI.
 */
export async function runStaticSimulationStream(
  box: PipelineBox,
  isPresident: boolean,
  onChunk: (chunk: string) => void
): Promise<ParsedBoxResult> {
  // Construct a raw string representation of the dialogue/recommendation
  let rawText = '';
  
  if (box.transcript && box.transcript.length > 0) {
    box.transcript.forEach(msg => {
      rawText += `[${msg.name}]: ${msg.content}\n`;
    });
  }
  
  if (!isPresident) {
    rawText += `\nRECOMMENDATION: ${box.recommendation}\nSUMMARY: ${box.summary}\n`;
  } else {
    rawText += `\nVERDICT: ${box.recommendation}\nIMPACT ANALYSIS: ${box.summary}\n`;
  }

  // Await the streaming simulation
  await streamText(rawText, onChunk);

  // Return the directly extracted static data, formatted for the UI
  return {
    transcript: box.transcript || [],
    voteFor: box.status === 'approved' ? 5 : box.status === 'rejected' ? 0 : 3, // Fallback mock votes
    voteTotal: box.id === 'heads' ? 3 : (isPresident ? 0 : 5),
    recommendation: box.recommendation,
    summary: box.summary,
    stats: box.stats
  };
}
