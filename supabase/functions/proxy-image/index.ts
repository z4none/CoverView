import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const imageUrl = url.searchParams.get('url');

    if (!imageUrl) {
      return new Response('Missing url parameter', { status: 400, headers: corsHeaders });
    }

    console.log(`Proxying image: ${imageUrl}`);

    const imageResponse = await fetch(imageUrl);

    if (!imageResponse.ok) {
      return new Response(`Failed to fetch image: ${imageResponse.statusText}`, { status: imageResponse.status, headers: corsHeaders });
    }

    const imageBlob = await imageResponse.blob();

    // Forward the content-type (e.g., image/jpeg, image/webp)
    const contentType = imageResponse.headers.get('content-type') || 'application/octet-stream';

    return new Response(imageBlob, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable' // Cache aggressively since random images might change URL but content for a specific URL should be stable? actually random API redirects.
        // For the random API, the browser requests proxy?url=...t=timestamp.
        // The proxy fetches it. 
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
