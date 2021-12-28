import { removeFriend, sendFriendRequest } from "./friends";
import React, { useContext } from "react";
import { AuthContext } from "../contexts/Auth";


const FriendButton = ({memberData, userData}) => {
    const { currentUser } = useContext(AuthContext);
    const isAuthed = ((memberData.id !== currentUser.uid))
    const isFriend = (userData.friends.includes(memberData.id))
    const sentRequest = (userData.outgoing_friend_requests.includes(memberData.id))

    const doRemoveFriend = () => {
        removeFriend(currentUser, memberData)
    }

    const sendRequest = () => {
        sendFriendRequest(currentUser, memberData)
    }


    return (
        <>
        {isAuthed && (

        <a href="javascript:void(0);" class="dropdown-item preview-item text-muted" onClick={isFriend ? doRemoveFriend : sendRequest}>
            <div class="preview-thumbnail"><i class="fas fa-user-plus"></i></div>
            <div class={sentRequest ? "preview-item-content disabled" : "preview-item-content"}>
                <div class="preview-subject ellipsis mb-1 text-small">
                    {isFriend ? "Remove friend" : "Send friend request"}
                </div>
            </div>
        </a>
        )}
        </>
    )
}


export default FriendButton;