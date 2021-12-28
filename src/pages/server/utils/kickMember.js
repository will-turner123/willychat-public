import firebase from "firebase/compat/app";
import 'firebase/compat/auth';

export default function kickMember(serverId, memberId){
    console.log('serverId', serverId)
    console.log('memberId', memberId)
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
