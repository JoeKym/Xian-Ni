const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'News service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Searching for Renegade Immortal news...');

    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'Renegade Immortal Xian Ni donghua anime news 2025 2026',
        limit: 10,
        lang: 'en',
        tbs: 'qdr:m',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Firecrawl API error:', data);
      return new Response(
        JSON.stringify({ success: false, error: data.error || `Request failed: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Transform results into news items
    const newsItems = (data.data || []).map((item: any) => ({
      title: item.title || 'Untitled',
      url: item.url || '',
      source: extractSource(item.url || ''),
      snippet: item.description || item.markdown?.substring(0, 200) || '',
      date: new Date().toISOString().split('T')[0],
    }));

    console.log(`Found ${newsItems.length} news items`);

    return new Response(
      JSON.stringify({ success: true, data: newsItems }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching news:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function extractSource(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    const domainMap: Record<string, string> = {
      'bilibili.com': 'Bilibili',
      'myanimelist.net': 'MyAnimeList',
      'anilist.co': 'AniList',
      'reddit.com': 'Reddit',
      'youtube.com': 'YouTube',
      'novelupdates.com': 'Novel Updates',
      'twitter.com': 'Twitter',
      'x.com': 'X',
    };
    return domainMap[hostname] || hostname;
  } catch {
    return 'Web';
  }
}
