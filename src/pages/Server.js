import React, { useContext, useEffect, useState, useRef } from "react";
import { Navigate, useParams, Link } from "react-router-dom";
import { AuthContext } from "../contexts/Auth";
import firebase from "firebase/compat/app";
import 'firebase/compat/auth';
import SideBar from "../components/SideBar";
import moment from 'moment';
import Picker from 'emoji-picker-react'
import sidebarStyles from '../theme/css/sidebar.css';
import BigSpinner from "../components/BigSpinner";
import { sendFriendRequest, removeFriend } from "../components/friends";
import Modal from "../components/Modal";
import FriendButton from "../components/FriendButton";
import BlockButton from "../components/BlockButton";


/* =================================
        UTILITY FUNCTIONS
   ================================= */

// TODO: remove user from ModList
const kickMember = (serverId, memberId) => {
        firebase
        .firestore()
        .collection('users')
        .doc(memberId)
        .update({
            subscribed_channels: firebase.firestore.FieldValue.arrayRemove(serverId)
        })
        .then(() => {
            firebase
            .firestore()
            .collection('servers')
            .doc(serverId)
            .update({
                members: firebase.firestore.FieldValue.arrayRemove(memberId)
            })
        })
}


const banMember = (serverData, memberData) => {
        firebase
        .firestore()
        .collection('servers')
        .doc(serverData.id)
        .update({
            bans: firebase.firestore.FieldValue.arrayUnion(memberData.id)
        })
        .then(
            kickMember(serverData.id, memberData)
        )
}


const makeMod = (serverData, memberData) => {
        firebase
        .firestore()
        .collection('servers')
        .doc(serverData.id)
        .update({
            mods: firebase.firestore.FieldValue.arrayUnion(memberData.id)
        })
}

const removeMod = (serverData, memberData) => {
        firebase
        .firestore()
        .collection('servers')
        .doc(serverData.id)
        .update({
            mods: firebase.firestore.FieldValue.arrayRemove(memberData.id)
        })
}




/* =========================== */



const ChannelItem = (props) => {
    const currentChannel = props.currentChannel;
    const data = props.data;
    const [active, setActive] = useState(currentChannel.uid === data.uid);
    const [hasNotifications, setHasNotifications] = useState(false);
    const [hasMentions, setHasMentions] = useState(false);
    const serverData = props.serverData;
    const shouldUpdate = props.shouldUpdate;
    const setShouldUpdate = props.setShouldUpdate;
    const updateChannel = props.updateChannel;
    const notifications = props.notifications;
    const closeSettings = props.closeSettings;
    
    const toggleUpdate = () => {
        setShouldUpdate(!shouldUpdate);
    }

    const doUpdateChannel = () => {
        // if(props.settingsOpen){
        //     props.setSettingsOpen(false);
        // }
        closeSettings(false);
        updateChannel(data)
    }
    useEffect(() => {
        setActive(currentChannel.uid === data.uid);
        if(notifications[data.uid]){
            setHasNotifications(notifications[data.uid].unread)
        }
    }, [currentChannel, notifications])
    // console.log('channelitem currentchannel', currentChannel)
    return(
        <li class={active ? "nav-item menu-items active activeChannel" : "nav-item menu-items"}>
            <Link exact={true} to={"/server/" + serverData.id + "/" + data.uid} className="nav-link" onClick={doUpdateChannel}>
                <span class={hasNotifications ? "menu-title text-white" : "menu-title"}>#{data.name}</span>
                {/* <span class="menu-title">#{data.name}</span> */}

            </Link>

        </li>
    )
}




const ChannelList = ({serverData, updateChannel, channel, notifications, setSettingsOpen}) => {
    const [channelArray, setChannelArray] = useState(serverData.channels);
    const [loading, setLoading] = useState(false);
    const [currentChannel, setCurrentChannel] = useState(channel);
    const [prevChannel, setPrevChannel] = useState(currentChannel);

    useEffect(() => {
        setChannelArray(serverData.channels)
        setCurrentChannel(channel)
    }, [serverData, channel])



    return (
        <>
        {loading && (
        <li class="nav-item menu-items">

            <div class="border-spinner text-secondary text-center"></div>
        </li>
        )}
        {!loading && (
            <>
            <span class="channelScroller">
            {channelArray.map((c, index) => {
                return <ChannelItem channel={c} data={c} key={index} serverData={serverData}
                currentChannel={currentChannel} updateChannel={updateChannel}
                notifications={notifications}
                closeSettings={setSettingsOpen}
                />
           })
           }
           </span>
           </>
        )}
        </>
    )

}



const InviteButton = ({serverData}) => {
    const [modalOpen, setModalOpen] = useState(false);
    const invLink = window.location.href;
    const openModal = () => {
        setModalOpen(true);
    }

    const closeModal = () => {
        setModalOpen(false);
    }
    const copyToKeyboard = () => {
        navigator.clipboard.writeText(invLink);
        closeModal();
    }

    return(
        <>
        <li class="nav-item menu-items py-1" onClick={openModal}>
        <span class="nav-link">
        <span class="menu-icon">
            <i class="fas fa-plus"></i>
        </span>
        <span class="menu-title">Invite people</span>
        </span>
        </li>
        <Modal show={modalOpen} title={"Invite friends to join " + serverData.name} handleClose={closeModal}>
            <div class="input-group p-5">
                <h3 class="p-2 text-center">Send a server invite link to a friend</h3>
                <input type="text" class="form-control" value={invLink} readonly></input>
                <div class="input-group-prepend">
                    <button class="btn btn-primary" onClick={copyToKeyboard}>Copy</button>
                </div>
            </div>
        </Modal>
        </>
    )
}

