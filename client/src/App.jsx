
import axios from "axios";
import {UserContextProvider} from "./UserContext";
import Routes from "./Routes";

function App() {

  // This is the base url for axios calls.
  axios.defaults.baseURL = "http://localhost:4040";

  // Indicates whether or not cross-site access-control requests should be made using credentials, such as cookies, authorization headers or certificates.
  axios.defaults.withCredentials = true;

  return (
    // <div className="bg-red-500">test</div>

    <UserContextProvider>
      <Routes/>
    </UserContextProvider>
    
  )
}

export default App
