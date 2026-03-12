const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // AniList GraphQL API - free, no key needed
    const query = `
      query {
        Media(search: "Xian Ni", type: ANIME, format: ONA) {
          id
          title {
            romaji
            english
            native
          }
          episodes
          nextAiringEpisode {
            airingAt
            episode
            timeUntilAiring
          }
          status
          season
          seasonYear
          description
          coverImage {
            extraLarge
            large
            medium
          }
          bannerImage
          averageScore
          meanScore
          genres
          studios {
            nodes {
              name
            }
          }
          streamingEpisodes {
            title
            thumbnail
            url
            site
          }
        }
      }
    `;

    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('AniList API error:', data);
      return new Response(
        JSON.stringify({ success: false, error: `AniList API error: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const media = data?.data?.Media;
    if (!media) {
      return new Response(
        JSON.stringify({ success: false, error: 'No media data found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: media }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching episodes:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
