import firebase from "firebase/compat/app";
import 'firebase/compat/auth';


export const sendFriendRequest = (currentUser, memberData) => {
    firebase
    .firestore()
    .collection('users')
    .doc(currentUser.uid)
    .update({
        outgoing_friend_requests: firebase.firestore.FieldValue.arrayUnion(memberData.id)
    }).then(() => {
        firebase
        .firestore()
        .collection('users')
        .doc(memberData.id)
        .update({
            friend_requests: firebase.firestore.FieldValue.arrayUnion(currentUser.uid)
        })
    })
}

export const acceptFriendRequest = (currentUser, memberData) => {
    firebase
    .firestore()
    .collection('users')
    .doc(currentUser.uid)
    .update({
        friend_requests: firebase.firestore.FieldValue.arrayRemove(memberData),
        friends: firebase.firestore.FieldValue.arrayUnion(memberData)
    }).then(
        firebase
        .firestore()
        .collection('users')
        .doc(memberData)
        .update({
            outgoing_friend_requests: firebase.firestore.FieldValue.arrayRemove(currentUser.uid),
            friends: firebase.firestore.FieldValue.arrayUnion(currentUser.uid)
        })
    )
}

export const denyFriendRequest = (currentUser, memberData) => {
    console.log(memberData)
    firebase
    .firestore()
    .collection('users')
    .doc(currentUser.uid)
    .update({
        friend_requests: firebase.firestore.FieldValue.arrayRemove(memberData),
    }).then(
        firebase
        .firestore()
        .collection('users')
        .doc(memberData)
        .update({
            outgoing_friend_requests: firebase.firestore.FieldValue.arrayRemove(currentUser.uid),
        })
    )
}

export const removeFriend = (currentUser, memberData) => {
    firebase
    .firestore()
    .collection('users')
    .doc(currentUser.uid)
    .update({
        friends: firebase.firestore.FieldValue.arrayRemove(memberData.id)
    })
    .then(
        firebase
        .firestore()
        .collection('users')
        .doc(memberData.id)
        .update({
            friends: firebase.firestore.FieldValue.arrayRemove(currentUser.uid)
        })
    )
}