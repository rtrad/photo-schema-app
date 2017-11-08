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
    
    
    fetchPreviousSearch(id, filter) {
        var payload = filter;
        payload['from recent'] = true;
        $.ajax({
            type: "POST",
            url: 'http://localhost:5000/api/photos/filter',
            crossDomain: true,
            dataType: 'json',
            contentType: 'application/json',
            headers: {'Authentication' : localStorage.getItem('token')},
            success: (result)=>{
                var resultObj = {};
                resultObj[id] = result;
                this.setState({
                  photo_groups: Object.assign({}, this.state.photo_groups, resultObj),
                }); 
            }, 
            data : JSON.stringify(payload)
        });
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
                for (var i = 0; i < result.searches.length; i++) {
                    payload = result.searches[i];
                    var options = {  
                        weekday: "long", year: "numeric", month: "short",  
                        day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit"
                    }; 
                    var date = new Date(result.searches[i].time * 1000);
                    var id = 'previous search from ' + date.toLocaleTimeString("en-us", options);
                    this.fetchPreviousSearch(id, payload);
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