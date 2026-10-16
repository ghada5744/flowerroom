"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-store";
import { formatNaira } from "@/lib/format";

type Variant = { id: string; name: string; priceKobo: number; color: string | null };
type Addon = {
  id: string;
  name: string;
  slug?: string;
  type: string;
  priceKobo: number;
  imageUrl: string | null;
  backSoon: boolean;
};

type Props = {
  productId: string;
  slug: string;
  productName: string;
  imageUrl?: string | null;
  variants: Variant[];
  wrappers: Addon[];
  cards: Addon[];
  treats: Addon[];
  balloons: Addon[];
  /** Gift sets already include cake/card/balloons — hide optional extras */
  isGiftSet?: boolean;
};

function hasOwnPhoto(url: string | null | undefined) {
  if (!url) return false;
  return url.startsWith("/uploads/") || url.includes("supabase.co");
}

function ExtraChoices({
  items,
  selectedIds,
  onToggle,
  showMore,
  onToggleMore,
}: {
  items: Addon[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  showMore: boolean;
  onToggleMore: () => void;
}) {
  const visible = showMore ? items : items.slice(0, 6);
  return (
    <>
      <div className="flex flex-wrap gap-2">
        {visible.map((item) => {
          const active = selectedIds.includes(item.id);
          const photo = hasOwnPhoto(item.imageUrl);
          return (
            <button
              key={item.id}
              type="button"
              disabled={item.backSoon}
              onClick={() => onToggle(item.id)}
              className={`extra-chip ${photo ? "has-photo" : ""} ${active ? "is-active" : ""}`}
            >
              {photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.imageUrl!} alt="" className="extra-chip-photo" />
              )}
              <span>
                <span className="block">{item.name}</span>
                {item.backSoon ? (
                  <span className="extra-chip-meta">Back soon</span>
                ) : item.priceKobo > 0 ? (
                  <span className="extra-chip-meta">{formatNaira(item.priceKobo)}</span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
      {items.length > 6 && (
        <button type="button" className="mt-2 text-[12px] text-muted underline" onClick={onToggleMore}>
          {showMore ? "Show less" : "Show more"}
        </button>
      )}
    </>
  );
}

export function ProductConfigurator({
  productId,
  slug,
  productName,
  imageUrl,
  variants,
  wrappers,
  cards,
  treats,
  balloons,
  isGiftSet = false,
}: Props) {
  const [variantId, setVariantId] = useState(variants[0]?.id || "");
  const [wrapperId, setWrapperId] = useState(wrappers[0]?.id || "");
  const [cardId, setCardId] = useState(cards.find((c) => c.priceKobo === 0)?.id || cards[0]?.id || "");
  const [extraIds, setExtraIds] = useState<string[]>([]);
  const [showMoreCards, setShowMoreCards] = useState(false);
  const [showMoreTreats, setShowMoreTreats] = useState(false);
  const [showMoreBalloons, setShowMoreBalloons] = useState(false);
  const addItem = useCart((s) => s.addItem);
  const router = useRouter();

  const selected = useMemo(
    () => variants.find((v) => v.id === variantId) || variants[0],
    [variants, variantId],
  );
  const wrapper = wrappers.find((w) => w.id === wrapperId);
  const card = cards.find((c) => c.id === cardId);
  const allExtras = [...treats, ...balloons];
  const selectedExtras = allExtras.filter((g) => extraIds.includes(g.id));

  const total =
    (selected?.priceKobo || 0) +
    (wrapper?.priceKobo || 0) +
    (card?.priceKobo || 0) +
    selectedExtras.reduce((n, g) => n + g.priceKobo, 0);

  const enquireOnly = (selected?.priceKobo || 0) <= 0;
  const cardIsComplimentary =
    !!card &&
    (card.slug === "card-message-free" || card.name.toLowerCase().includes("complimentary"));
  const hasUnpricedExtras =
    selectedExtras.some((g) => g.priceKobo <= 0) ||
    (!!card && card.priceKobo <= 0 && !cardIsComplimentary);
  const needsWhatsApp = enquireOnly || hasUnpricedExtras;
  const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "2349155353128";

  const waMessage = encodeURIComponent(
    [
      `Hello Flower Room NG — I’d like a quote for: ${productName}`,
      selected ? `Option: ${selected.name}` : null,
      selectedExtras.length ? `Extras: ${selectedExtras.map((g) => g.name).join(", ")}` : null,
      card ? `Card: ${card.name}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  function toggleExtra(id: string) {
    setExtraIds((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));
  }

  function addToCart() {
    if (!selected || needsWhatsApp) return;
    const extras = [
      wrapper ? `Wrap: ${wrapper.name}` : null,
      card ? `Card: ${card.name}` : null,
      ...selectedExtras.map((g) => g.name),
    ]
      .filter(Boolean)
      .join(" · ");

    addItem({
      productId,
      variantId: selected.id,
      slug,
      productName,
      variantName: extras ? `${selected.name} · ${extras}` : selected.name,
      imageUrl,
      unitKobo: total,
    });
    router.push("/cart");
  }

  const showExtras = !isGiftSet && !enquireOnly;
  const buyButton = needsWhatsApp ? (
    <a href={`https://wa.me/${wa}?text=${waMessage}`} target="_blank" rel="noopener noreferrer" className="btn-cart">
      Enquire on WhatsApp
    </a>
  ) : (
    <button type="button" onClick={addToCart} className="btn-cart">
      Add to cart
    </button>
  );

  return (
    <div className="space-y-6">
      {!enquireOnly && (
        <p className="font-display text-3xl text-ink">{formatNaira(selected?.priceKobo || 0)}</p>
      )}
      {enquireOnly && (
        <p className="text-[15px] leading-relaxed text-[#555]">
          Custom quote — message us on WhatsApp and we&apos;ll confirm availability and price for you.
        </p>
      )}

      {variants.length > 1 && !enquireOnly && (
        <div>
          <p className="mb-2 text-[12px] font-semibold tracking-[0.12em] text-muted uppercase">Size</p>
          <div className="size-options">
            {variants.map((v) => {
              const active = v.id === variantId;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVariantId(v.id)}
                  className={`option-chip ${active ? "is-active" : ""}`}
                >
                  <span className="block">{v.name}</span>
                  {v.priceKobo > 0 && <span className="option-chip-price">{formatNaira(v.priceKobo)}</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {!needsWhatsApp && total !== (selected?.priceKobo || 0) && (
          <p className="text-sm text-muted">
            Total with options: <strong className="text-ink">{formatNaira(total)}</strong>
          </p>
        )}
        {hasUnpricedExtras && !enquireOnly && (
          <p className="text-[13px] text-[#555]">
            An extra has no set price yet — continue on WhatsApp so we can confirm the total.
          </p>
        )}
        {buyButton}
      </div>

      {showExtras && (wrappers.length > 0 || cards.length > 0 || treats.length > 0 || balloons.length > 0) && (
        <div className="space-y-5 border-t border-[#eadfce] pt-5">
          <p className="text-[12px] font-semibold tracking-[0.14em] text-muted uppercase">Optional extras</p>

          {wrappers.length > 0 && (
            <div>
              <p className="mb-2 text-[13px] text-[#333]">Wrapper</p>
              <ExtraChoices
                items={wrappers}
                selectedIds={wrapperId ? [wrapperId] : []}
                onToggle={setWrapperId}
                showMore={false}
                onToggleMore={() => undefined}
              />
            </div>
          )}

          {cards.length > 0 && (
            <div>
              <p className="mb-2 text-[13px] text-[#333]">Card</p>
              <ExtraChoices
                items={cards}
                selectedIds={cardId ? [cardId] : []}
                onToggle={setCardId}
                showMore={showMoreCards}
                onToggleMore={() => setShowMoreCards((v) => !v)}
              />
            </div>
          )}

          {treats.length > 0 && (
            <div>
              <p className="mb-2 text-[13px] text-[#333]">Treat</p>
              <ExtraChoices
                items={treats}
                selectedIds={extraIds}
                onToggle={toggleExtra}
                showMore={showMoreTreats}
                onToggleMore={() => setShowMoreTreats((v) => !v)}
              />
            </div>
          )}

          {balloons.length > 0 && (
            <div>
              <p className="mb-2 text-[13px] text-[#333]">Balloons</p>
              <ExtraChoices
                items={balloons}
                selectedIds={extraIds}
                onToggle={toggleExtra}
                showMore={showMoreBalloons}
                onToggleMore={() => setShowMoreBalloons((v) => !v)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
