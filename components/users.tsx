import UserAvatar from "./useravatar";
import styles from '@/styles/users.module.css';
import { User } from '@/lib/types';

interface PropsType {
  users: User[];
}

const Users = ({ users}: PropsType) => {
    return users?.length > 0 ? (
      <div>
        <h2>Also in this room:</h2>
        <ul className={styles.userList}>
          {users.map((user) => (
            <li key={user.id} className={styles.userBox}>
              <span>{user.name}</span>
              <UserAvatar user={user}></UserAvatar>
            </li>
          ))}
        </ul>
      </div>
    ) : (
      <div>There is no one else in this room</div>
    );
};
  
export default Users;
  