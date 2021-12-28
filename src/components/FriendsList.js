import { AuthContext } from "../contexts/Auth";
import firebase from "firebase/compat/app";
import 'firebase/compat/auth';
import React, { useContext, useEffect, useState, useRef } from "react";
import { removeFriend } from "./friends";
import { Link } from "react-router-dom";

const FriendsListItem = ({userData}) => {
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

    const doRemoveFriend = () => {
        if(userData !== currentUser.uid){
            removeFriend(currentUser, friend)
        }
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
                    <img src={friend.imageUrl} class="img-xs mr-1 rounded-circle preview-icon"/>
                </div>
                <div class="preview-item-content d-sm-flex flex-grow mx-2">
                    <div class="flex-grow ml-1">
                        {friend.username}
                    </div>
                    <div class="me-auto pt-2 pt-sm-0 mx-4">
                        <Link to={"/chat/" + friend.username} exact={true} className="btn btn-primary">Message</Link>
                    </div>
                    <div class="me-auto pt-2 pt-sm-0 mx-4">
                        <a 
                        onClick={doRemoveFriend}
                        class={(userData === currentUser.uid) ? "btn btn-outline-danger disabled" : "btn btn-outline-danger"}>
                            Remove Friend
                        </a>
                    </div>
                </div>
            </li>
        )}
        </>
    )
}


export default function FriendsList({userData}){

    return (
        <div class="card">
            <div class="card-body">
                <h4 class="card-title">Your Friends</h4>
                <div class="list-wrapper">
                <ul class="preview-list">
                {userData.friends.map((friend) => {
                            return <FriendsListItem userData={friend} key={friend}/>
                        })}
                </ul>
                </div>
            </div>
        </div>
    )
}