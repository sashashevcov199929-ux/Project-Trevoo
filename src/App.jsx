import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainPage from "./pages/MainPage/MainPage";
import SecondPage from "./pages/SecondPage/SecondPage";
import AuthProvider from "./Context/AuthContext";

import PrivateRoute from "./Routes/PrivateRoute";
import RestorePassword from "./pages/MainPage/authModal/restorePassword";
import AuthModal from "./pages/MainPage/authModal/AuthModal";
import RegisterModal from "./pages/MainPage/authModal/RegisterModal";
import PublickRouter from "./Routes/PublickRoute";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/login"
            element={
              <PublickRouter>
                <AuthModal />
              </PublickRouter>
            }
          />
          <Route
            path="/register"
            element={
              <PublickRouter>
                <RegisterModal />
              </PublickRouter>
            }
          />
          <Route path="/" element={<MainPage />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <SecondPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/resetPassword"
            element={
              <PublickRouter>
                <RestorePassword />
              </PublickRouter>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
