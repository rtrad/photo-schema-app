import React, { PropTypes } from 'react';

import $ from 'jquery';
import {Carousel, FormControl, Button, Label} from 'react-bootstrap';



class Tagging extends React.Component {
	constructor(props) {
		super(props);

        let compatible = true;
        if(!window.webkitSpeechRecognition) {
            compatible = false;
            console.info('The Transcription component has been disabled because your web browser does not support Speech Recognition.');
        }
        
		this.state = {searchquery : '', 
            photos : [],
            photo_index : 0,
            photo_direction : null,
            tags : [],
            newtags : [],
            recognized: '',
            transcribed: '',
            compatible,
            isRecording: false,};

		this.fetchPhotos();
        this.handleChange = this.handleChange.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handlePhotoRotate = this.handlePhotoRotate.bind(this);
        this.handleUpdateTags = this.handleUpdateTags.bind(this);
        this.handleTagsChange = this.handleTagsChange.bind(this);

        this.recognition = null;
        this.wordTranscriptions = props.data || {};

	}
    
    handleTagsChange(event) {
        const target = event.target;
        this.setState({
            newtags : target.value
        });
    }
    
    handleUpdateTags(event) {
        console.log(this.state.newtags);
        const photo_id = this.state.photos[this.state.photo_index].photo_id;
        $.ajax({
			type: "PUT",
			url: 'http://localhost:5000/api/photo/' + photo_id + '/tags',
			crossDomain: true,
			dataType: 'json',
            headers : {Authentication : localStorage.getItem('token')},
            data : {tags : this.state.newtags},
			success: (result)=>{
				this.fetchTags(photo_id);
			}
		});
    }
    
    handlePhotoRotate(selectedIndex, event) {
        this.setState({
            photo_index : selectedIndex,
            photo_direction : event.direction
        });
        this.setState({
            tags : this.state.photos[selectedIndex].tags 
        });
    }
    
    fetchTags(photo_id) {
        $.ajax({
			type: "GET",
			url: 'http://localhost:5000/api/photo/' + photo_id + '/tags',
			crossDomain: true,
			dataType: 'json',
            headers : {'Authentication' : localStorage.getItem('token')},
			success: (result)=>{
				this.setState(result); 
			}
		});
    }
    
    fetchPhotos() {
		$.ajax({
			type: "GET",
			url: 'http://localhost:5000/api/photos/',
			crossDomain: true,
			dataType: 'json',
            headers : {'Authentication' : localStorage.getItem('token')},
			success: (result)=>{
				this.setState({photos : result}); 
                this.setState({tags : this.state.photos[this.state.photo_index].tags});
			}
		});
    }
	
	
	handleChange(event) {
        const target = event.target;
        this.setState({[target.name]: target.value}); 
	}
	
    handleSearch(event) {
		alert('Search is not yet implemented');
    }

    //Start of voice function
    componentDidMount() {
        if(this.state.compatible) {
            if(this.props.dataPath) {
                const xhr = new XMLHttpRequest();
                xhr.open('get', this.props.dataPath, true);
                xhr.onreadystatechange = () => {
                    if(xhr.readyState === 4) {
                        if(xhr.status === 200) {
                            this.wordTranscriptions = JSON.parse(xhr.responseText);
                        } else {
                            console.log('error');
                        }
                    }
                };
                xhr.send();
            }

            this.setupRecognition();
        }
    }

