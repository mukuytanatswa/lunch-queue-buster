import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto prose prose-neutral">
            <h1 className="text-4xl font-bold mb-2">Terms and Conditions</h1>
            <p className="text-muted-foreground mb-10">Last updated: April 2026</p>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing or using the QuickBite platform, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you may not use our services. These terms apply to all users including students, staff, and vendors on the University of Cape Town campus.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-3">2. Use of the Platform</h2>
              <p className="text-muted-foreground">
                QuickBite is a pre-order platform for food available at vendors on the UCT campus. Orders placed through QuickBite are for collection at the vendor's counter. QuickBite does not offer a delivery service. You must be a registered user to place orders, and you are responsible for ensuring that the account information you provide is accurate and up to date.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-3">3. Account Responsibilities</h2>
              <p className="text-muted-foreground">
                You are responsible for maintaining the confidentiality of your account credentials. Any activity that occurs under your account is your responsibility. If you suspect unauthorised access to your account, you must notify us immediately at info@getquickbite.co.za. QuickBite reserves the right to suspend or terminate accounts that violate these terms.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-3">4. Orders and Payment</h2>
              <p className="text-muted-foreground">
                Placing an order on QuickBite constitutes an offer to purchase. An order is only confirmed once the vendor accepts it and payment has been successfully processed. Payments are handled securely by PayFast. QuickBite does not store your card details. Prices displayed on vendor menus are set by the vendors and may change without prior notice.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-3">5. Cancellations and Refunds</h2>
              <p className="text-muted-foreground">
                You may cancel an order before the vendor has accepted it, and you will receive a full refund. Once a vendor has accepted your order and begun preparation, cancellations are subject to the vendor's own policy. Refunds for accepted orders will be considered on a case by case basis. To request a refund or cancellation, contact info@getquickbite.co.za.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-3">6. Prohibited Conduct</h2>
              <p className="text-muted-foreground mb-3">You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Use QuickBite for any unlawful purpose</li>
                <li>Submit false or fraudulent orders</li>
                <li>Attempt to gain unauthorised access to any part of the platform</li>
                <li>Interfere with or disrupt the platform or its infrastructure</li>
                <li>Impersonate any person or entity</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-3">7. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                QuickBite acts as an intermediary between users and vendors. We are not responsible for the quality, safety, or accuracy of food items provided by vendors. To the maximum extent permitted by law, QuickBite's liability for any claim arising from the use of the platform is limited to the value of the order in question.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-3">8. Governing Law</h2>
              <p className="text-muted-foreground">
                These Terms and Conditions are governed by and construed in accordance with the laws of the Republic of South Africa. Any disputes arising from these terms will be subject to the jurisdiction of the South African courts.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-semibold mb-3">9. Contact</h2>
              <p className="text-muted-foreground">
                If you have any questions about these Terms and Conditions, please contact us at{" "}
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

export default Terms;
