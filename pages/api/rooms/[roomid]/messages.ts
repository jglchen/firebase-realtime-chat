import db from '@/utils/firebaseStore';
import { Message } from '@/lib/types';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { roomid } = req.query;
        const messages: Message[] = [];
        const msgsRef = db.collection('chatroom').doc(roomid as string).collection('messages').orderBy('sentAt'); 
        const snapshot = await msgsRef.get();       
        snapshot.forEach(doc => {
            messages.push({id: doc.id, ...doc.data()} as Message);
        });
        res.status(200).json(messages);
    } catch (err) {    
        res.status(400).end();
    }
}    

export default handler;
