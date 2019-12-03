## Project 4
# General Assembly Software Engineering : Whatify

## Timeframe
7 Days

## Technologies Used
* Python
* Django
* PostgreSQL
* React.js
* JavaScript (ES6) / HTML5 / SCSS
* Git / GitHub
* Heroku

## Overview
Whatify is a music-quiz app which generates questions based on your personal listening data from Spotify.

Using open-authentication, users are able to connect to our app with Spotify and with consent, we are able to store user listening data on our own servers, and generate quizzes based off this information.

We store the results of this listening data on our own postgreSQL to streamline the backend process in requesting data for every quiz session.

## Instructions
1. You can start your session by clicking ‘Connect with Spotify’ on the home page. If you are not already logged in with Spotify, you will be redirected to Spotify’s login page, where you can sign in and sign Whatify’s terms of use.

![frontpage](https://i.imgur.com/Bc4ph0B.png)

2. Once logged in, you will be directed to your dashboard where you have the selection of ‘Play Game’, “Leaderboard’, and ‘Log Out’. To continue to the game, click ‘Play Game’.

3. When the loading has been completed, you will be given the option to ‘Play Game’ or ‘Cancel’ to go back to the dashboard. Click ‘Play Game’ to start the game.

![frontpage](https://i.imgur.com/MTU0Dwv.png)

4. Every round will last 30 seconds, based off the preview URL supplied by Spotify’s API. Points are a reflection of how fast you answer, and so the blue progress bar represents how long you have to answer a question.

5. A game lasts 10 rounds. Upon quiz completion, you will be shown an end-game screen reflecting your metrics from the game; time spent per round, points earnt and correct /  incorrect answers. 

6. From the end-game screen you can choose to play again or return to your dashboard. The dashboard can also show you the leaderboard, where you can view the highest scorers on Whatify.

# Installation

We use pipenv to create a virtual environment for python, if you require a virtual environment we recommend pipenv via `$ brew install pipenv`.

Make sure to install all our package dependencies from our package-lock files via `$ npm install` and `$ pipenv install` before starting.

# Process
This was a group project with 3 developers working together, [@Tom Good](https://github.com/TE-Good), [@Matt Davey](https://github.com/nuclearsheep540) and [@Matt Wilkie](https://github.com/MattPRW). We used pen and paper to manage a lot of our plans in-real time due to the short length of our task.

As a team we decided to follow a lot of Agile workflow methodologies; we started every day with a stand-up for the day discussing what problems we had to solve for the day, including any unresolved issues from the day before; we built the whole project via pair programming where every developer had a chance in navigating. We also followed the principles of feature-driven development (FDD) as we knew there was a lot to get build in a short amount of time, this way we were able to isolate certain features into bite-sized and manageable tasks.

The first features we had to focus on was Spotify user Authentication, we chose to dedicate 2 days of our task to this feature, knowing it was the biggest prerequisite to run our site’s quiz. We knew we had to at least get this feature working standalone before knowing the rest of the product could be built.

We began back end development by planning models and serializers required for the game-data that would be populated later in our postgreSQL database from the Spotify API requests. Using Django, we built views to control requests to and from Spotify API and our database to control data to and from the client. We built requests which gathered user data upon logging in, this creates a streamlined experience by gathering data in the background and enables a quick transition from log in to starting game.


```python
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
        callback_url = request.body.decode("utf-8")
        token_num = sp.get_access_token(callback_url)     
        token_extract = token_num.get('access_token')
        authed_spotify = spotipy.Spotify(auth=token_extract)
        request = authed_spotify.me()
        
        return Response(user_id)

class RetrieveUser(APIView):
    def get(self, _request):
        profile_data = authed_spotify.me()
        image = profile_data['images'][0]['url'] if profile_data['images'] else 'https://news.artnet.com/app/news-upload/2016/03/kanye-west-crop-e1458141735868-256x256.jpg'
                    #if profilr_data['images] is true, then set img = profile_data['images'][0]['url'], else, return Kanye
        payload = {
        'displayname': profile_data.get('display_name'),
        'username': profile_data.get('id'),
        'image': image,
        'songs': []
        }

        createdSpotifyUser = SpotifyUserSerializer(data=payload)

        if createdSpotifyUser.is_valid():
          createdSpotifyUser.save()
        
        whole_object = authed_spotify.current_user_top_tracks(limit=50, offset=0, time_range='medium_term')
        whole_object_items = whole_object['items']
      
        for i, index in enumerate(whole_object_items):
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
        return Response(profile_data.get('id'))
```

Game logic and our front end were also tackled independently during our FDD approach. We visualised our game logic by wireframing on pen and paper, understanding the problems we were going to approach and how to overcome them. Our second phase involved hard-coding data into our react-state to emulate a real expectation from our back end at a scalable level. We were able to successfully build our game logic around this placeholder of data, and upon connecting our back end the next day, there were no issues and all the requests fit into place seamlessly.

# Challenges
Open auth as a concept, was a challenge to work with. As a new technology we weren’t familiar with, getting to grips with technology that authenticates users for third party apps was at first tricky and hard to test. It was difficult troubleshooting our build while unsure of how open auth works, so this made it a real challenge.

We initially attempted to create a many to many relationship table in our postgreSQL database to keep the database storage-efficient. We found combining the many to many table with user generated data challenging, due to the self-populating nature of the tables. As a short-term solution, we altered the song model to accept a username as a reference for us to filter in the front end.

# Wins
Once we understood open auth, it became clearer on how to troubleshoot during our build and we’re proud of the result we’ve attained. Open authentication is something commonly found out there and we see it as a big win having successfully used it in our project.

The user generated population of tables was a task which the team had not faced before, and was required for our website to function. However, when tackling this we managed to complete the task relatively smoothly.

# Further features
If we had more time, we could have incorporated the many to many relationship table into the database to streamline the back end, and potentially cut down the front end calls to one.

By default, the library we use to utilise Spotify’s open authentication, caches auth tokens server-side, this is resulting in only single-instances of authed users. To rectify this, we need to offset the access token from server-side to client-side, and we could achieve this via either signed cookies or local storage given more time.
