import db from '@/utils/firebaseStore';
import store from 'store2';
import { User, UserListElm } from '@/lib/types';
import type { NextApiRequest, NextApiResponse } from 'next';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { roomid } = req.query;
        const users: User[] = [];
        //const tokens: string[] = [];
        const userList: UserListElm[] = [];
        const storeKey = 'fcm_userlist_' + roomid;
        const usersRef = db.collection('chatroom').doc(roomid as string).collection('users'); 
        const snapshot = await usersRef.get();       
        snapshot.forEach(doc => {
            const user = {id: doc.id, ...doc.data()} as User;
            const {token} = user;
            if (token){
                userList.push({id: doc.id, token});
            }
            delete user.token;
            users.push(user);
        });
        store(storeKey, JSON.stringify(userList));
        res.status(200).json(users);
    } catch (err) {    
        res.status(400).end();
    }
}    

export default handler;
