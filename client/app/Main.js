import React from 'react'
import ReactDOM from 'react-dom'
import Header from './components/Header'
import HomeGuest from './components/HomeGuest'
import Footer from './components/Footer'
import Terms from './components/Terms'
import About from './components/About'
import {BrowserRouter, Switch, Route} from 'react-router-dom'

const Main = () => {
	return (
		<BrowserRouter>
			<Header />
			<Switch>
					<Route path="/" exact>
						<HomeGuest />
					</Route>
					<Route path="/about">
						<About />
					</Route>
					<Route path="/terms">
						<Terms />
					</Route>
			</Switch>
			<Footer />
		</BrowserRouter>
	);
};

ReactDOM.render(<Main />, document.querySelector('#app'))

export default Main;

if(module.hot) {
	module.hot.accept()
}