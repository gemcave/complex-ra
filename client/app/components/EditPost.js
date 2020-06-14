import React, { useState, useEffect, useContext } from 'react';
import Page from './Page';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import LoadingDotsIcon from './LoadingDotsIcon';
import NotFound from './NotFound';
import { useImmerReducer } from 'use-immer';
import StateContext from '../StateContext';
import DispatchContext from '../DispatchContext';
import { Redirect } from 'react-router-dom';

const EditPost = () => {
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);

  const initialEditState = {
    title: {
      value: '',
      hasErrors: false,
      message: '',
    },
    body: {
      value: '',
      hasErrors: false,
      message: '',
    },
    isFetching: true,
    isSaving: false,
    id: useParams().id,
    sendCount: 0,
    notFound: false,
    permissionProblem: false,
  };

  const editReducer = (draftEditState = initialEditState, action) => {
    switch (action.type) {
      case 'fetchComplete':
        (draftEditState.title.value = action.value.title),
          (draftEditState.body.value = action.value.body);
        draftEditState.isFetching = false;
        if (appState.user.value != action.value.author.username)
          draftEditState.permissionProblem = true;
        return;
      case 'titleChange':
        draftEditState.title.hasErrors = false;
        draftEditState.title.value = action.value;
        return;
      case 'bodyChange':
        draftEditState.body.hasErrors = false;
        draftEditState.body.value = action.value;
        return;
      case 'submitRequest':
        if (!draftEditState.title.hasErrors && !draftEditState.body.hasErrors) {
          draftEditState.sendCount++;
        }
        return;
      case 'saveRequestStarted':
        draftEditState.isSaving = true;
        return;
      case 'saveRequestFinished':
        draftEditState.isSaving = false;
        return;
      case 'titleRules':
        if (!action.value.trim()) {
          draftEditState.title.hasErrors = true;
          draftEditState.title.message = 'You must provide a title.';
        }
        return;
      case 'bodyRules':
        if (!action.value.trim()) {
          draftEditState.body.hasErrors = true;
          draftEditState.body.message = 'You must provide a body.';
        }
        return;
      case 'notFound':
        draftEditState.notFound = true;
        return;
      default:
        return draftEditState;
    }
  };

  const [state, dispatch] = useImmerReducer(editReducer, initialEditState);

  const handleSubmit = (e) => {
    e.preventDefault();

    dispatch({ type: 'titleRules', value: state.title.value });
    dispatch({ type: 'bodyRules', value: state.body.value });
    dispatch({ type: 'submitRequest' });
  };

  useEffect(() => {
    const axiosReq = axios.CancelToken.source();

    async function fetchPost() {
      try {
        const response = await axios.get(`/post/${state.id}`, {
          cancelToken: axiosReq.token,
        });

        if (response.data) {
          dispatch({ type: 'fetchComplete', value: response.data });
        } else {
          dispatch({ type: 'notFound' });
        }
      } catch (e) {
        console.log('There was a problem.');
      }
    }
    fetchPost();
    return () => {
      axiosReq.cancel();
    };
  }, []);

  useEffect(() => {
    if (state.sendCount) {
      dispatch({ type: 'saveRequestStarted' });
      const axiosReq = axios.CancelToken.source();

      // eslint-disable-next-line no-inner-declarations
      async function fetchPost() {
        try {
          const response = await axios.post(
            `/post/${state.id}/edit`,
            {
              title: state.title.value,
              body: state.body.value,
              token: appState.user.token,
            },
            { cancelToken: axiosReq.token }
          );
          dispatch({ type: 'saveRequestFinished' });
          appDispatch({ type: 'flashMessage', value: 'Post was updated!' });
        } catch (e) {
          console.log('There was a problem.');
        }
      }
      fetchPost();
      return () => {
        axiosReq.cancel();
      };
    }
  }, [state.sendCount]);

  if (state.notFound) {
    return <NotFound />;
  }

  if (state.isFetching) {
    return (
      <Page title="">
        <LoadingDotsIcon />
      </Page>
    );
  }

  if (state.permissionProblem) {
    appDispatch({
      type: 'flashMessage',
      value: 'You do not have permisson to edit that post.',
    });
    return <Redirect to="/" />;
  }

  return (
    <>
      <Page title="Edit post">
        <Link to={`/post/${state.id}`} className="small font-weight-bold">
          &laquo; Back to post permalink
        </Link>

        <form onSubmit={handleSubmit} className="mt-3">
          <div className="form-group">
            <label htmlFor="post-title" className="text-muted mb-1">
              <small>Title</small>
            </label>
            <input
              onBlur={(e) =>
                dispatch({ type: 'titleRules', value: e.target.value })
              }
              onChange={(e) =>
                dispatch({ type: 'titleChange', value: e.target.value })
              }
              value={state.title.value}
              name="title"
              id="post-title"
              className="form-control form-control-lg form-control-title"
              type="text"
              placeholder=""
              autoComplete="off"
              autoFocus
            />
            {state.title.hasErrors && (
              <div className="alert alert-danger small liveValidateMessage">
                {state.title.message}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="post-body" className="text-muted mb-1 d-block">
              <small>Body Content</small>
            </label>
            <textarea
              onBlur={(e) =>
                dispatch({ type: 'bodyRules', value: e.target.value })
              }
              onChange={(e) =>
                dispatch({ type: 'bodyChange', value: e.target.value })
              }
              value={state.body.value}
              name="body"
              id="post-body"
              className="body-content tall-textarea form-control"
              type="text"
            />
            {state.body.hasErrors && (
              <div className="alert alert-danger small liveValidateMessage">
                {state.body.message}
              </div>
            )}
          </div>

          <button className="btn btn-primary" disabled={state.isSaving}>
            Save Updates
          </button>
        </form>
      </Page>
    </>
  );
};

export default EditPost;
