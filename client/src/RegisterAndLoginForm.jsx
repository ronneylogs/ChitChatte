import {useState,useContext} from "react";
import axios from "axios";
import {UserContext} from "./UserContext.jsx";

export default function RegisterAndLoginForm(){

    // REACT HOOKS
    // Username
    const [username, setUsername] = useState('');
    // Password
    const [password, setPassword] = useState('');
    // Username for registering id.
    const {setUsername:setLoggedInUsername,setId} =  useContext(UserContext);

    const[isLoginOrRegister, setIsLoginOrRegister] = useState('register');

    // 
    async function handleSubmit(ev) {
        ev.preventDefault();

        const url = isLoginOrRegister === 'register' ? 'register' : 'login';
        // Send a post rquest to backend with the username and password
        const {data} = await axios.post(url, {username,password});
        setLoggedInUsername(username);
        setId(data.id);
    }

    return(
        <div className="bg-blue-50 h-screen flex items-center">
            <form className="w-64 mx-auto mb-12" onSubmit={handleSubmit}>
                <input value={username}
                onChange={ev => setUsername(ev.target.value)} 
                type="text" 
                placeholder="username" 
                className="block w-full rounded-sm p-2 mb-2 border"/>

                <input value={password} 
                onChange={ev => setPassword(ev.target.value)} 
                type="password"
                placeholder="password" 
                className="block w-full rounded-sm p-2 mb-2 border" />

                <button className="bg-blue-500 text-white block w-full rounded-sm p-2">
                    {isLoginOrRegister === 'register' ? ' Register':' Login'}
                </button>
                <div className="text-center mt-2">
                    {isLoginOrRegister === 'register' && (
                        <div>
                            Already a member? 
                            <button onClick={()=> setIsLoginOrRegister('login')}> Login here</button>
                        </div>
                    )} 
                    {isLoginOrRegister === 'login' && (
                        <div>
                            Don't have an account? 
                            <button onClick={()=> setIsLoginOrRegister('register')}> Register here</button>
                        </div>
                    )}  
                 
                </div>
            </form>
        </div>
    );
} 