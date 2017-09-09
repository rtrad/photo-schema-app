import React from 'react';
import $ from 'jquery';
import {Carousel, Row, Col} from 'react-bootstrap';

class UploadScreen extends React.Component {
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
		
		return (
			<Carousel>
				{this.state.photos.map(photo =>
					<Carousel.Item>
						<Row>
							<Col sm={3}>
								<img src={photo.url} />
							</Col>
						</Row>
					</Carousel.Item>
				
				)}
			</Carousel>
		);
	}
}

export default UploadScreen;