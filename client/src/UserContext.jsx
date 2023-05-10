import {createContext,useState,useEffect} from "react";
import axios from "axios";

export const UserContext = createContext({});

export function UserContextProvider({children}){

    // REACT HOOKS
    // Username
    const [username,setUsername] = useState(null);
    // Id
    const [id,setId] = useState(null);

    useEffect(() => {
        axios.get('/profile').then(response =>{
            setId(response.data.userId);
            setUsername(response.data.username);
        });
    },[]);

    return(
        <UserContext.Provider value={{username,setUsername,id,setId}}>
            {children}
        </UserContext.Provider>
    );

}