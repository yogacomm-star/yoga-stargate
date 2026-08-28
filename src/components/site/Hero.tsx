"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

type HeroProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  backgroundImage?: string;
  /** "left" = testo allineato a sinistra sopra la foto (stile hero home) */
  align?: "center" | "left";
  children?: ReactNode;
};

export default function Hero({
  eyebrow,
  title,
  subtitle,
  primaryCta,
  secondaryCta,
  backgroundImage,
  align = "center",
  children,
}: HeroProps) {
  const onPhoto = !!backgroundImage;
  const left = align === "left";

  return (
    <section className="relative overflow-hidden">
      {onPhoto ? (
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <Image src={backgroundImage} alt="" fill priority sizes="100vw" className="object-cover" />
          {left ? (
            <div className="absolute inset-0 bg-gradient-to-r from-[#0f2d40]/85 via-[#0f2d40]/55 to-[#0f2d40]/15" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-[#0f2d40]/80 via-[#0f2d40]/60 to-background" />
          )}
        </div>
      ) : (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 0.5, scale: 1 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-secondary/50 blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 0.4, scale: 1 }}
            transition={{ duration: 1.4, delay: 0.2, ease: "easeOut" }}
            className="absolute top-10 right-[-6rem] h-80 w-80 rounded-full bg-mystic/25 blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 0.35, scale: 1 }}
            transition={{ duration: 1.4, delay: 0.35, ease: "easeOut" }}
            className="absolute bottom-[-4rem] left-1/3 h-72 w-72 rounded-full bg-accent/20 blur-3xl"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        </div>
      )}

      <div
        className={`mx-auto px-4 py-24 sm:px-6 sm:py-32 ${
          left ? "max-w-6xl text-left" : "max-w-4xl text-center"
        }`}
      >
        <div className={left ? "max-w-2xl" : undefined}>
          {eyebrow && (
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`mb-4 inline-flex items-center rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide uppercase ${
                onPhoto ? "border-white/30 bg-white/10 text-white backdrop-blur-sm" : "border-border bg-card text-primary"
              }`}
            >
              {eyebrow}
            </motion.p>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`font-heading text-4xl font-semibold sm:text-5xl md:text-6xl ${onPhoto ? "text-white" : "text-foreground"}`}
          >
            {title}
          </motion.h1>

          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className={`mt-5 max-w-2xl text-lg sm:text-xl ${onPhoto ? "text-white/90" : "text-foreground/70"} ${
                left ? "" : "mx-auto"
              }`}
            >
              {subtitle}
            </motion.p>
          )}

          {(primaryCta || secondaryCta) && (
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className={`mt-8 flex flex-col gap-3 sm:flex-row ${left ? "items-start sm:items-center" : "items-center justify-center"}`}
            >
              {primaryCta && (
                <Link
                  href={primaryCta.href}
                  className="cursor-pointer rounded-lg bg-accent px-7 py-3.5 text-base font-semibold text-accent-foreground shadow-soft-md transition-transform hover:-translate-y-0.5"
                >
                  {primaryCta.label}
                </Link>
              )}
              {secondaryCta && (
                <Link
                  href={secondaryCta.href}
                  className={`cursor-pointer rounded-lg border-2 px-7 py-3.5 text-base font-semibold transition-transform hover:-translate-y-0.5 ${
                    onPhoto ? "border-white text-white hover:bg-white/10" : "border-primary text-primary"
                  }`}
                >
                  {secondaryCta.label}
                </Link>
              )}
            </motion.div>
          )}

          {children}
        </div>
      </div>
    </section>
  );
}
