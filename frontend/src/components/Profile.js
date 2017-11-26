import React, { Component, PropTypes } from 'react';
import $ from 'jquery';
import { Modal, Form, FormGroup, FormControl, ControlLabel, Col, Button } from 'react-bootstrap'; 

const initialState = {
	username:'',
    email:'',
    password: '',
    confirmpassword: '',
    days: 0
};


class Profile extends React.Component{
    
    constructor(props) {
        super(props);
        this.state = initialState;
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
		this.fetchUser();
    

    }

	fetchUser() {
		$.ajax({
			type: "GET",
			url: 'http://localhost:5000/api/user',
			crossDomain: true,
			dataType: 'json',
            contentType: 'application/json',
            headers: {'Authentication' : localStorage.getItem('token')},
			success: (result)=>{
				this.setState({'username':result.user.username});
				this.setState({'days':result.user.notification});
				this.setState({'email':result.user.email});
			}
		});
	}
	
    handleChange(event) {
        const target = event.target;
        this.setState({[target.name]: target.value});        
    }

    validateChange() {
        let output = '';
        output += this.state.newpassword.length < 8 ? 'Password must be at least 8 characters long\n' : '';
        output += this.state.confirmnewpassword !== this.state.newpassword ? 'Passwords must be equal\n' : '';
        output += this.state.newemail.length == 0 ? 'Must enter an email address\n' : '';
        output += this.state.days <= 0 ? 'days must be more than zero\n' : '';

        if (output.length == 0) {
            return true;
        } else {
            return output;
        }
    }

    handleSubmit(event) {
        event.preventDefault();
        
        let valid = this.validateChange();
        if (valid === true) {
            var formData = {
				email : this.state.email,
				password : this.state.password,
				notification : this.state.days
			}
        } else {
			alert(valid);
		}
		
		$.ajax({
			type: "POST",
			url: 'http://localhost:5000/api/user',
			crossDomain: true,
			dataType: 'json',
            contentType: 'application/json',
            headers: {'Authentication' : localStorage.getItem('token')},
			success: (result)=>{
				alert('User profile successfully updated');
			}, 
			error: (result)=>{
				alert('User profile failed to update');
			}, 
            data : JSON.stringify(formData)
		});
        
	}

    render(){
        return (
         <div>
            <h3> Edit Profile and Adjust Settings for {this.state.username} </h3>
            <Form horizontal onSubmit={this.handleSubmit}>
                    <FormGroup>
                        <Col componentClass={ControlLabel} sm={2}>New Email:</Col>
                        <Col sm={5}>
                            <FormControl name="email" type="text" value={this.state.email} onChange={this.handleChange} />
                        </Col>
                    </FormGroup> 
                    <FormGroup>
                        <Col componentClass={ControlLabel} sm={2}>New Password:</Col>
                        <Col sm={5}>
                            <FormControl name="password" type="password" value={this.state.password} onChange={this.handleChange} />
                        </Col>
                    </FormGroup>
                    <FormGroup>
                        <Col componentClass={ControlLabel} sm={2}>Confirm New Password:</Col>
                        <Col sm={5}>
                            <FormControl name="confirmpassword" type="password" value={this.state.confirmpassword} onChange={this.handleChange} />
                        </Col>
                    </FormGroup>
                    
                    <FormGroup>
                        <Col componentClass={ControlLabel} sm={2}>Days untill next notification:</Col>
                        <Col sm={1}>
                            <FormControl name="days" type="number" value={this.state.days} onChange={this.handleChange} />

                        </Col>
                    </FormGroup>
                    
                    <FormGroup>
                        <Col smOffset={2} sm={10}>
                            <Button type="submit">Save</Button>
                        </Col>
                    </FormGroup>
            </Form>
         </div>
        )
    }

}

export default Profile;
