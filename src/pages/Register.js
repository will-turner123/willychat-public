import React, { useReducer, useState, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import firebase from 'firebase/compat/app';
import 'firebase/auth';
import 'firebase/compat/storage';
import 'firebase/compat/firestore';
import { AuthContext } from "../contexts/Auth";
import BigSpinner from '../components/BigSpinner';
import { Link } from 'react-router-dom';

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



const initialState = {
  username: '',
  email: '',
  description: '',
  password: '',
  confirmPassword: '',
  image: '',
  formErrors: {},
};
const reducer = (state, action) => {
  switch (action.type) {
    case 'username':
      return { ...state, username: action.payload };
    case 'email':
      return { ...state, email: action.payload };
    case 'password':
      return { ...state, password: action.payload };
    case 'confirmPassword':
      return { ...state, confirmPassword: action.payload };
    case 'image':
      return { ...state, image: action.payload };
    default:
      throw new Error();
  }
};
const RegisterPage = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [error, setError] = useState(false);
  const [hasRegistered, setHasRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleOnChange = (evt) => {
    const { target } = evt;
    dispatch({
      type: target.name,
      payload: target.value,
    });
  };
  const handleFileChange = (evt) => {
    const { target } = evt;
    dispatch({
      type: target.name,
      payload: target.files[0],
    });
  };
  const registerUser = (evt) => {
    evt.preventDefault();
    if (state.password !== state.confirmPassword) {
      setError('Error: Passwords do not match.');
      return;
    }
    firebase.firestore().collection('users').where('username', '==', state.username).get()
    .then(snapshot => {
        if(snapshot.empty){
            // username not taken
            setLoading(true);
            firebase.auth().createUserWithEmailAndPassword(state.email, state.password)
            .then(async (doc) => {
                const { uid } = doc.user;
                const username = state.username;
                const imageRef = firebase.storage().ref(`/profiles/${uid}`);
                await imageRef.put(state.image);
                const imageUrl = await imageRef.getDownloadURL();
                //  subscribed_channels: {'uid': uid, 'notif_count': 0}
                //  friends: [user.uid]
                //  id: uid
                //  friend_requests: []
                //  username: []
                firebase.auth().currentUser.updateProfile({
                    displayName: username,
                    photoURL: imageUrl,
                })
                firebase.firestore().collection('users').doc(uid).set({
                  username: state.username,
                  imageUrl: imageUrl,
                  friends: [uid],
                  friend_requests: [],
                  subscribed_channels: ['default'],
                  id: uid,
                  notifications: {},
                  status: "online",
                  outgoing_friend_requests: [],
                  blocked: [],
                });
                firebase.firestore().collection('chats').add({
                    participants: [uid, uid],
                    messages: []
                })
                .then(
                  setHasRegistered(true)
                  )
            })
        }
        else{
            setError('Error: username is taken');
            // TODO: form validation stuff
        }
    })
    .catch((err) => {
        setError(err.message);
        console.log(`Unable to register user: ${err.message}`);
        console.log(err);
      });
  };


  if (hasRegistered) {
    return <Navigate to="/redirect" />; 
  }
  return (

    <>
    <div class="container-fluid page-body-wrapper full-page-wrapper">
      <div class="row w-100">
        <div class="content-wrapper full-page-wrapper d-flex align-items-center auth login-bg">
          <div class="card col-lg-4 mx-auto">
            {loading && (<div class="mx-auto my-auto"><BigSpinner/></div>)}
            {!loading && (
              <div class="card-body px-5 py-5">
                <h3 class="card-title text-start mb-3">
                  <form onSubmit={registerUser} id="registerForm">
                    <div class="form-group">
                      <label>Username</label>
                      <input 
                        type="text"
                        class="form-control p_input"
                        placeholder="Username"
                        name="username"
                        autoComplete="username"
                        required
                        onChange={handleOnChange}
                        value={state.username}
                        minLength={3}
                      />
                    </div>
                    <div class="form-group">
                      <label>Email</label>
                      <input 
                        type="email"
                        class="form-control p_input"
                        placeholder="Email"
                        name="email"
                        autoComplete="email"
                        required
                        onChange={handleOnChange}
                        value={state.email}
                        minLength={3}
                      />
                    </div>
                    <div class="form-group">
                      <label>Password</label>
                      <input 
                        type="password"
                        class="form-control p_input"
                        placeholder="Password"
                        name="password"
                        autoComplete="password"
                        required
                        onChange={handleOnChange}
                        value={state.password}
                        minLength={3}
                      />
                    </div>
                    <div class="form-group">
                      <label>Confirm Password</label>
                      <input 
                        type="password"
                        class="form-control p_input"
                        placeholder="Confirm Password"
                        name="confirmPassword"
                        autoComplete="password"
                        required
                        onChange={handleOnChange}
                        value={state.confirmPassword}
                        minLength={3}
                      />
                    </div>
                    <div class="form-group">
                      <label>Profile Picture</label>
                      <input 
                        id="image"
                        name="image"
                        type="file"
                        accept=".png,.jpeg,.jpg,.webp"
                        required
                        onChange={handleFileChange}
                        value={state.image.fileNamer}
                        className="form-control"
                        placeholder="Name"
                        minLength={3}
                      />
                    </div>
                    <div class="text-center">
                      <button type="submit" class="btn btn-primary btn-block enter-btn my-3 w-50">Register</button>
                    </div>
                    <p class="sign-up">Already have an account? <Link to="/login">Log in</Link></p>
                  </form>
                </h3>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
      </>
  )
};
export default RegisterPage;