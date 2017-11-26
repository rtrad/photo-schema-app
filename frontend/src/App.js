import React, { Component } from 'react';
import 'react-dates/initialize';
import Main from './Main';
import Header from './components/Header';
import 'react-dates/lib/css/_datepicker.css';


class App extends Component {
  render() {
    return (
        <div>
            <Header />
            <Main />
        </div>
    );
  }
}

export default App;
