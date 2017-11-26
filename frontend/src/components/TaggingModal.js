import React from 'react';
import PropTypes from 'prop-types';
import {Modal, Carousel, Grid, Row, Col, FormGroup, ControlLabel, Button, Glyphicon, Image} from 'react-bootstrap';
import {WithContext as ReactTags} from 'react-tag-input';
import tag_style from '../react-tags.css'

const initialState = {
	carouselIndex : 0,
	compatible: true,
	isRecording: false,
	recognized: '',
	transcribed: ''
};

export default class TaggingModal extends React.Component {
	constructor(props) {
		super(props);
		
		this.state = initialState;
		if(!window.webkitSpeechRecognition) {
            this.setState({compatible : false});
            console.info('The Transcription component has been disabled because your web browser does not support Speech Recognition.');
        }
		
		this.carouselHandleNext = this.carouselHandleNext.bind(this);
		this.handleClose = this.handleClose.bind(this);
		this.handleTagDelete = this.handleTagDelete.bind(this);
        this.handleTagAdd = this.handleTagAdd.bind(this);
        this.handleTagDrag = this.handleTagDrag.bind(this);
		
		this.recognition = null;
        this.wordTranscriptions = {};
	}
	
	static propTypes = {
		onClose: PropTypes.func,
		photos: PropTypes.array,
		tags: PropTypes.array,
		show: PropTypes.bool,
		pushTag: PropTypes.func,
		removeTag: PropTypes.func,
		data: PropTypes.object,
		dataPath: PropTypes.string,
		onTranscription: PropTypes.func,
		textStart: PropTypes.string,
		textStop: PropTypes.string,
		textUnsupported: PropTypes.string,
		wrapTokens: PropTypes.string,
		wrapUnknown: PropTypes.string
	}
	
	static defaultProps = {
		onClose() {},
		photos: [],
		tags: [],
		show: false,
		pushTag() {},
		removeTag() {},
		textStart: 'Begin Recording',
		textStop: 'Stop Recording',
		textUnsupported: 'Your browser does not support Speech Recognition.',
		wrapTokens: '',
		wrapUnknown: ''
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
        //this is where I will take out articles.*********************************************
        var articles = ['an','that','other','hm','this', 'a', 'the', 'is', 'there','are','they', '',' ','  ']; 
        const cleanBuffer = [];
        buffer.forEach(function(element){
           if(articles.includes(element)){
            console.log('pass');
           }else{
            cleanBuffer.push(element);
           };
        });

        console.log('cleanBuffer', cleanBuffer);

        cleanBuffer.forEach(function(element){
        	console.log(element);
        	this.handleTagAdd(element);
        }, this);


        //this.handleTagAdd(cleanBuffer);
        //************************************************************************************

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
	
	carouselHandleNext(index, e) {
		this.setState({carouselIndex : index});
		
	}
	
	getCurrentTags() {
		let tags = [];
        (this.props.photos[this.state.carouselIndex].tags.content.forEach(
            function (tag, index) {
                tags.push({id : index, text: tag});
            }
        ));
        return tags;
	}
	
	handleClose(e) {
		this.state = initialState;
		this.props.onClose(e);
	}
	
	handleTagDelete(idx) {
        let curr_tags = this.props.tags[this.state.carouselIndex];
        let tag = curr_tags.splice(idx,1)[0];
        tag = tag.text;
		this.props.removeTag(this.props.photos[this.state.carouselIndex].photo_id, tag);

    }
    handleTagAdd(tag) {
        this.props.tags[this.state.carouselIndex].push({
            id: this.props.tags[this.state.carouselIndex].length + 1,
            text: tag
        });
		this.props.pushTag(this.props.photos[this.state.carouselIndex].photo_id, tag);

    }
    handleTagDrag(tag, currPos, newPos) {
        let curr_tags = this.props.tags[this.state.carouselIndex];
        curr_tags.splice(currPos, 1);
        curr_tags.splice(newPos, 0, tag);
    }
	
	render() {
		var carouselItemStyle = {
				display: "block",
				height: "300px",
				margin: "auto"
		};
		var modalStyle = {
				width: "50%"
		};
		
		const buttonText = this.state.compatible ?
            (!this.state.isRecording ? this.props.textStart : this.props.textStop) :
            'Your browser does not support Speech Recognition.';
		
		return (
			<Modal show={this.props.show} onHide={this.handleClose} bsSize={'lg'}>
				<Modal.Header closeButton>
					<Modal.Title>
						Tag Photo{this.props.photos.length > 1 ? 's' : ''}
						<a className={"pull-right"} 
							download={this.props.photos.length > 0 ? this.props.photos[this.state.carouselIndex].url : "#"}
							href={this.props.photos.length > 0 ? this.props.photos[this.state.carouselIndex].url : "#"}>
							<Glyphicon glyph="download" /> Download Photo
						</a>
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div>
					<Grid>
						<Row>
						<Col xs={12} md={6}>
						<Carousel activeIndex={this.state.carouselIndex} onSelect={this.carouselHandleNext}>
							{this.props.photos.map((photo, index) =>
								<Carousel.Item index={index}>
									<Image src={photo.url} style={carouselItemStyle} alt={JSON.stringify(photo.tags.content)}/>
								</Carousel.Item>
							)}
						</Carousel>
						</Col>
						<Col xs={12} md={3}>
							<FormGroup>
							<ControlLabel>Tags:</ControlLabel>
							<ReactTags 
								classnames={{
									tags: 'ReactTags__tags',
									tagInput: 'ReactTags__tagInput',
									tagInputField: 'ReactTags__tagInputField',
									selected: 'ReactTags__selected',
									tag: 'ReactTags__tag',
									remove: 'ReactTags__remove',
									suggestions: 'ReactTags__suggestions',
									activeSuggestions: 'ReactTags__activeSuggestion'
								}}
								tags={this.props.photos.length > 0 ? this.props.tags[this.state.carouselIndex] : {}}
								handleDelete={this.handleTagDelete}
								handleAddition={this.handleTagAdd}
								handleDrag={this.handleTagDrag} />
							<hr/>
							<ControlLabel>Tag with your voice</ControlLabel>
							<Button disabled={!this.state.compatible} onClick={this.beginRecognition.bind(this)}>
								<Glyphicon glyph="microphone"/>{buttonText}</Button>
							</FormGroup>
							<p><ControlLabel>Transcribed:</ControlLabel><span className="result" dangerouslySetInnerHTML={{__html: this.state.transcribed}} /></p>
							{this.state.recognized && <Button onClick={this.clear.bind(this)}>Clear</Button>}
						</Col>
						</Row>
					</Grid>
					</div>
				</Modal.Body>
			</Modal>
		);
	}
}