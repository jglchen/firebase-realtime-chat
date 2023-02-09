import useSWR from 'swr';
import axios from 'axios';

export default function useMessages (roomid: string) {
   const fetcher = (url: string) => axios.get(url).then(res => res.data);
   const { data, error, mutate } = useSWR(`/api/rooms/${roomid}/messages`, fetcher);

   return {
      data,
      error,
      mutate
   };
} 