const ChannelSidebar = ({serverData, channel, updateChannel, notifications, settingsOpen, setSettingsOpen}) => {
    const { currentUser } = useContext(AuthContext);
    // const serverData = props.serverData;
    // const channel = props.channel;
    // const updateChannel = props.updateChannel;
    const [channelArray, setChannelArray] = useState();
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [formValue, setFormValue] = useState('');
    const [updateSelf, setUpdateSelf] = useState(false);
    // const shouldUpdate = props.shouldUpdate;
    // const setShouldUpdate = props.setShouldUpdate;
    // const notifications = props.notifications;
    useEffect(() => {
        setChannelArray(serverData.channels)
        setLoading(false);
    }, [updateSelf])

    const openModal = () => {
        setModalOpen(true);
    }

    const closeModal = () => {
        setModalOpen(false);
    }
    const toggleSettings = () => {
        setSettingsOpen(!settingsOpen);
    }
    const createChannel = async (e) => {
        e.preventDefault();
        setFormValue('');
        const msg = {}
        await firebase.firestore().collection('channels').add({
            name: formValue,
            messages: [],
            uid: "",
        }).then((docRef) => {
            firebase.firestore().collection('channels').doc(docRef.id).update({
                uid: docRef.id
            }).then(
                firebase.firestore().collection('servers').doc(serverData.id).update({
                    channels: firebase.firestore.FieldValue.arrayUnion({
                        'uid': docRef.id,
                        'name': formValue
                    })
                })
            )
        }
        ).then(() => {
            closeModal()
            setUpdateSelf(!updateSelf)
        })
    }

    return(
        <>
        <nav class="sidebar sidebar-offcanva secondarySidebar bg-lighter h-100" id="secondarySidebar">
                <ul class="nav channels-nav">
                <li class="nav-item nav-category">
                    <span class="nav-link">Channels</span>
                </li>
                    {loading && (
                    <li class="nav-item menu-items">

                        <div class="spinner-border text-secondary text-center"></div>
                    </li>
                    )}
                {!loading && (
                        <>
                        <ChannelList channelArray={channelArray} serverData={serverData} refresh={updateSelf} channel={channel} 
                        updateChannel={updateChannel} notifications={notifications} 
                        settingsOpen={settingsOpen} setSettingsOpen={setSettingsOpen}/>
                        
                        {serverData.owner === currentUser.uid && (
                        <li class="nav-item menu-items py-1" onClick={openModal}>
                            <span class="nav-link">
                            <span class="menu-icon">
                                <i class="fas fa-plus"></i>
                            </span>
                            <span class="menu-title">Create a new channel</span>
                            </span>
                        </li> 
                        )}
                        <InviteButton serverData={serverData}/>
                        {(serverData.owner === currentUser.uid || serverData.mods.includes(currentUser.uid)) && (
                            <li class="nav-item menu-items py-2" onClick={toggleSettings}>
                                <span class="nav-link">
                                    <span class="menu-icon">
                                        <i class="fas fa-cog"></i>
                                    </span>
                                    <span class="menu-title">Server Settings</span>
                                </span>
                            </li>
                        )}
                        </>
                    )}
                
            </ul>
            <Modal show={modalOpen} title={"Create a channel"} handleClose={closeModal}>
                <div class="modal-body">
                    <form class="form-group" id="createChannel" onSubmit={createChannel}>
                        <div class="input-group">
                            <div class="input-group-prepend">
                                <span class="input-group-text">#</span>
                            </div>
                            <input type="text" class="form-control text-light" value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="new-channel" required/>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <a onClick={closeModal} href="javascript:void(0)" class="text-decoration-none text-white px-3">Cancel</a>
                    <button form="createChannel" class="btn btn-primary" disabled={!formValue}>Create Channel</button>
                </div>
            </Modal>
            </nav>
    </>

    )
}








const ServerHeader = (props) => {
    // const [channelData, setChannelData] = useState({})
    const [loading, setLoading] = useState(false);
    const setShowMembers = props.setShowMembers;
    const showMembers = props.showMembers;
    const serverData = props.serverData;
    const channelData = props.channel;
    const collapsed = props.collapsed;
    const setCollapsed = props.setCollapsed;
    const settingsOpen = props.settingsOpen;


    const toggleCollapse = () => {
        if(collapsed){
            document.getElementById('sidebarNav').classList.remove('collapsedSidebar');
            document.getElementById('sidebar').classList.remove('collapsedSidebar');
        }
        else{
            document.getElementById('sidebar').classList.add('collapsedSidebar');
            document.getElementById('sidebarNav').classList.add('collapsedSidebar');
        }
        setCollapsed(!collapsed);
    }

    const toggleMembers = () => {
        console.log(showMembers)
        setShowMembers(!showMembers);
    }

    return (
    <>
    {!loading && (
        <nav class="navbar p-0 fixed-top d-flex flex-row navbar-chat-header">
        <div class="navbar-menu-wrapper flex-grow d-flex align-items-stretch">
          <button class="navbar-toggler navbar-toggler align-self-center" type="button" onClick={toggleCollapse}>
            <span class="fas fa-bars"></span>
          </button>
          <ul class="navbar-nav w-100">
              <li class="nav-item">
                  <span class="nav-link">{settingsOpen ? "Settings" : "#" + channelData.name + " "}<span class="d-none d-sm-inline-block"> - {serverData.name}</span></span>
              </li>
          </ul>
          <ul class="navbar-nav navbar-nav-right float-right">
            <li class="nav-item nav-settings">
                <button class="navbar-toggler navbar-toggler align-self-center" type="button" id="toggleMembers">
                    <span class="fas fa-arrows-alt-h"></span>
                </button>
            </li>
          </ul>
          {/* <button class="navbar-toggler navbar-toggler-right d-lg-none align-self-center" type="button" data-toggle="offcanvas">
            <span class="mdi mdi-format-line-spacing"></span>
          </button> */}
        </div>
      </nav>
    )}
    {loading && (
        <nav class="navbar p-0 fixed-top d-flex flex-row navbar-chat-header">
        <div class="border-spinner text-primary"></div>
        </nav>
    )}
    </>

    
    )
}


