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
import CreatePost from './components/CreatePost';
import Axios from 'axios';
import ViewSinglePost from './components/ViewSinglePost';
import FlashMessages from './components/FlashMessages';
import Profile from './components/Profile';
import EditPost from './components/EditPost';
import NotFound from './components/NotFound';
import Search from './components/Search';
import { CSSTransition } from 'react-transition-group';

Axios.defaults.baseURL = 'http://localhost:8080';

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
    }
  };

  const [state, dispatch] = useImmerReducer(reducer, initialState);

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
          <CSSTransition
            timeout={330}
            in={state.isSearchOpen}
            classNames="search-overlay"
            unmountOnExit
          >
            <Search />
          </CSSTransition>
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
