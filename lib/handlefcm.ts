import { User, Message, MessageFCM } from './types';

export function messageFCMToAPI (msg: MessageFCM): Message{
   const user = JSON.parse(msg.user as string);
   const sentAt = +msg.sentAt;
   const convertedMsg = {...msg, sentAt, user};
   delete convertedMsg.action;
   return convertedMsg;
}

export function sendBackToMessages(messages: Message[], msg: MessageFCM){
   const exists = messages?.find(
      ({ id }) => id === msg.id
   );
   if (exists){
      return messages;
   }
   
   const hanledMsg = messageFCMToAPI (msg);
   const messagesData = messages ? messages.filter((item: any) => 
      item.id !== 'temp'): [];
   messagesData.push(hanledMsg);
   return messagesData;
}
