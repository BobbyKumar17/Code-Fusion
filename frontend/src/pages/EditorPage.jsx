import React, { useEffect, useRef, useState } from 'react';
import Client from '../components/Client';
import logo from "../assets/image.png";
import CodeEditor from '../components/CodeEditor';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { initSocket } from '../socket';
import ChatBox from '../components/ChatBox';

const EditorPage = () => {
    const socketRef = useRef(null);
    const codeRef = useRef(null);
    const mssgRef = useRef(null);
    const languageRef = useRef(null);
    const inputRef = useRef(null);
    const outputRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [clients, setClients] = useState([]);
    const { roomId } = useParams();

    useEffect(() => {
        const init = async () => {
            try {
                socketRef.current = await initSocket();

                socketRef.current.on('connect_error', handleErrors);
                socketRef.current.on('connect_failed', handleErrors);

                function handleErrors(err) {
                    console.error('Socket error', err);
                    toast.error('Socket Connection Failed, try again later.');
                }

                socketRef.current.emit('join', {
                    roomId: roomId,
                    username: location.state?.username
                });

                socketRef.current.on('joined', ({ clients, username, socketId }) => {
                    if (username !== location.state?.username) {
                        toast.success(`${username} has joined the room.`);
                    }
                    setClients(clients);

                    if (codeRef.current) {
                        socketRef.current.emit('sync-code', {
                            code: codeRef.current,
                            socketId,
                        });
                    }
                    if (mssgRef.current) {
                        socketRef.current.emit('sync-mssg', {
                            allMssg: mssgRef.current,
                            socketId
                        });
                    }
                    if (languageRef.current) {
                        socketRef.current.emit('sync-lang', {
                            lang: languageRef.current,
                            socketId
                        });
                    }
                    if (inputRef.current) {
                        socketRef.current.emit('sync-input', {
                            inp: inputRef.current,
                            socketId,
                        });
                    }
                    if (outputRef.current) {
                        socketRef.current.emit('sync-output', {
                            out: outputRef.current,
                            socketId
                        });
                    }
                });

                socketRef.current.on('disconnected', ({ socketId, username }) => {
                    toast.success(`${username} has left the room.`);
                    setClients(prev => prev.filter(client => client.socketId !== socketId));
                });
            } catch (err) {
                console.error('Failed to initialize socket', err);
            }
        };

        init();

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current.off('joined');
                socketRef.current.off('disconnected');
                socketRef.current.off('connect_error');
                socketRef.current.off('connect_failed');
            }
        };
    }, [roomId, location.state?.username]);

    const copyRoomId = async () => {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success('Room ID copied to clipboard');
        } catch (err) {
            toast.error(`Couldn't copy Room ID`);
            console.error("Error while copying room ID", err);
        }
    };

    const leaveRoom = () => {
        navigate('/');
    };

    if (!location.state || !location.state.username) {
        return <Navigate to="/" />;
    }

    return (
        <div className="mainWrap">
            <div className="aside h-screen">
                <div className="asideInner">
                    <div className="logo">
                        <img className="logoImage" src={logo} alt="logo" />
                    </div>
                    <h3>Connected</h3>
                    <div className="clientsList h-3/5 overflow-auto">
                        {clients.map(client => (
                            <Client key={client.socketId} username={client.username} />
                        ))}
                    </div>
                </div>
                <button className="btn copyBtn" onClick={copyRoomId}>Copy ROOM ID</button>
                <button className="btn leaveBtn" onClick={leaveRoom}>Leave</button>
            </div>
            <div className="editorWrap">
                <CodeEditor
                    socketRef={socketRef}
                    roomId={roomId}
                    onCodeChange={(code) => { codeRef.current = code; }}
                    onLanguageChange={(language) => { languageRef.current = language; }}
                    onInputChange={(inp) => { inputRef.current = inp; }}
                    onOutputChange={(out) => { outputRef.current = out; }}
                />
            </div>
            <div className="chatArea">
                <ChatBox socketRef={socketRef} onMssgChange={(data) => { mssgRef.current = data; }} />
            </div>
        </div>
    );
};

export default EditorPage;
