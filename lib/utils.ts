import { NextApiRequest } from 'next';
import db from '@/utils/firebaseStore';
import { Timestamp } from 'firebase-admin/firestore';
import { UserListElm } from '@/lib/types';
import store from 'store2';

export function getAuthorizationToken(req: NextApiRequest){
    const bearerHeader = req.headers['authorization'];
    //check if bearer is undefined
    if(typeof bearerHeader === 'undefined'){
        return '';
    }
    //split the space at the bearer
    const bearer = bearerHeader.split(' ');
    if (bearer.length <2){
        return '';
    }
    return bearer[1]; 
}

export async function clearChatRoom(roomid: string) {
    const docMsg = store(`fcm_addmsgrecent_${roomid}`) ? JSON.parse(store(`fcm_addmsgrecent_${roomid}`)): null;
    if (docMsg){
        if (docMsg.sentAt > (Timestamp.now().toMillis() - 12 * 60 * 60 * 1000)){
            return '';
        }
    }

    const docUser = store(`fcm_adduserrecent_${roomid}`) ? JSON.parse(store(`fcm_adduserrecent_${roomid}`)): null;
    if (docUser) {
        if (docUser.createdAt > (Timestamp.now().toMillis() - 12 * 60 * 60 * 1000)){
            return '';
        }
    }

    if (!docMsg && !docUser){
        return 'EmptyRoom';
    }

    await clearUsers(roomid);
    await clearMessages(roomid);
    await clearTypingUser(roomid);
    clearRecent(roomid);
    return 'EmptyRoom';
}

export async function clearUsers(roomid: string) {
    const snapshot = await db.collection('chatroom').doc(roomid).collection('users').get();
    if (snapshot.empty) {
        return;
    }  

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
       batch.delete(doc.ref);
    });
    await batch.commit(); 

    store.remove(`fcm_userlist_${roomid}`);
}

export async function clearMessages(roomid: string) {
    const snapshot = await db.collection('chatroom').doc(roomid).collection('messages').get();
    if (snapshot.empty) {
        return;
    }  

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
       batch.delete(doc.ref);
    });
    await batch.commit(); 
}


export async function clearTypingUser(roomid: string) {
    const snapshot = await db.collection('chatroom').doc(roomid).collection('typingusers').get();
    if (snapshot.empty) {
        return;
    }  

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
       batch.delete(doc.ref);
    });
    await batch.commit(); 
}

export function clearRecent(roomid: string) {
    //Users
    store.remove(`fcm_adduserrecent_${roomid}`);
    //Messahes
    store.remove(`fcm_addmsgrecent_${roomid}`);
} 

export function userListToTokens(userList: UserListElm[]): string[]{
    let tokenSet = new Set<string>();
    for (let elm of userList) {
        tokenSet.add(elm.token);
    } 
    return Array.from(tokenSet);
}


