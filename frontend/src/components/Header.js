import React from 'react';
import { Link } from 'react-router-dom';

import {Nav, Navbar, NavItem} from 'react-bootstrap';


class Header extends React.Component {
	render() {
		return (
			<Navbar>
				<Navbar.Header>
					<Navbar.Brand>
						<Link to='/'>Intrapic</Link>
					</Navbar.Brand>
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
				</Navbar.Header>
			</Navbar>
		);
	}
}

export default Header;