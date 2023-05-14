import {useEffect,useState,useContext} from "react";
import Avatar from "./Avatar";
import Logo from "./Logo";
import {UserContext} from "./UserContext.jsx";
import _, { uniqBy } from 'lodash';

export default function Chat(){

    const[selectedUserId,setSelectedUserId] = useState(null);

    // Connect to wss here
    const [ws,setWs] = useState(null);
    const [onlinePeople,setOnlinePeople] = useState({});
    const {username,id} = useContext(UserContext);
    const [newMessageText,setNewMessageText] = useState('');
    const [messages,setMessages] = useState([]);

    // To stream new information coming from wss
    useEffect(()=>{
        const ws = new WebSocket('ws://localhost:4040');
        setWs(ws);

        // listening to changes in handle message
        ws.addEventListener('message',handleMessage)

    },[]);


    // Loops through the people array and displays each userId's username
    function showOnlinePeople(peopleArray){
        const people = {};
        peopleArray.forEach(({userId,username}) => {
            people[userId] = username;
        });

        // Update the object for the new people
        setOnlinePeople(people);

    }

    function handleMessage(ev){
        const messageData = JSON.parse(ev.data);

        // online is the name set in the server code for online users
        if('online' in messageData){
            showOnlinePeople(messageData.online);
        }
        else if('text' in messageData) {
            setMessages(prev=> ([...prev,{...messageData}]));
        }
    }

    function sendMessage(ev){
        ev.preventDefault();

        ws.send(JSON.stringify({
            recipient: selectedUserId,
            text: newMessageText,
        }));
        setNewMessageText('');
        setMessages(prev =>([...prev,{
            text:newMessageText,
            sender: id,
            recipient: selectedUserId,
            id: Date.now(),
        }]));

    }

    // Gets rid of own profile
    const onlinePeopleExclOurUser =  {...onlinePeople};
    delete onlinePeopleExclOurUser[id];

    // Gets rid of double message issue with lodash
    const messagesWithoutDupes = uniqBy(messages,'id');



    return(
        <div className="flex h-screen">
            <div className="bg-white w-1/3">
            <Logo/>
      
                    {/* Goes over each online person and displays their username given userId */}
                {Object.keys(onlinePeopleExclOurUser).map(userId => (
                    <div key={userId} onClick={() => setSelectedUserId(userId)} 
                        className={"border-b border-gray-100 py-2 pl-4 flex items-center gap-2 cursor-pointer " +(userId === selectedUserId? 'bg-blue-50': '')}>
                        {userId === selectedUserId && (
                        <div className="w-1 bg-blue-500 h-12 rounded-r-md"></div>
                        )}
                        <div className="flex gap-2 py-2 pl-4 items-center">
                            <Avatar username={onlinePeople[userId]} userId={userId}/>
                            <span className="text-grey-800">{onlinePeople[userId]}</span>
                        </div>


                    </div>
                ))}
            </div>
            <div className="flex flex-col bg-blue-50 w-2/3 py-2">
                <div className="flex-grow">
                    {!selectedUserId &&(
                        <div className ="flex h-full items-center justify-center">
                            <div className="text-gray-300">&larr; Select a person from the sidebar</div>
                        </div>
                    )}
                    {!!selectedUserId && (
                        <div className="relative">
                            <div className="overflow-y-scroll absolute inset-0">
                            {messagesWithoutDupes.map(message => (

                                <div className={(message.sender === id? 'text-right' : 'text-left')}>

                            
                                    <div className={"text-left inline-block p-2 my-2 rounded-sm text-sm " +(message.sender === id ? 'bg-blue-500 text-white ': 'bg-white text-gray-500')}>
                                        sender:{message.sender} <br/>
                                        my id: {id} <br/>
                                        {message.text}
                                    </div>
                                </div>

                            ))}

                            </div>
                        </div>
                        

                    )}
                </div>

                {!!selectedUserId && (
                <form className="flex gap-2" onSubmit={sendMessage}>
                    <input 
                    type="text" 
                    value = {newMessageText}
                    onChange = {ev => setNewMessageText(ev.target.value)}
                    placeholder="Type your message here" 
                    className="bg-white flex-grow border rounded-sm p-2 " />
                <button type="submit" className="bg-blue-500 p-2 text-white rounded-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                </button>
                </form>

                )}

            </div>
        </div>
    );



}