import React from 'react';
import $ from 'jquery';
import { Modal, Form, FormGroup, FormControl, ControlLabel, Col, Button } from 'react-bootstrap'; 
import RegistrationForm from './RegistrationForm';

const initialState = {
    username: '',
    password: '',
    showRegistration: false,
    registerUser: {
        username: '',
        password: '',
        confirm_password: '',
        email: ''
    }
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

    openRegistration() {
        this.setState({ showRegistration: true });
    }

    closeRegistration() {
        this.setState({ showRegistration: false });
    }

    handleRegistration(event) {
        alert("Registered user!");
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
                            <Button type="submit">Login</Button>
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
