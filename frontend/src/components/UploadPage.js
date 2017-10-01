import React, { Component } from 'react';
import {Form, Button} from 'react-bootstrap';
import $ from "jquery";

export default class UploadPage extends Component {
  constructor(props) {
      super(props);
      this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleSubmit(event) {
    event.preventDefault();
    var fd = new FormData();
    //console.log(localStorage.getItem("token"));
    fd.append("file", this.fileUpload.files[0]);
    $.ajax ({type:"POST",
      url:"http://localhost:5000/api/photo",
      data:fd,
      processData: false,
      contentType: false,
      headers: {Authentication: localStorage.getItem("token")},
      crossDomain: true
    });
  }

  render() {
    return(
      <Form onSubmit = {this.handleSubmit}>
        <input type = 'file' name = "file" ref = {(ref) => this.fileUpload = ref}/>
        <Button type = 'submit'>
          Upload
        </Button>
      </Form>
    )
  }
}
