import logo from './logo.svg';
import './theme/css/style.css';
import './theme/css/materialdesignicons.min.css';
import './App.css';
import React from "react";
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import firebaseConfig from './firebaseConfig';
import firebase from "firebase/compat/app";
import "firebase/auth";
import 'firebase/firestore';
import { AuthProvider } from "./contexts/Auth";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import RedirectPage from './components/Redirect';
import PrivateRoute from './components/PrivateRoute';
import LanderRoute from './components/LanderRoute';
import ServerPage from './pages/Server';
import Base from './pages/Base';
import Logout from './pages/Logout';
import HomePage from './pages/Home';
import ChatPage from './pages/Chat';
import InboxPage from './pages/InboxPage';
import SettingsPage from './pages/Settings';
import Lander from './pages/Lander';
// style imports



// https://stackoverflow.com/questions/56069309/detect-the-uniqueness-of-the-usernames-with-firebase-and-react-js

// on user registration, create users document with:
//  subscribed_channels: {'uid': uid, 'notif_count': 0}
//  friends: [user.uid]
//  id: uid
//  friend_requests: []
//  username: []

// create chats document 
//  participants: [uid1, uid2]
// messages: {}

// left sidebar with all subscribed_channels and create server
// servers: {'name': server name, 'id': server uid, 'icon': "", 'owner': owner.uid,  'mods': [], 'members': [], channels: [{
//  "channelid": {"name": channelName, "messages": ["message": "hello world", "author": uid, "authorDisplay": author.displayName, "timestamp": timestamp]}, 
// }]}



export default function App() {
  return (
    <AuthProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Base/>}>
          <Route index element={<LanderRoute><HomePage/></LanderRoute>}/>
          <Route path="/redirect" element={<RedirectPage/>}/>
          <Route path="/register" element={<Register/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/logout" element={<Logout/>} />
          <Route path="/server/*" element={<PrivateRoute><ServerPage/></PrivateRoute>}></Route>
          <Route path="/chat/*" element={<PrivateRoute><ChatPage/></PrivateRoute>}/>
          <Route path="/inbox" element={<PrivateRoute><InboxPage/></PrivateRoute>}/>
          <Route path="/settings" element={<PrivateRoute><SettingsPage/></PrivateRoute>}/>
        </Route>
        <Route path="/land" element={<Lander/>}/>
      </Routes>
    </Router>
    </AuthProvider>
  );
}
ReactDOM.render(
  <React.StrictMode>
        <App/>
  </React.StrictMode>,
  document.getElementById("root")
);
