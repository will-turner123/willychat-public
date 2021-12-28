import FriendsList from "../components/FriendsList"
import FriendRequests from "../components/FriendRequests";
import Inbox from "../components/Inbox";
import BigSpinner from "../components/BigSpinner";
import { AuthContext} from "../contexts/Auth";
import React, { useContext, useEffect, useState, useRef } from "react";
import firebase from "firebase/compat/app";
import 'firebase/compat/auth';
import SideBar from "../components/SideBar";
import Header from "../components/Header";

const HomePage = () => {
    const [listenerLoaded, setListenerLoaded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState();
    const [collapsed, setCollapsed] = useState(window.innerWidth < 768 ? false : true);
    const { currentUser } = useContext(AuthContext);

    useEffect(() => {
        if(!listenerLoaded){
            userListener()
        }
    }, [])

    const userListener = () => {
        firebase
        .firestore()
        .collection('users')
        .doc(currentUser.uid)
        .onSnapshot((snapshot) => {
            setUserData(snapshot.data())
            setLoading(false)
        })
    }


    return(
        <>
        <SideBar />
        <Header collapsed={collapsed} setCollapsed={setCollapsed} children={
                <span class="nav-link">Home</span>
            }/>
        <div class="main-panel">
            <div class="content-wrapper">
                {loading && (<BigSpinner/>)}
                {!loading && (
                    <>
                    <div class="row p-5 my-5">
                        <div class="col-md-12 col-lg-4 grid-margin stretch-card">
                            <FriendRequests userData={userData}/>
                        </div>
                        <div class="col-md-12 col-lg-8 grid-margin stretch-card">
                            <FriendsList userData={userData}/>
                        </div>
                        <div class="col-12 grid-margin stretch-card">
                            <Inbox userData={userData} viewAll={false}/>
                        </div>
                    </div>
                    </>
                )}
            </div>
        </div>
        </>    
    )
}

export default HomePage