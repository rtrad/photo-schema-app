import React from 'react';
import $ from 'jquery';
import {ListGroup, ListGroupItem} from 'react-bootstrap';

class MainScreen extends React.Component {
	constructor(props) {
		super(props);
        
		this.state = {searchquery : '', photo_groups: {}};
		this.fetchPhotos();
        this.handleChange = this.handleChange.bind(this);
        this.handleSearch = this.handleSearch.bind(this);
	}
    
    fetchPhotos() {
        let payload = {
            "filters" : [
                {
                    "attribute" :"tags.count",
                    "expression" : {"operation" : "eq", "value" : 0}
                }
            ]
        };
		$.ajax({
			type: "POST",
			url: 'http://localhost:5000/api/photos/filter',
			crossDomain: true,
			dataType: 'json',
            contentType: 'application/json',
            headers: {'Authentication' : localStorage.getItem('token')},
			success: (result)=>{
				this.setState({
                  photo_groups: Object.assign({}, this.state.photo_groups, {
                    untaggged: result,
                  }),
                }); 
			}, 
            data : JSON.stringify(payload)
		});
        
        
        
        $.ajax({
            type: "GET",
            url: 'http://localhost:5000/api/recent_searches',
            crossDomain: true,
            dataType: 'json',
            contentType: 'application/json',
            headers: {'Authentication' : localStorage.getItem('token')},
            success: (result)=>{
                for (var i = 0; i < result.length; i++) {
                    payload = result[i];
                    $.ajax({
                        type: "POST",
                        url: 'http://localhost:5000/api/photos/filter',
                        crossDomain: true,
                        dataType: 'json',
                        contentType: 'application/json',
                        headers: {'Authentication' : localStorage.getItem('token')},
                        success: (result)=>{
                            this.setState({
                              photo_groups: Object.assign({}, this.state.photo_groups, {
                                i: result,
                              }),
                            }); 
                        }, 
                        data : JSON.stringify(payload)
                    });
                } 
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
                {Object.keys(this.state.photo_groups).map(key => 
                    <div>
                    <h3>{key}</h3>
                    <ListGroupItem>
                    {this.state.photo_groups[key].map(photo =>
                        <img src={photo.url} width={100}></img>
                    )}
                    </ListGroupItem>
                    </div>
                )}
			</ListGroup>
		);
	}
}

export default MainScreen;