"use client";
import { useState, createContext, useContext } from "react";
import { Toast, ToastContainer } from "react-bootstrap";

const ToastContext = createContext<any>(null);
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: any) {
  const [toast, setToast] = useState({
    show: false,
    message: "",
    variant: "success",
  });

  const showToast = (message: string, variant: "success" | "danger" | "warning" | "info" = "success") => {
    setToast({ show: true, message, variant });

    setTimeout(() => {
      setToast((t) => ({ ...t, show: false }));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      <ToastContainer position="top-end" className="p-3">
        <Toast
          bg={toast.variant}
          show={toast.show}
          onClose={() => setToast((t) => ({ ...t, show: false }))}
        >
          <Toast.Body className="text-white">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </ToastContext.Provider>
  );
}