const DeleteMessage = ({memberData, serverData, messageData, currentChannel}) => {
    const { currentUser } = useContext(AuthContext);
    const isAuthed = ((serverData.mods.includes(currentUser.uid) || serverData.owner === currentUser.uid) || memberData.id !== currentUser.uid)
    console.log(currentChannel)
    const deleteMessage = () => {
        if(isAuthed){
        firebase
        .firestore()
        .collection('channels')
        .doc(currentChannel)
        .update({
            messages: firebase.firestore.FieldValue.arrayRemove(messageData)
        })
        }
    }
    return (
        <>
        {isAuthed && (

        <a href="javascript:void(0);" class="dropdown-item preview-item text-danger" onClick={deleteMessage}>
            <div class="preview-thumbnail"><i class="fas fa-trash-alt"></i></div>
            <div class="preview-item-content">
                <div class="preview-subject ellipsis mb-1 text-small">
                    Delete Message
                </div>
            </div>
        </a>
        )}
        </>
    )
}


const ChatMessage = ({message, serverData, userData, id, currentChannel}) => {
    const text = message.text;
    const author = message.author;
    const timestamp =  message.timestamp
    const [loading, setLoading] = useState(true)
    const [authorData, setAuthorData] = useState();
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(id);
    // const [listening, setListening] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { currentUser } = useContext(AuthContext);

    const toggle = () => {setIsOpen(!isOpen)}


    
    useEffect(() => {
        function handleClickOutside(event){{
            if(menuRef.current && !menuRef.current.contains(event.target)){
                setIsOpen(false);
                document.removeEventListener("mousedown", handleClickOutside);
            }
        }}
        document.addEventListener("mousedown", handleClickOutside)
        firebase
        .firestore()
        .collection('users')
        .doc(author)
        .get()
        .then((query) => {
            setAuthorData(query.data())
            setLoading(false)
        })

        return () => {
            document.removeEventListener("click", handleClickOutside)
        }
    }, [isOpen])

    const toggleMenu = () => {
        setIsOpen(!isOpen)
    }

    var now = moment(new Date());
    var dateString = moment.duration(now.diff(moment(timestamp))).humanize() + " ago"
    return(
    <>
    <div class="message" ref={menuRef}>
    {!loading && (
        <>
        <img src={authorData.imageUrl} class="rounded-circle message-avatar"/>
        <div class="message-content" onClick={toggleMenu}>
            <p><strong>{authorData.username}</strong> <span class="text-muted text-small">{ dateString }</span></p>
            {message.photoUrl && (
                <div class="message-img-container">
                    <img src={message.photoUrl} class="img-fluid"/>
                </div>
            )}
            <p>{text}</p>
        </div>
        {isOpen && (
            <>
            <div class="position-relative">

            <div class={isOpen ? "dropdown-menu dropdown-menu-right navbar-dropdown preview-list show msg-menu position-absolute" : "dropdown-menu"}>
                <SendMessageButton memberData={authorData} />
                <ViewProfileButton memberData={authorData} />
                <FriendButton memberData={authorData} serverData={serverData} userData={userData}/>
                <BlockButton memberData={authorData} serverData={serverData}/>
                <DeleteMessage serverData={serverData} messageData={message} currentChannel={currentChannel} />
                {((serverData.mods.includes(currentUser.uid)||serverData.owner===currentUser.uid)&&authorData.id!==currentUser.uid) && (<div class="dropdown-divider"></div>)}
                <ModButton memberData={authorData} serverData={serverData} />
                <KickMemberButton memberData={authorData} serverData={serverData}/>
                <BanMemberButton memberData={authorData} serverData={serverData} />
            </div>

            </div>
            </>
        )}
        </>
    )}
    {loading && (
        <div class="message-content">
            <div class="spinner-border text-primary"></div>
        </div>
    )}
    {!loading && (
        <>
        <div class="message-menu-container float-right">
            <a href="javascript:void(0);" class="message-menu-icons" onClick={toggleMenu}>
                <i class="fas fa-ellipsis-h member-dots"></i>
            </a>
        </div>
    </>
    )}
    </div>

    </>
    )
}


