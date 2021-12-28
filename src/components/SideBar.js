import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../contexts/Auth";
import firebase from "firebase/compat/app";
import 'firebase/compat/auth';
import TopBar from "./TopBar";
import { Link, useLocation } from "react-router-dom";
import Modal from "./Modal";

// #16191C - primary
// #1A1D21 - secondary
// #2787F5 - highlight
//

function ServerItem({server, userData}){
    const [currentServer, setCurrentServer] = useState();
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const location = useLocation();
    const {pathname} = location;
    

    useEffect(() => {
        var unread = 0
        for(var key in userData.notifications){
            if(userData.notifications[key]['server'] === server){
                unread = unread + userData.notifications[key]['unread'];
            }
        }
        setUnreadCount(unread);
        firebase
        .firestore()
        .collection('servers')
        .doc(server)
        .get()
        .then((snapshot) => {
            setCurrentServer(snapshot.data())
            setLoading(false)
        })
    }, [userData])

    return(
        <>
        {loading && (
            <li class="nav-item">
                <span class="nav-link"><div class="spinner-border text-secondary"/></span>
            </li>
        )}
        {!loading && (
        <li class={pathname === "/server/" + currentServer.id ? "nav-item menu-items active" : "nav-item menu-items"}>
            <Link className="nav-link" to={"../server/" + currentServer['id']}>
                <span class="menu-icon count-indicator">
                    <img class="navServerIcon img-xs rounded-circle" src={currentServer.icon}/>
                    {unreadCount > 0 && (
                        <UnreadCounter unreadCount={unreadCount} color={"bg-danger"}/>
                    )}
                </span>
                <span class="menu-title">{currentServer.name}</span>
            </Link>
        </li>
        )}
    </>
    )
}
const UnreadCounter = ({unreadCount, color="bg-danger"}) => {
    
    useEffect(() => {console.log('unreadCount', unreadCount)}, [unreadCount])
    
    return(
        <>
        {console.log('unreadcounter', unreadCount)}
        <span class={"count menu-count-indicator " + color}>{unreadCount > 9 ? "9+" : unreadCount}</span>
        </>
    )
}


const CreateServer = () => {
    const [modalOpen, setModalOpen] = useState(false);
    const [formValue, setFormValue] = useState('');
    const [serverName, setServerName] = useState('');
    const [image, setImage] = useState(null)
    const [downloadURL, setDownloadURL] = useState(null)
    const [name, setName] = useState(null);
    const { currentUser } = useContext(AuthContext);


    const openModal = () => {
        setModalOpen(true);
    }

    const closeModal = () => {
        setModalOpen(false);
    }
    const handleNameChange = (e) => {
        setServerName(e.target.value)
    }
    const handleChange = (e) => {
        if(e.target.files[0]){
            setImage(e.target.files[0])
        }
    }

    const handleSubmit = async (e) => {
        closeModal()
        e.preventDefault()
            const ref = firebase.storage().ref(`/servers/${image.name}`)
            const uploadTask = await ref.put(image);
            const url = await ref.getDownloadURL()
            firebase
            .firestore()
            .collection('servers')
            .add({
                name: serverName,
                icon: url,
                id: '',
                bans: [],
                channels: [],
                members: [currentUser.uid],
                owner: currentUser.uid,
                mods: []
            })
            .then((docRef) => {
                firebase.firestore().collection('servers').doc(docRef.id).update({id: docRef.id})
                .then(
                    firebase.firestore().collection('channels').add({name: "general", messages: [], uid: ""})
                    .then((channelRef) => {
                        firebase.firestore().collection('channels').doc(channelRef.id).update({uid: channelRef.id})
                        .then(
                            firebase.firestore().collection('servers').doc(docRef.id).update(
                                {channels: firebase.firestore.FieldValue.arrayUnion({name: "general", uid: channelRef.id})})
                        )
                        .then(
                            firebase.firestore().collection('users').doc(currentUser.uid).update({
                                subscribed_channels: firebase.firestore.FieldValue.arrayUnion(docRef.id)
                            })
                        )
                        .then(
                            setImage(null)
                        )
                        .then(setServerName(null))
                    })
                )
            })
            
            
    }



    return (
        <>
        <span class="nav-link" onClick={openModal}>
            <span class="menu-icon">
                <i class="fas fa-plus"></i>
            </span>
            <span class="menu-title">Create a new server</span>
        </span>
        <Modal show={modalOpen} title={"Create a new server"} handleClose={closeModal}>
            <div class="modal-body">
            <form onSubmit={handleSubmit} id="updateServerForm">
                <div class="form-group">
                    <label for="serverName">Server Name</label>
                    <input type="text" 
                    class="form-control text-light"
                    id="serverNameInput"
                    placeholder="Server Name"
                    name="serverName"
                    required
                    value={serverName}
                    onChange={handleNameChange}
                    minLength={3}
                    />
                </div>
                <div class="form-group">
                    <label for="serverIconInput">Server Icon</label>
                    <input 
                        type="file"
                        id="serverIconInput"
                        accept=".png,.jpeg,.jpg,.webp"
                        class="form-control"
                        required
                        onChange={handleChange}
                        />
                </div>
                <div class="input-group">
                    <button class="btn btn-outline-danger mx-1">Cancel</button>
                    <button class="btn btn-success mx-1" action="submit" form="updateServerForm">Create Server</button>
                </div>
            </form>
            </div>
        </Modal>
        </>
    )
}


