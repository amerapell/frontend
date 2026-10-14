"use client";
import { Modal } from "@/components/ui/Modal";
import { useUI } from "@/context/UIContext";

const CLOTHING = [
  ["XS", "6", "34", "2", "80", "62", "88"],
  ["S", "8", "36", "4", "84", "66", "92"],
  ["M", "10", "38", "6", "88", "70", "96"],
  ["L", "12", "40", "8", "93", "75", "101"],
  ["XL", "14", "42", "10", "98", "80", "106"],
];
const SHOES = [
  ["36", "3", "5.5", "23.0"],
  ["37", "4", "6.5", "23.7"],
  ["38", "5", "7.5", "24.4"],
  ["39", "6", "8.5", "25.1"],
  ["40", "6.5", "9", "25.7"],
  ["41", "7.5", "10", "26.4"],
  ["42", "8", "10.5", "27.0"],
  ["43", "9", "11.5", "27.7"],
  ["44", "9.5", "12", "28.3"],
];

/** PDP-5 size guide per category: clothing, or shoes EU/UK/US. */
export function SizeGuideModal() {
  const { sizeGuide, openSizeGuide } = useUI();
  const open = sizeGuide === "CLOTHING" || sizeGuide === "SHOES";
  return (
    <Modal open={open} onClose={() => openSizeGuide(null)} title={<>Size <em>guide</em></>} wide>
      {sizeGuide === "SHOES" ? (
        <>
          <p className="body-copy">Shoes are in EU sizes. Measure your foot from heel to longest toe, standing.</p>
          <table className="size-table">
            <thead><tr><th>EU</th><th>UK</th><th>US</th><th>FOOT (CM)</th></tr></thead>
            <tbody>{SHOES.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>)}</tbody>
          </table>
        </>
      ) : (
        <>
          <p className="body-copy">Most pieces fit true to size. Body measurements in centimetres.</p>
          <table className="size-table">
            <thead><tr><th>SIZE</th><th>UK</th><th>EU</th><th>US</th><th>BUST</th><th>WAIST</th><th>HIP</th></tr></thead>
            <tbody>{CLOTHING.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>)}</tbody>
          </table>
        </>
      )}
      <p className="mono-xs" style={{ marginTop: 16 }}>BETWEEN SIZES? ASK A STYLIST ON WHATSAPP — WE REPLY FAST.</p>
    </Modal>
  );
}
