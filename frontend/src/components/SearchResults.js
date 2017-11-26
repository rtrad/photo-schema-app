import React from 'react';
import PropTypes from 'prop-types';
import {Modal, Button} from 'react-bootstrap';
import momentPropTypes from 'react-moment-proptypes';

export default class SearchResults extends React.Component {
    constructor(props) {
        super(props);
    }
    
    static propTypes = {
        onClose: PropTypes.func,
        results: PropTypes.array,
        query: PropTypes.shape({
            start: momentPropTypes.momentObj,
            end: momentPropTypes.momentObj,
            tag: PropTypes.string
        }),
        show: PropTypes.bool
    }

    static defaultProps = {
        onClose() {},
        results: [],
        query: null,
        show: false
    }

    getTitle = () => {
        if (this.props.query != null) {
            return "Search results for tag \"" + this.props.query.tag + "\"";
        }
    }

    render() {
        return (
            <Modal show={this.props.show} onHide={this.props.onClose}>
                <Modal.Header closeButton>
                    <Modal.Title>{this.getTitle()}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                </Modal.Body>
            </Modal>
        );
    }
}
