import React from 'react';
import { Modal, Form, FormGroup, FormControl, ControlLabel, Col, Button } from 'react-bootstrap'; 

function RegistrationForm({show, closeReg, onSubmit, onChanged, userObject}) {
    return (
        <Modal show={show} onHide={closeReg}>
            <Modal.Header closeButton>
                <Modal.Title>Sign up</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form horizontal onSubmit={onSubmit}>
                    <FormGroup>
                        <Col componentClass={ControlLabel} sm={2}>Username:</Col>
                        <Col sm={10}>
                            <FormControl name="username" type="text" value={userObject.username} onChange={onChanged} />
                        </Col>
                    </FormGroup>
                    <FormGroup>
                        <Col componentClass={ControlLabel} sm={2}>Password:</Col>
                        <Col sm={10}>
                            <FormControl name="password" type="password" value={userObject.password} onChange={onChanged} />
                        </Col>
                    </FormGroup>
                    <FormGroup>
                        <Col componentClass={ControlLabel} sm={2}>Confirm password:</Col>
                        <Col sm={10}>
                            <FormControl name="confirm_password" type="password" value={userObject.confirm_password} onChange={onChanged}/>
                        </Col>
                    </FormGroup>
                    <FormGroup>
                        <Col componentClass={ControlLabel} sm={2}>Name:</Col>
                        <Col sm={10}>
                            <FormControl name="name" type="text" value={userObject.name} onChange={onChanged}/>
                        </Col>
                    </FormGroup>
                    <FormGroup>
                        <Col componentClass={ControlLabel} sm={2}>Email:</Col>
                        <Col sm={10}>
                            <FormControl name="email" type="email" value={userObject.email} onChange={onChanged}/>
                        </Col>
                    </FormGroup>
                    <FormGroup>
                        <Col smOffset={2} sm={10}>
                            <Button bsStyle="primary" type="submit">Register</Button>
                        </Col>
                    </FormGroup>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default RegistrationForm;
