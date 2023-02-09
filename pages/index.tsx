import { useState, useEffect, FormEvent } from "react";
import axios from "axios";
import { Beforeunload } from 'react-beforeunload';
import { isSupported } from "firebase/messaging";
import Layout from "@/components/layout";
import ChatRoom from "@/components/chatroom";
import apiconfig from "@/lib/apiconfig";
import { User } from '@/lib/types';
import { firebaseCloudMessaging } from '@/utils/webPush';
import styles from '@/styles/home.module.css';

export default function Home() {
   const [roomName, setRoomName] = useState("");
   const [user, setUser] = useState<User | null>();
   const [sdkSupported, setSdkSupported] = useState(true);
   
   //Check if the environment supports the firebase cloud messaging 
   useEffect(() => {
      isSupported()
      .then((supported) => {
         setSdkSupported(supported);
      })
      .catch((error) => {
         console.log(error);
      });
   },[]);

   const handleRoomNameChange = (event: FormEvent<HTMLInputElement>) => {
      setRoomName(event.currentTarget.value.replace(/<\/?[^>]*>/g, ""));
   };

   const enterRoom = async () => {
      if (!sdkSupported){
         setRoomName('');
         return;
      }
      if (!roomName){
         return;
      }

      let result: any;
      do {
         const response = await axios.get("https://api.randomuser.me/");
         result = response.data.results[0];
      }
      while(!result.id.name && !result.id.value);      
      const userData = {
         id: `${result.id.name}_${result.id.value?.replace(/ /g, '-')}`,
         name: result.name.first,
         picture: result.picture.thumbnail,
         email: result.email,
      };
      setUser(userData);
      const token = await firebaseCloudMessaging.init();
      const {data} = await axios.post(`/api/rooms/${roomName}/adduser`, { user: {...userData}, token }, apiconfig);
      if (data.id !== user?.id){
         setUser(data);
      }
   };

   function userLogout(){
      if (user){
         axios.delete(`/api/rooms/${roomName}/leaveroom`, {...apiconfig, data: {user}});
         setUser(null);
      }
      setRoomName('');
   }
  
   return (
   <Beforeunload onBeforeunload={(event) => {event.preventDefault(); userLogout();}}>
      <Layout>
         <>
         {user &&
         <ChatRoom 
            roomid={roomName}
            user={user}
            userLogout={userLogout}
         />
         }
         {!user &&
         <div className={styles.homeContainer}>
            <h1 style={{textAlign: 'center'}}>Chat Applications with Firebase Cloud Messaging</h1>
            <input
               type="text"
               placeholder="Room"
               value={roomName}
               onChange={handleRoomNameChange}
               className={styles.textInputField}
               />
            <div className={styles.enterRoomButton} onClick={() => enterRoom()}>
                Join room
            </div> 
            <div className={styles.remarkContainer}>
            {!sdkSupported && 
                <div style={{textAlign: 'center', color: 'red'}}>The browser you are currently using does not support Firebase Cloud Messaging SDK.</div>
            }
            We can successfully build a real-time chat application with <a href='https://nextjs.org/' target='_blank' rel='noreferrer'>Next.js</a> using <a href='https://socket.io/' target='_blank' rel='noreferrer'>Socket.IO</a>. The real-time communication however was found not to function well once the package is deployed to Vercel, which is a serverless platform. It is suggested by Vercel two main approaches to applying a real-time model to stateless serverless functions.
            <ol>
               <li>Serverless Functions have maximum execution limits and should respond as quickly as possible. They should not subscribe to data events. Instead, we need a client that subscribes to data events (such as <a href='https://ably.com/' target='_blank' rel='noreferrer'>Alby</a>, <a href='https://pusher.com/' target='_blank' rel='noreferrer'>Pusher</a>, etc.) and a serverless function that publishes new data.</li>
               <li>Rather than pushing data, we can fetch real-time data on-demand. For example, the Vercel dashboard delivers realtime updates using <a href='https://swr.vercel.app/' target='_blank' rel='noreferrer'>SWR</a>.</li>
            </ol>
            In this demonstration, we build a real-time chat application with <a href='https://firebase.google.com/products/cloud-messaging' target='_blank' rel='noreferrer'>Firebase Cloud Messaging</a>. The Firebase Cloud Messaging(FCM) JavaScript API lets you receive notification messages in web apps running in browsers that support the <a href='https://www.w3.org/TR/push-api/' target='_blank' rel='noreferrer'>Push API</a>. This includes the browser versions listed in this <a href='https://caniuse.com/push-api' target='_blank' rel='noreferrer'>support matrix</a> and Chrome extensions via the Push API.
            </div>
         </div>
         } 
         </>
      </Layout>
   </Beforeunload>   
   );
}    
