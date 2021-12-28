import FriendsList from "../components/FriendsList"
import FriendRequests from "../components/FriendRequests";
import BigSpinner from "../components/BigSpinner";
import { AuthContext} from "../contexts/Auth";
import React, { useContext, useEffect, useState, useRef } from "react";
import firebase from "firebase/compat/app";
import 'firebase/compat/auth';
import SideBar from "../components/SideBar";
import Header from "../components/Header";


const BlockedUserItem = ({blocked, userData}) => {
    const [blockedUser, setBlockedUser] = useState();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        firebase
        .firestore()
        .collection('users')
        .doc(blocked)
        .get()
        .then((query) => {
            console.log(query.data())
            setBlockedUser(query.data())
            setLoading(false)
        })
    })

    const unblock = () => {
        firebase
        .firestore()
        .collection('users')
        .doc(userData.id)
        .update({
            blocked: firebase.firestore.FieldValue.arrayRemove(blocked)
        })
    }

    return(
    <>
    {loading && (
        <li class="preview-list-item border-bottom">
            <div class="preview-thumbnail">
                <div class="border-spinner text-secondary"/>
            </div>
        </li>
    )}
    {!loading && (
        <li class="preview-list-item border-bottom">
            <div class="preview-thumbnail">
                <img src={blockedUser.imageUrl} class="img-xs mr-1 rounded-circle preview-icon"/>
            </div>
            <div class="preview-item-content d-sm-flex flex-grow mx-2">
                <div class="flex-grow ml-1">
                    {blockedUser.username}
                </div>
                <div class="me-auto pt-2 pt-sm-0 mx-4">
                    <a 
                    onClick={unblock}
                    class="btn btn-outline-danger">
                        Unblock
                    </a>
                </div>
            </div>
        </li>
    )}
    </>
    )
}

const BlockedUsers = ({userData}) => {

    return (
        <div class="card">
        <div class="card-body">
            <h4 class="card-title">Blocked Users</h4>
            <div class="list-wrapper">
            <ul class="preview-list">
            {userData.blocked.length === 0 && (
                <p class="text-muted">You have nobody blocked :)</p>
            )}
            {userData.blocked.map((blocked) => {
                        return <BlockedUserItem blocked={blocked} key={blocked} userData={userData}/>
                    })}
            </ul>
            </div>
        </div>
    </div>
    )
}


const UserSettings = ({userData}) => {
    const [username, setUsername] = useState(userData.username)
    const [image, setImage] = useState(null)
    const [downloadURL, setDownloadURL] = useState(null)
    const [name, setName] = useState(null);

    const handleNameChange = (e) => {
        setUsername(e.target.value)
    }
    const handleChange = (e) => {
        if(e.target.files[0]){
            setImage(e.target.files[0])
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if(image){
            const ref = firebase.storage().ref(`/profiles/${image.name}`)
            const uploadTask = await ref.put(image);
            const url = await ref.getDownloadURL()
                firebase
                .firestore()
                .collection('users')
                .doc(userData.id)
                .update({
                    imageUrl: url
                }).then(
                    setImage(null)
                )
        }
        if(username != userData.username){
            firebase
            .firestore()
            .collection('users')
            .doc(userData.id)
            .update({
                username: username
            })
        }
    }
    return (
        <div class="card">
        <div class="card-body">
            <h4 class="card-title">Edit your profile</h4>
            <form onSubmit={handleSubmit} id="updateUserForm">
                <div class="form-group">
                    <label htmlFor="usernameInput">Username</label>
                    <input type="text" 
                    class="form-control text-light"
                    id="usernameInput"
                    placeholder="Username"
                    name="usernameInput"
                    required
                    value={username}
                    onChange={handleNameChange}
                    minLength={3}
                    />
                </div>
                <div class="form-group">
                    <label htmlFor="serverIconInput">Profile Picture - Currently <img class="img-xs rounded-circle m-1" src={userData.imageUrl}/></label>
                    <input 
                        type="file"
                        id="serverIconInput"
                        accept=".png,.jpeg,.jpg,.webp"
                        class="form-control"
                        onChange={handleChange}
                        />
                </div>
                <div class="input-group">
                    <button class="btn btn-success" action="submit" form="updateUserForm">Update Profile</button>
                </div>
            </form>
        </div>
    </div>
    )
}


const SettingsPage = () => {
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
                <span class="nav-link">Settings</span>
            }/>
        <div class="main-panel">
            <div class="content-wrapper">
                {loading && (<BigSpinner/>)}
                {!loading && (
                    <>
                    <div class="row p-5 my-5">
                        <div class="col-md-12 col-lg-6 grid-margin stretch-card">
                            <UserSettings userData={userData}/>
                        </div>
                        <div class="col-md-12 col-lg-6 grid-margin stretch-card">
                            <BlockedUsers userData={userData}/>
                        </div>
                    </div>
                    </>
                )}
            </div>
        </div>
        </>    
    )
}

export default SettingsPage;