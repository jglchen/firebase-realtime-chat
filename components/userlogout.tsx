const UserLogOut = ({ userLogout }: { userLogout: () => void}) => {
    return (
        <div style={{marginLeft: 5, cursor: 'pointer'}} onClick={() => userLogout()}>Leave Room</div>
    );
}; 

export default UserLogOut;

  