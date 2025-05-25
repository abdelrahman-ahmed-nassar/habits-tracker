import React, { createContext, useContext, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  ToastContainer,
  ToastProps,
  ToastVariant,
} from "../components/ui/Toast";

interface ToastContextType {
  toasts: ToastProps[];
  addToast: (
    message: string,
    variant?: ToastVariant,
    duration?: number
  ) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (
    message: string,
    variant: ToastVariant = "info",
    duration: number = 5000
  ) => {
    const id = uuidv4();
    setToasts((prev) => [
      ...prev,
      {
        id,
        message,
        variant,
        duration,
        onClose: () => removeToast(id),
      },
    ]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
};

export default ToastContext;
