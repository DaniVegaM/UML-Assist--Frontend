import Header from "./Header";
import Footer from "./Footer";
import { Outlet } from "react-router";
import { Toaster } from "react-hot-toast";

export default function MainLayout() {
  return (
    <>
      <Header />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 5000,
          style: { padding: "0px", margin: "0px" },
        }}
        containerStyle={{ top: 20, right: 20 }}
      />

      <main className="mx-auto my-auto">
        <Outlet />
      </main>

      <Footer />
    </>
  );
}
