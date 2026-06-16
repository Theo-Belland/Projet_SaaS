import { useEffect, useState } from "react";

interface Message {
  _id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
  replies?: { text: string; sentAt: string }[];
}

export default function Inbox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySending, setReplySending] = useState(false);

  const fetchMessages = () => {
    fetch("http://localhost:3000/api/contact", {
      headers: {
        Authorization: localStorage.getItem("token") || "",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setMessages(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const markAsRead = async (id: string) => {
    await fetch(`http://localhost:3000/api/contact/${id}/read`, {
      method: "PATCH",
    });
  };

  const handleOpenMessage = async (message: Message) => {
    await markAsRead(message._id);
    setSelectedMessage(message);
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Supprimer ce message ?")) return;
    await fetch(`http://localhost:3000/api/contact/${id}`, {
      method: "DELETE",
    });
    setSelectedMessage(null);
    fetchMessages();
  };

  const handleReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;
    setReplySending(true);
    try {
      const res = await fetch(
        `http://localhost:3000/api/contact/${selectedMessage._id}/reply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reply: replyText }),
        }
      );
      if (res.ok) {
        setReplyText("");
        // Rafraîchir les messages pour voir la nouvelle réponse
        fetchMessages();
        // Réouvrir le message pour voir la réponse
        const updatedMessages = await fetch("http://localhost:3000/api/contact").then(r => r.json());
        const updatedMessage = updatedMessages.find((m: Message) => m._id === selectedMessage._id);
        if (updatedMessage) {
          setSelectedMessage(updatedMessage);
        }
        alert("Réponse envoyée !");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'envoi");
    } finally {
      setReplySending(false);
    }
  };

  const unreadCount = messages.filter(
    (message) => !message.read
  ).length;

  if (loading) {
    return <p>Chargement...</p>;
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Inbox</h2>
          <p className="text-sm text-slate-500">
            Gère les messages reçus depuis ton formulaire de contact.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm w-full sm:w-auto">
          <p className="text-sm font-medium text-slate-500">
            Messages non lus
          </p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {unreadCount}
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-semibold">
            Derniers messages
          </h3>
        </div>

        <div className="divide-y divide-slate-200">
          {messages.map((message) => (
            <article
              key={message._id}
              className={`p-6 ${
                !message.read
                  ? "bg-white"
                  : "bg-slate-50"
              } cursor-pointer hover:bg-slate-100 transition`}
              onClick={() => handleOpenMessage(message)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold">
                    {message.name}
                  </h4>

                  <p className="text-sm text-slate-500">
                    {message.email}
                  </p>
                </div>

                <span className="text-xs text-slate-400">
                  {new Date(
                    message.createdAt
                  ).toLocaleDateString("fr-FR")}
                </span>
              </div>

              <p className="text-slate-700 mb-3 truncate">
                {message.message}
              </p>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  !message.read
                    ? "bg-amber-100 text-amber-800"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {!message.read ? "Non lu" : "Lu"}
              </span>
            </article>
          ))}
        </div>
      </div>

      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-50 border-b border-slate-200 p-6 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-semibold">{selectedMessage.name}</h2>
                <p className="text-slate-600">{selectedMessage.email}</p>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-2xl text-slate-500 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-slate-500 mb-4">
                Reçu le {new Date(selectedMessage.createdAt).toLocaleDateString("fr-FR")}
              </p>
              <div className="bg-slate-50 p-4 rounded-lg mb-6 whitespace-pre-wrap border-l-4 border-blue-500">
                <strong>{selectedMessage.name}</strong>
                <p className="text-sm text-slate-600 mb-2">{selectedMessage.email}</p>
                {selectedMessage.message}
              </div>

              {selectedMessage.replies && selectedMessage.replies.length > 0 && (
                <div className="mb-6 space-y-3">
                  <h4 className="font-semibold text-slate-700">Réponses :</h4>
                  {selectedMessage.replies.map((reply, idx) => (
                    <div key={idx} className="bg-blue-50 p-4 rounded-lg border-l-4 border-green-500 whitespace-pre-wrap">
                      <p className="text-xs text-slate-500 mb-2">
                        {new Date(reply.sentAt).toLocaleDateString("fr-FR")} à {new Date(reply.sentAt).toLocaleTimeString("fr-FR")}
                      </p>
                      {reply.text}
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-4">
                <textarea
                  placeholder="Écris ta réponse..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-3 h-32"
                />

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => handleDeleteMessage(selectedMessage._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Supprimer
                  </button>
                  <button
                    onClick={handleReply}
                    disabled={!replyText.trim() || replySending}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {replySending ? "Envoi..." : "Répondre"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}