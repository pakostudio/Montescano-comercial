"use client";
import { useRef, useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { interests, type Product } from "../lib/catalog-types";
export default function LeadForm({
  product,
  initialInterest = "Retail / distribución",
  context = "contacto",
}: {
  product?: Product;
  initialInterest?: string;
  context?: string;
}) {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");
  const requestId = useRef<string | null>(null);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading") return;
    const data = Object.fromEntries(new FormData(e.currentTarget));
    requestId.current ??= crypto.randomUUID();
    setStatus("loading");
    try {
      const r = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          consent: data.consent === "on",
          product_id: product?.id,
          source_context: context,
          request_id: requestId.current,
        }),
      });
      const json = await r.json();
      if (!r.ok) throw new Error(json.error);
      setStatus("success");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Inténtalo de nuevo.");
      setStatus("error");
    }
  }
  if (status === "success")
    return (
      <motion.div
        role="status"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="form-success"
      >
        <p className="kicker">SOLICITUD RECIBIDA</p>
        <h3>Gracias por escribirnos.</h3>
        <p>
          Tu solicitud{product ? ` sobre ${product.sku}` : ""} quedó registrada
          para seguimiento comercial.
        </p>
      </motion.div>
    );
  return (
    <form onSubmit={submit} className="lead-form">
      <div className="form-heading">
        <p className="kicker">HABLEMOS DE TU PROYECTO</p>
        <h2>Solicitar información</h2>
        {product && (
          <p>
            {product.brand} · {product.sku}
          </p>
        )}
      </div>
      <div className="form-fields">
        {[
          ["name", "Nombre", true, "text", 120],
          ["company", "Empresa", false, "text", 160],
          ["role", "Cargo", false, "text", 100],
          ["email", "Email", true, "email", 254],
          ["phone", "Teléfono", false, "tel", 40],
        ].map(([name, label, required, type, max]) => (
          <label key={String(name)}>
            {label}
            {required ? " *" : ""}
            <input
              name={String(name)}
              type={String(type)}
              required={Boolean(required)}
              maxLength={Number(max)}
              minLength={required ? 2 : undefined}
              autoComplete={
                name === "name"
                  ? "name"
                  : name === "email"
                    ? "email"
                    : name === "phone"
                      ? "tel"
                      : name === "company"
                        ? "organization"
                        : "organization-title"
              }
            />
          </label>
        ))}
        <label>
          Tipo de interés *
          <select name="interest" defaultValue={initialInterest}>
            {interests.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
      </div>
      <label>
        Mensaje *
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={3000}
          rows={4}
          placeholder="Cuéntanos qué modelos o solución buscas."
        />
      </label>
      <label className="honey" aria-hidden="true">
        Sitio web
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <label className="consent">
        <input type="checkbox" name="consent" required />
        <span>
          Autorizo a Montescano a usar estos datos para atender mi solicitud y
          contactarme.{" "}
          <a href="/privacidad" target="_blank" rel="noopener">
            Información sobre el formulario
          </a>
          .
        </span>
      </label>
      {status === "error" && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <motion.button
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="button primary"
        disabled={status === "loading"}
      >
        {status === "loading" ? "ENVIANDO…" : "ENVIAR SOLICITUD"}{" "}
        <span aria-hidden="true">↗</span>
      </motion.button>
      <p className="required-note">* Campos obligatorios</p>
    </form>
  );
}
