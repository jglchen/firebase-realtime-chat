import messaging from '@/utils/firebaseMessaging';
import db from '@/utils/firebaseStore';
import store from 'store2';
import {getAuthorizationToken, userListToTokens} from '@/lib/utils';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method === 'DELETE'){
            if (getAuthorizationToken(req) !== process.env.NEXT_PUBLIC_API_SECRECY){
                return;
            }
            const { roomid, userid } = req.query;
            const storeKey = 'fcm_userlist_' + roomid;
            await db.collection('chatroom').doc(roomid as string).collection('typingusers').doc(userid as string).delete();
            const tokens = userListToTokens(store(storeKey) ? JSON.parse(store(storeKey)): []);
            const messageData = {action: 'stoptyping', userid};
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
