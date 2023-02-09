import messaging from '@/utils/firebaseMessaging';
import db from '@/utils/firebaseStore';
import { Timestamp } from 'firebase-admin/firestore';
import store from 'store2';
import {getAuthorizationToken, clearChatRoom, userListToTokens } from '@/lib/utils';
import { User, UserListElm } from '@/lib/types';
import type { NextApiRequest, NextApiResponse } from 'next';

function addUserListStore(roomid: string, id: string, token: string) {
    const storeKey = 'fcm_userlist_' + roomid;
    let userList: UserListElm[] = [];
    if (store(storeKey)){
        userList = JSON.parse(store(storeKey));
    }
    if (userList.find((item) => item.id === id)){
        return userList;
    }

    userList.push({id, token});
    store(storeKey, JSON.stringify(userList));
    return userList;
}    

function addUserRecentStore(roomid: string, user: User) {
    const storeKey = 'fcm_adduserrecent_' + roomid;
    store(storeKey, JSON.stringify(user));
    return user;
}    

export default async function handler(req: NextApiRequest, res: NextApiResponse<User>) {
    
    try {
        if (req.method === 'POST'){
            if (getAuthorizationToken(req) !== process.env.NEXT_PUBLIC_API_SECRECY){
                return;
            }
            const { roomid } = req.query;
            const {user, token} = req.body;
            let userID = user.id;
            delete user.id;
            const response = await clearChatRoom(roomid as string);
            const userRef = db.collection('chatroom').doc(roomid as string).collection('users');
            if (response == 'EmptyRoom') {
                const result = await userRef.doc(userID).set({...user, token, createdAt: Timestamp.now().toMillis()});
            }else{
                const doc = await userRef.doc(userID).get();
                if (!doc.exists) {
                    const result = await userRef.doc(userID).set({...user, token, createdAt: Timestamp.now().toMillis()});
                }else{
                    const result = await userRef.add({...user, token, createdAt: Timestamp.now().toMillis()});
                    userID = result.id;                   
                }
            }
            //add recent user data to store
            addUserRecentStore(roomid as string, {id: userID, ...user, createdAt: Timestamp.now().toMillis()});
            const messageData = {action: 'adduser', id: userID, ...user};
            //add token to store array
            const tokens =  userListToTokens(addUserListStore(roomid as string, userID, token));
            if (tokens.length){
                const message = {
                    data: messageData,
                    tokens: tokens,         
                }
                const resp = await messaging.sendMulticast(message);
            }
            res.status(200).json({id: userID, ...user});
        }else{
            res.status(200).end();
        }
    } catch (e) {
        console.log('Error adding users:', e);
        res.status(400).end();
    }
}

