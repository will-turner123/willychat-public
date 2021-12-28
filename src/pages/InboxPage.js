import BigSpinner from "../components/BigSpinner";
import { AuthContext} from "../contexts/Auth";
import React, { useContext, useEffect, useState, useRef } from "react";
import firebase from "firebase/compat/app";
import 'firebase/compat/auth';
import SideBar from "../components/SideBar";
import Inbox from "../components/Inbox";
import Header from "../components/Header";

const InboxView = ({collapsed, setCollapsed}) => {
    const [listenerLoaded, setListenerLoaded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState();
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
            setListenerLoaded(true);
            setLoading(false)
        })
    }


    return(
        <>

        <div class="main-panel">
            <div class="content-wrapper">
                {loading && (<BigSpinner/>)}
                {!loading && (
                    <>
                    <Header collapsed={collapsed} setCollapsed={setCollapsed} children={
                        <span class="nav-link">Your Inbox</span>
                    }/>
                    <div class="row p-5 my-5">
                        <div class="col-12 grid-margin stretch-card">
                            <Inbox userData={userData} viewAll={true}/>
                        </div>
                    </div>
                    </>
                )}
            </div>
        </div>
        </>    
    )
}
const InboxPage = () => {
    const [collapsed, setCollapsed] = useState(window.innerWidth < 768 ? false : true);

    return(
        <>
        <div class="chatSidebarWrapper">
            <SideBar makeSticky={false} collapsed={collapsed} />
        </div>
        <InboxView collapsed={collapsed} setCollapsed={setCollapsed}/>
        </>    
    )
}
export default InboxPage;