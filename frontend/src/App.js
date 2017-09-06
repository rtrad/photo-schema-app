import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class LoginForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {uname: '', pwd: ''};

        this.handleChangeUname = this.handleChangeUname.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    handleChangeUname(event) {
        this.setState({uname: event.target.value}); 
    }

    handleChangePwd(event) {
        this.setState({pwd: event.target.value});
    }

    handleSubmit(event) {
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <label>
                    Username:
                    <input type="text" value={this.state.uname} onChange={this.handleChangeUname} />
                </label>
                <label>
                    Password:
                    <input type="password" value={this.state.pwd} onChange={this.handleChangePwd} />
                </label>
                <input type="submit" value="Login" />
            </form>
        );
    }
}

class App extends Component {
  render() {
    return (
        <div>
        <h1> Intrapic </h1>
            <LoginForm />
        </div>
    );
  }
}

export default App;
