from django.urls import path
from .views import SpotifyUserListView, SongCreateView, CollectionsListView, SpotifyUserDetailView

urlpatterns = [
    path('user', SpotifyUserListView.as_view()),
    path('user/<int:pk>', SpotifyUserDetailView.as_view()),
    path('songcreate', SongCreateView.as_view()),
    path('collections', CollectionsListView.as_view())
]
