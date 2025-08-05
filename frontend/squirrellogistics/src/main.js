import React from "react";
import reactDOM from 'react-dom/client'
import App from './App'
import {BrowserRouter} from 'react-router-dom'

reactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <App/>
    </BrowserRouter>
)
