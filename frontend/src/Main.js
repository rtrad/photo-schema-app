import React from 'react';
import { Switch, Route } from 'react-router-dom';
import MainScreen from './components/MainScreen';
import LoginForm from './components/LoginForm';
import UploadScreen from './components/UploadScreen';
import Profile from './components/Profile';

const Main = () => (
    <main>
        <Switch>
            <Route exact path='/' component={LoginForm} />
            <Route exact path='/home' component={MainScreen} />
            <Route exact path='/upload' component={UploadScreen} />
            <Route exact path='/profile' component={Profile} />
        </Switch>
    </main>
)

export default Main;
