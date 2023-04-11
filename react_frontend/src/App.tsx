import './App.css'
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {UserList} from "./components/user/UserList";
import {UserAdd} from "./components/user/UserAdd";
import {UserDetails} from "./components/user/UserDetails";
import {UserDelete} from "./components/user/UserDelete";
import {UserEdit} from "./components/user/UserEdit";
import {UserByWrittenChars} from "./components/statistics/UserByWrittenChars";
import {AppMenu} from "./components/AppMenu";
import {AppHome} from "./components/AppHome";
import {CssBaseline} from "@mui/material";

function App() {
  return (
      <>
          <CssBaseline/>
          <BrowserRouter>
              <AppMenu/>
              <Routes>
                  <Route path="/" element={<AppHome/>}/>

                  <Route path="/users" element={<UserList/>}/>
                  <Route path="/users/add" element={<UserAdd/>}/>
                  <Route path="/user/:id/details" element={<UserDetails/>}/>
                  <Route path="/user/:id/edit" element={<UserEdit/>}/>

                  <Route path="/statistics/users-by-chars-written" element={<UserByWrittenChars/>}/>
              </Routes>
          </BrowserRouter>
      </>
  );
}

export default App;
