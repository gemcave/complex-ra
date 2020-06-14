/* eslint-disable no-inner-declarations */
import React, { useState, useEffect, useContext } from 'react';
import Page from './Page';
import axios from 'axios';
import { useParams, Redirect } from 'react-router-dom';
import { Link } from 'react-router-dom';
import LoadingDotsIcon from './LoadingDotsIcon';
import ReactMarkdown from 'react-markdown';
import ReactTooltip from 'react-tooltip';
import NotFound from './NotFound';
import StateContext from '../StateContext';
import DispatchContext from '../DispatchContext';

const ViewSinglePost = () => {
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [post, setPost] = useState();
  const [deleteAttemptCount, setDeleteAttemptCount] = useState(0);
  const [deleteWasSuccessful, setDeleteWasSuccessful] = useState(false);

  useEffect(() => {
    const axiosReq = axios.CancelToken.source();

    async function fetchPost() {
      try {
        const response = await axios.get(`/post/${id}`, {
          cancelToken: axiosReq.token,
        });

        setPost(response.data);
        setIsLoading(false);
      } catch (e) {
        console.log('There was a problem.');
      }
    }
    fetchPost();
    return () => {
      axiosReq.cancel();
    };
  }, [id]);

  useEffect(() => {
    const axiosReq = axios.CancelToken.source();

    if (deleteAttemptCount) {
      async function deletePost() {
        try {
          const response = await axios.delete(
            `/post/${id}`,
            {
              data: {
                token: appState.user.token,
              },
            },
            {
              cancelToken: axiosReq.token,
            }
          );

          if (response.data == 'Success') {
            setDeleteWasSuccessful(true);
          }

          setPost(response.data);
          setIsLoading(false);
        } catch (e) {
          console.log('There was a problem.');
        }
      }
      deletePost();
    }
    return () => {
      axiosReq.cancel();
    };
  }, [deleteAttemptCount]);

  if (isLoading) {
    return (
      <Page title="">
        <LoadingDotsIcon />
      </Page>
    );
  }

  if (deleteWasSuccessful) {
    appDispatch({
      type: 'flashMessage',
      value: 'Post was successfully deleted!',
    });
    return <Redirect to={`/profile/${appState.user.username}`} />;
  }

  if (!isLoading && !post) {
    return (
      <Page title="Not Found">
        <NotFound />
      </Page>
    );
  }

  const date = new Date(post.createdDate);
  const dateFormatted = `${
    date.getMonth() + 1
  }/${date.getDate()}/${date.getFullYear()}`;

  const isOwner = () => {
    if (appState.loggedIn) {
      return appState.user.username == post.author.username;
    }
    return false;
  };

  const deleteHandler = () => {
    const areYouSure = window.confirm(
      'Do you really want to delete this post?'
    );
    if (areYouSure) {
      setDeleteAttemptCount((prev) => prev + 1);
    }
  };

  return (
    <Page title={`${post.title}`}>
      <div className="d-flex justify-content-between">
        <h2>{post.title}</h2>
        {isOwner() && (
          <span className="pt-2">
            <Link
              data-tip="Edit"
              data-for="edit"
              to={`/post/${post._id}/edit`}
              className="text-primary mr-2"
            >
              <i className="fas fa-edit"></i>
            </Link>
            <ReactTooltip id="edit" className="custom-tooltip" />{' '}
            <a
              onClick={deleteHandler}
              data-tip="Delete"
              data-for="delete"
              className="delete-post-button text-danger"
            >
              <i className="fas fa-trash"></i>
            </a>
            <ReactTooltip id="delete" className="custom-tooltip" />
          </span>
        )}
      </div>

      <p className="text-muted small mb-4">
        <Link to={`/profile/${post.author.username}`}>
          <img className="avatar-tiny" src={post.author.avatar} />
        </Link>
        Posted by{' '}
        <Link to={`/profile/${post.author.username}`}>
          {post.author.username}
        </Link>{' '}
        on {dateFormatted}
      </p>

      <div className="body-content">
        <ReactMarkdown
          source={post.body}
          allowedTypes={[
            'paragraph',
            'strong',
            'emphasis',
            'text',
            'heading',
            'list',
            'listItem',
          ]}
        />
      </div>
    </Page>
  );
};

export default ViewSinglePost;
