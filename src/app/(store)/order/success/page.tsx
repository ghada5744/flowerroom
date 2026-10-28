import Link from "next/link";
import { ClearCartOnMount } from "@/components/ClearCartOnMount";

type Props = { searchParams: Promise<{ reference?: string; order?: string; demo?: string }> };

export default async function OrderSuccessPage({ searchParams }: Props) {
  const sp = await searchParams;
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <ClearCartOnMount />
      <p className="text-xs tracking-[0.16em] uppercase text-magenta">Thank you</p>
      <h1 className="font-display mt-2 text-4xl">Order received</h1>
      <p className="mt-4 text-muted">
        {sp.demo
          ? "Paystack keys are not configured yet — this is a demo confirmation. Add your Paystack keys to enable live payments."
          : "Your payment was successful. We’ll arrange your flowers and send a video for approval before delivery."}
      </p>
      {(sp.order || sp.reference) && (
        <p className="mt-4 text-sm text-ink">
          {sp.order && (
            <>
              Order <strong>{sp.order}</strong>
              <br />
            </>
          )}
          {sp.reference && <>Reference: {sp.reference}</>}
        </p>
      )}
      <Link href="/shop" className="btn-primary mt-8 inline-flex">
        Continue shopping
      </Link>
    </div>
  );
}
