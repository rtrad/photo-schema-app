import React from 'react';
import $ from 'jquery';
import {ListGroup, ListGroupItem, Form, FormGroup, Button, FormControl, Grid, Row, Col} from 'react-bootstrap';
import SearchBar from './SearchBar';
import SearchResults from './SearchResults';

class MainScreen extends React.Component {
	constructor(props) {
		super(props);
        
		this.state = {
		    photo_groups: {},
		    search_results: [],
		    query: null,
		    show_search: false,
		    rangepicker_focus: null
		};
		this.fetchPhotos();
        this.handleChange = this.handleChange.bind(this);
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
            ],
            "from recent" : true
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

	displaySearch = (tag,sd,ed,r) => {
	    this.setState({
            search_results: r,
            query: {
                "start": sd,
                "end": ed,
                "tag": tag
            },
            show_search: true
        });
    }
	
    onSearchClose = (e) => {
        this.setState({
            search_results: [],
            query: null,
            show_search: false
        });
    }

    render() {
		return (
		    <Grid>
            <SearchBar onSearch={this.displaySearch}/>
		    <Row>
		    <SearchResults
		        onClose={this.onSearchClose}
		        results={this.state.search_results}
		        query={this.state.query}
		        show={this.state.show_search}/>
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
			</Row>
			</Grid>
		);
	}
}

MainScreen.contextTypes = {
    router: React.PropTypes.func.isRequired
};

export default MainScreen;
