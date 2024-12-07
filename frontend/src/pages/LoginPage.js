import { useNavigate } from 'react-router-dom';
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { login } from '../api/api';
import '../css/LoginPage.css';
import { Box, Button, TextField, Typography, Checkbox, FormControlLabel, Container, CssBaseline } from '@mui/material';
import { LockOutlined as LockIcon } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../context/AuthContext';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#1976d2' },
    background: { default: '#0d1b2a', paper: '#1b263b' },
    text: { primary: '#ffffff' },
  },
});

const LoginPage = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await login(form);
      const { access_token, role } = response.data;

      // Save the token in localStorage
      localStorage.setItem("jwt_token", access_token);

      console.log(role);

      // Save user and token in context
      setUser({role : role});

      // Redirect based on role
      if (role === 'Administrator') navigate('/admin');
      else if (role === 'Doctor') navigate('/doctor');
      else if (role === 'Nurse') navigate('/nurse');
      else setError('Unknown role.');
    } catch (err) {
      console.error('Login error:', err); // Log error for debugging
      setError('Invalid username or password'); // User-friendly error
    }
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <div className="background-animation">
        <Container component="main" maxWidth="xs">
          <CssBaseline />
          <Box
            sx={{
              marginTop: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: 'background.paper',
              padding: 4,
              borderRadius: 2,
              boxShadow: 3,
            }}
          >
            <Box
              sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                borderRadius: '50%',
                padding: 2,
                marginBottom: 2,
              }}
            >
              <LockIcon fontSize="large" />
            </Box>
            <Typography component="h1" variant="h5">
              Login
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={form.username}
                onChange={handleChange}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
              />
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Remember me"
              />
              {error && (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                  {error}
                </Typography>
              )}
              <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                Login
              </Button>
            </Box>
          </Box>
        </Container>
      </div>
    </ThemeProvider>
  );
};

export default LoginPage;
