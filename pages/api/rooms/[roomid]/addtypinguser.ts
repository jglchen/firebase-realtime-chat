import messaging from '@/utils/firebaseMessaging';
import db from '@/utils/firebaseStore';
import store from 'store2';
import {getAuthorizationToken, userListToTokens} from '@/lib/utils';
import { User } from '@/lib/types';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse<User>) {
    try {
        if (req.method === 'POST'){
            if (getAuthorizationToken(req) !== process.env.NEXT_PUBLIC_API_SECRECY){
                return;
            }
            const { roomid } = req.query;
            const {user} = req.body;
            const storeKey = 'fcm_userlist_' + roomid;
            const userID = user.id;
            delete user.id;
            const result = await db.collection('chatroom').doc(roomid as string).collection('typingusers').doc(userID).set(user);
            const messageData = {action: 'addtypinguser', ...user, id: userID};
            const tokens = userListToTokens(store(storeKey) ? JSON.parse(store(storeKey)): []);
            if (tokens.length){
                const message = {
                    data: messageData,
                    tokens: tokens,         
                }
                const response = await messaging.sendMulticast(message);
            }
            res.status(200).json(messageData);
        }else{
            res.status(200).end();
        }
    } catch (e) {
        console.log('Error adding typingusers:', e);
        res.status(400).end();
    }
}

