import './App.css'
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {UserList} from "./components/user/UserList";
import {UserAdd} from "./components/user/UserAdd";
import {UserDetails} from "./components/user/UserDetails";
import {UserEdit} from "./components/user/UserEdit";
import {UserByWrittenChars} from "./components/statistics/UserByWrittenChars";
import {AppMenu} from "./components/AppMenu";
import {AppHome} from "./components/AppHome";
import {CssBaseline} from "@mui/material";
import {FolderList} from "./components/folders/FolderList";
import {FolderAdd} from "./components/folders/FolderAdd";
import {FolderDetails} from "./components/folders/FolderDetails";
import {FolderEdit} from "./components/folders/FolderEdit";
import {FileList} from "./components/files/FileList";
import {FileAdd} from "./components/files/FileAdd";
import {FileEdit} from "./components/files/FileEdit";
import {FileDetails} from "./components/files/FileDetails";
import {StatisticsHome} from "./components/statistics/StatisticsHome";
import {FoldersBySharedFiles} from "./components/statistics/FoldersBySharedFiles";
import {FilterUsersByCreatedDate} from "./components/filters/FilterUsersByCreatedDate";

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

                  <Route path="/folders" element={<FolderList/>}/>
                  <Route path="/folders/add" element={<FolderAdd/>}/>
                  <Route path="/folder/:id/details" element={<FolderDetails/>}/>
                  <Route path="/folder/:id/edit" element={<FolderEdit/>}/>

                  <Route path="/files" element={<FileList/>}/>
                  <Route path="/files/add" element={<FileAdd/>}/>
                  <Route path="/file/:id/details" element={<FileDetails/>}/>
                  <Route path="/file/:id/edit" element={<FileEdit/>}/>

                  <Route path="/statistics" element={<StatisticsHome/>}/>
                  <Route path="/statistics/users-by-chars-written" element={<UserByWrittenChars/>}/>
                  <Route path="/statistics/folders-by-shared-users" element={<FoldersBySharedFiles/>}/>

                  <Route path="/filters/users-by-created-date" element={<FilterUsersByCreatedDate/>}/>
              </Routes>
          </BrowserRouter>
      </>
  );
}

export default App;
