"use client";

import Link from "next/link";
import { TimeLeft } from "./Countdown";
import { PrizeArt } from "./PrizeArt";
import {
  faNum,
  isOpen,
  ticketNo,
  ticketsOf,
  toman,
  winnerTicket,
  type Campaign,
  type Store,
} from "@/lib/raffle";

export function CampaignCard({ store, campaign }: { store: Store; campaign: Campaign }) {
  const sold = ticketsOf(store, campaign.id).length;
  const open = isOpen(campaign);
  const winner = winnerTicket(store, campaign);
  const pct = campaign.maxTickets ? Math.min(100, (sold / campaign.maxTickets) * 100) : 0;

  return (
    <article className="campaign-card">
      <div className={`campaign-art art-${campaign.icon}`}>
        <span className={`status-pill ${open ? "is-live" : "is-done"}`}>
          {open ? "● در حال فروش" : "قرعه‌کشی شد"}
        </span>
        <PrizeArt icon={campaign.icon} className="campaign-art-svg" />
      </div>
      <div className="campaign-body">
        <h3>{campaign.title}</h3>
        <p className="muted campaign-prize">{campaign.prize}</p>
        <div className="campaign-meta">
          <span>
            قیمت بلیط: <strong>{toman(campaign.ticketPrice)}</strong>
          </span>
          {open && <TimeLeft target={campaign.drawAt} />}
        </div>
        {open ? (
          <>
            <div className="sold-line">
              <span>
                {faNum(sold)} بلیط فروخته شده
                {campaign.maxTickets ? ` از ${faNum(campaign.maxTickets)}` : ""}
              </span>
            </div>
            {campaign.maxTickets > 0 && (
              <div className="progress">
                <div style={{ width: `${pct}%` }} />
              </div>
            )}
          </>
        ) : (
          <p className="winner-line">
            🏆 بلیط <strong>{ticketNo(campaign.winnerNumber!)}</strong>
            {winner && <> · {winner.buyerName}</>}
          </p>
        )}
        <Link href={`/draws/${campaign.id}`} className={`btn ${open ? "btn-primary" : ""} btn-block`}>
          {open ? "خرید بلیط" : "مشاهده نتیجه"}
        </Link>
      </div>
    </article>
  );
}
