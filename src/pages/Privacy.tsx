import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
            <p className="text-muted-foreground mb-10">Last updated: April 2026</p>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-3">1. Introduction</h2>
              <p className="text-muted-foreground">
                QuickBite is committed to protecting your personal information in accordance with the Protection of Personal Information Act (POPIA) of South Africa. This Privacy Policy explains what information we collect, how we use it, and the rights you have regarding your data.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-3">2. Information We Collect</h2>
              <p className="text-muted-foreground mb-3">We collect the following information when you use QuickBite:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Your name and email address when you register</li>
                <li>Your phone number if provided during onboarding</li>
                <li>Your campus location preference</li>
                <li>Order history and transaction records</li>
                <li>Device and usage information for improving the platform</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-3">3. How We Use Your Information</h2>
              <p className="text-muted-foreground mb-3">We use your information to:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Process and manage your orders</li>
                <li>Send you order status notifications</li>
                <li>Provide customer support</li>
                <li>Improve the QuickBite platform and user experience</li>
                <li>Comply with legal and regulatory obligations</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                We do not sell your personal information to third parties.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-3">4. Data Storage and Security</h2>
              <p className="text-muted-foreground">
                Your data is stored securely using Supabase, a cloud database platform with industry-standard security practices. We take reasonable technical and organisational measures to protect your information against unauthorised access, loss, or misuse. However, no method of electronic storage is completely secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-3">5. Sharing of Information</h2>
              <p className="text-muted-foreground">
                We share your information only where necessary to provide the service. Vendors on the platform receive your name and order details so they can prepare your food. Payment information is processed by PayFast and is not stored by QuickBite. We do not share your data with any other third parties except as required by law.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-3">6. Your Rights under POPIA</h2>
              <p className="text-muted-foreground mb-3">Under POPIA, you have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your account and personal data</li>
                <li>Object to the processing of your information</li>
                <li>Lodge a complaint with the Information Regulator of South Africa</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                To exercise any of these rights, contact us at{" "}
                <a href="mailto:info@getquickbite.co.za" className="text-primary hover:underline">
                  info@getquickbite.co.za
                </a>.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-3">7. Cookies and Analytics</h2>
              <p className="text-muted-foreground">
                QuickBite may use cookies and similar technologies to improve your experience on the platform. These help us understand how users interact with the app so we can make improvements. You can disable cookies in your browser settings, although this may affect some functionality.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-3">8. Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. When we do, we will revise the date at the top of this page. We encourage you to review this policy periodically. Continued use of QuickBite after any changes constitutes your acceptance of the updated policy.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-3">9. Contact</h2>
              <p className="text-muted-foreground">
                If you have any questions or concerns about this Privacy Policy or how we handle your data, please contact us at{" "}
                <a href="mailto:info@getquickbite.co.za" className="text-primary hover:underline">
                  info@getquickbite.co.za
                </a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
