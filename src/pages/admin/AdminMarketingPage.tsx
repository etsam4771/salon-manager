import { useMemo, useState } from "react";
import { HiOutlinePaperAirplane, HiOutlineChatAlt2 } from "react-icons/hi";
import { FaWhatsapp, FaSms } from "react-icons/fa";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import EmptyState from "../../components/admin/EmptyState";
import { useSalonData } from "../../hooks/useSalonData";
import { useToast } from "../../hooks/useToast";
import type { CampaignChannel } from "../../types/salon";

const AUDIENCES = ["All customers", "Frequent (10+ visits)", "Inactive"] as const;

const TEMPLATES: Record<string, string> = {
  "New service launch": "Hey {name}! We just added a new treatment we think you'll love. Book your spot this week for 15% off.",
  "Win-back inactive": "We miss you at Elanova, {name}! Come back this month and enjoy a complimentary add-on on us.",
  "Appointment reminder": "Hi {name}, just a reminder — your appointment is coming up. Reply CONFIRM to lock it in.",
  "Birthday offer": "Happy birthday, {name}! Celebrate with 20% off any service this month, on the house.",
};

export default function AdminMarketingPage() {
  const { customers, campaigns, sendCampaign } = useSalonData();
  const { showToast } = useToast();

  const [channel, setChannel] = useState<CampaignChannel>("WhatsApp");
  const [audience, setAudience] = useState<(typeof AUDIENCES)[number]>("All customers");
  const [templateName, setTemplateName] = useState("New service launch");
  const [message, setMessage] = useState(TEMPLATES["New service launch"]);

  const recipientCount = useMemo(() => {
    if (audience === "Frequent (10+ visits)") return customers.filter((c) => c.visits >= 10).length;
    if (audience === "Inactive") return customers.filter((c) => c.status === "Inactive").length;
    return customers.length;
  }, [customers, audience]);

  function handleSend() {
    if (!message.trim()) {
      showToast("Write a message before sending.", "warning");
      return;
    }
    if (recipientCount === 0) {
      showToast("No customers match this audience.", "warning");
      return;
    }
    sendCampaign({
      name: `${templateName} — ${audience}`,
      channel,
      messageTemplate: message,
      recipientCount,
    });
    showToast(`Campaign queued for ${recipientCount} recipient${recipientCount === 1 ? "" : "s"}.`, "success");
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminPageHeader title="Marketing" subtitle="Send SMS or WhatsApp campaigns to your client list" />

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Builder */}
        <div className="lg:col-span-2 bg-sand-light rounded-2xl border border-blush/60 p-6 md:p-8 flex flex-col gap-5">
          <div className="flex gap-2">
            {(["WhatsApp", "SMS"] as CampaignChannel[]).map((c) => (
              <button
                key={c}
                onClick={() => setChannel(c)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  channel === c
                    ? "bg-forest text-sand-light border-forest"
                    : "border-blush text-ink/60 hover:border-forest/40"
                }`}
              >
                {c === "WhatsApp" ? <FaWhatsapp size={13} /> : <FaSms size={13} />} {c}
              </button>
            ))}
          </div>

          <div>
            <label className="text-sm text-ink/70">Audience</label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value as (typeof AUDIENCES)[number])}
              className="mt-2 w-full rounded-lg border border-blush px-4 py-3 text-sm outline-none focus:border-forest transition-colors bg-white"
            >
              {AUDIENCES.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
            <p className="text-xs text-ink/40 mt-1.5">
              {recipientCount} recipient{recipientCount === 1 ? "" : "s"} match this audience.
            </p>
          </div>

          <div>
            <label className="text-sm text-ink/70">Template</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {Object.keys(TEMPLATES).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTemplateName(t);
                    setMessage(TEMPLATES[t]);
                  }}
                  className="px-3 py-1.5 rounded-full text-xs border border-blush text-ink/60 hover:border-forest/40 transition-colors"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-ink/70">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="mt-2 w-full rounded-lg border border-blush px-4 py-3 text-sm outline-none focus:border-forest transition-colors resize-none"
            />
            <p className="text-xs text-ink/40 mt-1.5">{message.length} characters · use {"{name}"} to personalize</p>
          </div>

          <button
            onClick={handleSend}
            className="self-start flex items-center gap-1.5 bg-forest text-sand-light rounded-full px-5 py-2.5 text-sm font-medium hover:bg-forest-dark transition-colors"
          >
            <HiOutlinePaperAirplane size={15} /> Send campaign
          </button>
        </div>

        {/* Preview */}
        <div className="bg-forest rounded-2xl p-6 flex flex-col gap-3">
          <p className="text-xs uppercase tracking-wide text-sand-light/50 font-mono">Preview</p>
          <div className="bg-sand-light rounded-2xl rounded-tl-sm p-4 text-sm text-ink">
            {message.replace("{name}", "Priya") || <span className="text-ink/40">Your message will appear here…</span>}
          </div>
        </div>
      </div>

      {/* Past campaigns */}
      <div>
        <h2 className="font-display text-xl text-ink mb-4">Past campaigns</h2>
        {campaigns.length === 0 ? (
          <EmptyState
            icon={HiOutlineChatAlt2}
            title="No campaigns sent yet"
            subtitle="Campaigns you send will show up here."
          />
        ) : (
          <div className="flex flex-col gap-2">
            {campaigns.map((c) => (
              <div
                key={c.id}
                className="bg-sand-light rounded-xl border border-blush/60 p-4 flex items-center gap-4"
              >
                {c.channel === "WhatsApp" ? (
                  <FaWhatsapp className="text-forest shrink-0" size={16} />
                ) : (
                  <FaSms className="text-forest shrink-0" size={16} />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-ink truncate">{c.name}</p>
                  <p className="text-xs text-ink/50 mt-0.5 truncate">{c.messageTemplate}</p>
                  <p className="text-xs text-ink/50 mt-0.5">
                    {c.recipientCount} recipients ·{" "}
                    {new Date(c.scheduledAt ?? c.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
