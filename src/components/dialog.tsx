import React, { useCallback, useLayoutEffect, useRef, type ReactNode } from "react";
import { navigate } from "astro:transitions/client";
import { CloseIcon } from "../icons/close";

export const Dialog = ({
  children,
  title,
}: React.PropsWithChildren<{ title: ReactNode }>) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const dialogOnBackdropClickHandler = useCallback((event: MouseEvent) => {
    if (dialogRef.current && event.target === dialogRef.current) {
      dialogRef.current.close();
    }
  }, []);

  useLayoutEffect(() => {
    const dialog = dialogRef.current;

    if (dialog) {
      dialog.showModal();
      dialog.addEventListener("click", dialogOnBackdropClickHandler);
    }

    return () => {
      if (dialog) {
        dialog.removeEventListener("click", dialogOnBackdropClickHandler);

        dialog.close();
      }
    };
  }, []);

  const handleClose = () => {
    navigate("/");
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/25 z-50 backdrop-blur-xs"
        onClick={() => {
          handleClose();
        }}
      ></div>
      <dialog
        ref={dialogRef}
        className="@[1000px]:top-1/2 @[1000px]:left-1/2 outline-none h-screen max-h-full @[1000px]:h-[80vh] flex flex-col @[1000px]:-translate-x-1/2 @[1000px]:-translate-y-1/2 bg-white px-6 pb-6 pt-4 @[1000px]:rounded-lg max-w-4xl w-full shadow-lg"
        onClose={() => {
          handleClose();
        }}
      >
        <div className="flex justify-between">
          <h1 className="font-ArchivoBlack text-4xl">{title}</h1>
          <button onClick={handleClose} className="cursor-pointer">
            <CloseIcon className="size-8" />
          </button>
        </div>
        {children}
      </dialog>
    </>
  );
};
