import { useState } from "react";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus("Remplis tous les champs ⚠️");
      return;
    }

    const res = await fetch("http://localhost:3000/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, email, message })
    });

    const data = await res.json();

    if (res.ok) {
      setStatus("Message envoyé 👍");
      setName("");
      setEmail("");
      setMessage("");
    } else {
      setStatus(`Erreur ❌ : ${data.error || "Erreur inconnue"}`);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1>Contact</h1>

      <form onSubmit={handleSubmit} className="space-y-3">

        <input
          placeholder="Nom"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 w-full"
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full"
        />

        <textarea
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border p-2 w-full"
        />

        <button className="bg-blue-600 text-white p-2 w-full">
          Envoyer
        </button>

      </form>

      <p>{status}</p>
    </div>
  );
}