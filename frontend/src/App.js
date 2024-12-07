import './App.css';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import { AuthProvider } from './context/AuthContext';
import DoctorDashboard from './pages/DoctorDashboard';
import NurseDashboard from './pages/NurseDashboard';


function App() {
  return (
    <div className="App">
        <AuthProvider>
          <Routes>
            <Route exact path='/' element={<LoginPage />}></Route>
            <Route exact path='/admin' element={<AdminDashboard />}></Route>
            <Route exact path='/doctor' element={<DoctorDashboard />}></Route>
            <Route exact path='/nurse' element={<NurseDashboard />}></Route>

          </Routes>
        </AuthProvider>
    </div>
  );
}

export default App;
