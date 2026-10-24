import QRCode from "qrcode";
import TipJar from "@/components/tip-jar";
import { TIPS, tipUri } from "@/lib/tips";
import { searchMeta } from "@/lib/search-sections";

export const metadata = { title: "Tip jar | Bubble or Build" };

export default async function TipPage() {
  const qrSvgs: Record<string, string> = {};
  await Promise.all(
    TIPS.map(async (tip) => {
      qrSvgs[tip.label] = await QRCode.toString(tipUri(tip), {
        type: "svg",
        margin: 1,
        errorCorrectionLevel: "M",
      });
    })
  );

  return (
    <div
      className="search-section"
      {...searchMeta({
        id: "tip-jar",
        title: "Tip jar",
        kind: "Page",
        keywords: "tip jar donate support qr bitcoin ethereum",
      })}
    >
      <h1 className="page-title">Tip jar</h1>
      <p className="page-sub">
        Bubble or Build is free and independent. If the record-keeping is worth
        something to you, tips keep it running. Scan a QR code or copy an
        address.
      </p>
      <TipJar qrSvgs={qrSvgs} bare />
    </div>
  );
}
