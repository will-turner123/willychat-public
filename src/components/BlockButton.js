import { removeFriend, sendFriendRequest } from "./friends";
import React, { useContext } from "react";
import { AuthContext } from "../contexts/Auth";
import firebase from "firebase/compat/app";
import 'firebase/compat/auth';


const blockUser = (currentUser, memberData) => {
    firebase
    .firestore()
    .collection('users')
    .doc(currentUser.uid)
    .update({
        blocked: firebase.firestore.FieldValue.arrayUnion(memberData.id)
    })
}


const BlockButton = ({memberData, serverData}) => {
    const { currentUser } = useContext(AuthContext);
    const isAuthed = ((memberData.id !== currentUser.uid))

    const doBlock = () => {
        blockUser(currentUser, memberData)
    }

    return (
        <>
        {isAuthed && (

        <a href="javascript:void(0);" class="dropdown-item preview-item text-danger" onClick={doBlock}>
            <div class="preview-thumbnail"><i class="fas fa-user-alt-slash"></i></div>
            <div class="preview-item-content">
                <div class="preview-subject ellipsis mb-1 text-small">
                    Block User
                </div>
            </div>
        </a>
        )}
        </>
    )
}

export default BlockButton;