import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import DispatchContext from '../DispatchContext';
import StateContext from '../StateContext';
import ReactTooltip from 'react-tooltip';

const HeaderLoggedIn = (props) => {
  const appDispatch = useContext(DispatchContext);
  const appState = useContext(StateContext);

  const handleLogout = () => {
    appDispatch({ type: 'logout' });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    appDispatch({ type: 'openSearch' });
  };

  return (
    <div className="flex-row my-3 my-md-0">
      <a
        data-for="search"
        data-tip="Search"
        onClick={handleSearch}
        href="#"
        className="text-white mr-2 header-search-icon"
      >
        <i className="fas fa-search"></i>
      </a>
      <ReactTooltip place="bottom" id="search" className="custom-tooltip" />{' '}
      <span
        data-for="chat"
        data-tip="Chat"
        className="mr-2 header-chat-icon text-white"
      >
        <i className="fas fa-comment"></i>
        <span className="chat-count-badge text-white"> </span>
      </span>
      <ReactTooltip place="bottom" id="chat" className="custom-tooltip" />{' '}
      <Link
        data-for="profile"
        data-tip="My Profile"
        to={`/profile/${appState.user.username}`}
        className="mr-2"
      >
        <img className="small-header-avatar" src={appState.user.avatar} />
      </Link>
      <ReactTooltip place="bottom" id="profile" className="custom-tooltip" />{' '}
      <Link className="btn btn-sm btn-success mr-2" to="/create-post">
        Create Post
      </Link>{' '}
      <button onClick={handleLogout} className="btn btn-sm btn-secondary">
        Sign Out
      </button>
    </div>
  );
};

export default HeaderLoggedIn;