    transcribe(recognized) {
        // check if the whole string is in the dictionary
        const noSpaces = recognized.replace(/\s/g, '').toUpperCase();
        if(this.wordTranscriptions[noSpaces]) {
            if(this.props.wrapTokens) {
                return this.props.wrapTokens.replace('%s', this.wordTranscriptions[noSpaces]);
            } else {
                return this.wordTranscriptions[noSpaces];
            }
        }

        // check words
        const buffer = [];
        recognized.split(' ').forEach((word) => {
            if(!word) { buffer.push(' '); return; }
            const wordUpper = word.toUpperCase();

            // check if word is in the dictionary
            let transcribed = this.wordTranscriptions[wordUpper];

            // if all uppercase, it's probably an acronym
            if(!transcribed && word === wordUpper) {
                transcribed = '';
                for(let i = 0; i < word.length; i++) {
                    // append the transcription for each letter-word
                    transcribed += this.wordTranscriptions[word.charAt(i)] || word.charAt(i);
                }
            }

            // wrap known tokens
            console.log('do we wrap', transcribed, this.props.wrapTokens);
            if(transcribed && this.props.wrapTokens) {
                console.log('wrapping tokens', transcribed, this.props.wrapTokens);
                transcribed = this.props.wrapTokens.replace('%s', transcribed);
            }

            // wrap unknown tokens
            if(!transcribed && this.props.wrapUnknown) {
                console.log('wrapping unknown', word, this.props.wrapUnknown);
                word = this.props.wrapUnknown.replace('<','&lt;').replace('>','&gt;').replace('%s', word);
            }

            buffer.push(transcribed || word);
        });
        return buffer.join(' ');
    }

    setupRecognition() {
        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.onend = this.finishRecognition.bind(this);
        recognition.onresult = this.finishRecognition.bind(this);
        this.recognition = recognition;
    }

    beginRecognition() {
        if(this.state.isRecording) {
            this.finishRecognition();
        } else {
            this.recognition.onresult = this.processRecognition.bind(this);
            this.recognition.onend = this.finishRecognition.bind(this);
            this.recognition.start();
            this.setState({
                isRecording: true
            });
        }
    }

    processRecognition(event) {
        console.log('processrecog', event.results);

        if(!event.results) {
            this.setState({
                recognized: 'error',
                transcribed: '',
            });
        } else {
            const recognized = event.results[event.results.length - 1][0].transcript;
            const transcribed = this.transcribe(recognized);
            this.setState({
                recognized: event.results.length === 1 ? recognized : this.state.recognized + recognized,
                transcribed: event.results.length === 1 ? transcribed : this.state.transcribed + transcribed,
            });

            if(this.props.onTranscription) {
                this.props.onTranscription.call(null, recognized, transcribed);
            }
        }
    }

    finishRecognition(event) {
        this.recognition.onend = this.recognition.onresult = null;
        this.recognition.stop();
        this.setState({
            isRecording: false
        });
    }

    clear() {
        this.setState({
            recognized: '',
            transcribed: '',
        });
    }
    //End of voice function

    render() {
		var imageStyle = {
            display: "block",
            height: "600px",
            margin: "auto"
        };
        var tagStyle = {
            margin: "0 auto"
        };

        const buttonText = this.state.compatible ?
            (!this.state.isRecording ? this.props.textStart : this.props.textStop) :
            'Your browser does not support Speech Recognition.';
        
		return (

            <div>
                <Carousel activeIndex={this.state.photo_index} direction={this.state.photo_direction} onSelect={this.handlePhotoRotate}>
                    {this.state.photos.map(photo =>
                        <Carousel.Item>
                            <img src={photo.url} style={imageStyle}/>
                        </Carousel.Item>
                    )}
                </Carousel>

                <br/>
                <div style={tagStyle}>
                    {this.state.tags.map(tag =>
                        <span>
                            <Label bsStyle="primary">{tag.value}</Label>&nbsp;
                        </span>
                    )}
                    <FormControl type="text" value={this.state.newtags} onChange={this.handleTagsChange}></FormControl>
                    <Button bsStyle="success" onClick={this.handleUpdateTags}>Add Tags</Button>
                </div>

                <div style={tagStyle}>
                    <Button disabled={!this.state.compatible} onClick={this.beginRecognition.bind(this)}>
                {buttonText}</Button>
                </div>

                <p><label>Transcribed:</label><span className="result" dangerouslySetInnerHTML={{__html: this.state.transcribed}} /></p>
                {this.state.recognized && <Button onClick={this.clear.bind(this)}>× Clear</Button>}

            </div>           
		);
	}
}


Tagging.defaultProps = {
    textStart: '🎤 Begin Tagging',
    textStop: '■ Stop Tagging',
    textUnsupported: '⚠ Your browser does not support Speech Recognition.',
    wrapTokens: '',
    wrapUnknown: ''
};

export default Tagging;