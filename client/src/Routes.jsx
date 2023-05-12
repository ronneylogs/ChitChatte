import RegisterAndLoginForm from "./RegisterAndLoginForm";
import Chat from "./Chat";
import {useContext} from "react";
import {UserContext} from "./UserContext.jsx"

export default function Route(){
    const {username,id} = useContext(UserContext);


    if(username){
        return <Chat/>;
    }


    return(
        <RegisterAndLoginForm/>
    );

}