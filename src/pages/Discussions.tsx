import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { useSession } from "../hooks/useSession";
import { toast } from "react-toastify";

type Message = {
  id: string;
  contenu: string;
  created_at: string;
  auteur_id: string;
  profiles: {
    prenom: string;
    pseudo: string;
  };
  reactions: {
    utilisateur_id: string;
    emoji: string;
  }[];
};

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

export default function Discussions() {
  const { id } = useParams<{ id: string }>();
  const session = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("messages")
        .select("id, contenu, created_at, auteur_id, profiles(prenom, pseudo), reactions_messages(utilisateur_id, emoji)")
        .eq("voyage_id", id)
        .order("created_at", { ascending: true });

      if (error) {
        toast.error("Erreur chargement messages");
        return;
      }

      setMessages(data || []);
      setLoading(false);
      scrollToBottom();
    };

    fetchMessages();
  }, [id]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !session?.user?.id || !id) return;

    const { error } = await supabase.from("messages").insert({
      voyage_id: id,
      contenu: newMessage.trim(),
      auteur_id: session.user.id,
    });

    if (error) {
      toast.error("Erreur envoi message");
    } else {
      setNewMessage("");
      const { data: updated } = await supabase
        .from("messages")
        .select("id, contenu, created_at, auteur_id, profiles(prenom, pseudo), reactions_messages(utilisateur_id, emoji)")
        .eq("voyage_id", id)
        .order("created_at", { ascending: true });

      setMessages(updated || []);
      scrollToBottom();
    }
  };

  const handleReact = async (messageId: string, emoji: string) => {
    if (!session?.user?.id) return;

    const { error } = await supabase.from("reactions_messages").upsert({
      message_id: messageId,
      utilisateur_id: session.user.id,
      emoji
    }, { onConflict: ['message_id', 'utilisateur_id'] });

    if (error) {
      toast.error("Erreur réaction");
    } else {
      const { data: updated } = await supabase
        .from("messages")
        .select("id, contenu, created_at, auteur_id, profiles(prenom, pseudo), reactions_messages(utilisateur_id, emoji)")
        .eq("voyage_id", id)
        .order("created_at", { ascending: true });

      setMessages(updated || []);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white text-moovea-dark rounded-lg shadow h-[70vh] flex flex-col">
      <h2 className="text-3xl font-bold mb-4 animate-slideUp">💬 Discussions</h2>

      <div className="flex-1 overflow-y-auto border rounded p-4 bg-moovea-light/40 backdrop-blur-sm">
        {loading ? (
          <p className="text-center text-moovea-dark">Chargement...</p>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="mb-4">
              <p className="text-sm text-moovea-dark/70">
                <span className="font-semibold">{m.profiles?.prenom}</span>{" "}
                <span className="text-moovea-dark/50">@{m.profiles?.pseudo}</span> •{" "}
                {new Date(m.created_at).toLocaleString()}
              </p>
              <p className="bg-white border border-moovea-light/50 px-3 py-2 rounded mt-1 shadow-sm">
                {m.contenu}
              </p>
              <div className="flex gap-2 mt-1 ml-2 flex-wrap">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleReact(m.id, emoji)}
                    className={`text-xl ${m.reactions?.some(r => r.utilisateur_id === session?.user?.id && r.emoji === emoji) ? 'opacity-100' : 'opacity-40'} hover:opacity-100 transition-all`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              {m.reactions && m.reactions.length > 0 && (
                <p className="text-sm text-moovea-dark/60 mt-1 ml-2">
                  {m.reactions.map((r) => r.emoji).join(" ")}
                </p>
              )}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="mt-4 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 border px-3 py-2 rounded bg-white text-moovea-dark"
          placeholder="💬 Écris ton message..."
        />
        <button
          type="submit"
          className="bg-accent hover:bg-accent-dark text-white px-5 py-2 rounded-full shadow transition-all"
        >
          Envoyer
        </button>
      </form>
    </div>
  );
}
