import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {

    const [userName, setUserName] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.removeItem('loginToken');
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(
                `https://networthtrackerapi20240213185304.azurewebsites.net/api/Auth/getToken?email=${encodeURIComponent(userName)}&password=${encodeURIComponent(password)}`,
                {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' }
                }
            );

            if (response.ok) {
                const result = await response.json();
                console.log("Login successful:", result);

                localStorage.setItem('loginToken', result.token);
                navigate('/home');
            } else {
                localStorage.removeItem('loginToken');
                setErrorMessage('Invalid username or password');
            }

        } catch (error) {
            console.log("Login error:", error);
            setErrorMessage('Error logging in. Please try again.');
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>

            <form className="login-form" onSubmit={handleSubmit}>

                <input
                    type="text"
                    placeholder="Username"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                {errorMessage && (
                    <p className="error-text">{errorMessage}</p>
                )}

                <button type="submit">
                    Login
                </button>

            </form>
        </div>
    );
};

export default Login;