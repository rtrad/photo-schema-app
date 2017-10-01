import React, { Component, PropTypes } from 'react';

import $ from 'jquery';
import {Carousel, FormGroup, FormControl, ControlLabel, Button } from 'react-bootstrap';
import {WithContext as ReactTags} from 'react-tag-input';
import tag_style from '../react-tags.css'


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
            isRecording: false,
            carousel_id: 0,
            curr_tags: []
        };

        this.fetchPhotos();
        this.handleChange = this.handleChange.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
        this.handleSelect = this.handleSelect.bind(this);

        this.handleTagDelete = this.handleTagDelete.bind(this);
        this.handleTagAdd = this.handleTagAdd.bind(this);
        this.handleTagDrag = this.handleTagDrag.bind(this);

        this.recognition = null;
        this.wordTranscriptions = props.data || {};

    }
    
    pushTag(photo_id, tag) {
        $.ajax({
            type: "PUT",
            url: 'http://localhost:5000/api/photo/' + photo_id + '/tags',
            crossDomain: true,
            dataType: 'json',
            headers : {'Authentication' : localStorage.getItem('token')},
            data : {'tags' : tag}
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
                let tags = [];
                
                this.state.photos[this.state.carousel_id].tags.forEach(
                    function(tag, index) {
                        tags.push({id: index, text: tag.value})
                    });
                this.setState({curr_tags : tags});
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
                
                let tags = [];
                
                this.state.photos[this.state.carousel_id].tags.forEach(
                    function(tag, index) {
                        tags.push({id: index, text: tag.value})
                    });
                this.setState({curr_tags : tags});
            }
        });
    }

    // Carousel handler functions
    handleSelect(selectedIndex, event) {
        this.setState({
            carousel_id: selectedIndex,
        });
        
        let tags = [];
        
        (this.state.photos[selectedIndex].tags.forEach(
            function (tag, index) {
                tags.push({id : index, text: tag.value});
            }
        ));
        this.setState({curr_tags : tags});
    }

    //Tagging handler functions
    handleTagDelete(idx) {
        let curr_tags = this.state.curr_tags;
        curr_tags.splice(idx,1);
        this.setState({curr_tags: curr_tags});

    }
    handleTagAdd(tag) {
        let curr_tags = this.state.curr_tags;
        curr_tags.push({
            id: curr_tags.length + 1,
            text: tag
        });
        this.setState({curr_tags: curr_tags});
        this.pushTag(this.state.photos[this.state.carousel_id].photo_id, tag);

    }
    handleTagDrag(tag, currPos, newPos) {
        let curr_tags = this.state.curr_tags;
        curr_tags.splice(currPos, 1);
        curr_tags.splice(newPos, 0, tag);

        this.setState({curr_tags: curr_tags});
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
        
        const { carousel_id, curr_tags, photos } = this.state;
        return (

            <div>
                <Carousel activeIndex={carousel_id} onSelect={this.handleSelect}>
                    {photos.map((photo, idx) =>
                        <Carousel.Item index={idx}>
                            <img src={photo.url} style={imageStyle}/>
                        </Carousel.Item>
                    )}
                </Carousel>

                <br/>
                <form>
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
                        tags={curr_tags}
                        handleDelete={this.handleTagDelete}
                        handleAddition={this.handleTagAdd}
                        handleDrag={this.handleTagDrag} />
                    </FormGroup>
                </form>
                <div style={tagStyle}>
                    <FormControl type="text"></FormControl>
                    <Button  disabled={!this.state.compatible} onClick={this.beginRecognition.bind(this)}>
                {buttonText}</Button>
                </div>

                <p><label>Transcribed:</label><span className="result" dangerouslySetInnerHTML={{__html: this.state.transcribed}} /></p>
                {this.state.recognized && <Button onClick={this.clear.bind(this)}>× Clear</Button>}

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
