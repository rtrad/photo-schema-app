import React from 'react';
import $ from 'jquery';
import { Form, FormGroup, FormControl, ControlLabel, Button } from 'react-bootstrap'; 

const initialState = {
    username: '',
    password: ''
};

class LoginForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = initialState;

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    handleChange(event) {
        const target = event.target;
        this.setState({[target.name]: target.value}); 
    }

    handleSubmit(event) {
		event.preventDefault();
		var formData = {
			username : this.state.username,
			password : this.state.password
		};
		$.ajax({
			type: "POST",
			url: 'http://localhost:5000/login',
			crossDomain: true,
			data: formData,
            dataType: 'json',
			success: (result)=>{
                localStorage.setItem('token', result['token']);
                this.context.router.history.push('/home'); 
            },
            error: (result)=>{
                alert('invalid login');
                localStorage.removeItem('token');
                this.setState(initialState);
            }
		});
    }

    render() {
        return (
            <form onSubmit={this.handleSubmit}>
                <FormGroup>
                    <ControlLabel>
                        Username:
                        <FormControl name="username" type="text" value={this.state.username} onChange={this.handleChange} />
                    </ControlLabel>
                    <ControlLabel>
                        Password:
                        <FormControl name="password" type="password" value={this.state.password} onChange={this.handleChange} />
                    </ControlLabel>
                    <Button type="submit">Login</Button>
                </FormGroup>
            </form>
        );
    }
}

LoginForm.contextTypes = {
  router: React.PropTypes.func.isRequired
};

export default LoginForm;
