import React, { Component } from 'react';
import Dropzone from 'react-dropzone';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import FontIcon from 'material-ui/FontIcon';
import {blue500, red500, greenA200} from 'material-ui/styles/colors';
import RaisedButton from 'material-ui/RaisedButton';
import $ from "jquery";


export default class UploadScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filesPreview:[],
      filesToBeSent:[],
      photoCount:100
    }
  }
  onDrop(acceptedFiles, rejectedFiles) {
  // ('Accepted files: ', acceptedFiles[0].name);
    console.log(acceptedFiles);
    var filesToBeSent = this.state.filesToBeSent;
    if (filesToBeSent.length < this.state.photoCount) {
      filesToBeSent.push(acceptedFiles);
      var filesPreview = [];
      for(var i in filesToBeSent) {
        filesPreview.push(
          <div> {filesToBeSent[i][0].name}
            <MuiThemeProvider>
              <a href = "#">
                <FontIcon
                  className = "material-icons customstyle"
                  color = {blue500}
                  styles = {{ top:10,}}
                  >clear
                </FontIcon>
              </a>
            </MuiThemeProvider>
          </div>
        )
      }
      this.setState({filesToBeSent,filesPreview});
    }
    else {
      alert("You have reached the limit of files you can upload at one time.")
    }
    //filesToBeSent.push(acceptedFiles);
    //this.setState({filesToBeSent});
  }

  handleClick(event) {
    // console.log("handleClick",event);
    var self = this;
    if (this.state.filesToBeSent.length > 0) {
      var filesArray = this.state.filesToBeSent;
      for (var i in filesArray) {
        console.log("files", filesArray[i]);
        var fd = new FormData();
        fd.append("file1",filesArray[i]);
        $.ajax ({type:"POST", url:"http://localhost:5000/api/photo", data:fd, contentType:"application/octet-stream"});
      }
    }
    else {
      alert("There are no files to upload.");
    }
  }

  render() {
    return (
      <div>
        <Dropzone onDrop = {(photos) => this.onDrop(photos)}>
          <div>
            Drop files here to upload or click in the box to select files to upload.
          </div>
        </Dropzone>
        <div>
          Photos to be uploaded are:
          {this.state.filesPreview}
        </div>
        <MuiThemeProvider>
            <RaisedButton
              label = "Upload"
              primary = {true}
              onClick = {(event) => this.handleClick(event)}
            />
        </MuiThemeProvider>
      </div>
    );
  }
}