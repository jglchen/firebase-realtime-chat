import db from '@/utils/firebaseStore';
import { User } from '@/lib/types';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { roomid } = req.query;
        const typingusers: User[] = [];
        const usersRef = db.collection('chatroom').doc(roomid as string).collection('typingusers'); 
        const snapshot = await usersRef.get();       
        snapshot.forEach(doc => {
            typingusers.push({id: doc.id, ...doc.data()} as User);
        });
        res.status(200).json(typingusers);
    } catch (err) {    
        res.status(400).end();
    }
}    

export default handler;
