import messaging from '@/utils/firebaseMessaging';
import db from '@/utils/firebaseStore';
import store from 'store2';
import {getAuthorizationToken, clearMessages, clearTypingUser, clearRecent, userListToTokens} from '@/lib/utils';
import { UserListElm } from '@/lib/types';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method === 'DELETE'){
            if (getAuthorizationToken(req) !== process.env.NEXT_PUBLIC_API_SECRECY){
                return;
            }
            const { roomid } = req.query;
            const { user } = req.body;
            const userRef = db.collection('chatroom').doc(roomid as string).collection('users');
            await userRef.doc(user.id).delete();
            
            //Check if collection of users is empty
            const snapshotUser = await userRef.get();
            const storeKey = 'fcm_userlist_' + roomid;
            if (snapshotUser.empty) {
                store.remove(storeKey);
                await clearTypingUser(roomid as string);
                await clearMessages(roomid as string);
                clearRecent(roomid as string);
                res.status(200).json({status: 'chatroom is empty'});
            }else{
                const userArray: UserListElm[] = store(storeKey) ? JSON.parse(store(storeKey)): [];
                const userList = userArray.filter((item) => item.id !== user.id);
                const tokens = userListToTokens(userList);
                store(storeKey, JSON.stringify(userList));
                const messageData = {action: 'leaveroom', id: user.id};
                const message = {
                    data: messageData,
                    tokens: tokens,         
                }
                const response = await messaging.sendMulticast(message);
                res.status(200).json(messageData);
            }
        }else{
            res.status(200).end();
        }
    } catch (e) {
        console.log('Error sending message:', e);
        res.status(400).end();
    }
}




