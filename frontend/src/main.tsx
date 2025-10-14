import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { MantineProvider, createTheme, type MantineColorsTuple } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

import './index.css'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'

import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/homePage';
import XtermPage from './pages/xtermPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProblemsPage from './pages/ProblemsPage';
import ProblemDetailPage from './pages/ProblemDetailPage';
import ProfilePage from './pages/ProfilePage';


// React router system
const router = createBrowserRouter([
  {
    path: "/",
    Component: HomePage
  },
  {
    path: "/login",
    Component: LoginPage
  },
  {
    path: "/register",
    Component: RegisterPage
  },
  {
    path: "/problems",
    Component: ProblemsPage
  },
  {
    path: "/problems/:id",
    Component: ProblemDetailPage
  },
  {
    path: "/profile",
    Component: ProfilePage
  },
  {
    path: "/profile/:id",
    Component: ProfilePage
  },
  {
    path: "/xterm",
    Component: XtermPage
  }
]);


// Mantine Theme system
const yellowTheme: MantineColorsTuple = [
  '#fdfce4',
  '#f8f6d3',
  '#f0ecaa',
  '#e7e17c',
  '#e0d856',
  '#dbd33e',
  '#d9d02f',
  '#c0b820',
  '#aaa317',
  '#928d03'
];

const theme = createTheme({
  colors: {
    yellowTheme
  },
  primaryColor: 'yellowTheme',
  fontFamily: "Roboto, sans-serif"
});


// Main app
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MantineProvider defaultColorScheme='dark' theme={theme}>
      <Notifications />
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </MantineProvider>
  </StrictMode>,
)
