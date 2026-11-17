// Tworzy sesję Stripe Checkout dla koszyka ze sklepu.
// Ceny liczone są wyłącznie po stronie serwera z data/products.json,
// więc klient nie może ich zmienić. Wymaga zmiennej STRIPE_SECRET_KEY w Netlify.
import Stripe from "stripe";
import catalog from "../../data/products.json" with { type: "json" };

const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

export default async (req) => {
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return json(503, { error: "Płatności online nie są jeszcze skonfigurowane." });

  let body;
  try { body = await req.json(); } catch { return json(400, { error: "Nieprawidłowe dane." }); }
  const items = Array.isArray(body.items) ? body.items.slice(0, 30) : [];
  const c = body.customer || {};
  if (!items.length) return json(400, { error: "Koszyk jest pusty." });
  const phone = String(c.telefon || "").replace(/\D/g, "");
  if (phone.length < 9) return json(400, { error: "Brak numeru telefonu." });

  const line_items = [];
  const summary = [];
  for (const it of items) {
    const p = catalog.products.find((x) => x.id === it.id);
    if (!p) return json(400, { error: "Nieznany produkt." });
    if (p.from) return json(400, { error: "Ta pozycja jest wyceniana indywidualnie." });
    const size = catalog.sizes.find((s) => s.id === it.size) || catalog.sizes.find((s) => s.id === "M");
    const qty = Math.max(1, Math.min(20, parseInt(it.q, 10) || 1));
    const price = p.price + (p.cat === "bukiety" ? size.delta : 0);
    const card = String(it.card || "").slice(0, 160);
    line_items.push({
      quantity: qty,
      price_data: {
        currency: "pln",
        unit_amount: Math.round(price * 100),
        product_data: { name: `${p.name} (${size.name})`, ...(card ? { description: `Bilecik: ${card}` } : {}) },
      },
    });
    summary.push(`${qty}x ${p.name} ${size.id}${card ? ` [bilecik: ${card}]` : ""}`);
  }
  const delivery = c.odbior === "Dostawa";
  if (delivery) {
    line_items.push({
      quantity: 1,
      price_data: { currency: "pln", unit_amount: Math.round((catalog.delivery_fee || 0) * 100), product_data: { name: "Dostawa" } },
    });
  }

  const origin = new URL(req.url).origin;
  const cut = (s) => String(s || "").slice(0, 490);
  const stripe = new Stripe(key);
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: "pl",
      payment_method_types: ["blik", "card", "p24"],
      line_items,
      success_url: `${origin}/sukces.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/sklep.html?anulowano=1`,
      phone_number_collection: { enabled: false },
      metadata: {
        zamowienie: cut(summary.join(" | ")),
        imie: cut(c.imie),
        telefon: cut(phone),
        termin: cut(c.kiedy),
        odbior: cut(c.odbior),
        adres: cut(delivery ? c.adres : ""),
        uwagi: cut(c.uwagi),
      },
      payment_intent_data: { description: cut(`Kwiaciarnia Małgorzata: ${summary.join(", ")}`) },
    });
    return json(200, { url: session.url });
  } catch (e) {
    console.error(e);
    return json(502, { error: "Nie udało się utworzyć płatności." });
  }
};
