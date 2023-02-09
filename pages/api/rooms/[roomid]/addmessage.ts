import messaging from '@/utils/firebaseMessaging';
import db from '@/utils/firebaseStore';
import { Timestamp } from 'firebase-admin/firestore';
import store from 'store2';
import {getAuthorizationToken, userListToTokens} from '@/lib/utils';
import { MessageFCM } from '@/lib/types';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse<MessageFCM>) {
    try {
        if (req.method === 'POST'){
            if (getAuthorizationToken(req) !== process.env.NEXT_PUBLIC_API_SECRECY){
                return;
            }
            const { roomid } = req.query;
            const storeKey = 'fcm_userlist_' + roomid;
            const {user, msgbody} = req.body;
            const currentTime = Timestamp.now().toMillis();
            const messageBody = {user, body: msgbody, sentAt: currentTime};
            const result = await db.collection('chatroom').doc(roomid as string).collection('messages').add(messageBody);
            const messageData: MessageFCM = {action: 'addmessage', id: result.id, user: JSON.stringify(user), body: msgbody, sentAt: currentTime.toString()};
            const tokens = userListToTokens(store(storeKey) ? JSON.parse(store(storeKey)): []);
            if (tokens.length){
                const message: any = {
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
        console.log('Error sending message:', e);
        res.status(400).end();
    }
}    

export default handler;
