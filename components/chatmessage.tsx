import UserAvatar from "./useravatar";
import getDateString from '@/lib/getdatestring';
import styles from '@/styles/chatmessage.module.css';
import { Message } from '@/lib/types';

interface PropsType {
  message: Message;
  ownedByCurrentUser: boolean;
}

const ChatMessage = ({ message, ownedByCurrentUser }: PropsType) => {
    return (
      <div
        className={`${styles.messageItem} ${
          ownedByCurrentUser ? styles.myMessage : styles.receivedMessage
        }`}
      >
        {!ownedByCurrentUser && (
          <div className={styles.messageAvatarContainer}>
            <UserAvatar user={message.user!}></UserAvatar>
          </div>
        )}
        <div className={styles.messageBodyContainer}>
          <div className={styles.messageUserName}>{!ownedByCurrentUser && message.user?.name + ' @ '}{getDateString(message.sentAt)}</div>
          <div className={styles.messageBody}>{message.body}</div>
        </div>
      </div>
    );
};
  
export default ChatMessage;
  