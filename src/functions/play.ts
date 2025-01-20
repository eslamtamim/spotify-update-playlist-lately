import { app, HttpRequest, HttpResponse, InvocationContext } from '@azure/functions';
import { getCurrentPlaying, setCurrentPlaying } from '../helpers/spotifty_helpers';

async function play(req: HttpRequest, _: InvocationContext): Promise<HttpResponse> {
  const id = req.query.get('id');
  let res: Record<string, any> = {};
  if (id) {
    console.log('req.url: ', req.url, 'id: ', id);
    await setCurrentPlaying(id);
    res = { set_current: 'ok', ...res };
  }
  const playing = await getCurrentPlaying();
  const playing_status = playing.is_playing
    ? `${playing.item.name} - ${playing.item.artists.map((e: { name: any }) => e.name).join(', ')}`
    : 'not playing or paused, ping me a song :D';
  res = { ...res, playing: playing_status };
  return new HttpResponse({
    status: 200,
    jsonBody: res,
  });
}
app.http('play', { route: 'play', methods: ['GET'], handler: play });
