"use client";

import { useRef } from "react";

type Props = {
  action: (formData: FormData) => Promise<void>;
};

export function Form({ action }: Props) {
  const ref = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={ref}
      action={async (formData) => {
        await action(formData);
        ref.current?.reset();
      }}
      className="max-w-md mx-auto flex flex-col space-y-4"
    >
      <label className="flex flex-col">
        <span className="mb-1 text-gray-700">タイトル:</span>
        <input
          type="text"
          name="title"
          className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </label>
      <label className="flex flex-col">
        <span className="mb-1 text-gray-700">説明:</span>
        <input
          type="text"
          name="description"
          className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </label>
      <button
        type="submit"
        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition duration-300 ease-in-out"
      >
        送信
      </button>
    </form>
  );
}
