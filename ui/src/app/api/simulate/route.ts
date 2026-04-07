import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt, model = 'smollm:135m' } = await req.json();

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      body: JSON.stringify({
        model,
        prompt,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    // Create a TransformStream to handle the response
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const reader = response.body?.getReader();

    if (!reader) {
      throw new Error('Response body is empty');
    }

    // Process the stream
    (async () => {
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const json = JSON.parse(line);
              if (json.response) {
                await writer.write(encoder.encode(json.response));
              }
              if (json.done) {
                await writer.close();
                return;
              }
            } catch (e) {
              console.error('Error parsing Ollama JSON:', e);
            }
          }
        }
      } catch (err) {
        console.error('Stream error:', err);
        writer.abort(err);
      } finally {
        try {
          await writer.close();
        } catch (e) {
          // Writer might already be closed
        }
      }
    })();

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });

  } catch (error: any) {
    console.error('Simulation API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
