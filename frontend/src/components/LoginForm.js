import React from 'react';

class LoginForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {uname: '', pwd: ''};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    handleChange(event) {
        const target = event.target;
        this.setState({[target.name]: target.value}); 
    }

    handleSubmit(event) {
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <label>
                    Username:
                    <input name="uname" type="text" value={this.state.uname} onChange={this.handleChange} />
                </label>
                <label>
                    Password:
                    <input name="pwd" type="password" value={this.state.pwd} onChange={this.handleChange} />
                </label>
                <input type="submit" value="Login" />
            </form>
        );
    }
}

export default LoginForm;