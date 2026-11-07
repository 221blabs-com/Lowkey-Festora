/**
 * Ticket pricing — shared by the UI and the server. The server recomputes the
 * total from team size and never trusts an amount sent by the browser.
 */
export const TICKET_PRICE = 299; // ₹ per participant (online round)
export const PLATFORM_FEE = 6; // ₹ Festora platform fee per ticket
export const PER_TICKET_TOTAL = TICKET_PRICE + PLATFORM_FEE; // ₹305

export function quote(teamSize: number) {
  const tickets = TICKET_PRICE * teamSize;
  const fees = PLATFORM_FEE * teamSize;
  const total = tickets + fees;
  return { teamSize, tickets, fees, total, totalPaise: total * 100 };
}
