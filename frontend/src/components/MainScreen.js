import React from 'react';
import $ from 'jquery';
import {ListGroup, ListGroupItem} from 'react-bootstrap';

class MainScreen extends React.Component {
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
            headers: {'Authentication' : localStorage.getItem('token')},
			success: (result)=>{
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
			<ListGroup>
                {this.state.photos.map(photo => 
                    <ListGroupItem><img src={photo.url} width={100}></img></ListGroupItem>
                )}
			</ListGroup>
		);
	}
}

export default MainScreen;