const apiconfig ={
    headers: {
       'Accept': 'application/json',
       'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_SECRECY}`
    }   
}
export default apiconfig;