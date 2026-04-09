import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const faqs = [
  {
    question: "What is QuickBite?",
    answer:
      "QuickBite is a campus food pre-order platform built for the University of Cape Town. It lets students and staff browse menus from on-campus vendors, place their order in advance, and collect it at the counter when it is ready. There is no waiting in line.",
  },
  {
    question: "How do I place an order?",
    answer:
      "Create an account, browse the list of available vendors, add items to your cart, and complete payment. Once your order is confirmed, the vendor will prepare it and notify you when it is ready for collection.",
  },
  {
    question: "When will my order be ready?",
    answer:
      "Each vendor sets their own preparation time, which is displayed on their menu page. You will receive a notification on the app as soon as your order is ready to collect from the vendor's counter.",
  },
  {
    question: "Can I cancel an order?",
    answer:
      "You can cancel an order before the vendor has accepted it. Once a vendor has accepted and begun preparing your order, cancellations are at the vendor's discretion. To request a cancellation, contact us at info@getquickbite.co.za.",
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "QuickBite accepts card payments processed securely through PayFast. We support Visa, Mastercard, and instant EFT.",
  },
  {
    question: "Which vendors are available on QuickBite?",
    answer:
      "QuickBite is currently available to vendors operating on the UCT campus. You can view the full list of participating vendors on the Vendors page after signing in.",
  },
  {
    question: "Do I need an account to order?",
    answer:
      "Yes. You need to register with a valid email address to place orders. Registration is free and takes less than a minute.",
  },
  {
    question: "What if there is a problem with my order?",
    answer:
      "If your order is incorrect, missing items, or there is any other issue, please reach out to us at info@getquickbite.co.za and we will assist you as quickly as possible.",
  },
];

const FAQ = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-2">Frequently Asked Questions</h1>
            <p className="text-muted-foreground mb-10">
              Everything you need to know about ordering with QuickBite.
            </p>
            <div className="space-y-8">
              {faqs.map((item, index) => (
                <div key={index} className="border-b pb-8 last:border-b-0">
                  <h2 className="text-lg font-semibold mb-2">{item.question}</h2>
                  <p className="text-muted-foreground">{item.answer}</p>
                </div>
              ))}
            </div>
            <div className="mt-12 p-6 bg-primary/5 rounded-xl border border-primary/10">
              <p className="text-sm text-muted-foreground">
                Still have questions? Send us an email at{" "}
                <a
                  href="mailto:info@getquickbite.co.za"
                  className="text-primary hover:underline"
                >
                  info@getquickbite.co.za
                </a>{" "}
                and we will get back to you.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
