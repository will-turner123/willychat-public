import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/Auth";
import firebase from "firebase/compat/app";
import 'firebase/compat/auth';
import {Link} from 'react-router-dom';

const Login = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const { email, password } = e.target.elements;
    try {
      firebase.auth().signInWithEmailAndPassword(email.value, password.value);
    } catch (error) {
      alert(error);
    }
  };
  const { currentUser } = useContext(AuthContext);
  if (currentUser) {
    return <Navigate to="/" />;
  }
  return (
    <>
      <div class="container-fluid page-body-wrapper full-page-wrapper">
        <div class="row w-100">
          <div class="content-wrapper full-page-wrapper d-flex align-items-center auth login-bg">
            <div class="card col-lg-4 mx-auto">
              <div class="card-body px-5 py-5">
                <h3 class="card-title text-start mb-3">Login</h3>
                <form onSubmit={handleSubmit}>
                  <div class="form-group">
                    <label>Email *</label>
                    <input type="email" name="email" placeholder="Email" class="form-control p_input" />
                  </div>
                  <div class="form-group">
                    <label>Password *</label>
                    <input type="password" name="password" placeholder="Password" class="form-control p_input"/>
                    <div class="text-center">
                      <button type="submit" class="btn btn-primary btn-block enter-btn my-3 w-50">Login</button>
                    </div>
                    <p class="sign-up">Don't have an account? <Link to="/register">Join now</Link></p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  );
};

export default Login;