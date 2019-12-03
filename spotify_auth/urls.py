from django.urls import path
from .views import AuthOutput, Callback, RetrieveUser, ListUserSongs, cookie_session

urlpatterns = [
  path('login', AuthOutput.as_view()),
  path('callback', Callback.as_view()),
  path('retrieve', RetrieveUser.as_view()),
  path('usersongs', ListUserSongs.as_view())
]
