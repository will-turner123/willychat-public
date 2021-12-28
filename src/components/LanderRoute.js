import React from 'react';
import {Route, Navigate} from 'react-router-dom';
import firebase from 'firebase/compat/app';
import 'firebase/auth';

const LanderRoute = ({ children }) => {
    return(
            firebase.auth().currentUser ? children : <Navigate to="/land" />
    )
}

export default LanderRoute;