import * as fs from 'fs';
import * as os from 'os';

async function fetchWebApi(endpoint: string, method: string, body: any = null) {
  const tmpDir = os.tmpdir();
  let token = '';
  try {
    token = fs.readFileSync(`${tmpDir}/token`, 'utf8').trim();
  } catch (e) {
    console.log('Token not found');
    token = await getToken();
    fs.writeFileSync(`${tmpDir}/token`, token);
  }

  let payload: Record<string, any> = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    method,
  };
  if (body) payload.body = JSON.stringify(body);
  const res = await fetch(`https://api.spotify.com/${endpoint}`, payload);

  return await res.json();
}

export async function UpdatePlaylist(playlist_id: string, uris: string) {
  console.log(`Adding ${uris} to ${playlist_id}`);
  return await fetchWebApi(`v1/playlists/${playlist_id}/tracks?uris=${uris}`, 'PUT', {
    range_start: 1,
  });
}

export async function getTopTracks() {
  // Endpoint reference : https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks
  const res = await fetchWebApi('v1/me/top/tracks?time_range=short_term&limit=10', 'GET');
  const items = res.items;
  if (!items) {
    console.log('No items found', res);
  }
  return items;
}

async function getToken(): Promise<string> {
  const client_id = process.env['SPOTIFY_CLIENT_ID'];
  const client_secret = process.env['SPOTIFY_CLIENT_SECRET'];
  const refresh_token = process.env['SPOTIFY_REFRESH_TOKEN'];

  const data = new URLSearchParams();
  data.append('grant_type', 'refresh_token');
  data.append('refresh_token', refresh_token);
  data.append('client_id', client_id);
  data.append('client_secret', client_secret);

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: data,
  });

  const json = await res.json();
  return json.access_token;
}
