import { AuthContext } from "../contexts/Auth";
import firebase from "firebase/compat/app";
import 'firebase/compat/auth';
import React, { useContext, useEffect, useState, useRef } from "react";
import moment from 'moment';
import { Link, useLocation, useNavigate } from "react-router-dom";



const ChatItem = ({chat, userData}) => {
    const [loading, setLoading] = useState(true);
    const [chatUser, setChatUser] = useState(null);
    const [lastMessage, setLastMessage] = useState();
    const [hasRead, setHasRead] = useState(true);
    var history = useNavigate();

    useEffect(() => {
        // get chat user
        if(userData.notifications[chat.id]){
            if(userData.notifications[chat.id].unread > 1){
                setHasRead(false);
            }
        }
        if(chat.messages.length <= 1){
            setLastMessage({text: "Start the conversation!", timestamp: "Now"})
        }
        else{
            var now = moment(new Date());
            var ts = moment.duration(now.diff(moment(chat.messages.at(-1)['timestamp']))).humanize() + " ago"
            setLastMessage({text: chat.messages.at(-1).text, timestamp: ts})
        }
        if(chat.participants[0] === chat.participants[1]){
            setChatUser(userData);
            setLoading(false);
        }
        else{
            let otherUser = ""
            chat.participants.forEach((participant) => {
                if(participant != userData.id){
                    otherUser = participant
                }
            })
            firebase
            .firestore()
            .collection('users')
            .doc(otherUser)
            .get()
            .then((query) => {
                setChatUser(query.data())
                setLoading(false)
            })
        }
    }, [userData])

    function goToChat(){
        history("/chat/" + chatUser.username)
    }

    // <Link exact={true} to={"/chat/" + chatUser.username}>

    return (
        <div class="preview-item border-bottom" onClick={goToChat}>
            {loading && (<div class="border-spinner text-secondary"/>)}
            {!loading && (
                <>
                <div class="preview-thumbnail">
                    <img src={chatUser.imageUrl} class="rounded-circle"/>
                </div>
                <div class="preview-item-content d-flex flex-grow">
                    <div class="flex-grow">
                        <div class="d-flex d-md-block d-xl-flex justify-content-between">
                            <h6 class="preview-subject">{chatUser.username}</h6>
                            <p class="text-muted text-small">{lastMessage.timestamp}</p>
                        </div>
                        <p class={hasRead ? "text-muted" : "text-light"}>{lastMessage.text}</p>
                    </div>
                </div>
                </>
            )}
        </div>
    )
}


function Inbox({userData, viewAll}){
    const [loading, setLoading] = useState(true);
    const [chats, setChats] = useState([]);
    const notAllDisplayCount = 5
    const history = useNavigate()
    
    function viewAllChats(){
        history("/inbox")
    }
    useEffect(() => {
        const chatsArray = []
        let counter = 0
        firebase
        .firestore()
        .collection('chats')
        .where("participants", "array-contains", userData.id)
        .get()
        .then((docs) => {
            docs.forEach((doc) => {
                chatsArray.push(doc.data())
                counter++;
                if(chatsArray.length === docs.size || (!viewAll && counter >= notAllDisplayCount)){
                    setChats(chatsArray)
                    setLoading(false)
                }
            })
        })
    }, [userData, viewAll])

    return (
        <div class="card">
            <div class="card-body">
                <div class="d-flex flex-row justify-content-between">
                    <h4 class="card-title">Messages</h4>
                    {!viewAll && (<p class="text-muted mb-1 small" onClick={viewAllChats}>View All</p>)}
                </div>
                {loading && (
                    <div class="spin-wrapper text-center">
                        <div class="big-spinner text-secondary"/>
                    </div>
                )}
                {!loading && (
                    <div class="preview-list">
                        {chats.map((chat, index) => {
                            return <ChatItem chat={chat} key={index} userData={userData}/>
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Inbox;