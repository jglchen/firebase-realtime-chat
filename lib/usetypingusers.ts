import useSWR from 'swr';
import axios from 'axios';

export default function useTypingUsers (roomid: string) {
   const fetcher = (url: string) => axios.get(url).then(res => res.data);
   const { data, mutate, error } = useSWR(`/api/rooms/${roomid}/typingusers`, fetcher);

   return {
      data,
      mutate,
      error
   };
}    