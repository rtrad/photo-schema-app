import React from 'react';
import $ from 'jquery';
import {ListGroup, ListGroupItem, Form, FormGroup, Button, FormControl, Grid, Row, Col} from 'react-bootstrap';

class MainScreen extends React.Component {
	constructor(props) {
		super(props);
        
		this.state = {
		    searchquery : '',
		    photo_groups: {},
		    search_results: [],
		    show_search: false
		};
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
	
    handleSearch(event) {
        event.preventDefault();
        let payload = {
            "filters": [
                {
                    "attribute": "tags.content",
                    "expression": {"operation": "contains", value: this.state.searchquery}
                }
            ]
        }
        $.ajax({
			type: "POST",
			url: 'http://localhost:5000/api/photos/filter',
			crossDomain: true,
			dataType: 'json',
            contentType: 'application/json',
            headers: {'Authentication' : localStorage.getItem('token')},
			success: (result)=>{
				this.setState({
                  photo_groups: {
                    ["Search result for tag " + this.state.searchquery] : result
                  }
                }); 
			}, 
            data : JSON.stringify(payload)
		});
    }

   
    render() {
        var imageStyle = {
            width: "600px",
            overflow: "auto",
            display: "inline"
        };
        var scrollingWrapper = {
            "overflow-x": "scroll",
            "overflow-y": "hidden",
            "white-space": "nowrap",
        }
        var card = {
                display: "inline-block",
                width: "100",
                margin: "5",
        }
        
		return (
		    <Grid>
		    <Form horizontal onSubmit={this.handleSearch}>
		        <FormGroup>
                    <Col md={10}>
                    <FormControl
                        name="searchquery"
                        type="input"
                        value={this.state.searchquery}
                        placeholder="Enter search query"
                        onChange={this.handleChange}/>
                    </Col>
		            <Col md={2}>
                    <Button type="submit">Search</Button>
                    </Col>
                </FormGroup>
		    </Form>
		    <Row>
			<ListGroup>
                {Object.keys(this.state.photo_groups).map(key => 
                    <div>
                    <h3>{key}</h3>
                    <div style = {imageStyle}>
                    <ListGroupItem style = {scrollingWrapper}>
                    {this.state.photo_groups[key].map(photo =>
                        <img src={photo.url} style = {card}></img>
                    )}
                    </ListGroupItem>
                    </div>
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
