import React from 'react';
import $ from 'jquery';
import { Form, FormGroup, FormControl, ControlLabel, Col, Button } from 'react-bootstrap';	

import RegistrationForm from './RegistrationForm';

const initialState = {
    username: '',
    password: '',
    showRegistration: false,
    registerUser: {
        username: '',
        password: '',
        confirm_password: '',
        name : '',
        email: ''
    },
	loading: false
};

class LoginForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = initialState;

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.openRegistration = this.openRegistration.bind(this);
        this.closeRegistration = this.closeRegistration.bind(this);
        this.handleRegistration = this.handleRegistration.bind(this);
        this.handleRegistrationChange = this.handleRegistrationChange.bind(this);
    }
    
    validateRegistration() {
        let output = '';
        output += this.state.registerUser.username.length === 0 ? 'Must enter a username\n' : '';
        output += this.state.registerUser.password.length < 8 ? 'Password must be at least 8 characters long\n' : '';
        output += this.state.registerUser.confirm_password !== this.state.registerUser.password ? 'Passwords must be equal\n' : '';
        output += this.state.registerUser.name.length === 0 ? 'Must enter your name\n' : '';
        output += this.state.registerUser.email.length === 0 ? 'Must enter an email address\n' : '';
        
        if (output.length === 0) {
            return true;
        } else {
            return output;
        }
    }
    
    handleChange(event) {
        const target = event.target;
        this.setState({[target.name]: target.value}); 
    }

    handleSubmit(event) {
		event.preventDefault();
		this.setState({loading : true});
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
				this.setState({loading : false});
            },
            error: (result)=>{
                alert('invalid login');
                localStorage.removeItem('token');
                this.setState(initialState);
				this.setState({loading : false});
            }
		});
    }

    openRegistration() {
        this.setState({ showRegistration: true });
    }

    closeRegistration() {
        this.setState({ showRegistration: false });
    }

    handleRegistration(event) {
		event.preventDefault();
        let valid = this.validateRegistration();
        if (valid === true) {
            var formData = {
                username : this.state.registerUser.username,
                password : this.state.registerUser.password,
                email : this.state.registerUser.email,
                name : this.state.registerUser.name
            };
            $.ajax({
                type: "POST",
                url: 'http://localhost:5000/register',
                crossDomain: true,
                data: formData,
                dataType: 'json',
                success: (result)=>{
                    localStorage.setItem('token', result['token']);
                    this.setState(initialState, function () {
                        alert('user created!');    
                        this.context.router.history.push('/home');
                    });
                },
                error: (result)=>{
                    this.setState(initialState, function () {
                        alert('registration failed\nerror: ' + result.responseJSON['error']);                        
                    });
                }
            });
        } else {
            alert(valid);
        }
    }

    handleRegistrationChange(event) {
        const target = event.target;
        let registerUser = this.state.registerUser;
        registerUser[[target.name]] = target.value;
        this.setState({registerUser: registerUser});
    }

    render() {
        return (
            <div>
                <Form horizontal onSubmit={this.handleSubmit}>
                    <FormGroup>
                        <Col componentClass={ControlLabel} sm={2}>Username:</Col>
                        <Col sm={10}>
                            <FormControl name="username" type="text" value={this.state.username} onChange={this.handleChange} />
                        </Col>
                    </FormGroup>
                    <FormGroup>
                        <Col componentClass={ControlLabel} sm={2}>Password:</Col>
                        <Col sm={10}>
                            <FormControl name="password" type="password" value={this.state.password} onChange={this.handleChange} />
                        </Col>
                    </FormGroup>
                    <FormGroup>
                        <Col smOffset={2} sm={10}>
                            <Button type="submit" disabled={this.state.loading}>{this.state.loading ? 'Loging in ...' : 'Login'}</Button>
                        </Col>
                    </FormGroup>
                    <FormGroup>
                        <Col smOffset={2} sm={10}>
                            <Button bsStyle="primary" onClick={this.openRegistration}>Register</Button>
                        </Col>
                    </FormGroup>
                </Form>
                <RegistrationForm
                    show={this.state.showRegistration}
                    closeReg={this.closeRegistration}
                    onSubmit={this.handleRegistration}
                    onChanged={this.handleRegistrationChange}
                    userObject={this.state.registerUser}
                />
            </div>
        );
    }
}

LoginForm.contextTypes = {
  router: React.PropTypes.func.isRequired
};

export default LoginForm;
