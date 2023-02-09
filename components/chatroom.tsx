import { useEffect, useState, useRef, FormEvent } from "react";
import axios from "axios";
import apiconfig from "@/lib/apiconfig";
import useUsers from '@/lib/useusers';
import useMessages from '@/lib/usemessages';
import useTypingUsers from '@/lib/usetypingusers';
import useTyping from "@/lib/usetyping";
import ChatMessage from "@/components/chatmessage";
import NewMessageForm from "@/components/newmessageform";
import TypingMessage from "@/components/typingmessage";
import Users from "@/components/users";
import UserAvatar from "@/components/useravatar";
import UserLogOut from "./userlogout";
import styles from '@/styles/chatroom.module.css';
import { User, Message } from '@/lib/types';

import app from '@/utils/firebase';
import { getMessaging, onMessage } from "firebase/messaging";
import { firebaseCloudMessaging } from '@/utils/webPush';
import { sendBackToMessages } from '@/lib/handlefcm';

interface PropsType {
  roomid: string;
  user: User;
  userLogout: () => void;
}

export default function ChatRoom({roomid, user, userLogout}: PropsType) {
    const {data: users, mutate: usersMutate} = useUsers(roomid as string);
    const {data: messages, mutate: messagesMutate} = useMessages(roomid as string);
    const {data: typingUsers, mutate: typingUsersMutate} = useTypingUsers(roomid as string);
    const [newMessage, setNewMessage] = useState("");
    const scrollTarget = useRef(null);
    const { isTyping, startTyping, stopTyping, cancelTyping } = useTyping();
    const [timeDiff, setTimeDiff] = useState(0);
    
    useEffect(() => {
      setToken()
      // this is working
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', (event) => console.log('event for the service worker', event))
      }
      async function setToken() {
        try {
          const token = await firebaseCloudMessaging.init()
          if (token) {
            console.log('token', token)
            // not working
            getMessage();
          }
        } catch (error) {
          console.log(error)
        }
      }
    },[]);
    
    function getMessage() {
      console.log('message functions');
      const messaging = getMessaging(app);
      onMessage(messaging, (message) => { 
        getMessageToData(message); 
      });
    }
    
    function getMessageToData(message: any){
      const { data } = message;
      console.log('foreground', data);
      
      switch (data.action) {
        case 'adduser':
          usersMutate((users: User[]) => {
            const exists = users?.find(
              ({ id }) => id === data.id
            );
            if (exists){
              return users;
            }

            delete data.ation;
            if (!users){
              return [data];
            }
            return [...users, data];
           }, false);
           break;
        case 'leaveroom':
          if (data.id) {
             usersMutate((users: User[]) => {
                return users?.filter(({id}) => id != data.id)
             }, false); 
          }else{
             usersMutate();
          }
          break;
        case 'addtypinguser':
          typingUsersMutate((typingUsers: User[]) => {
             const exists = typingUsers?.find(
               ({ id }) => id === data.id
             );
             if (exists){
               return typingUsers;
             }

             delete data.ation;
             if (!typingUsers){
               return [data];
             }
             return [...typingUsers, data];
           },false);
           break;
        case 'stoptyping':
          typingUsersMutate((typingUsers: User[]) => {
               return typingUsers?.filter(({id}) => id != data.userid)
          }, false); 
          break;
        case 'addmessage':
          messagesMutate((messages: Message[]) => {
            return sendBackToMessages(messages, data);
          },false); 
          break;
      }
    }
    
    const sendMessage = async (messageBody: string) => {
      if (!messageBody) return;
      try {
        messagesMutate((messages: Message[]) => {
           const message = {id: 'temp', user, body: messageBody, sentAt: Date.now()};
           if (!messages){
              return [message];
           }
           return [...messages, message];
        }, false);
        const {data} = await axios.post(`/api/rooms/${roomid}/addmessage`, { user, msgbody: messageBody}, apiconfig);
        messagesMutate((messages: Message[]) => {
           return sendBackToMessages(messages, data);
        }, false);
      }catch(err){
        //
      }
    };

    const startTypingMessage = async () => {
       if (!user) return;
       await axios.post(`/api/rooms/${roomid}/addtypinguser`, { user }, apiconfig);
    };
  
    const stopTypingMessage = async () => {
       if (!user) return;
       axios.delete(`/api/rooms/${roomid}/stoptyping?userid=${user.id}`, apiconfig);
    };
   
    const handleNewMessageChange = (event: FormEvent<HTMLInputElement>) => {
      setNewMessage(event.currentTarget.value.replace(/<\/?[^>]*>/g, ""));
    };
  
    const handleSendMessage = (event: FormEvent<HTMLInputElement>) => {
      event.preventDefault();
      cancelTyping();
      sendMessage(newMessage);
      setNewMessage("");
    };
    
    useEffect(() => {
      if (isTyping) startTypingMessage();
      else stopTypingMessage();
    }, [isTyping]);

    useEffect(() => {
      axios.get('/api/currenttime')
      .then(({data}) => {
         setTimeDiff(Date.now() - data.current);
      })
      .catch((error) => {
      });
    },[]);
    
    useEffect(() => {
        if (scrollTarget.current) {
           (scrollTarget.current as any).scrollIntoView({ behavior: 'smooth' });
        }
    },[messages?.length + typingUsers?.length]);
    
    return (
      <div className={styles.chatRoomContainer}>
        <div className={styles.chatRoomTopBar}>
          <h1>Room: {roomid}</h1>
          {user && 
            <>
            <UserAvatar user={user}></UserAvatar>
            <UserLogOut userLogout={userLogout} />
            </>
          }
        </div>
        <Users users={users?.filter((item: User) => item.id !== user?.id)}></Users>
          <div className={styles.messagesContainer}>
            <ol className={styles.messagesList}>
              {/*messages && messages.length > 0 && console.log("messaages", messages)*/}
              {messages?.map((message: Message) => {
                message.sentAt += timeDiff;
                return (
                <li key={message.id}>
                  <ChatMessage message={message} ownedByCurrentUser={message.user?.id === user?.id ? true: false}    ></ChatMessage>
                </li>
              );})}
                  {typingUsers?.filter((item: User) => item.id != user?.id).map((user: User) => (
                  <li key={user.id}>
                    <TypingMessage user={user}></TypingMessage>
                  </li>
                  ))}
               </ol>
            <div ref={scrollTarget}></div>
          </div>
          <NewMessageForm
            newMessage={newMessage}
            handleNewMessageChange={handleNewMessageChange}
            handleStartTyping={startTyping}
            handleStopTyping={stopTyping}
            handleSendMessage={handleSendMessage}
          ></NewMessageForm>
      </div>
    );
}    
