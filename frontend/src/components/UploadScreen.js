import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import FontIcon from 'material-ui/FontIcon';
import {blue500, red500, greenA200} from 'material-ui/styles/colors';
import RaisedButton from 'material-ui/RaisedButton';
import {Grid, Col} from "react-bootstrap";
import {Form, Button} from 'react-bootstrap';
import {ListGroup, ListGroupItem} from 'react-bootstrap';
import $ from "jquery";

const handleDropRejected = (...args) => console.log('reject', args)

export default class UploadScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      filesToBeSent:[],
      photoCount:100,
      photoURLs: [],
      photosAdded:0
    }
    this.handleClick = this.handleClick.bind(this)
  }

  onDrop(acceptedFiles, rejectedFiles) {
    console.log(acceptedFiles);
    var filesToBeSent = this.state.filesToBeSent;
    var photoURLs = this.state.photoURLs;
    if (filesToBeSent.length < this.state.photoCount) {
      for (var i in acceptedFiles) {
        filesToBeSent.push(acceptedFiles[i]);
        var reader = new FileReader();
        reader.onload = function(e) {
          photoURLs.push(e.target.result);
        }
        reader.readAsDataURL(acceptedFiles[i]);
      }
    var photosAdded = acceptedFiles.length;
    this.setState({filesToBeSent,photoURLs,photosAdded});
    }
    else {
      alert("You have reached the limit of files you can upload at one time.")
    }
  }

  handleClick(event) {
    console.log("handleClick",event);
    event.preventDefault();
    var filesArray = this.state.filesToBeSent;
    if (filesArray.length > 0) {
      for (var i = 0; i < filesArray.length; i++) {
        var fd = new FormData();
        fd.append('file', filesArray[i]);
        console.log(fd);
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
      var filesToBeSent = this.state.filesToBeSent;
      filesToBeSent = [];
      this.setState({filesToBeSent})
    }
    else {
      alert("There are no files to upload.");
    }
  }

  handleClear(event) {
    var filesToBeSent = this.state.filesToBeSent;
    var photoURLs = this.state.photoURLs;
    var photosAdded = 0;
    filesToBeSent = [];
    photoURLs = [];
    this.setState({filesToBeSent, photoURLs, photosAdded})
  }

  handleClearLast(event) {
    var filesToBeSent = this.state.filesToBeSent;
    var photoURLs = this.state.photoURLs;
    var photosAdded = this.state.photosAdded;
    for (var i = 0; i < photosAdded; i++) {
      filesToBeSent.pop();
      photoURLs.pop();
    }
    photosAdded = 0;
    this.setState({filesToBeSent, photoURLs, photosAdded})
  }

  handleReload() {
    var filesToBeSent = this.state.filesToBeSent;
    var photoURLs = this.state.photoURLs;
    this.setState({filesToBeSent, photoURLs})
  }


  render() {
    return (
      <Grid><Col xs={6} md={6}>
            <section>
            <Dropzone onDrop={ (photos) => this.onDrop(photos) } accept="image/jpeg,image/jpg,image/tiff,image/gif,image/png,image/bmp,image/tif" multiple={ true } onDropRejected={ handleDropRejected}>
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
              label = "Clear All"
              primary = {true}
              onClick = {(event) => this.handleClear(event)}
            />
        </MuiThemeProvider>

        <MuiThemeProvider>
            <RaisedButton
              label = "Undo"
              primary = {true}
              onClick = {(event) => this.handleClearLast(event)}
            />
        </MuiThemeProvider>

        <MuiThemeProvider>
            <RaisedButton
              label = "Load Preview"
              primary = {true}
              onClick = {(event) => this.handleReload(event)}
            />
        </MuiThemeProvider>

        <ListGroup>
          <div>
           <ListGroupItem>
              {this.state.photoURLs.map(photo =>
              <img src={ photo } alt="image preview" height="200" width="200" />
              )}
              </ListGroupItem>
            </div>
  			</ListGroup>

      </Col></Grid>
    );
  }
}