export default function SideBar(props){
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState({'subscribed_channels': []});
    const [collapsed, setCollapsed] = useState(props.collapsed);
    const { currentUser } = useContext(AuthContext);
    const location = useLocation();
    const {pathname} = location;
    const [makeSticky, setMakeSticky] = useState(props.makeSticky ?
         "sidebar-brand-wrapper d-flex align-items-center justify-content-center fixed-top w-100" :
          "sidebar-brand-wrapper d-flex align-items-center justify-content-center w-100")
    const [unreadCount, setUnreadCount] = useState(0);
    const [listenerLoaded, setListenerLoaded] = useState(false);

    useEffect(() => {
        // gets user
        console.log('sidebar', userData)
        if(!listenerLoaded){
            listener()
        }
    }, [userData])

    const listener = () => {
        firebase
        .firestore()
        .collection('users')
        .doc(currentUser.uid)
        .onSnapshot(
            (doc) => {
                let unread = 0;
                let counter = 0;
                let data = doc.data();
                console.log(data.notifications)
                if(Object.entries(data.notifications).length === 0){
                    setUnreadCount(0);
                    setListenerLoaded(true);
                    setUserData(data);
                    setLoading(false);
                }
                for(var key in data.notifications){
                    console.log(key)
                    if(data.notifications[key]['type'] === 'chat'){
                        unread = unread + data.notifications[key]['unread'];
                    }
                    counter++;
                    if(counter === Object.keys(data.notifications).length){
                        setUnreadCount(unread);
                        setListenerLoaded(true)
                        setUserData(data);
                        setLoading(false);
                    }
                }
            }
        )
    }
    return (
        <nav class={collapsed ? "sidebar sidebar-offcanvas collapsedSidebar sidebar-icon-only" : "nav sidebar sidebar-offcanvas"} id="sidebar">
                <div class={makeSticky}>
                <Link to="/" className="sidebar-brand brand-logo text-primary" href="index.html"><i class="fas fa-bomb"></i> Willychat</Link>
                <Link to="/" className="sidebar-brand brand-logo-mini" href="index.html"><i class="fas fa-bomb"></i></Link>
                </div>
                <ul class={collapsed ? "nav collapsedSidebar" : "nav"} id="sidebarNav">
                <li class="nav-item profile">
                    <div class="profile-desc">
                    <div class="profile-pic">
                        <div class="count-indicator">
                        <img class="img-xs rounded-circle " src={userData.imageUrl} alt=""/>
                        <span class="count bg-success"></span>
                        </div>
                        <div class="profile-name">
                        <h5 class="mb-0 font-weight-normal">{userData.username}</h5>
                        </div>
                    </div>
                    </div>
                </li>
                <li class="nav-item nav-category">
                    <span class="nav-link">Menu</span>
                </li>
                <li class={pathname === "/" ? "nav-item menu-items active" : "nav-item menu-items"}>
                    <Link className="nav-link" to="/">
                    <span class="menu-icon">
                        <i class="fas fa-home"></i>
                    </span>
                    <span class="menu-title">Home</span>
                    </Link>
                </li>
                <li class={pathname === "/settings" ? "nav-item menu-items active" : "nav-item menu-items"}>
                    <Link className="nav-link" to="/settings">
                    <span class="menu-icon">
                        <i class="fas fa-cog"></i>
                    </span>
                    <span class="menu-title">Settings</span>
                    </Link>
                </li>
                <li class={pathname === "/inbox" ? "nav-item menu-items active" : "nav-item menu-items"}>
                    <Link className="nav-link" to="/inbox">
                    <span class="menu-icon count-indicator">
                        <i class="fas fa-envelope"></i>
                        {unreadCount > 0 && (
                            <UnreadCounter unreadCount={unreadCount}/>
                        )}
                    </span>
                    <span class="menu-title">DMs</span>
                    </Link>
                </li>
                <li class="nav-item nav-category">
                    <span class="nav-link">Servers</span>
                </li>
                {loading && (
                    <li class="nav-item">
                        <span class="nav-link"><div class="spinner-border"/></span>
                    </li>
                )}
                {loading === false && (userData.subscribed_channels.map((server) => {
                    
                    return <ServerItem server={server} key={server} userData={userData}/>
                })
                )}
                <li class="nav-item menu-items">
                    <CreateServer/>
                </li>
            </ul>
            </nav>
    )
}