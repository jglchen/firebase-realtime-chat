import Image from 'next/image';
import styles from '@/styles/useravatar.module.css';
import { User } from '@/lib/types';

interface PropsType {
  user: User;
}

const UserAvatar = ({ user }: PropsType) => {
    return (
      <Image
        src={user.picture}
        alt={user.name}
        title={user.name}
        width={28}
        height={28}
        className={styles.avatar}
      />
    );
  };
  
  export default UserAvatar;
  
