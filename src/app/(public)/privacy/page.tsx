export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Privacy Policy</h1>
      <p className="text-sm text-slate-400 mb-8">Last updated: January 2025 | Operated from United Arab Emirates</p>

      <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
        {[
          {
            title: "1. Introduction",
            body: "Tweenz AI ('we', 'us', 'our') operates www.tweenz.ae, a bilingual AI academic operating system for MBA and university students. This Privacy Policy explains how we collect, use, store, and protect your personal data in compliance with applicable laws including UAE data protection regulations."
          },
          {
            title: "2. Data We Collect",
            body: "We collect: (a) Account data — name, email, password hash, role; (b) Academic profile — university, program, semester, GPA target; (c) Course data — courses you create manually; (d) Uploaded files — lecture PDFs, PowerPoints, audio, video, notes; (e) Usage data — AI queries, study pack views, quiz attempts; (f) Payment data — subscription status, billing information managed by Stripe (we do not store full card numbers); (g) Communication data — messages, email logs; (h) Consent logs — records of your explicit consents."
          },
          {
            title: "3. How We Use Your Data",
            body: "We use your data to: (a) Provide the platform services; (b) Generate AI study packs, tutor chat, quizzes, and briefs grounded in your uploaded materials; (c) Process payments and manage subscriptions; (d) Send email digests when you request them; (e) Improve platform reliability and security; (f) Comply with legal obligations. We do NOT use your uploaded course materials to train AI models unless you explicitly opt in."
          },
          {
            title: "4. File Upload and AI Processing",
            body: "When you upload lecture files, slides, or notes, you explicitly consent to: (a) Secure storage of the file; (b) Text extraction, OCR, and transcription for study purposes; (c) Chunking and embedding for AI-powered tutor chat; (d) Generation of study packs, summaries, flashcards, and quizzes. This processing only occurs after your explicit consent and is used solely for your personal academic benefit. Files are not shared with other users."
          },
          {
            title: "5. Data Storage and Security",
            body: "Your data is stored in secure cloud infrastructure with encryption in transit (HTTPS/TLS) and encryption at rest where supported. We apply role-based access controls, audit logging, and least-privilege principles. Backups are encrypted."
          },
          {
            title: "6. Third-Party Services",
            body: "We use: (a) Supabase for database and authentication; (b) Stripe for payment processing; (c) OpenAI or Anthropic Claude for AI generation (your data is sent per their API terms); (d) Email providers for transactional emails; (e) S3-compatible storage for file storage. We select providers with appropriate data protection agreements."
          },
          {
            title: "7. Your Rights",
            body: "You have the right to: (a) Access your personal data; (b) Correct inaccurate data; (c) Delete your account and data; (d) Export your data; (e) Withdraw consent; (f) Object to processing. To exercise these rights, go to Settings > Privacy and Data, or contact privacy@tweenz.ae."
          },
          {
            title: "8. Data Retention",
            body: "We retain your data for as long as your account is active. After account deletion, personal data is deleted within 30 days, except where retention is required by law or for fraud prevention. Audit logs are retained for 12 months."
          },
          {
            title: "9. Cookies",
            body: "We use essential cookies for authentication and session management. We use analytics cookies only with your consent. You can manage cookie preferences in your browser settings."
          },
          {
            title: "10. Children",
            body: "Tweenz AI is designed for university students and professionals aged 18 and above. We do not knowingly collect data from children under 18."
          },
          {
            title: "11. Changes",
            body: "We may update this Privacy Policy from time to time. We will notify you by email or in-platform notice of significant changes at least 14 days before they take effect."
          },
          {
            title: "12. Contact",
            body: "For privacy questions, data requests, or concerns: privacy@tweenz.ae | Tweenz AI, United Arab Emirates"
          },
        ].map((s, i) => (
          <div key={i}>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">{s.title}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl">
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">سياسة الخصوصية — ملاحظة باللغة العربية</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          سياسة الخصوصية الكاملة متاحة باللغة العربية. نحن نلتزم بحماية بياناتك الشخصية وفقاً للأنظمة المعمول بها. للاستفسار: privacy@tweenz.ae
        </p>
      </div>
    </div>
  );
}
