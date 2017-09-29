import React, { Component, PropTypes } from 'react';

import $ from 'jquery';
import {Carousel, FormControl, ControlLabel, Button } from 'react-bootstrap';



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
            recognized: '',
            transcribed: '',
            compatible,
            isRecording: false,};

		this.fetchPhotos();
        this.handleChange = this.handleChange.bind(this);
        this.handleSearch = this.handleSearch.bind(this);

        this.recognition = null;
        this.wordTranscriptions = props.data || {};

	}
    
    fetchPhotos() {
		$.ajax({
			type: "GET",
			url: 'http://localhost:5000/api/photos/',
			crossDomain: true,
			dataType: 'json',
			success: (result)=>{
				console.log(result);
				this.setState({photos : result}); 
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
                <Carousel>
                    {this.state.photos.map(photo =>
                        <Carousel.Item>
                            <img src={photo.url} style={imageStyle}/>
                        </Carousel.Item>
                    )}
                </Carousel>

                <br/>
                <div style={tagStyle}>
                    <FormControl type="text"></FormControl>
                    <Button bsStyle="success">Add Tags</Button>
                </div>

                <button disabled={!this.state.compatible} onClick={this.beginRecognition.bind(this)}>
                {buttonText}
                </button>


                <p><label>Transcribed:</label><span className="result" dangerouslySetInnerHTML={{__html: this.state.transcribed}} /></p>
                {this.state.recognized && <button onClick={this.clear.bind(this)}>× Clear</button>}

            </div>           
		);
	}
}

Tagging.propTypes = {
    data: PropTypes.object,
    dataPath: PropTypes.string,
    onTranscription: PropTypes.func,
    textStart: PropTypes.string,
    textStop: PropTypes.string,
    textUnsupported: PropTypes.string,
    wrapTokens: PropTypes.string,
    wrapUnknown: PropTypes.string
};

Tagging.defaultProps = {
    textStart: '🎤 Begin Tagging',
    textStop: '■ Stop Tagging',
    textUnsupported: '⚠ Your browser does not support Speech Recognition.',
    wrapTokens: '',
    wrapUnknown: ''
};

export default Tagging;