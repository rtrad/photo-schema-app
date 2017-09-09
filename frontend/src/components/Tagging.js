import React from 'react';
import $ from 'jquery';
import {Carousel} from 'react-bootstrap';

class Tagging extends React.Component {
	constructor(props) {
		super(props);
        
		this.state = {searchquery : '', photos : []};
		this.fetchPhotos();
        this.handleChange = this.handleChange.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
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
    
    render() {
		var imageStyle = {
            display: "block",
            height: "600px",
            margin: "auto"
        };
		return (
			<Carousel>
				{this.state.photos.map(photo =>
					<Carousel.Item>
                        <img src={photo.url} style={imageStyle}/>
					</Carousel.Item>
				
				)}
			</Carousel>
		);
	}
}

export default Tagging;