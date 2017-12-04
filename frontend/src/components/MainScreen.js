import React from 'react';
import $ from 'jquery';
import {ListGroup, ListGroupItem, Button, Grid, Row, Image} from 'react-bootstrap';
import SearchBar from './SearchBar';
import TaggingModal from './TaggingModal';

class MainScreen extends React.Component {
	constructor(props) {
		super(props);
        
		this.state = {
		    photo_groups: {},
		    search_results: [],
		    query: null,
		    show_search: false,
		    rangepicker_focus: null,
			show_tagging : false,
			photos_tagging : [],
			tags_tagging : []
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
                    untagged: result,
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
					var searchTerms = [];
					payload.filters.forEach((currentValue) => {
						if (currentValue.expression && currentValue.expression.value){
							searchTerms.push(currentValue.expression.value);
						}
					});
                    var id = 'previous search: ' + searchTerms.join(', ');
                    this.fetchPreviousSearch(id, payload);
                } 
            }
        });
		
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
                    'all photos': result,
                  }),
                }); 
			},
			data : JSON.stringify({'from recent' : true})
		});
    }
	
	pushTag(photo_id, tag) {
        let payload = {'tags' : {'content' : [tag]}};
        $.ajax({
            type: "POST",
            url: 'http://localhost:5000/api/photo/' + photo_id + '/tags',
            crossDomain: true,
            contentType: 'application/json',
            headers : {'Authentication' : localStorage.getItem('token')},
            data : JSON.stringify(payload)
        });
    }
    
    removeTag(photo_id, tag) {
        let payload = {'tags' : {'content' : [tag]}};
        $.ajax({
            type: "DELETE",
            url: 'http://localhost:5000/api/photo/' + photo_id + '/tags',
            crossDomain: true,
            contentType: 'application/json',
            headers : {'Authentication' : localStorage.getItem('token')},
            data : JSON.stringify(payload)
        });
    }
	
	handleChange(event) {
        const target = event.target;
        this.setState({[target.name]: target.value}); 
	}

	displaySearch = (tag,sd,ed,r) => {
		let tags = [];  
		r.forEach(
			function(photo, photo_index){
				tags[photo_index] = [];
				photo.tags.content.forEach(
					function(tag, tag_index) {
						tags[photo_index].push({id: tag_index, text: tag});
				});
			});
	    this.setState({
            search_results: r,
            query: {
                "start": sd,
                "end": ed,
                "tag": tag
            },
            show_search: true,
			tags_search: tags
        });
    }
	
    onSearchClose = (e) => {
        window.location.reload();
		console.log('hide search');
        this.setState({
            query: '',
            show_search: false
        });

    }
	
	onTaggingClose = (e) => {
        window.location.reload();
		this.setState({show_tagging : false});

	}
	
	handleTag = (photos) => {
		let tags = [];  
		photos.forEach(
			function(photo, photo_index){
				tags[photo_index] = [];
				photo.tags.content.forEach(
					function(tag, tag_index) {
						tags[photo_index].push({id: tag_index, text: tag});
				});
			});
		this.setState({show_tagging : true, photos_tagging : photos, tags_tagging : tags});
	}

    render() {
        var imageStyle = {
            width: "600px",
            overflow: "auto",
            display: "inline"
        };
        var scrollingWrapper = {
            overflowX: "scroll",
            overflowY: "hidden",
            whiteSpace: "nowrap",
        }
        var card = {
			display: "inline-block",
			width: "100px",
			margin: "5px",
			cursor: 'pointer'
        }
		return (
		    <Grid>
				<SearchBar onSearch={this.displaySearch}/>
					<Row>
					
						<TaggingModal
							onClose={this.onSearchClose}
							photos={this.state.search_results}
							tags={this.state.tags_search}
							query={this.state.query}
							show={this.state.show_search}
							pushTag={this.pushTag}
							removeTag={this.removeTag}/>
						<ListGroup>
							{Object.keys(this.state.photo_groups).map(key => 
								<div>
								<h3>
									{key}
									<Button className={"pull-right"} onClick={() => this.handleTag(this.state.photo_groups[key])}>tag photos</Button>
								</h3>
								<div style={imageStyle}>
									<ListGroupItem style={scrollingWrapper}>
									{this.state.photo_groups[key].map(photo =>
										<Image src={photo.url} style={card} onClick={() => this.handleTag([photo])}></Image>
									)}
									</ListGroupItem>
								</div>
								</div>
							)}
						</ListGroup>
						<TaggingModal
							onClose={this.onTaggingClose}
							photos={this.state.photos_tagging}
							tags={this.state.tags_tagging}
							show={this.state.show_tagging}
							pushTag={this.pushTag}
							removeTag={this.removeTag}/>
					</Row>
			</Grid>
		);
	}
}

MainScreen.contextTypes = {
  router: React.PropTypes.func.isRequired
};

export default MainScreen;