const ChannelView = ({currentServer, currentChannel, userData}) => {
    const { currentUser } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [chat, setChat] = useState();
    const [formValue, setFormValue] = useState('');
    const [update, setUpdate] = useState(false);
    const [listenerLoaded, setListenerLoaded] = useState(false);
    const [channel, setChannel] = useState(currentChannel);
    const [oldChannel, setOldChannel] = useState(channel)
    const dummy = useRef();
    const [showPicker, setShowPicker] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [hasFile, setHasFile] = useState(false);
    const [imageAsFile, setImageAsFile] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    const handleImageAsFile = (e) => {
        e.preventDefault();
        const image = e.target.files[0]
        setImageAsFile(imageFile => (image))
        setHasFile(true);
    }

    useEffect(() => {
        if(currentChannel !== channel){
            setChannel(currentChannel);
            listener(currentChannel);
        }
        if(!listenerLoaded){
            listener(currentChannel)
        }
        dummy.current.scrollIntoView({ behavior: 'smooth'})
    }, [update, currentChannel])

    const toggleModal = () => {
        setModalOpen(!modalOpen)
    }
    const toggleHasFile = () => {
    }
    const openModal = () => {
        setModalOpen(true)
    }
    const closeModal = () => {
        setModalOpen(false)
    }
    const cancelFile = (e) => {
        document.getElementById('image');
    }

    const listener = (c) => {
        firebase.firestore().collection('channels').doc(c).onSnapshot((doc) => {
            setListenerLoaded(true);
            setChat(doc.data())
            setOldChannel(c)
            setChannel(c);
            setLoading(false)
            setUpdate(!update)
        })
    }


    const sendMessage = async (e) => {
        e.preventDefault();
        setFormValue('');
        if(hasFile){
            const imageRef = firebase.storage().ref(`/messages/${imageAsFile.name}`);
            await imageRef.put(imageAsFile);
            var myImageUrl = await imageRef.getDownloadURL()
        }
        else{
            var myImageUrl = ""
        }

        
        const msg = {}
        console.log(myImageUrl)
        await firebase.firestore().collection('channels').doc(currentChannel).update({
            messages: firebase.firestore.FieldValue.arrayUnion({
                text: formValue,
                photoUrl: myImageUrl,
                author: currentUser.uid,
                timestamp: Date.now()
            })
        })
        .then(
            setUpdate(!update)
        )
        .then(()=>{
            document.getElementById('image').value = "";
            setHasFile(false);
            setImageUrl('');
            setImageAsFile('');

        }).then(
            // increment unread count by one
            await firebase.firestore().collection('servers').doc(currentServer.id).get()
            .then((query) => {
                query.data().members.forEach((member) => {
                    if(member !== currentUser.uid){
                        firebase.firestore().collection('users').doc(member).get().then((q) => {
                            let notifs = q.data().notifications;
                            if(notifs[currentChannel]){
                                notifs[currentChannel] = {'unread': notifs[currentChannel]['unread']+1, 'mentions': notifs[currentChannel]['mentions'], 'type': 'server', 'server': currentServer.id}
                                firebase.firestore().collection('users').doc(member).update({
                                    notifications: notifs
                                })
                            }
                            else{
                                notifs[currentChannel] = {'unread': 1, 'mentions': 0, 'type': 'server', 'server': currentServer.id}
                                firebase.firestore().collection('users').doc(member).update({
                                    notifications: notifs
                                })
                            }
                        })
                    }
                })
            })
        )
    }

    return(
        <>
        <div class="chat-container bg-black">

            <div class="chat-conversations">
            {loading && (
                <div class="col-12 d-flex justify-content-center align-items-center text-center">
                    <div class="spinner-border text-primary"></div>
                </div>
            )}
            {!loading && (
                <>
                      {chat['messages'] ? chat['messages'].map((msg, index) => {
                          if(!userData.blocked.includes(msg.author)){
                            return <ChatMessage message={msg} key={index} serverData={currentServer} userData={userData} id={index} key={index} currentChannel={currentChannel}></ChatMessage>
                          }
                    }) : null}
            </>
            )}
            <span ref={dummy}></span>
            </div>  
            <form onSubmit={sendMessage} class="w-100">
                <div class="input-group chatInput">
                    <div class="input-group-prepend">
                        <span class={hasFile ? "input-group-text text-light bg-success" : "input-group-text"} onClick={openModal}>
                        <i class="fas fa-plus"></i>
                        </span>
                    </div>
                    <Modal show={modalOpen} title={"Upload a file"} handleClose={closeModal}>
                        <>
                        <div class="input-group">
                        <input 
                            id="image"
                            name="image"
                            type="file"
                            accept=".png,.jpeg,.jpg,.webp"
                            onChange={handleImageAsFile}
                            class="form-control file-upload-info p-5"
                            placeholder="Submit a file"
                        />
                        </div>
                        {/* <button class="btn btn-dark" onClick={cancelFile}>Cancel</button> */}
                        <a class="btn btn-success" onClick={closeModal} href="javascript:void(0);">Attach File</a>
                        </>
                    </Modal>
                    <input class="form-control text-white" value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="Send a message..."/>
                    <div class="input-group-append">
                        <span class="input-group-text"><i class="fas fa-smile"></i></span>
                    </div>
                    <div class="input-group-append h-100">
                        <button type="submit" disabled={!formValue} class="btn btn-primary h-100">Send</button>
                    </div>
                </div>
            </form>
        </div>
        </>
    )
}
const ServerNavigation = ({currentChannel, serverData, updateChannel, notifications, setShowMembers, showMembers, settingsOpen, setSettingsOpen}) => {
    const [collapsed, setCollapsed] = useState(window.innerWidth > 768 ? false : true);
    return(
    <>
    <ServerHeader serverData={serverData} channel={currentChannel} setCollapsed={setCollapsed} collapsed={collapsed} setShowMembers={setShowMembers} showMembers={showMembers} settingsOpen={settingsOpen}/>
    <div class={collapsed ? "channel-sidebar-wrapper sidebar-icon-only h-100" : "channel-sidebar-wrapper h-100"}>
        <ChannelSidebar serverData={serverData} channel={currentChannel} updateChannel={updateChannel}
         notifications={notifications}
         settingsOpen={settingsOpen} setSettingsOpen={setSettingsOpen} />
    </div>
    </>
    )
}










const KickMemberButton = ({memberData, serverData}) => {
    const { currentUser } = useContext(AuthContext);
    const isAuthed = ((serverData.mods.includes(currentUser.uid) || serverData.owner === currentUser.uid) && memberData.id !== currentUser.uid)

    const doKick = () => {
        kickMember(serverData.id, memberData.id)
    }
 
    return (
        <>
        {isAuthed && (
            <a href="javascript:void(0);" class="dropdown-item preview-item text-danger" onClick={doKick}>
                <div class="preview-thumbnail"><i class="fas fa-user-minus"></i></div>
                <div class="preview-item-content">
                    <div class="preview-subject ellipsis mb-1 text-small">
                        Kick User
                    </div>
                </div>
            </a>
        )}
        </>
    )
}

