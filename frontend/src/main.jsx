import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./redux/store";
import { Provider, useSelector } from "react-redux";
import { CategoryProvider } from "./components/hooks/CategoryContext.jsx";
import { SocketProvider } from "./components/hooks/socketContext.jsx";

// Create a wrapper component to access Redux
function Root() {
  const { currentUser } = useSelector((state) => state.user);

  return (
    <CategoryProvider>
      <BrowserRouter>
        <ToastContainer position="top-right" autoClose={5000} />
        <SocketProvider userId={currentUser?.user?.id}>
          <App />
        </SocketProvider>
      </BrowserRouter>
    </CategoryProvider>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Root />
      </PersistGate>
    </Provider>
  </StrictMode>
);
