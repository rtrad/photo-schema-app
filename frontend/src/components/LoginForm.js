import React from 'react';
import { FormGroup, FormControl, ControlLabel, Button } from 'react-bootstrap'; 

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
            <form onSubmit={this.handleSubmit}>
                <FormGroup>
                    <ControlLabel>
                        Username:
                        <FormControl name="uname" type="text" value={this.state.uname} onChange={this.handleChange} />
                    </ControlLabel>
                    <ControlLabel>
                        Password:
                        <FormControl name="pwd" type="password" value={this.state.pwd} onChange={this.handleChange} />
                    </ControlLabel>
                    <Button type="submit">Login</Button>
                </FormGroup>
            </form>
        );
    }
}

export default LoginForm;
