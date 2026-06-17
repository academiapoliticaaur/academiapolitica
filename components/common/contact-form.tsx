"use client";

import { useState, useRef } from "react";
import { sendContactEmail } from "@/lib/actions/contact";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const formData = new FormData(e.currentTarget);
    const result = await sendContactEmail(formData);

    if (result.success) {
      setStatus("success");
      formRef.current?.reset();
    } else {
      setStatus("error");
      setErrorMsg(result.error || "Eroare necunoscută.");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        <div className="text-4xl mb-3">✅</div>
        <p className="text-lg font-semibold text-green-800 mb-1">Mesaj trimis!</p>
        <p className="text-sm text-green-700">Îți vom răspunde în cel mai scurt timp la adresa de email furnizată.</p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-4 text-sm text-green-600 underline hover:text-green-800"
        >
          Trimite un alt mesaj
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Nume complet <span className="text-red-500">*</span>
          </label>
          <input
            name="name"
            type="text"
            required
            placeholder="Ex: Maria Ionescu"
            className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            name="email"
            type="email"
            required
            placeholder="Ex: maria@email.com"
            className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Mesaj <span className="text-red-500">*</span>
        </label>
        <textarea
          name="message"
          required
          rows={5}
          placeholder="Descrie problema sau întrebarea ta..."
          className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 resize-none"
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
      >
        {status === "loading" ? "Se trimite..." : "Trimite mesajul"}
      </button>
    </form>
  );
}
