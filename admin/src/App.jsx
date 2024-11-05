// routes
import AppRoutes from "./routes";

// Library components
import { ToastContainer } from "react-toastify";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";

// redux
import { store } from "./redux/store";

// styles
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

const persistor = persistStore(store);

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <div className="main_page">
          <AppRoutes />
          <ToastContainer theme="light" position="bottom-right" />
        </div>
      </PersistGate>
    </Provider>
  );
}

export default App;
