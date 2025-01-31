// netlify/functions/getSubmissions.js
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const { NETLIFY_ACCESS_TOKEN } = process.env;
  const siteId = process.env.SITE_ID;
  
  if (!NETLIFY_ACCESS_TOKEN || !siteId) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Missing required environment variables' })
    };
  }

  try {
    // Fetch both forms' submissions
    const [rumors, sightings] = await Promise.all([
      fetch(`https://api.netlify.com/api/v1/sites/${siteId}/forms/pliny-rumor/submissions`, {
        headers: {
          'Authorization': `Bearer ${NETLIFY_ACCESS_TOKEN}`
        }
      }).then(res => res.json()),
      fetch(`https://api.netlify.com/api/v1/sites/${siteId}/forms/pliny-sighting/submissions`, {
        headers: {
          'Authorization': `Bearer ${NETLIFY_ACCESS_TOKEN}`
        }
      }).then(res => res.json())
    ]);

    return {
      statusCode: 200,
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rumors: rumors.map(r => ({
          location: r.data.location,
          dateStart: r.data.dateStart,
          dateEnd: r.data.dateEnd,
          createdAt: r.created_at
        })),
        sightings: sightings.map(s => ({
          location: s.data.location,
          gpsCoords: s.data.gpsCoords,
          dateSeen: s.data.dateSeen,
          createdAt: s.created_at
        }))
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error fetching submissions' })
    };
  }
}