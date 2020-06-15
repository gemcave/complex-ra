/* eslint-disable no-inner-declarations */
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useImmerReducer } from 'use-immer';
import StateContext from './StateContext';
import DispatchContext from './DispatchContext';

import Header from './components/Header';
import Home from './components/Home';
import HomeGuest from './components/HomeGuest';
import Footer from './components/Footer';
import Terms from './components/Terms';
import About from './components/About';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
// import CreatePost from './components/CreatePost';

const CreatePost = React.lazy(() => import('./components/CreatePost'));
const ViewSinglePost = React.lazy(() => import('./components/ViewSinglePost'));
const Search = React.lazy(() => import('./components/Search'));
const Chat = React.lazy(() => import('./components/Chat'));

import Axios from 'axios';
// import ViewSinglePost from './components/ViewSinglePost';
import FlashMessages from './components/FlashMessages';
import Profile from './components/Profile';
import EditPost from './components/EditPost';
import NotFound from './components/NotFound';
// import Search from './components/Search';
import { CSSTransition } from 'react-transition-group';
// import Chat from '../Chat';
import { Suspense } from 'react';
import LoadingDotsIcon from './components/LoadingDotsIcon';

Axios.defaults.baseURL = process.env.BACKENDURL || '';

const Main = () => {
  const initialState = {
    loggedIn: Boolean(localStorage.getItem('complexappToken')),
    flashMessages: [],
    user: {
      token: localStorage.getItem('complexappToken'),
      username: localStorage.getItem('complexappUsername'),
      avatar: localStorage.getItem('complexappAvatar'),
    },
    isSearchOpen: false,
    isChatOpen: false,
    unreadChatCount: 0,
  };

  const reducer = (state, action) => {
    switch (action.type) {
      case 'login':
        state.loggedIn = true;
        state.user = action.data;
        return;
      case 'logout':
        state.loggedIn = false;
        return;
      case 'flashMessage':
        state.flashMessages.push(action.value);
        return;
      case 'openSearch':
        state.isSearchOpen = true;
        return;
      case 'closeSearch':
        state.isSearchOpen = false;
        return;
      case 'toggleChat':
        state.isChatOpen = !state.isChatOpen;
        return;
      case 'closeChat':
        state.isChatOpen = false;
        return;
      case 'incrementUnreadChatCount':
        state.unreadChatCount++;
        return;
      case 'clearUnreadChatCount':
        state.unreadChatCount = 0;
        return;
    }
  };

  const [state, dispatch] = useImmerReducer(reducer, initialState);

  useEffect(() => {
    if (state.loggedIn) {
      const searchReq = Axios.CancelToken.source();
      async function fecthResults() {
        try {
          const response = await Axios.post(
            '/checkToken',
            { token: state.user.token },
            { cancelToken: searchReq.token }
          );
          if (!response.data) {
            dispatch({ type: 'logout' });
            dispatch({
              type: 'flashMessage',
              value: 'Your session has expired. Please log in again.',
            });
          }
        } catch (error) {
          console.log('There was a problem: ');
        }
      }
      fecthResults();
      return () => {
        searchReq.cancel();
      };
    }
  }, []);

  useEffect(() => {
    if (state.loggedIn) {
      localStorage.setItem('complexappToken', state.user.token);
      localStorage.setItem('complexappUsername', state.user.username);
      localStorage.setItem('complexappAvatar', state.user.avatar);
    } else {
      localStorage.removeItem('complexappToken');
      localStorage.removeItem('complexappUsername');
      localStorage.removeItem('complexappAvatar');
    }
  }, [state.loggedIn]);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <FlashMessages messages={state.flashMessages} />
          <Header />
          <Suspense fallback={<LoadingDotsIcon />}>
            <Switch>
              <Route path="/" exact>
                {state.loggedIn ? <Home /> : <HomeGuest />}
              </Route>
              <Route path="/create-post">
                <CreatePost />
              </Route>
              <Route path="/post/:id/edit" exact>
                <EditPost />
              </Route>
              <Route path="/about">
                <About />
              </Route>
              <Route path="/profile/:username">
                <Profile />
              </Route>
              <Route path="/post/:id">
                <ViewSinglePost />
              </Route>
              <Route path="/terms">
                <Terms />
              </Route>
              <Route>
                <NotFound />
              </Route>
            </Switch>
          </Suspense>
          <CSSTransition
            timeout={330}
            in={state.isSearchOpen}
            classNames="search-overlay"
            unmountOnExit
          >
            <div className="search-overlay">
              <Suspense fallback="">
                <Search />
              </Suspense>
            </div>
          </CSSTransition>
          <Suspense fallback="">{state.loggedIn && <Chat />}</Suspense>
          <Footer />
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
};

ReactDOM.render(<Main />, document.querySelector('#app'));

export default Main;

if (module.hot) {
  module.hot.accept();
}
