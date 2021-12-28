import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../contexts/Auth";
import firebase from "firebase/compat/app";
import 'firebase/compat/auth';
import SideBar from "../components/SideBar";


const Dashboard = () => {
  const { currentUser } = useContext(AuthContext);
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  return (
      <>
      <SideBar/>
    <div class="container-fluid">
      <h1>Welcome</h1>
      <p>This is the dashboard, if you can see this you're logged in.</p>
      <p>{currentUser.displayName}</p>
      <img src={currentUser.photoURL} class="img-round"/>
      <button onClick={() => firebase.auth().signOut()}>Sign out</button>
    </div>
    </>
  );
};

export default Dashboard;