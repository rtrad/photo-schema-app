import React, { Component } from 'react';
import {Form, Button} from 'react-bootstrap';
import $ from "jquery";

export default class UploadPage extends Component {
  constructor(props) {
      super(props);
      this.state = {
        preview: null
      }
      this.handleDrop = this.handleDrop.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleDrop([{ preview }]) {
    this.setState({preview})
  }

  handleSubmit(event) {
    event.preventDefault();
    var fd = new FormData();
    //console.log(localStorage.getItem("token"));
    fd.append("file", this.fileUpload.files[0]);
    console.log(fd);
    $.ajax ({type:"POST",
      url:"http://localhost:5000/api/photo",
      data:fd,
      processData: false,
      contentType: false,
      headers: {Authentication: localStorage.getItem("token")},
      crossDomain: true
    });
    alert("File uploaded!");
  }

  render() {
    const { preview } = this.state
    return(
      <Form onSubmit = {this.handleSubmit}>
        <input type = 'file' name = "file" ref = {(ref) => this.fileUpload = ref}/>
        <Button type = 'submit'>
          Upload
        </Button>
        The photo that was just added to the list is:
        { preview &&
        <img src={ preview } alt="image preview" height="200" width="200" />
        }
      </Form>
    )
  }
}
