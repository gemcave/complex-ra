import React, { useState, useContext } from 'react';
import Page from './Page';
import axios from 'axios';
import { Redirect } from 'react-router-dom';
import DispatchContext from '../DispatchContext';
import StateContext from '../StateContext';

const CreatePost = () => {
  const [title, setTitle] = useState();
  const [body, setBody] = useState();
  const [wasSuccessful, setWasSuccessfull] = useState(false);
  const appDispatch = useContext(DispatchContext);
  const appState = useContext(StateContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('/create-post', {
        title,
        body,
        token: appState.user.token,
      });

      setWasSuccessfull(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  if (wasSuccessful) {
    appDispatch({
      type: 'flashMessage',
      value: 'Congrats, you successfully created a post!',
    });
    return <Redirect to={`/post/${wasSuccessful}`} />;
  }

  return (
    <Page title="Create new post">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          <input
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            name="title"
            id="post-title"
            className="form-control form-control-lg form-control-title"
            type="text"
            placeholder=""
            autoComplete="off"
          />
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          <textarea
            onChange={(e) => setBody(e.target.value)}
            name="body"
            id="post-body"
            className="body-content tall-textarea form-control"
            type="text"
          ></textarea>
        </div>

        <button className="btn btn-primary">Save New Post</button>
      </form>
    </Page>
  );
};

export default CreatePost;
