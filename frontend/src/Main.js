import React from 'react';
import { Switch, Route } from 'react-router-dom';
import MainScreen from './components/MainScreen';
import LoginForm from './components/LoginForm';
import Tagging from './components/Tagging';
import UploadScreen from './components/UploadScreen';


const Main = () => (
    <main>
        <Switch>
            <Route exact path='/' component={LoginForm} />
            <Route exact path='/home' component={MainScreen} />
            <Route exact path='/tagging' component={Tagging} />
            <Route exact path='/upload' component={UploadScreen} />
        </Switch>
    </main>
)

export default Main;