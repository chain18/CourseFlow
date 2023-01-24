import "./App.css";
import { useAuth } from "./contexts/authentication.js";
import AuthenticatedApp from "./pages/AuthenticatedApp.js";
import UnauthenticatedApp from "./pages/UnauthenticatedApp.js";

function App() {
  const { isAuthenticated } = useAuth();
  return (
    <>
    {isAuthenticated ? <AuthenticatedApp /> : <UnauthenticatedApp />}
    </>
    );
}

export default App;
