import { AppRouter } from './router/AppRouter'
import { ThemeProvider } from './contexts/ThemeContext'
import { Toaster } from "react-hot-toast";
import './App.css'

function App() {
  return (
    <ThemeProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: { padding: "0px", margin: "0px" },
        }}
        containerStyle={{
          top: 70,      
          right: 20,
          zIndex: 999999,
        }}
      />
      <AppRouter />
    </ThemeProvider>
  );
}

export default App;

