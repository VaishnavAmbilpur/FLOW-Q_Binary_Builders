import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Database, Lock, UserCheck, Bell } from "lucide-react";

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 font-sans selection:bg-brand-500/30">
            {/* Header */}
            <div className="w-full bg-white dark:bg-[#11162d] border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg group-hover:bg-brand-50 dark:group-hover:bg-brand-500/20 transition-colors">
                            <ArrowLeft className="w-4 h-4 text-neutral-600 dark:text-neutral-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors" />
                        </div>
                        <span className="font-bold text-sm text-neutral-600 dark:text-neutral-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">Back to Home</span>
                    </Link>
                    <div className="font-extrabold text-xl tracking-tight">
                        FLOW-<span className="text-brand-600 dark:text-brand-400">Q</span>
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <main className="max-w-4xl mx-auto px-6 py-12 md:py-20 animate-fade-up">
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-brand-50 dark:bg-brand-500/20 border border-brand-200 dark:border-brand-500/30 rounded-2xl flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">Privacy Policy</h1>
                    </div>
                    <p className="text-neutral-500 dark:text-neutral-400 font-medium">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>

                <div className="space-y-12 text-sm md:text-base leading-relaxed text-neutral-700 dark:text-neutral-300">

                    <section>
                        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                            <UserCheck className="w-5 h-5 text-brand-500" /> 1. Introduction
                        </h2>
                        <p className="mb-4">
                            Welcome to FLOW-Q ("Software," "we," "us," or "our"). We understand that in the healthcare and service industries, privacy is paramount. This Privacy Policy outlines how your personal information and patient data is collected, used, and protected when you use our queue management and real-time appointment platform.
                        </p>
                        <p>
                            By using FLOW-Q, either as a Hospital Administrator, Receptionist, Doctor, or End-User (Patient), you agree to the collection and use of information in accordance with this policy. We align our data principles securely and compliantly, offering features like Zero-PII modes and DPDP-aligned auto-erasure protocols.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                            <Database className="w-5 h-5 text-info-500" /> 2. Information We Collect
                        </h2>
                        <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 shadow-sm">
                            <h3 className="font-bold text-neutral-900 dark:text-white mb-2">For Organizations and Staff</h3>
                            <ul className="list-disc pl-5 space-y-2 mb-6">
                                <li><strong>Account Details:</strong> Admin and Staff names, professional email addresses, specializations, and encrypted passwords.</li>
                                <li><strong>Operational Data:</strong> Usage metrics, API keys, schedule hours, and audit logs of administrative actions.</li>
                            </ul>

                            <h3 className="font-bold text-neutral-900 dark:text-white mb-2">For Patients (End-Users)</h3>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Voluntary PII:</strong> Names, phone numbers, and optional contextual health descriptions provided during booking.</li>
                                <li><strong>Zero-PII Mode:</strong> If a hospital forces Zero-PII operation, FLOW-Q collects strictly anonymous UUIDs and token numbers without tying them to real identities.</li>
                                <li><strong>Tracking Metadata:</strong> Socket IDs and browser sessions to facilitate real-time WebSocket queue updates.</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-brand-500" /> 3. Data Protection and Encryption
                        </h2>
                        <p className="mb-4">
                            FLOW-Q takes data security rigorously. We deploy database-level field encryption for all highly sensitive Patient Identifiable Information (PII). This means that even if the database is illegally accessed, names and phone numbers remain cryptographically scrambled.
                        </p>
                        <p>
                            Our platform operates on a strictly separated Multi-Tenant Architecture. Data is logically isolated via specialized middleware to guarantee that queues and patient records are exclusively accessible only by authorized staff scoped to the exact hospital and branch origin.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
                            <Bell className="w-5 h-5 text-success-500" /> 4. Communications and Consent
                        </h2>
                        <p className="mb-4">
                            We may utilize automated algorithms to dispatch real-time SMS or WhatsApp notifications containing queue statuses or appointment reminders. We utilize a strict "Gatekeeper" protocol ensuring messages are uniquely bound to your explicitly granted Communication Consent schema. You may opt out of real-time messaging alerts at any time.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">5. Data Retention and Erasure (DSR)</h2>
                        <p className="mb-4">
                            In honoring privacy rights such as the DPDP and GDPR, FLOW-Q offers automated data lifecycle management. Hospitals can configure active retention limits (e.g., 30 days). Expired records, or those subject to explicit deletion requests, are systematically scrubbed of identifying traces—leaving behind only non-identifying statistical hashes required for analytics.
                        </p>
                        <p>
                            If you are a patient looking to invoke a Data Subject Request (DSR) to erase your data, please contact the specific hospital/clinic administration through which you registered your appointment queue. They uniquely hold the decryption keys required to process your request securely via our Admin Dashboard.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">6. Changes to This Privacy Policy</h2>
                        <p className="mb-4">
                            We reserve the right to update this Privacy Policy periodically. Continued use of the platform after updates have been published directly affirms your acknowledgement and agreement to the modified terms.
                        </p>
                    </section>
                </div>

                <div className="mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-800 text-center">
                    <p className="text-sm font-bold text-neutral-500 dark:text-neutral-400">
                        Have questions regarding compliance? Contact your hospital administrator or our support engineering team.
                    </p>
                </div>
            </main>
        </div>
    );
}
