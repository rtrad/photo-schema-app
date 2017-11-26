import React from 'react';
import PropTypes from 'prop-types';
import $ from 'jquery';
import {DateRangePicker, DayPickerRangeController, isInclusivelyBeforeDay} from 'react-dates';
import {Form, FormGroup, Button, FormControl, Row, Col} from 'react-bootstrap';
const moment = require('moment');

export default class SearchBar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            tag: "",
            start_date: null,
            end_date: null,
            rangepicker_focus: null,
			loading: false
        }
    }

    static propTypes = {
        onSearch: PropTypes.func
    }

    handleChange = (e) => {
        const target = e.target;
        this.setState({[target.name]: target.value});
    }

    handleSearch = (e) => {
        e.preventDefault();
		this.setState({loading : true});
        let date_filter = null
        if (this.state.start_date != null ||
            this.state.end_date != null) {
            if (this.state.start_date != null &&
                this.state.end_date != null) {
                date_filter = {
                    "operation": "between",
                    "low": this.state.start_date.unix(),
                    "high": this.state.end_date.unix()
                }
            } else if (this.state.start_date != null) {
                date_filter = {
                    "operation": "gte",
                    "value": this.state.start_date.unix()
                }
            } else {
                date_filter = {
                    "operation": "lte",
                    "value": this.state.end_date.unix()
                }
            }
        }
        let payload = {
            "filters": [
                {
                    "attribute": "tags.content",
                    "expression": {
                        "operation": "contains",
                        value: this.state.tag
                    }
                },
                {
                    "attribute": "upload_time",
                    "expression": date_filter
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
			success: (result) => {
				this.completedSearch(result),
				this.setState({loading : false});
			}, 
			error: ()=> this.setState({loading : false}),
            data : JSON.stringify(payload)
		});
    }

    completedSearch = (result) => {
        this.props.onSearch(
            this.state.tag,
            this.state.start_date,
            this.state.end_date,
            result);
    }

    render() {
        return (
 		    <Form horizontal onSubmit={this.handleSearch}>
 		        <FormGroup>
 		            <Col md={5}>
                        <FormControl
                            name="tag"
                            type="input"
                            value={this.tag}
                            placeholder="Enter search query"
                            onChange={this.handleChange}/>
                    </Col>
                    <Col md={4}>
                        <DateRangePicker
                            startDatePlaceholderText="Pictures after..."
                            endDatePlaceholderText="Pictures before..."
                            startDate={this.state.start_date}
                            endDate={this.state.end_date}
                            onDatesChange={
                                ({ startDate, endDate }) => this.setState({
                                    start_date: startDate,
                                    end_date: endDate})
                                }
                            focusedInput={this.state.rangepicker_focus}
                            onFocusChange={
                                focusedInput => this.setState({
                                    rangepicker_focus: focusedInput
                                })}
                            isOutsideRange={day => !isInclusivelyBeforeDay(day, moment())}
                        />
                    </Col>
                    <Col md={3}>
                        <Button bsStyle="primary" disabled={this.state.loading} type="submit">{this.state.loading ? "Searching ..." : "Search"}</Button>
                    </Col>
                </FormGroup>
		    </Form>
       )
    }
}
