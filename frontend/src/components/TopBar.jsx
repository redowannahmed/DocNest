// import { User, LogOut } from "lucide-react"
// import "../css/TopBar.css"

// export default function TopBar({ user, onLogout }) {
//   return (
//     <header className="dashboard-header">
//       <div className="header-container">
//         <div className="header-content">
//           <div className="header-left">
//             <div className="user-icon-box">
//               <User className="user-icon" />
//             </div>
//             <div>
//               <h1 className="dashboard-title">
//                 Patient Dashboard
//               </h1>
//               <p className="welcome-text">
//                 Welcome, <span className="user-name">{user?.name || "Patient"}</span>
//               </p>
//             </div>
//           </div>
//           <div className="header-right">
//             {onLogout && (
//               <button
//                 onClick={onLogout}
//                 className="btn-destructive"
//               >
//                 <LogOut className="logout-icon" />
//                 Logout
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </header>
//   )
// }