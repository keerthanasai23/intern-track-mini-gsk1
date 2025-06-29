import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import InternshipForm from './components/InternshipForm';
import AuthForm from './components/AuthForm';
import './App.css';
import EditDetails from './components/EditDetails';

// Auth check utility
const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  return { isAuth: !!token, role };
};

// Protected Route Wrapper
const StudentRoute = () => {
  const { isAuth, role } = isAuthenticated();
  return isAuth && role === 'student' ? <Outlet /> : <Navigate to="/login" replace />;
};

const CoordinatorRoute = () => {
  const { isAuth, role } = isAuthenticated();
  return isAuth && role === 'coordinator' ? <Outlet /> : <Navigate to="/login" replace />;
};

// Auth Route Wrapper (for login/register when already authenticated)
const PublicRoute = () => {
  const { isAuth, role } = isAuthenticated();
  return !isAuth ? <Outlet /> : <Navigate to={role === 'student' ? '/internship-form' : '/coordinator-dashboard'} replace />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <h1>InternTrack</h1>
        <Routes>
          {/* Public routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<AuthForm type="login" />} />
            <Route path="/register" element={<AuthForm type="register" />} />
          </Route>

          {/* Student protected routes */}
          <Route element={<StudentRoute />}>
            <Route path="/internship-form" element={<InternshipForm />} />
            <Route path="/edit-details" element={<EditDetails />} />
            {/* View route removed as per new version */}
          </Route>

          {/* Coordinator protected route */}
          <Route element={<CoordinatorRoute />}>
            <Route path="/coordinator-dashboard" element={<div>Coordinator Dashboard</div>} />
          </Route>

          {/* Root redirect */}
          <Route 
            path="/" 
            element={
              (() => {
                const { isAuth, role } = isAuthenticated();
                if (!isAuth) return <Navigate to="/login" replace />;
                return <Navigate to={role === 'student' ? '/edit-details' : '/coordinator-dashboard'} replace />;
              })()
            } 
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;