const BanMemberButton = ({memberData, serverData}) => {
    const { currentUser } = useContext(AuthContext);
    const isAuthed = ((serverData.mods.includes(currentUser.uid) || serverData.owner === currentUser.uid) && memberData.id !== currentUser.uid)

    const doBan = () => {
        banMember(serverData, memberData)
    }

    return (
        <>
        {isAuthed && (
            <a href="javascript:void(0);" class="dropdown-item preview-item text-danger" onClick={doBan}>
                <div class="preview-thumbnail"><i class="fas fa-gavel"></i></div>
                <div class="preview-item-content">
                    <div class="preview-subject ellipsis mb-1 text-small">
                        Ban User
                    </div>
                </div>
            </a>
        )}
        </>
    )
}

const ModButton = ({memberData, serverData}) => {
    const { currentUser } = useContext(AuthContext);
    const isAuthed = ((serverData.owner === currentUser.uid) && memberData.id !== currentUser.uid)
    const isMod = (serverData.mods.includes(memberData.id))

    const giveMod = () => {
        makeMod(serverData, memberData)
    }
    const takeMod = () => {
        removeMod(serverData, memberData)
    }

    return (
        <>
        {isAuthed && (
            <a href="javascript:void(0);" class="dropdown-item preview-item text-warning" onClick={isMod ? takeMod : giveMod}>
                <div class="preview-thumbnail"><i class="fas fa-user-shield"></i></div>
                <div class="preview-item-content">
                    <div class="preview-subject ellipsis mb-1 text-small">
                        {isMod ? "Remove Moderator" : "Make Moderator"}
                    </div>
                </div>
            </a>
        )}
        </>
    )
}



const SendMessageButton = ({memberData}) => {
    const { currentUser } = useContext(AuthContext);
    // const isAuthed = ((memberData.id !== currentUser.uid))
    const isAuthed = true;

    return (
        <>
        {isAuthed && (

        <Link exact={true} to={"/chat/" + memberData.username} className="dropdown-item preview-item text-muted">
            <div class="preview-thumbnail"><i class="fas fa-comment-dots"></i></div>
            <div class="preview-item-content">
                <div class="preview-subject ellipsis mb-1 text-small">
                    Send Message
                </div>
            </div>
        </Link>
        )}
        </>
    )
}

const ViewProfileButton = ({memberData}) => {
    const { currentUser } = useContext(AuthContext);
    // const isAuthed = ((memberData.id !== currentUser.uid))
    const isAuthed = true;

    return (
        <>
        {isAuthed && (

        <Link exact={true} to={"/user/" + memberData.username} className="dropdown-item preview-item text-muted">
            <div class="preview-thumbnail"><i class="far fa-id-card"></i></div>
            <div class="preview-item-content">
                <div class="preview-subject ellipsis mb-1 text-small">
                    View Profile
                </div>
            </div>
        </Link>
        )}
        </>
    )
}




const MemberItem = ({memberData, id, serverData, userData}) => {
    const menuRef = useRef(id);
    // const [listening, setListening] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const { currentUser } = useContext(AuthContext);

    const toggle = () => {setIsOpen(!isOpen)}
    useEffect(() => {
        function handleClickOutside(event){{
            if(menuRef.current && !menuRef.current.contains(event.target)){
                setIsOpen(false);
                document.removeEventListener("mousedown", handleClickOutside);
            }

        }}

        document.addEventListener("mousedown", handleClickOutside)
    }, [isOpen])



    let statusClass = ""
    if(memberData.status === "online"){
       statusClass = "count bg-success" 
    }
    if(memberData.status === "offline"){
        statusClass = "count bg-secondary"
    }
    if(memberData.status === "away"){
        statusClass = "count bg-warning"
    }
    if(memberData.status === "dnd"){
        statusClass = "count bg-danger"
    }

    
    return (
        <>
            <li class="nav-item profile member-item" onClick={toggle} ref={menuRef}>
                <div class="profile-desc">
                    <div class="profile-pic">
                        <div class="count-indicator">
                            <img class="img-xs rounded-circle" src={memberData.imageUrl}/>
                            {/* <span class={statusClass}/> */}
                        </div>
                        <div class="profile-name">
                            <h5 class="mb-0 font-weight-normal">{memberData.username}</h5>
                        </div> 
                    </div>
                    <a href="javascript:void(0);">
                        <i class="fas fa-ellipsis-v member-dots"></i>
                    </a>
                    <div class={isOpen ? "dropdown-menu dropdown-menu-right navbar-dropdown preview-list show" : "dropdown-menu"}>
                        <SendMessageButton memberData={memberData} />
                        {/* <ViewProfileButton memberData={memberData} /> */}
                        <FriendButton memberData={memberData} serverData={serverData} userData={userData}/>
                        <BlockButton memberData={memberData} serverData={serverData}/>
                        <div class="dropdown-divider"></div>
                        <ModButton memberData={memberData} serverData={serverData} />
                        <KickMemberButton memberData={memberData} serverData={serverData}/>
                        <BanMemberButton memberData={memberData} serverData={serverData} />
                    </div>

                </div>
            </li>
        </>
    )

}

