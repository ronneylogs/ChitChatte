import RegisterAndLoginForm from "./RegisterAndLoginForm";
import {useContext} from "react";
import {UserContext} from "./UserContext.jsx"

export default function Route(){
    const {username,id} = useContext(UserContext);


    if(username){
        return "logged in" +username;
    }


    return(
        <RegisterAndLoginForm/>
    );

}