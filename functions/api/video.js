export async function onRequest(context) {
  const url = new URL(context.request.url);
  const videoId = url.searchParams.get('id');

  // If no ID is provided, return an error
  if (!videoId) {
    return new Response(JSON.stringify({ error: "No video ID provided" }), { status: 400 });
  }

  // Simulate a database lookup. 
  // In reality, this could check Cloudflare D1 or KV to get the real video URL.
  const videoData = {
    id: videoId,
    // Replace this with a real video source when you have it
    url: "https://www.w3schools.com/html/mov_bbb.mp4", 
    title: "Awesome Video",
  };

  return new Response(JSON.stringify(videoData), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*' // Allows cross-origin embedding
    }
  });
}