const MemberList = ({serverData, userData}) => {
    const [loading, setLoading] = useState(true);
    const [owner, setOwner] = useState({});
    const [mods, setMods] = useState([]);
    const [serverMembers, setMembers] = useState([]);
    const [passedData, setPassedData] = useState(serverData);
    // const [serverData, setServerData] = useState(false);
    const [listData, setListData] = useState();
    const [showMembers, setShowMembers] = useState(window.innerWidth > 768 ? true : false);
    const [update, setUpdate] = useState(false);



    const toggleShowMembers = () => {
        setShowMembers(!showMembers)
    }

    useEffect(() => {
        const modArray = []
        const membersArray = []
        let counter = 0;
        let toggleMembers = document.getElementById('toggleMembers')
        toggleMembers.addEventListener("click", toggleShowMembers)
        serverData.members.forEach((member) => {
            firebase
            .firestore()
            .collection('users')
            .doc(member)
            .get()
            .then((query) => {
                if(member === serverData.owner){
                    setOwner(query.data())
                }
                else if(serverData.mods.includes(member)){
                    modArray.push(query.data())
                    setMods(modArray);
                }
                else{
                    membersArray.push(query.data())
                    setMembers(membersArray);
                }
                counter++
                if(counter >= serverData.members.length){
                    setLoading(false);
                }
            })
        })
        return () => {
            toggleMembers.removeEventListener("click", toggleShowMembers)
        }
    }, [serverData, showMembers])

    return(
        <div class={showMembers ? "member-sidebar-wrapper member-sidebar" : "member-sidebar-wrapper member-sidebar sidebar-icon-only members-collapsed"}>
        <nav class="sidebar member-sidebar" id="memberList">
            {!loading && showMembers && (
            <ul class="nav">
            {owner && (
            <>
            <li class="nav-item nav-category">
                <span class="nav-link">Owner</span>
            </li>
            <MemberItem memberData={owner} id={0} key={0} serverData={serverData} userData={userData}/>
            </>
            )}
            {serverData.mods.length > 0 && (
                <>
                <li class="nav-item nav-category"><span class="nav-link">Mods</span></li>
                    {mods.map((mod, index) => {
                        return <MemberItem memberData={mod} id={"mod" + index} key={"mod" + index} serverData={serverData} userData={userData}/>
                    })}
                </>
            )}
            {serverData.members.length > 0 && (
            <>
            <li class="nav-item nav-category"><span class="nav-link">Members</span></li>
            {serverMembers.map((member, ix) => {
                if(!serverData.mods.includes(member.id)){
                    return <MemberItem memberData={member} id={"member" + ix} key={"member" + ix} serverData={serverData} userData={userData}/>

                }
            })}
            </>
            )}
            </ul>

        )}
        </nav>
        </div>
    )

}


const ModList = ({serverData}) => {

    
    return(
        <p>Mod list</p>
    )
}

const SettingsMemberListItem = ({memberData, serverData}) => {
    const { currentUser } = useContext(AuthContext);
    const isOwner = (serverData.owner === currentUser.uid)
    const isMod = (serverData.mods.includes(currentUser.uid))
    const memberIsOwner = (serverData.owner === memberData.id)
    const memberIsMod = (serverData.mods.includes(memberData.id))
    let badgeColor = "badge"
    let roleName = ""
    if(memberIsOwner){
        badgeColor = "badge badge-danger"
        roleName = "Owner"
    }
    else if(memberIsMod){
        badgeColor = "badge badge-info"
        roleName = "Mod"
    }
    else{
        badgeColor = "badge badge-primary"
        roleName = "Member"
    }

    useEffect(() => {}, [])

    const giveMod = () => {
        if(isOwner){
            makeMod(serverData, memberData)
        }
    }
    const takeMod = () => {
        if(isOwner){
            removeMod(serverData, memberData)
        }
    }
    const doKick = () => {
        if((isOwner||isMod)&&memberData!=serverData.owner){
            kickMember(serverData, memberData)
        }
    }
    const doBan = () => {
        if((isOwner||isMod)&&!memberIsOwner){
            banMember(serverData, memberData)
        }
    }

    return (
        <tr>
            <td>
                <img src={memberData.imageUrl}/>
                <span class="ps-2">{memberData.username}</span>
            </td>
            <td><span class={badgeColor}>{roleName}</span></td>
            <td><a class={(isOwner&&!memberIsOwner) ? "btn btn-outline-warning" : "btn btn-outline-warning disabled"} onClick={memberIsMod ? takeMod : giveMod}>{memberIsMod ? "Remove mod" : "Make mod"}</a></td>
            <td><a class={((isOwner||isMod)&&!memberIsOwner) ? "btn btn-outline-danger" : "btn btn-outline-danger disabled"} onClick={doKick}>Kick</a></td>
            <td><a class={((isOwner||isMod)&&!memberIsOwner) ? "btn btn-outline-danger" : "btn btn-outline-danger disabled"} onClick={doBan}>Ban</a></td>
        </tr>
    )
}

