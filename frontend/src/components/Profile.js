import React, { Component, PropTypes } from 'react';
import $ from 'jquery';
import { Modal, Form, FormGroup, FormControl, ControlLabel, Col, Button } from 'react-bootstrap'; 

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
    }
};

class Profile extends React.Component{
    
    constructor(props) {
    	super(props);
    }

    render(){
    	return (
    	 <div>
    	 	<p>Edit Profile and Adjust Altert </p>
    	 </div>
    	)
    }

}

export default Profile;
