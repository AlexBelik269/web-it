import { useState } from "react";

export default function BaseConverter() {
  const [binary, setBinary] = useState("");
  const [decimal, setDecimal] = useState("");
  const [hexadecimal, setHexadecimal] = useState("");

  const updateFromBinary = (value) => {
    setBinary(value);

    if (!value) {
      setDecimal("");
      setHexadecimal("");
      return;
    }

    if (!/^[01]+$/.test(value)) return;

    const dec = parseInt(value, 2);

    setDecimal(dec.toString(10));
    setHexadecimal(dec.toString(16).toUpperCase());
  };

  const updateFromDecimal = (value) => {
    setDecimal(value);

    if (!value) {
      setBinary("");
      setHexadecimal("");
      return;
    }

    if (!/^\d+$/.test(value)) return;

    const dec = parseInt(value, 10);

    setBinary(dec.toString(2));
    setHexadecimal(dec.toString(16).toUpperCase());
  };

  const updateFromHexadecimal = (value) => {
    setHexadecimal(value);

    if (!value) {
      setBinary("");
      setDecimal("");
      return;
    }

    if (!/^[0-9A-Fa-f]+$/.test(value)) return;

    const dec = parseInt(value, 16);

    setBinary(dec.toString(2));
    setDecimal(dec.toString(10));
  };

  return (
    <div
      style={{
        maxWidth: "500px",
        margin: "2rem auto",
        padding: "1.5rem",
        border: "1px solid #333",
        borderRadius: "12px",
      }}
    >
      <h2>Base Converter</h2>

      <div style={{ display: "grid", gap: "1rem" }}>
        <label>
          Binary
          <input
            type="text"
            value={binary}
            onChange={(e) => updateFromBinary(e.target.value)}
            placeholder="10101000"
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </label>

        <label>
          Decimal
          <input
            type="text"
            value={decimal}
            onChange={(e) => updateFromDecimal(e.target.value)}
            placeholder="168"
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </label>

        <label>
          Hexadecimal
          <input
            type="text"
            value={hexadecimal}
            onChange={(e) => updateFromHexadecimal(e.target.value)}
            placeholder="A8"
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </label>
      </div>
    </div>
  );
}