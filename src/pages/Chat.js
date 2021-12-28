import React, { useContext, useEffect, useState, useRef } from "react";
import { Navigate, useParams, Link } from "react-router-dom";
import { AuthContext } from "../contexts/Auth";
import firebase from "firebase/compat/app";
import SideBar from "../components/SideBar";
import 'firebase/compat/auth';
import BigSpinner from "../components/BigSpinner";
import Modal from "../components/Modal";
import moment from "moment";
import Header from "../components/Header";
import BlockButton from "../components/BlockButton";
import FriendButton from "../components/FriendButton";



const DeleteMessage = ({chatData, messageData}) => {
    const { currentUser } = useContext(AuthContext);
    const deleteMessage = () => {
        firebase
        .firestore()
        .collection('chats')
        .doc(chatData)
        .update({
            messages: firebase.firestore.FieldValue.arrayRemove(messageData)
        })
    }
    return (
        <>

        <a href="javascript:void(0);" class="dropdown-item preview-item text-danger" onClick={deleteMessage}>
            <div class="preview-thumbnail"><i class="fas fa-trash-alt"></i></div>
            <div class="preview-item-content">
                <div class="preview-subject ellipsis mb-1 text-small">
                    Delete Message
                </div>
            </div>
        </a>
        </>
    )
}



const ChatMessage = ({message, chatData, userData, id}) => {
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
    {!loading && message && (
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
                <FriendButton memberData={authorData} userData={userData}/>
                <BlockButton memberData={authorData} />
                <DeleteMessage messageData={message} chatData={chatData} /> 
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



const ChatMessageView = ({chatData, chatUser}) => {
    const [loading, setLoading] = useState(true);
    const [listenerLoaded, setListenerLoaded] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [chat, setChat] = useState(null);
    const [formValue, setFormValue] = useState('');
    const [hasFile, setHasFile] = useState(false);
    const [imageAsFile, setImageAsFile] = useState('');
    const [update, setUpdate] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [userData, setUserData] = useState();
    const dummy = useRef();
    const { currentUser } = useContext(AuthContext);


    useEffect(() => {
        if(!listenerLoaded){
            firebase
            .firestore()
            .collection('users')
            .doc(currentUser.uid)
            .get()
            .then((query) => {
                setUserData(query.data())
            }).then(
                listener(chatData)
            )
        }
        clearNotifications();
        dummy.current.scrollIntoView({ behavior: 'smooth'})
    }, [update, chatData])


    const clearNotifications = () => {
        firebase.firestore().collection('users').doc(currentUser.uid).get().then((q) => {
            let notifs = q.data().notifications;
            if(notifs[chatData]){
                notifs[chatData] = {'unread': 0, 'mentions': notifs[chatData]['mentions']}
                firebase.firestore().collection('users').doc(currentUser.uid).update({
                    notifications: notifs
                })
            }
        })
    }
    const handleImageAsFile = (e) => {
        e.preventDefault();
        const image = e.target.files[0]
        setImageAsFile(imageFile => (image))
        setHasFile(true);
    }

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
        firebase.firestore().collection('chats').doc(c).onSnapshot((doc) => {
            setListenerLoaded(true);
            setChat(doc.data())
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
        await firebase.firestore().collection('chats').doc(chatData).update({
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
        .then(
            dummy.current.scrollIntoView({ behavior: 'smooth'})
        ).then(()=>{
            document.getElementById('image').value = "";
            setHasFile(false);
            setImageUrl('');
            setImageAsFile('');

        }).then(
            // increment unread count by one
            firebase.firestore().collection('chats').doc(chat.id).get()
            .then((query) => {
                query.data().participants.forEach((member) => {
                    if(member !== currentUser.uid){
                        firebase.firestore().collection('users').doc(member).get().then((q) => {
                            let notifs = q.data().notifications;
                            if(notifs[chatData]){
                                notifs[chatData] = {'unread': notifs[chatData]['unread']+1, 'mentions': notifs[chatData]['mentions'], 'type': 'chat'}
                                firebase.firestore().collection('users').doc(member).update({
                                    notifications: notifs
                                })
                                console.log('writing new unread count', notifs[chatData]['unread']+1)
                            }
                            else{
                                notifs[chatData] = {'unread': 1, 'mentions': 0, 'type': 'chat'}
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
                        {chat['messages'].length > 0 ? chat['messages'].map((msg, index) => {
                            return <ChatMessage message={msg} key={index} id={index} key={index} chatData={chatData} userData={userData}></ChatMessage>
                    }) : (<p>Get the conversation started!</p>)}
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


const ChatView = ({collapsed, setCollapsed}) => {
    const { currentUser } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const username = useParams()['*'].split('/');
    const [chatUser, setChatUser] = useState(username[0] ? username[0] : false);
    const [chatUserData, setChatUserData] = useState(username[0] ? username[0] : false);
    const [update, setUpdate] = useState(false);
    const [chatData, setChatData] = useState(null);


    useEffect(() => {
        // first, get other user's username from url params
        // if this other user exists
        //      get chat with participants include current user uid and other user uid
        //          set this to be the chat
        //          create listener to this doc id
        //          

        if(chatUser){
            var hasRoom = false;
            firebase
            .firestore()
            .collection('users')
            .where('username', '==', chatUser)
            .get()
            .then((docs) => {
                if(docs.size >= 1){
                    var usr = docs.docs[0].data()
                    setChatUserData(docs.docs[0].data())
                    firebase
                    .firestore()
                    .collection('chats')
                    .where('participants', 'array-contains', usr.id)
                    .get()
                    .then((chatRooms) => {
                        if(chatRooms.size >= 1){
                            chatRooms.docs.forEach((chatDoc) => {
                                if(chatDoc.data().participants.includes(currentUser.uid)){
                                    hasRoom = true;
                                    setChatData(chatDoc.data().id)
                                    setLoading(false)
                                }
                            })
                        }
                        if(!hasRoom){
                            console.log('creating room')
                            // create channel
                            firebase
                            .firestore()
                            .collection('chats')
                            .add({
                                participants: [usr.id, currentUser.uid],
                                id: "",
                                messages: []
                            })
                            .then((docRef) => {
                                firebase.firestore().collection('chats').doc(docRef.id).update({id: docRef.id}).then(()=>{
                                    
                                    setChatData(docRef.id)
                                    setLoading(false)
                                })
                            })
                        }
                    })
                }
                else{
                    console.log('invalid user')
                }

            })
        }
    }, [update])
    return (
        <>
        {loading && (
            <BigSpinner/>
        )}
        {!loading && (
            <>
            <Header collapsed={collapsed} setCollapsed={setCollapsed} children={
                <span class="nav-link">{chatUserData.username}</span>
            }/>
            <ChatMessageView chatData={chatData} userData={chatUserData}/>
            </>
        )}
        </>
    )
}


const ChatPage = () => {
    const [collapsed, setCollapsed] = useState(window.innerWidth < 768 ? false : true);

    return(
        <>
        <div class="chatSidebarWrapper">
            <SideBar makeSticky={false} collapsed={collapsed} />
        </div>
        <ChatView collapsed={collapsed} setCollapsed={setCollapsed}/>
        </>    
    )
}



export default ChatPage;