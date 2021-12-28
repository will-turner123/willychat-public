import { AuthContext } from "../contexts/Auth";
import firebase from "firebase/compat/app";
import 'firebase/compat/auth';
import React, { useContext, useEffect, useState, useRef } from "react";
import { acceptFriendRequest, denyFriendRequest } from "./friends";




const FriendRequestItem = ({userData}) => {
    const [friend, setFriend] = useState();
    const [loading, setLoading] = useState(true);
    const { currentUser } = useContext(AuthContext);

    useEffect(() => {
        firebase
        .firestore()
        .collection('users')
        .doc(userData)
        .get()
        .then((query) => {
            setFriend(query.data())
            setLoading(false);
        })
    }, [])

    const doAcceptFriendRequest = () => {
        acceptFriendRequest(currentUser, userData)
    }

    const doDenyFriendRequest = () => {
        denyFriendRequest(currentUser, userData);
    }

    return(
        <>
        {loading && (
            <li class="preview-list-item"><div class="border-spinner text-primary"></div></li>
        )}
        {!loading && (
            <li class="preview-list-item border-bottom">
                <div class="preview-thumbnail">
                    <img src={friend.imageUrl} class="img-xs mr-1 rounded-circle preview-icon"/>
                </div>
                <div class="preview-item-content d-sm-flex flex-grow mx-2">
                    <div class="flex-grow ml-1">
                        {friend.username}
                    </div>
                    <div class="me-auto pt-2 pt-sm-0 mx-4">
                        <a 
                        onClick={doAcceptFriendRequest}
                        class="btn btn-success">
                            Accept
                        </a>
                    </div>
                    <div class="me-auto pt-2 pt-sm-0 mx-4">
                        <a 
                        onClick={doDenyFriendRequest}
                        class="btn btn-outline-danger">
                            Deny
                        </a>
                    </div>
                </div>
            </li>
        )}
        </>
    )
}

export default function FriendRequests({userData}){
    return (
        <div class="card">
            <div class="card-body">
                <h4 class="card-title">Friend Requests</h4>
                <div class="list-wrapper">
                <ul class="preview-list">
                {userData.friend_requests.length === 0 && (
                    <p class="text-muted">You currently have no friend requests :/</p>
                )}
                {userData.friend_requests.map((friend) => {
                            return <FriendRequestItem userData={friend} key={friend}/>
                        })}
                </ul>
                </div>
            </div>
        </div>
    )
}