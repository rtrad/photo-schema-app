import React from 'react';
import { Form, FormGroup, FormControl, ControlLabel, Col, Button } from 'react-bootstrap'; 

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
        alert("logged in");
    }

    render() {
        return (
            <Form horizontal onSubmit={this.handleSubmit}>
                <FormGroup>
                    <Col componentClass={ControlLabel} sm={2}>Username:</Col>
                    <Col sm={10}>
                        <FormControl name="uname" type="text" value={this.state.uname} onChange={this.handleChange} />
                    </Col>
                </FormGroup>
                <FormGroup>
                    <Col componentClass={ControlLabel} sm={2}>Password:</Col>
                    <Col sm={10}>
                        <FormControl name="pwd" type="password" value={this.state.pwd} onChange={this.handleChange} />
                    </Col>
                </FormGroup>
                <FormGroup>
                    <Col smOffset={2} sm={10}>
                        <Button type="submit">Login</Button>
                    </Col>
                </FormGroup>
                <FormGroup>
                    <Col smOffset={2} sm={10}>
                        <Button bsStyle="primary">Register</Button>
                    </Col>
                </FormGroup>
            </Form>
        );
    }
}

export default LoginForm;
