import useSWR from 'swr';
import axios from 'axios';

export default function useUsers (roomid: string) {
   const fetcher = (url: string) => axios.get(url).then(res => res.data);
   const { data, mutate, error } = useSWR(`/api/rooms/${roomid}/users`, fetcher);

   return {
      data,
      mutate,
      error
   };
}    