import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Splash from "./Splash";
import WaveLanding from "./WaveLanding";
import App from "./App";
import LoginNew from "./LoginNew";
import Chat from "./Chat";
import ProfileNew from './ProfileNew';
import Projects from './Projects';
import TestDatabase from './TestDatabase';
import FirebaseTest from './components/FirebaseTest';
import PageTransition from "./PageTransition";
import ProtectedRoute from "./components/ProtectedRoute";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/splash" replace />} />
        <Route
          path="/splash"
          element={
            <PageTransition>
              <Splash />
            </PageTransition>
          }
        />
        <Route
          path="/landing"
          element={
            <PageTransition>
              <WaveLanding />
            </PageTransition>
          }
        />
        <Route
          path="/login"
          element={
            <ProtectedRoute requireAuth={false}>
              <PageTransition>
                <LoginNew />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/main"
          element={
            <ProtectedRoute requireAuth={true}>
              <PageTransition>
                <App />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute requireAuth={true}>
              <PageTransition>
                <Chat />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute requireAuth={true}>
              <PageTransition>
                <ProfileNew />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute requireAuth={true}>
              <PageTransition>
                <Projects />
              </PageTransition>
            </ProtectedRoute>
          }
        />
        <Route
          path="/test-db"
          element={
            <PageTransition>
              <TestDatabase />
            </PageTransition>
          }
        />
        <Route
          path="/firebase-test"
          element={
            <PageTransition>
              <FirebaseTest />
            </PageTransition>
          }
        />
        <Route path="*" element={<Navigate to="/splash" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
