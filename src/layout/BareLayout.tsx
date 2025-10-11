import React from "react";
import { Outlet } from "react-router";

export default function BareLayout() {
  return (
    <main className="min-h-screen grid place-items-center bg-[var(--bg)]">
     
      <div className="w-full max-w-[32rem] px-4">
        <Outlet />
      </div>
    </main>
  );
}
