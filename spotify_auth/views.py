import os
import sys
import spotipy
import spotipy.util as util
import webbrowser

from django.contrib.sessions.backends.base import SessionBase
from django.core import signing
from django.http import HttpResponse, HttpRequest

from dotenv import load_dotenv

import requests

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView, ListAPIView, RetrieveAPIView

from user.serializers import SpotifyUserSerializer, SongSerializer
from user.models import Song

spotify_client_id = os.getenv('SPOTIPY_CLIENT_ID')
print(spotify_client_id)
spotify_client_secret = os.getenv('SPOTIPY_CLIENT_SECRET')
print(spotify_client_secret)
spotify_redirect_uri = os.getenv('SPOTIPY_REDIRECT_URI')
print(spotify_redirect_uri)

scope = 'user-library-read user-top-read user-read-recently-played user-read-currently-playing'

# if len(sys.argv) > 1:
#     username = sys.argv[1]
# else:
#     print("Usage: %s username" % (sys.argv[0],))
#     sys.exit()

# token = util.prompt_for_user_token(username, scope, client_id=spotify_client_id,client_secret=spotify_client_secret,redirect_uri=spotify_redirect_uri)

# if token:
#     sp = spotipy.Spotify(auth=token)
#     results = sp.current_user_saved_tracks()
#     for item in results['items']:
#         track = item['track']
#         print(track['name'] + ' - ' + track['artists'][0]['name'])
# else:
#     print("Can't get token for", username)




# print(url)
# code = sp.parse_response_code('https://www.whatify.com/whatify?code=AQDTHh3oJXiMyzdSlZFcwVn7BBYxrafyDPoEh04dK_yqn8SNKEl3qtOR-i9WtgB1SWvViYYNaqq3OVzqRE_1ev0KTMS--7G-i7Mc_FmeRdWhmIJAbvuh2sOO9xTUsDu_KxHXFGflhiYXh_1Fx8wGPhHYFlpA_AvijAivQz-SMSykZMYa-8TSQ40b19syBW1-o6uO5k1VjRjKaXIoXRIgiexmcg')
# print(code)
# token = ''
# cache = sp.get_access_token('')
# print(cache)


sp = None
authed_spotify = None

class AuthOutput(APIView):
    def get(self, _request):
        global sp 
        sp = None
        sp = spotipy.oauth2.SpotifyOAuth(spotify_client_id, spotify_client_secret, spotify_redirect_uri, state=None, scope=scope, cache_path=None, proxies=None)
        url = sp.get_authorize_url()
        return Response(url)


class Callback(RetrieveUpdateDestroyAPIView):
    def post(self, request):
        global sp
        # queryset = self.get_queryset()
        callback_url = request.body.decode("utf-8")
        # print(callback_url)
        # object1.replace('b\'?code=', '')
        # callback_url = object1.get(())
        token_num = sp.get_access_token(callback_url)
            #now cash response in cookie

            #token extract now needs to = cookie called access_token
        token_extract = token_num.get('access_token')


          #the below might need to be a new function called when we get to  /dash
        global authed_spotify
        authed_spotify = spotipy.Spotify(auth=token_extract)
        request = authed_spotify.me()
        user_id = request.get('id')
        # print(request)
 
        dash_url = 'http://localhost:8000/dash'
        payload = {'token': 'poop'}
        session = requests.Session() # save an instance of request.Session
        session.post(dash_url, data=payload, verify=False)
        session.get('http://localhost:8000/dash')


        return Response(user_id)



        # return Response(print(token.get('access_token')))
        # print('access: ', token.get('access_token'))
        # return Response(request.GET)




class RetrieveUser(APIView):
    def get(self, _request):
        profile_data = authed_spotify.me()
        #if profilr_data['images] is true, then set img = profile_data['images'][0]['url'], else, return none
        image = profile_data['images'][0]['url'] if profile_data['images'] else 'https://news.artnet.com/app/news-upload/2016/03/kanye-west-crop-e1458141735868-256x256.jpg'

        payload = {
        'displayname': profile_data.get('display_name'),
        'username': profile_data.get('id'),
        'image': image,
        'songs': []
        }
        # if (not image):
        #   image = 'No image'
        createdSpotifyUser = SpotifyUserSerializer(data=payload)
        if createdSpotifyUser.is_valid():
          createdSpotifyUser.save()
        
        # r = requests.post('http://localhost:8000/db/user', data=payload)
      
        whole_object = authed_spotify.current_user_top_tracks(limit=50, offset=0, time_range='medium_term')
        whole_object_items = whole_object['items']
      
        for i, index in enumerate(whole_object_items):
            # print(index, i)
            track_id = whole_object_items[i]['id']
            track_name = whole_object_items[i]['name']
            track_artist = whole_object_items[i]['album']['artists'][0]['name']
            track_preview = whole_object_items[i]['preview_url']
            track_in_album = whole_object_items[i]['album']['name']
            track_album_art = whole_object_items[i]['album']['images'][0]['url']

            song_payload = {
              "track_id": track_id,
              "track_name": track_name,
              "track_artist": track_artist,
              "track_preview": track_preview,
              "track_in_album": track_in_album,
              "track_album_art": track_album_art,
              "owner": profile_data.get('id')
            }
            collections_payload = {
                'SpotifyUser_username_id': profile_data.get('id'),
                'Song_track_id': track_id
            }
            
          
            createdSong = SongSerializer(data=song_payload)
            
            if createdSong.is_valid():
              createdSong.save()

            # r = requests.post('http://localhost:8000/db/songcreate', data=song_payload)

        # print(total_object)
        # r = requests.post('http://localhost:8000/db/collections', data=total_object)

        # print('track id ', 'song id = ', track_id)
        # print('top song is called', track_name, 'by', track_artist, 'from the album', track_in_album)
        # print('listen here: ', track_preview)
        # print('album art: ', track_album_art)

        return Response(profile_data.get('id'))


class ListUserSongs(ListAPIView):
    queryset = Song.objects.all()
    serializer_class = SongSerializer

def cookie_session(request):
    request.session.set_test_cookie()
    return HttpResponse("<h1>test<h1>")


# get data from spotify
# make sure its in a json format
# make a post request from the backend using request with the body of the request holding the json data


# track_id = whole_object['items'][0]['id']
#         track_name = whole_object['items'][0]['name']
#         track_artist = whole_object['items'][0]['album']['artists'][0]['name']
#         track_preview = whole_object['items'][0]['preview_url']
#         track_in_album = whole_object['items'][0]['album']['name']
#         track_album_art = whole_object['items'][0]['album']['images'][0]['url']