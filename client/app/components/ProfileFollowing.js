import React, { useEffect, useState, useContext } from 'react';
import Axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import LoadingDotsIcon from './LoadingDotsIcon';
import StateContext from '../StateContext';

function ProfileFollowing() {
  const { username } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState([]);
  const appState = useContext(StateContext);

  // Get following users from server
  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();

    async function fetchFollowing() {
      try {
        const response = await Axios.get(`/profile/${username}/following`, {
          cancelToken: ourRequest.token,
        });
        setPosts(response.data);
        setIsLoading(false);
      } catch (e) {
        console.log('There was a problem or the request was cancelled.');
      }
    }
    fetchFollowing();

    return () => {
      ourRequest.cancel();
    };
  }, [username]);

  // If the response from the server is not received
  if (isLoading) return <LoadingDotsIcon />;

  // Rendering followers users
  return (
    <div className="list-group">
      {posts.length > 0 &&
        posts.map((following, index) => {
          return (
            <Link
              key={index}
              to={`/profile/${following.username}`}
              className="list-group-item list-group-item-action"
            >
              <img className="avatar-tiny" src={following.avatar} />{' '}
              <strong>{following.username}</strong>
            </Link>
          );
        })}
      {posts.length == 0 && appState.user.username == username && (
        <p className="lead text-muted text-center">
          You aren&rsquo;t following anyone yet.
        </p>
      )}
      {posts.length == 0 && appState.user.username != username && (
        <p className="lead text-muted text-center">
          {username} isn&rsquo;t following anyone yet.
        </p>
      )}
    </div>
  );
}

export default ProfileFollowing;
