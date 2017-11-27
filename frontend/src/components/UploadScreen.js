import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import {Grid, Col, Row, ButtonToolbar, Form, Button, ListGroup, ListGroupItem} from "react-bootstrap";
import $ from "jquery";

const handleDropRejected = (...args) => console.log('reject', args)

export default class UploadScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      filesToBeSent:[],
      maxPhotoCount:100,
      photoURLs: [],
    }
    this.onDrop = this.onDrop.bind(this)
  }

  onDrop(acceptedFiles, rejectedFiles) {
    var filesToBeSent = this.state.filesToBeSent;
    var photoURLs = this.state.photoURLs;
    var numberOfPhotos = 0;
    for (var i in filesToBeSent) {
      numberOfPhotos = numberOfPhotos + filesToBeSent[i].length;
    }
    if (numberOfPhotos < this.state.maxPhotoCount) {
      filesToBeSent.push(acceptedFiles);
      for (var i in acceptedFiles) {
        var reader = new FileReader();
        reader.onload = function(e) {
          photoURLs.push(e.target.result);
        }
        reader.readAsDataURL(acceptedFiles[i]);
      }
    this.setState({filesToBeSent, photoURLs});
    }
    else {
      alert("You have reached the limit of files you can upload at one time.")
    }
  }

  handleUpload(event) {
    console.log("handleClick",event);
    event.preventDefault();
    var filesToBeSent = this.state.filesToBeSent;
    if (filesToBeSent.length > 0) {
      for (var i in filesToBeSent) {
        for (var j in filesToBeSent[i]) {
          var fd = new FormData();
          fd.append('file', filesToBeSent[i][j]);
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
      }
      alert("File upload successful!");
      var photoURLs = this.state.photoURLs;
      filesToBeSent = [];
      photoURLs = [];
      this.setState({filesToBeSent, photoURLs});
    }
    else {
      alert("There are no files to upload!");
    }
  }

  handleClear(event) {
    var filesToBeSent = this.state.filesToBeSent;
    var photoURLs = this.state.photoURLs;
    if (filesToBeSent.length !== 0) {
      filesToBeSent = [];
      photoURLs = [];
      this.setState({filesToBeSent, photoURLs});
    } else {
      alert("There are no photos to remove!");
    }
  }

  handleUndo(event) {
    var filesToBeSent = this.state.filesToBeSent;
    var photoURLs = this.state.photoURLs;
    if (filesToBeSent.length !== 0) {
      for (var i in filesToBeSent[filesToBeSent.length - 1]) {
        photoURLs.pop();
      }
      filesToBeSent.pop();
      this.setState({filesToBeSent, photoURLs});
    } else {
      alert("There are no photos to remove!");
    }
  }

  handleLoadPreview() {
    var filesToBeSent = this.state.filesToBeSent;
    var photoURLs = this.state.photoURLs;
    if (filesToBeSent.length != 0) {
      this.setState({filesToBeSent, photoURLs});
    } else {
      alert("There are no files to preview!");
    }
  }

  render() {
    return (
      <Grid><Row><Col>
            <section>
            <Dropzone onDrop={ (photos) => this.onDrop(photos) } accept="image/jpeg,image/jpg,image/tiff,image/gif,image/png,image/bmp,image/tif" multiple={ true } onDropRejected={ handleDropRejected}>
              Click here or drag the desired photos into this area. Press "Load Preview" afterwards to load the photos into the view after they have been dropped in.
            </Dropzone>
            </section>
        </Col></Row>

        <hr></hr>

        <Row><Col><ButtonToolbar>
        <Button bsStyle="primary" onClick = {(event) => this.handleLoadPreview(event)}>
          Load Preview
        </Button>

        <Button bsStyle="danger" onClick = {(event) => this.handleUndo(event)}>
          Undo
        </Button>

        <Button bsStyle="danger" onClick = {(event) => this.handleClear(event)}>
          Clear All
        </Button>
        </ButtonToolbar></Col></Row>

        <br></br>

        <Row><Col>
        <ListGroup>
          <div>
           <ListGroupItem>
              {this.state.photoURLs.map(photo =>
              <img src={ photo } alt="image preview" height="140" width="140" style={{margin: "5px"}} />
              )}
              </ListGroupItem>
            </div>
  			</ListGroup>
        </Col></Row>

        <Row><Col>
        <Button bsStyle="success" onClick = {(event) => this.handleUpload(event)}>
          Upload
        </Button>
        </Col></Row>

        <br></br>

      </Grid>
    );
  }
}
