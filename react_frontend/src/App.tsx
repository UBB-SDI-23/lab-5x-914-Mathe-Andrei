import './App.css'
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {UserList} from "./components/user/UserList";
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
import {FoldersByNumFiles} from "./components/statistics/FoldersByNumFiles";
import {FilterUsersByCreatedDate} from "./components/filters/FilterUsersByCreatedDate";
import {Login} from "./components/auth/Login";
import {Register} from "./components/auth/Register";
import {ConfirmRegistration} from "./components/auth/ConfirmRegistration";
import {AuthProvider} from "./services/AuthProvider";
import {NotFound} from "./components/NotFound";
import {Authorization} from "./services/Authorization";
import {Roles} from "./models/Roles";
import {Unauthorized} from "./components/Unauthorized";
import {AdminDashboard} from "./components/admin/AdminDashboard";

function App() {
	return (
		<>
			<CssBaseline/>
			<BrowserRouter>
				<AuthProvider>
					<AppMenu/>
					<Routes>
						<Route path="/" element={<AppHome/>}/>
						<Route path="/unauthorized" element={<Unauthorized/>}/>

						<Route element={<Authorization allowedRoles={[Roles.GUEST]}/>}>
							<Route path="/login" element={<Login/>}/>
							<Route path="/register" element={<Register/>}/>
							<Route path="/register/confirm" element={<ConfirmRegistration/>}/>
						</Route>

						<Route element={<Authorization
							allowedRoles={[Roles.GUEST, Roles.USER, Roles.MODERATOR, Roles.ADMIN]}/>}>
							<Route path="/users" element={<UserList/>}/>
							<Route path="/user/:id/details" element={<UserDetails/>}/>

							<Route path="/folders" element={<FolderList/>}/>
							<Route path="/folder/:id/details" element={<FolderDetails/>}/>

							<Route path="/files" element={<FileList/>}/>
							<Route path="/file/:id/details" element={<FileDetails/>}/>

							<Route path="/statistics" element={<StatisticsHome/>}/>
							<Route path="/statistics/users-by-chars-written" element={<UserByWrittenChars/>}/>
							<Route path="/statistics/folders-by-num-files" element={<FoldersByNumFiles/>}/>

							<Route path="/filters/users-by-created-date" element={<FilterUsersByCreatedDate/>}/>
						</Route>

						<Route element={<Authorization allowedRoles={[Roles.USER, Roles.MODERATOR, Roles.ADMIN]}/>}>
							<Route path="/user/:id/edit" element={<UserEdit/>}/>

							<Route path="/folders/add" element={<FolderAdd/>}/>
							<Route path="/folder/:id/edit" element={<FolderEdit/>}/>

							<Route path="/files/add" element={<FileAdd/>}/>
							<Route path="/file/:id/edit" element={<FileEdit/>}/>
						</Route>

						<Route element={<Authorization allowedRoles={[Roles.ADMIN]}/>}>
							<Route path="/dashboard" element={<AdminDashboard/>}/>
						</Route>

						<Route path="*" element={<NotFound/>}/>
					</Routes>
				</AuthProvider>
			</BrowserRouter>
		</>
	);
}

export default App;
