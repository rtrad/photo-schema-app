import React, { Component } from 'react';
import $ from "jquery";

export default class UploadPage extends Component {
  constructor(props) {
      super(props);
      this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleSubmit(event) {
    var fd = new FormData();
    fd.append("file", event.target.files[0]);
    $.ajax ({type:"POST", url:"http://localhost:5000/api/photo", data:fd});
  }

  render() {
    return(
      <form encType = 'multipart/form-data' method = "POST" action = "http://localhost:5000/api/photo">
        <input type = 'file' name = "file"/>
        <input type = 'submit' value = "upload"/>
      </form>
    )
  }
}
