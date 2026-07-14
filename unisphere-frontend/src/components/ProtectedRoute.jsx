import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = sessionStorage.getItem('token');
    
    if (!token) {
        // If there is no token, redirect the user to the login page
        return <Navigate to="/login" replace />;
    }
    
    // If the token exists, render the protected component
    return children;
};

export default ProtectedRoute;
