import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import FontIcon from 'material-ui/FontIcon';
import {blue500, red500, greenA200} from 'material-ui/styles/colors';
import RaisedButton from 'material-ui/RaisedButton';
import {Grid, Col} from "react-bootstrap";
import {Form, Button} from 'react-bootstrap';
import $ from "jquery";

const handleDropRejected = (...args) => console.log('reject', args)

export default class UploadScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      filesPreview:[],
      filesToBeSent:[],
      photoCount:10,
      preview: null
    }
    this.handleClick = this.handleClick.bind(this)
    this.handleDrop = this.handleDrop.bind(this)
  }

  handleDrop([{ preview }]) {
    this.setState({preview})
  }

  onDrop(acceptedFiles, rejectedFiles) {
    console.log(acceptedFiles);
    var filesToBeSent = this.state.filesToBeSent;
    if (filesToBeSent.length < this.state.photoCount) {
      filesToBeSent.push(acceptedFiles);
      var filesPreview = [];
      for(var i in filesToBeSent) {
        filesPreview.push(
          <div>
            {filesToBeSent[i][0].name}
          </div>
        )
      }
      this.setState({filesToBeSent,filesPreview});
      this.handleDrop(filesToBeSent[(filesToBeSent.length) - 1]);
    }
    else {
      alert("You have reached the limit of files you can upload at one time.")
    }
  }

  handleClick(event) {
    console.log("handleClick",event);
    event.preventDefault();
    if (this.state.filesToBeSent.length > 0) {
      var filesArray = this.state.filesToBeSent;
      for (var i in filesArray) {
        var fd = new FormData();
        fd.append("file",filesArray[i]);
        $.ajax ({type:"POST",
          url:"http://localhost:5000/api/photo",
          data:fd,
          processData: false,
          contentType: false,
          headers: {Authentication: localStorage.getItem("token")},
          crossDomain: true
        });
      }
      alert("File upload successful!");
      var filesPreview = this.state.filesPreview;
      var filesToBeSent = this.state.filesToBeSent;
      var preview = this.state.preview;
      filesPreview = [];
      filesToBeSent = [];
      preview = null;
      this.setState({filesToBeSent, filesPreview, preview})
    }
    else {
      alert("There are no files to upload.");
    }
  }

  handleClear(event, fileName) {
    var filesPreview = this.state.filesPreview;
    var filesToBeSent = this.state.filesToBeSent;
    var preview = this.state.preview;
    filesPreview = [];
    filesToBeSent = [];
    preview = null;
    this.setState({filesToBeSent, filesPreview, preview})
  }

  handleClearLast(event) {
    var filesPreview = this.state.filesPreview;
    var filesToBeSent = this.state.filesToBeSent;
    var preview = this.state.preview;
    filesPreview.pop();
    filesToBeSent.pop();
    preview = null;
    this.setState({filesToBeSent, filesPreview, preview})
  }

  render() {
    const { preview } = this.state

    return (
      <Grid><Col xs={6} md={6}>
        <section>
        <Dropzone  onDrop={ (photos) => this.onDrop(photos) } accept="image/jpeg,image/jpg,image/tiff,image/gif" multiple={ false } onDropRejected={ handleDropRejected } >
          Drag one file or click here to select a photo to upload. Please drop or select one photo at a time.
        </Dropzone>
        </section>
        <Form onSubmit = {this.handleClick}>
          <Button type = 'submit'>
            Upload
          </Button>
        </Form>

        <MuiThemeProvider>
            <RaisedButton
              label = "Clear"
              primary = {true}
              onClick = {(event) => this.handleClear(event)}
            />
        </MuiThemeProvider>

        <MuiThemeProvider>
            <RaisedButton
              label = "Clear Last"
              primary = {true}
              onClick = {(event) => this.handleClearLast(event)}
            />
        </MuiThemeProvider>

        <div>
          The photo that was just added to the list is:
          { preview &&
          <img src={ preview } alt="image preview" height="200" width="200" />
          }
        </div>

        <div>
          Photos to be uploaded are:
          {this.state.filesPreview}
        </div>

      </Col></Grid>
    );
  }
}