const SettingsMemberList = ({serverData}) => {
    const { currentUser } = useContext(AuthContext);
    const [loading, setLoading] = useState(true)
    const [owner, setOwner] = useState(null)
    const [mods, setMods] = useState(null)
    const [members, setMembers] = useState(null)
    const isOwner = (serverData.owner === currentUser.uid)
    const isMod = (serverData.mods.includes(currentUser.uid))
    const [memberCount, setMemberCount] = useState(0)
    const [fetchedMembers, setFetchedMembers] = useState(false)



    useEffect(() => {
        // this code is copied from the member sidebar
        // TODO: make this a separate function
        const membersArray = []
        const modArray = []
        let itOwner = {}
        let counter = 0
        serverData.members.forEach((member) => {
            firebase
            .firestore()
            .collection('users')
            .doc(member)
            .get()
            .then((query) => {
                console.log(member)
                console.log(query.data())
                if(member === serverData.owner){
                    itOwner = query.data()
                }
                else if(serverData.mods.includes(member)){
                    modArray.push(query.data())
                }
                else{
                    membersArray.push(query.data())
                }
                counter = counter + 1;
                console.log('thencounter', counter)
                if(counter === serverData.members.length){
                    setOwner(itOwner)
                    setMods(modArray);
                    setMembers(membersArray);
                    setMemberCount(counter)
                    setLoading(false)
                }
            })
        })
        // if(memberCount >= serverData.members.length && !fetchedMembers){
        //     setFetchedMembers(false)
        //     setLoading(false)
        //     console.log('loading false')
        // }
    }, [serverData])

    return (
        <div class="row">
            <div class="col-12 grid-margin">
                <div class="card">
                    <div class="card-body">
                        <h4>Server Members ({memberCount})</h4>
                        {loading && (<BigSpinner/>)}
                        {!loading && (
                            <div class="table-responsive">
                                <table class="table">
                                    <thead>
                                        <tr>
                                            <th>Username</th>
                                            <th>Role</th>
                                            <th>Mod</th>
                                            <th>Kick</th>
                                            <th>Ban</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    <SettingsMemberListItem memberData={owner} serverData={serverData}/>
                                    {mods.map((mod) => {
                                        return <SettingsMemberListItem memberData={mod} serverData={serverData}/>
                                    })}
                                    {members.map((member) => {
                                        return <SettingsMemberListItem memberData={member} serverData={serverData}/>
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

const SettingsChanneListItem = ({serverData, channel}) => {
    const [channelData, setChannelData] = useState();
    const [modalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(true)
    const openModal = () => {
        setModalOpen(true);
    }
    const closeModal = () => {
        setModalOpen(false);
    }

    const deleteChannel = () => {
        firebase
        .firestore()
        .collection('channels')
        .doc(channel.uid)
        .get()
        .then((query) => {query.ref.delete()})
        .then(
            firebase
            .firestore()
            .collection('servers')
            .doc(serverData.id)
            .update({
                channels: firebase.firestore.FieldValue.arrayRemove(channel)
            })
        ).then(
            closeModal
        )
    }

    // useEffect(() => {
    //     firebase
    //     .firestore()
    //     .collection('channels')
    //     .doc(channel)
    //     .get()
    //     .then((query) => {
    //         setChannelData(query.data())
    //         setLoading(false)
    //     })
    // }, [serverData])

    return (
        <>
        <tr>
            <td class="ps-0">#{channel.name}</td>
            <td class="pe-0 text-end"><a class="btn btn-outline-danger" onClick={openModal}>Delete</a></td>
        </tr>
        <Modal show={modalOpen} title={"Confirm Delete"} handleClose={closeModal} key={channel.uid}>
            <div class="modal-body">
                <h4>Are you sure you would like to delete {channel.name}?</h4>
                <div class="modal-footer">
                    <button class="btn btn-outline-secondary" onClick={closeModal}>Cancel</button>
                    <button class="btn btn-danger" onClick={deleteChannel}>Delete</button>
                </div>
            </div>
        </Modal>
        </>
    )

}

const SettingsChannelList = ({serverData}) => {

    return(
        <div class="card stretch-card channel-settings-list">
            <div class="card-body">
                <h4 class="card-title">
                    Server Channels
                </h4>
                <table class="table mb-0">
                    <thead>
                        <tr>
                        <th class="ps-0">Channel</th>
                        <th class="pe-0 text-end">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {serverData.channels.map((channel) => {
                            return <SettingsChanneListItem serverData={serverData} channel={channel}/>
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}


const ServerSettings = ({serverData}) => {
    const { currentUser } = useContext(AuthContext);
    const isOwner = (serverData.owner === currentUser.uid)
    const isMod = (serverData.mods.includes(currentUser.uid))
    const [serverName, setServerName] = useState(serverData.name)
    const [image, setImage] = useState(null)
    const [downloadURL, setDownloadURL] = useState(null)
    const [name, setName] = useState(null);

    useEffect(() => {

    }, [serverData])




    const handleNameChange = (e) => {
        setServerName(e.target.value)
    }
    const handleChange = (e) => {
        if(e.target.files[0]){
            setImage(e.target.files[0])
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if(image){
            const ref = firebase.storage().ref(`/servers/${image.name}`)
            const uploadTask = ref.put(image);
            uploadTask.on("state_changed", () => {
                ref.getDownloadURL()
                .then((url) => {
                    firebase
                    .firestore()
                    .collection('servers')
                    .doc(serverData.id)
                    .update({
                        icon: url
                    })

                    setImage(null);
                })
            })
        }
        if(serverName != serverData.name){
            firebase
            .firestore()
            .collection('servers')
            .doc(serverData.id)
            .update({
                name: serverName
            })
        }
    }

    return (
        <div class="chat-container bg-black server-settings main-panel">
            <div class="container py-5">
                {isOwner && (
                <div class="row">
                    <div class="col-lg-8 col-sm-12 grid-margin">
                        <div class="card">
                            <div class="card-body">
                                <h4 class="card-title">Edit {serverData.name}</h4>
                                <form onSubmit={handleSubmit} id="updateServerForm">
                                    <div class="form-group">
                                        <label for="serverName">Server Name</label>
                                        <input type="text" 
                                        class="form-control text-light"
                                        id="serverNameInput"
                                        placeholder="Server Name"
                                        name="serverName"
                                        required
                                        defaultValue={serverData.name}
                                        value={serverName}
                                        onChange={handleNameChange}
                                        minLength={3}
                                        />
                                    </div>
                                    <div class="form-group">
                                        <label for="serverIconInput">Server Icon - Currently <img class="img-xs rounded-circle my-2" src={serverData.icon}/></label>
                                        <input 
                                            type="file"
                                            id="serverIconInput"
                                            accept=".png,.jpeg,.jpg,.webp"
                                            class="form-control"
                                            onChange={handleChange}
                                            />
                                    </div>
                                    <div class="input-group">
                                        <button class="btn btn-success" action="submit" form="updateServerForm">Update Server</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4 col-sm-12 grid-margin">
                        <SettingsChannelList serverData={serverData}/>
                    </div>
                </div>
                )}
                <SettingsMemberList serverData={serverData}/>
            </div>
        </div>
    )
}

const ServerView = () => {
    const { currentUser } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [serverData, setServerData] = useState({});
    const serverParams = useParams()['*'].split('/');
    const server = serverParams[0]
    const [channel, setChannel] = useState(serverParams[1] ? serverParams[1] : false);
    // const [server, setServer] = useState(serverParams[0] ? serverParams[0] : false);
    const [oldServer, setOldServer] = useState(server)
    const [update, setUpdate] = useState(false);
    const [listenerLoaded, setListenerLoaded] = useState(false);
    const [oldChannel, setOldChannel] = useState(channel)
    const [notifications, setNotifications] = useState({});
    const [showMembers, setShowMembers] = useState(true);
    const [userData, setUserData] = useState();
    const [settingsOpen, setSettingsOpen] = useState(false);


    useEffect(() => {
        if(server !== oldServer && listenerLoaded){
            setOldServer(server)
            setLoading(true)
            setListenerLoaded(false)
            setChannel(false)

        }
        if(channel === oldChannel && listenerLoaded){
            setOldChannel(channel);
            listener(channel.uid);
        }
        if(serverParams[0] && !listenerLoaded){
            listener(server)
            notifListener()
            setOldServer(serverParams[0])
        }
        clearNotifications();
      }, [update, channel, server])


    const clearNotifications = () => {
        console.log('clearing notifications')
        firebase.firestore().collection('users').doc(currentUser.uid).get().then((q) => {
            let notifs = q.data().notifications;
            if(notifs[channel.uid]){
                notifs[channel.uid] = {'unread': 0, 'mentions': notifs[channel.uid]['mentions']}
                firebase.firestore().collection('users').doc(currentUser.uid).update({
                    notifications: notifs
                })
            }
        })
    }
    

    
    function addToSubscribedChannels(srv){
        firebase
        .firestore()
        .collection('users')
        .doc(currentUser.uid)
        .get()
        .then((query) => {
            let q = query.data()
            console.log(q)
            console.log(currentUser.uid)
            console.log(srv)
            let subbed = q.subscribed_channels
            let hasSubbed = false;

            if(!subbed.includes(srv)){
                firebase.firestore().collection('servers').get(serverParams[0]).get().then((serverQuery) => {
                    if(serverQuery.exists){
                        firebase.firestore().collection('users').doc(currentUser.uid).update({
                            subscribed_channels: firebase.firestore.FieldValue.arrayUnion(serverParams[0])
                        })      
                    }
                    else{
                        // logic for returning user if server doesn't exist should go here
                        // since we're already checking here
                    }
                })
            }
        })
    }
    // handles notifications and user data
    const notifListener = () => {
        firebase
        .firestore()
        .collection('users')
        .doc(currentUser.uid)
        .onSnapshot((snapshot) => {
            setNotifications(snapshot.data().notifications)
            setUserData(snapshot.data())
            let subs = snapshot.data().subscribed_channels
            if(!subs.includes(serverData.id)){
                addToSubscribedChannels(serverData.id);
            }
        })
    }


    const listener = (params) => {
        firebase
        .firestore()
        .collection('servers')
        .doc(params)
        .onSnapshot((snapshot) => {
            setServerData(snapshot.data())
            if(channel === false){
                setChannel(snapshot.data().channels[0])
            }
            else{
                snapshot.data().channels.forEach((c) => {
                    if(c.uid === channel){
                        setChannel(c);
                    }
                })
            }
            // add user to server participants
            if(!snapshot.data().members.includes(currentUser.uid)) {
                firebase.firestore().collection('servers').doc(params).update({
                    members: firebase.firestore.FieldValue.arrayUnion(currentUser.uid)
            })

            
        }
        setListenerLoaded(true);
        setLoading(false);
        setUpdate(!update);
        })
    }

    
    return(
        <>
            {!loading && serverData.bans.includes(currentUser.uid) && (
                <Navigate to="/"/>
            )}
            {!loading && !serverData.bans.includes(currentUser.uid) &&(
                <>
                <ServerNavigation currentChannel={channel} serverData={serverData}
                 updateChannel={setChannel} notifications={notifications} 
                 setShowMembers={setShowMembers}  showMembers={showMembers}
                 settingsOpen={settingsOpen} setSettingsOpen={setSettingsOpen} />
                 {!settingsOpen && (
                        <ChannelView currentServer={serverData} currentChannel={channel.uid} userData={userData} />
                 )}
                 {settingsOpen && (
                     <ServerSettings serverData={serverData}/>
                 )}
                <MemberList serverData={serverData} showMembers={showMembers} key={serverData} userData={userData}/>
                </>
            )}
            {loading && (
                <BigSpinner/>
            )}
        </>
    )
}

const ServerPage = () => {
    const [collapsed, setCollapsed] = useState(window.innerWidth < 768 ? true : false);

    return(
        <>
        <div class="chatSidebarWrapper sidebar-icon-only server-sidebar">
            <SideBar makeSticky={false} collapsed={collapsed} />
        </div>
        <ServerView/>
        </>    
    )
}



export default ServerPage;