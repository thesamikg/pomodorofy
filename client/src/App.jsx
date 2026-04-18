import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";

import CustomCursor from "./components/CustomCursor";

const AppPage = lazy(() => import("./pages/AppPage"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const LandingPage = lazy(() => import("./pages/LandingPage"));

function App() {
  return (
    <>
      <CustomCursor />
      <Suspense
        fallback={
          <div className="page-shell flex min-h-screen items-center justify-center">
            <div className="glass-panel px-6 py-4 text-sm text-brand/65">
              Loading Pomodorofy...
            </div>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/signup" element={<AuthPage mode="signup" />} />
          <Route path="/app" element={<AppPage />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
