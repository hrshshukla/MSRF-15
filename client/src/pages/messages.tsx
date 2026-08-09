import { useEffect, useState } from "react";
import { Mail, MailOpen, RefreshCw } from "lucide-react";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { getApiErrorMessage, readApiResponse } from "@/lib/api-response";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
const API = `${BASE}/api`;

type ContactMessage = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  createdAt: string;
  readAt: string | null;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function MessagesPage() {
  const { accessToken, user } = useAuth();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function loadMessages(showRefreshState = false) {
    if (!accessToken) return;
    if (showRefreshState) setIsRefreshing(true);
    else setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/contact/messages`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const body = await readApiResponse<ContactMessage[] | { error?: string }>(response);
      if (!response.ok) {
        const errorBody = body && !Array.isArray(body) ? body : null;
        throw new Error(getApiErrorMessage(response, errorBody, "Unable to load messages"));
      }
      setMessages(Array.isArray(body) ? body : []);
      await markMessagesRead();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load messages");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  async function markMessagesRead() {
    if (!accessToken) return;
    const response = await fetch(`${API}/contact/messages/read`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) return;
    window.dispatchEvent(new CustomEvent("contact-messages-read"));
  }

  useEffect(() => {
    void loadMessages();
  }, [accessToken]);

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return <Redirect to="/settings" />;
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-primary">
            <Mail className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-[0.18em]">Inbox</span>
          </div>
          <h2 className="font-serif text-3xl font-bold text-foreground">Messages</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Contact form messages received from visitors and members.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => void loadMessages(true)}
          disabled={isLoading || isRefreshing}
          className="gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-2xl border bg-card p-12 text-center text-sm text-muted-foreground shadow-sm">
          Loading messages…
        </div>
      ) : messages.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card p-12 text-center shadow-sm">
          <MailOpen className="mx-auto mb-4 h-10 w-10 text-primary/50" />
          <h3 className="font-serif text-xl font-bold">No messages yet</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            New messages submitted through the Contact Us form will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm font-semibold text-muted-foreground">
            {messages.length} {messages.length === 1 ? "message" : "messages"}
          </p>
          {messages.map((message) => (
            <article key={message.id} className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h3 className="break-words font-serif text-xl font-bold text-foreground">
                    {message.subject}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
                    <a className="font-semibold text-primary hover:underline" href={`mailto:${message.email}`}>
                      {message.name}
                    </a>
                    <span className="break-all">{message.email}</span>
                    {message.phone && <span>{message.phone}</span>}
                  </div>
                </div>
                <time className="shrink-0 text-xs text-muted-foreground" dateTime={message.createdAt}>
                  {formatDate(message.createdAt)}
                </time>
              </div>
              <p className="mt-5 whitespace-pre-wrap border-t pt-5 text-sm leading-7 text-foreground/80">
                {message.message}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}