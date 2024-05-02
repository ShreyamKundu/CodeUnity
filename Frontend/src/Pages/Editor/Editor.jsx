import React from 'react';
import 'tailwindcss/tailwind.css';
import EDtor from '../../Components/EDtor';
import { EditorNav } from '../../Components';
import { useRef,useEffect,useState } from 'react';
import { useParams } from 'react-router-dom';
import { initializeSocket } from '../../socket';
import { axiosInstance } from '../../../utils';
import { useDispatch } from 'react-redux';
import { setTeam } from '../../../features/meetingSlice';



const Editor = () => {
  const socketRef = useRef(null);
  const { meetingId } = useParams();
  const [value, setValue] = useState('');
  const dispatch = useDispatch();
  useEffect(() => {
    const initSocket = async () => {
        if (!socketRef.current) {
            socketRef.current = await initializeSocket();
            socketRef.current.emit('joinRoom', meetingId);
            socketRef.current.on('userJoined', async ({ userId ,roomId}) => {
                console.log('A new user joined: ', userId);
                console.log('Room joined: ', roomId);
                try {
                  const response = await axiosInstance.post('/api/v1/project/showTeam',{roomId});
                  const {team} = response.data.workspace;
                  dispatch(setTeam(team));
                } catch (error) {
                  console.log(error);
                }
            });

            socketRef.current.on('code-sync', (code) => {
                setValue(code);
            });

            socketRef.current.on('disconnect',()=>{
              console.log('socket disconnected');
            })
        }
    };

    initSocket();

    // Proper cleanup to remove listeners
    return () => {
        if (socketRef.current) {
            socketRef.current.off('userJoined');
            socketRef.current.off('code-sync');
            socketRef.current.disconnect();
        }
    };
}, [meetingId]);

  return (
    <section className=' max-h-screen overflow-hidden w-full'>
      <EditorNav socketRef={socketRef}/>
      <EDtor socketRef={socketRef} value={value} setValue={setValue}/>
    </section>
  );
}

export default Editor;