import { useState } from "react";
import { RouterProvider } from "react-router-dom";
import router from "./routers/router.jsx";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors />
    </>
  );
}

export default App;
