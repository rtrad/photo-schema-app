import React from 'react';
import { Link } from 'react-router-dom';

import {Nav, Navbar, NavItem} from 'react-bootstrap';


class Header extends React.Component {
    constructor(props) {
        super(props);
        this.handleLogout = this.handleLogout.bind(this);
    }
    
    handleLogout(event) {
        localStorage.removeItem('token');
    }
    
	render() {
		return (
			<Navbar>
				<Navbar.Header>
					<Navbar.Brand>
						<Link to='/'>Intrapic</Link>
					</Navbar.Brand>
                </Navbar.Header>
                <Navbar.Collapse>
                    <Nav>
                        <NavItem>
                            <Link to='/home'>Home</Link>
                        </NavItem>
                        <NavItem>
                            <Link to='/upload'>Upload</Link>
                        </NavItem>
                        <NavItem>
                            <Link to='/tagging'>Tagging</Link>
                        </NavItem>
                    </Nav>
                    <Nav pullRight>
                        <NavItem>
                            <Link to='/' onClick={this.handleLogout}>Logout</Link>
                        </NavItem>
                    </Nav>
				</Navbar.Collapse>
			</Navbar>
		);
	}
}

export default Header;