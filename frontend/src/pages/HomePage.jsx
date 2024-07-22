import React, { useState } from 'react';
import logo from '../assets/image.png';
import { Link, useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import toast from 'react-hot-toast';

const HomePage = () => {
    const navigate = useNavigate();
    const [roomId, setRoomId] = useState("");
    const [username, setUsername] = useState("");

    const createNewRoom = (e) => {
        e.preventDefault();
        const id = uuidv4();
        setRoomId(id);
        toast.success("New Room created successfully");
    };

    const joinRoom = (e) => {
        e.preventDefault();
        if (!roomId || !username) {
            toast.error("Room ID and Username are required");
            return;
        }
        navigate(`editor/${roomId}`, { state: { username } });
    };

    const handleInputEnter = (e) => {
        if (e.code === 'Enter') {
            joinRoom(e);
        }
    };

    return (
        <div className="homePageWrapper">
            <div className="formWrapper">
                <img className="homePageLogo" src={logo} alt="logo" />
                <h4 className="mainLabel">Enter invitation ROOM ID</h4>
                <div className="inputGroup">
                    <input
                        type="text"
                        className="inputBox w-full"
                        placeholder="ROOM ID"
                        onChange={(e) => setRoomId(e.target.value)}
                        value={roomId}
                        onKeyUp={handleInputEnter}
                    />
                    <input
                        type="text"
                        className="inputBox w-full"
                        placeholder="USERNAME"
                        onChange={(e) => setUsername(e.target.value)}
                        value={username}
                        onKeyUp={handleInputEnter}
                    />
                    <button className="btn joinBtn" onClick={joinRoom}>
                        Join
                    </button>
                </div>
                <span className="createInfo">
                    Don't have an invite? Create&nbsp;
                    <Link onClick={createNewRoom} to="" className="createNewBtn">new room</Link>
                </span>
            </div>
            <footer>
                <h4>
                    Built with 💛 by&nbsp;
                    <a href="https://github.com/BobbyKumar17">Bobby Kumar</a>
                </h4>
            </footer>
        </div>
    );
};

export default HomePage;
