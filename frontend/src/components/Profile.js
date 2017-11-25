import React, { Component, PropTypes } from 'react';
import $ from 'jquery';
import { Modal, Form, FormGroup, FormControl, ControlLabel, Col, Button } from 'react-bootstrap'; 

const initialState = {
    newemail:'',
    newpassword: '',
    confirmnewpassword: '',
    days: ''
};


class Profile extends React.Component{
    
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
            newemail : this.state.newemail,
            newpassword : this.state.newpassword,
            confirmnewpassword :this.state.confirmnewpassword,
            days : this.state.days
        };
        console.log('testing');
        console.log(formData);
        
        // $.ajax({
        //  type: "POST",
        //  url: 'http://localhost:5000/login',
        //  crossDomain: true,
        //  data: formData,
  //           dataType: 'json',
        //  success: (result)=>{
  //               localStorage.setItem('token', result['token']);
  //               this.context.router.history.push('/home'); 
  //           },
  //           error: (result)=>{
  //               alert('invalid login');
  //               localStorage.removeItem('token');
  //               this.setState(initialState);
  //           }
        // });
        }

    render(){
        return (
         <div>
            <p> Edit Profile and Adjust Altert </p>
            <Form horizontal onSubmit={this.handleSubmit}>
                    <FormGroup>
                        <Col componentClass={ControlLabel} sm={2}>New Email:</Col>
                        <Col sm={5}>
                            <FormControl name="newemail" type="text" value={this.state.newemail} onChange={this.handleChange} />
                        </Col>
                    </FormGroup> 
                    <FormGroup>
                        <Col componentClass={ControlLabel} sm={2}>New Password:</Col>
                        <Col sm={5}>
                            <FormControl name="newpassword" type="password" value={this.state.newpassword} onChange={this.handleChange} />
                        </Col>
                    </FormGroup>
                    <FormGroup>
                        <Col componentClass={ControlLabel} sm={2}>Confirm New Password:</Col>
                        <Col sm={5}>
                            <FormControl name="confirmnewpassword" type="password" value={this.state.confirmnewpassword} onChange={this.handleChange} />
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
