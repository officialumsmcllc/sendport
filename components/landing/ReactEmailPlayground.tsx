"use client";

import React, { useState } from "react";
import { Laptop, Smartphone, Sun, Moon, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

export type TemplateId = "welcome" | "reset" | "invoice" | "digest";

export function ReactEmailPlayground() {
  const [activeTemplate, setActiveTemplate] = useState<TemplateId>("welcome");
  const [deviceView, setDeviceView] = useState<"desktop" | "mobile">("desktop");
  const [themeMode, setThemeMode] = useState<"dark" | "light">("dark");

  const templates: { id: TemplateId; filename: string }[] = [
    { id: "welcome", filename: "user-welcome.tsx" },
    { id: "reset", filename: "reset-password.tsx" },
    { id: "invoice", filename: "saas-invoice.tsx" },
    { id: "digest", filename: "weekly-digest.tsx" },
  ];

  const templateCode: Record<TemplateId, string> = {
    welcome: `import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
} from '@react-email/components';
import * as React from 'react';

export const WelcomeEmail = ({ username = 'Steve' }) => {
  const previewText = \`Welcome to Acme, \${username}!\`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-black my-auto mx-auto font-sans">
          <Container className="border border-slate-800 rounded-2xl my-[40px] mx-auto p-[28px] max-w-[465px] bg-slate-950 text-white">
            <Section className="mt-[20px] text-center">
              <div className="w-12 h-12 rounded-full bg-primary-600/20 border border-primary-500/40 mx-auto flex items-center justify-center mb-4">
                <span className="text-xl">⚡</span>
              </div>
              <Heading className="text-white text-[22px] font-bold text-center p-0 my-[20px] mx-0">
                Welcome to Acme, {username}!
              </Heading>
              <Text className="text-slate-400 text-[14px] leading-[24px]">
                We are thrilled to have you onboard. Sendport empowers your team to send high-volume transactional emails with sub-10ms latency.
              </Text>
              <Section className="text-center mt-[28px] mb-[28px]">
                <Button
                  className="bg-white rounded-xl text-black text-[13px] font-semibold no-underline text-center px-6 py-3"
                  href="https://getsendport.com/dashboard"
                >
                  Get Started
                </Button>
              </Section>
              <Hr className="border border-slate-800 my-[24px] mx-0 w-full" />
              <Text className="text-slate-500 text-[12px] leading-[20px]">
                Sent with 2048-bit DKIM encryption from Sendport HQ.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};`,

    reset: `import { Html, Head, Preview, Body, Container, Heading, Text, Button } from '@react-email/components';

export const ResetPasswordEmail = ({ user = 'Alex' }) => (
  <Html>
    <Head />
    <Preview>Reset your Sendport password</Preview>
    <Body className="bg-slate-950 font-sans text-white p-6">
      <Container className="max-w-[460px] mx-auto border border-slate-800 rounded-2xl p-6 bg-slate-900">
        <Heading className="text-xl font-bold mb-3">Password Reset Request</Heading>
        <Text className="text-slate-400 text-sm mb-6">
          Hi {user}, we received a request to reset your password. Click the button below to choose a new secure password.
        </Text>
        <Button className="bg-rose-500 text-white font-semibold px-6 py-3 rounded-xl text-sm" href="#">
          Reset Password
        </Button>
        <Text className="text-xs text-slate-500 mt-6">This link expires in 15 minutes.</Text>
      </Container>
    </Body>
  </Html>
);`,

    invoice: `import { Html, Head, Preview, Body, Container, Heading, Text, Section } from '@react-email/components';

export const InvoiceEmail = ({ invoiceNumber = 'INV-2026-894', amount = '$79.00' }) => (
  <Html>
    <Head />
    <Preview>Receipt for Invoice {invoiceNumber}</Preview>
    <Body className="bg-slate-950 font-sans text-white p-6">
      <Container className="max-w-[460px] mx-auto border border-slate-800 rounded-2xl p-6 bg-slate-900">
        <Heading className="text-xl font-bold mb-1">Payment Received ✅</Heading>
        <Text className="text-slate-400 text-sm mb-4">Thank you for subscribing to Sendport Scale Pro.</Text>
        <Section className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-4">
          <div className="flex justify-between text-sm py-1"><span className="text-slate-400">Invoice:</span><span className="font-mono">{invoiceNumber}</span></div>
          <div className="flex justify-between text-sm py-1"><span className="text-slate-400">Total Paid:</span><span className="font-bold text-emerald-400">{amount}</span></div>
        </Section>
      </Container>
    </Body>
  </Html>
);`,

    digest: `import { Html, Head, Preview, Body, Container, Heading, Text } from '@react-email/components';

export const WeeklyDigest = ({ week = 'Week 40' }) => (
  <Html>
    <Head />
    <Preview>Your Weekly Deliverability Report</Preview>
    <Body className="bg-slate-950 font-sans text-white p-6">
      <Container className="max-w-[460px] mx-auto border border-slate-800 rounded-2xl p-6 bg-slate-900">
        <Heading className="text-xl font-bold mb-2">Weekly Summary — {week}</Heading>
        <Text className="text-slate-400 text-sm mb-4">You delivered 142,500 emails with a 99.8% primary inbox rate.</Text>
      </Container>
    </Body>
  </Html>
);`,
  };

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-primary-500/30 bg-primary-500/10 px-3.5 py-1 text-xs font-semibold text-primary-400 backdrop-blur mb-4">
          <Sparkles className="w-3.5 h-3.5 text-primary-400" />
          <span>React Email Component Library</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Develop emails using <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-primary-400 bg-clip-text text-transparent">React</span>
        </h2>
        <p className="mt-3 text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Create beautiful, bulletproof templates without having to deal with legacy &lt;table&gt; layouts and archaic HTML styling.
        </p>
      </div>

      {/* Split Window Container */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl overflow-hidden">
        {/* Top Controls Bar */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800/80 bg-slate-900/80 px-4 py-3 gap-3">
          {/* File Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => setActiveTemplate(tpl.id)}
                className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-mono transition-all ${
                  activeTemplate === tpl.id
                    ? "bg-slate-800 text-sky-400 border border-slate-700 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <span className="text-[10px] text-sky-500 font-bold">TS</span>
                <span>{tpl.filename}</span>
              </button>
            ))}
          </div>

          {/* Device & Theme Toggles */}
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg bg-slate-950 border border-slate-800 p-0.5">
              <button
                onClick={() => setDeviceView("desktop")}
                className={`p-1.5 rounded-md transition-colors ${
                  deviceView === "desktop" ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300"
                }`}
                title="Desktop View"
              >
                <Laptop className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setDeviceView("mobile")}
                className={`p-1.5 rounded-md transition-colors ${
                  deviceView === "mobile" ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300"
                }`}
                title="Mobile View"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center rounded-lg bg-slate-950 border border-slate-800 p-0.5">
              <button
                onClick={() => setThemeMode("dark")}
                className={`p-1.5 rounded-md transition-colors ${
                  themeMode === "dark" ? "bg-slate-800 text-amber-400" : "text-slate-500 hover:text-slate-300"
                }`}
                title="Dark Mode"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setThemeMode("light")}
                className={`p-1.5 rounded-md transition-colors ${
                  themeMode === "light" ? "bg-slate-800 text-amber-400" : "text-slate-500 hover:text-slate-300"
                }`}
                title="Light Mode"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Split Body */}
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          {/* Left: Code Editor */}
          <div className="p-5 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed max-h-[460px] overflow-y-auto bg-slate-950/80">
            <pre>{templateCode[activeTemplate]}</pre>
          </div>

          {/* Right: Live Rendered Preview */}
          <div
            className={`p-6 flex items-center justify-center min-h-[460px] transition-colors ${
              themeMode === "dark" ? "bg-black" : "bg-slate-100"
            }`}
          >
            <div
              className={`transition-all duration-300 shadow-2xl rounded-2xl border ${
                themeMode === "dark"
                  ? "bg-slate-950 text-white border-slate-800"
                  : "bg-white text-slate-900 border-slate-200"
              } ${deviceView === "mobile" ? "w-[320px] p-5" : "w-full max-w-[420px] p-6"}`}
            >
              {activeTemplate === "welcome" && (
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-primary-500/20 border border-primary-500/30 flex items-center justify-center mx-auto text-primary-400 text-xl font-bold">
                    ⚡
                  </div>
                  <h3 className="text-xl font-bold">Welcome to Acme, Steve!</h3>
                  <p className={`text-xs leading-relaxed ${themeMode === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                    We are thrilled to have you onboard. Sendport empowers your team to send high-volume transactional emails with sub-10ms latency.
                  </p>
                  <div className="pt-2">
                    <button className={`w-full py-2.5 rounded-xl font-semibold text-xs shadow-md transition-all ${
                      themeMode === "dark" ? "bg-white text-black hover:bg-slate-100" : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}>
                      Get Started Free
                    </button>
                  </div>
                  <div className={`text-[11px] pt-4 border-t ${themeMode === "dark" ? "border-slate-800 text-slate-500" : "border-slate-100 text-slate-400"}`}>
                    Sent with 2048-bit DKIM encryption from Sendport HQ.
                  </div>
                </div>
              )}

              {activeTemplate === "reset" && (
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold">
                    🔒
                  </div>
                  <h3 className="text-lg font-bold">Reset your password</h3>
                  <p className={`text-xs leading-relaxed ${themeMode === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                    Hi Alex, we received a request to reset your password. Click the button below to choose a new password.
                  </p>
                  <button className="w-full py-2.5 rounded-xl font-semibold text-xs bg-rose-600 text-white hover:bg-rose-500">
                    Reset Password
                  </button>
                  <p className="text-[10px] text-slate-500">This secure link expires in 15 minutes.</p>
                </div>
              )}

              {activeTemplate === "invoice" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">PAID</span>
                    <span className="text-xs font-mono text-slate-400">#INV-2026-894</span>
                  </div>
                  <h3 className="text-base font-bold">Invoice Receipt</h3>
                  <div className={`p-3 rounded-xl border space-y-1.5 text-xs font-mono ${
                    themeMode === "dark" ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"
                  }`}>
                    <div className="flex justify-between"><span className="text-slate-500">Plan:</span><span>Scale Pro ($79/mo)</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Quota:</span><span>100,000 / mo</span></div>
                    <div className="flex justify-between font-bold text-emerald-400 pt-1 border-t border-slate-800">
                      <span>Total:</span><span>$79.00 USD</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTemplate === "digest" && (
                <div className="space-y-3">
                  <h3 className="text-base font-bold">Weekly Performance 📊</h3>
                  <p className={`text-xs ${themeMode === "dark" ? "text-slate-400" : "text-slate-600"}`}>
                    Your domains achieved a 99.9% primary inbox placement rate this week.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-center pt-2">
                    <div className={`p-2.5 rounded-xl border ${themeMode === "dark" ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                      <p className="text-lg font-bold text-emerald-400">99.9%</p>
                      <p className="text-[10px] text-slate-500">Deliverability</p>
                    </div>
                    <div className={`p-2.5 rounded-xl border ${themeMode === "dark" ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                      <p className="text-lg font-bold text-sky-400">142.5k</p>
                      <p className="text-[10px] text-slate-500">Delivered</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
