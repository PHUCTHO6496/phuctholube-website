// English versions of the policies in ./policies.ts (same terms, confirmed
// by the owner on 2026-11-28). The Vietnamese text prevails if they differ;
// keep both in step when either changes.
import type { PolicySection } from "@/lib/policies";

type PolicyEn = { description: string; intro?: string; sections: PolicySection[] };

const OWNER =
  "CÔNG TY TNHH THƯƠNG MẠI PHÚC THỌ (tax code 3500378966), the owner and operator of www.phuctholube.com (“Phuc Tho”, “we” or “us”)";

export const POLICIES_EN: Record<string, PolicyEn> = {
  "bao-mat-thong-tin": {
    description:
      "What information Phuc Tho collects through this website, what we use it for, where it is stored and your rights over your personal data.",
    intro: `This policy explains how ${OWNER} collects, uses and protects your personal information when you use this website.`,
    sections: [
      {
        heading: "1. Information we collect",
        blocks: [
          "We only collect information you choose to submit through the forms on this website:",
          {
            list: [
              "Quote request: company name, contact person, phone number, email and address (optional), notes, and the products and quantities you want quoted.",
              "Contact form: full name, phone number or email, and your message.",
              "Handbook sign-up: full name, email, phone number, company name (optional) and your consent.",
            ],
          },
          "To stop automated (spam) submissions, when you sign up for the handbook we store a one-way hash of your IP address; it cannot be used to recover the original address.",
          "This website does not use advertising cookies or third-party tracking or analytics tools. Your browser keeps your quote cart and whether you closed the handbook invitation on your own device (localStorage); this data is not sent to our servers, and you can delete it by clearing this site's data in your browser.",
        ],
      },
      {
        heading: "2. How we use it",
        blocks: [
          {
            list: [
              "To contact you, send quotations and give the technical advice you asked for.",
              "To send the handbook and technical documents you signed up for.",
              "To process orders, deliver, invoice and provide after-sales support.",
              "To contact you with suitable product advice where you have agreed to this.",
            ],
          },
          "We do not use your information for any other purpose without your consent, unless the law requires otherwise.",
        ],
      },
      {
        heading: "3. How long we keep it",
        blocks: [
          "We keep information for as long as needed for the purposes above and for keeping records as required by law — at most 5 years from your last contact or transaction — or until you ask us to delete it, where the law allows.",
        ],
      },
      {
        heading: "4. Sharing",
        blocks: [
          "We do not sell, rent or trade your personal information. It is only shared:",
          {
            list: [
              "With the infrastructure providers that run this website (website and file hosting, database, email delivery), to the extent needed to provide their service.",
              "With carriers, when goods are delivered to you (recipient name, phone number, delivery address).",
              "With competent state authorities when required by law.",
            ],
          },
        ],
      },
      {
        heading: "5. Where it is stored",
        blocks: [
          "The website and its data are hosted on the cloud infrastructure of Vercel and Neon (the database server is in Singapore); emails are sent through Google's service. Your information may therefore be stored and processed outside Vietnam; we choose providers with appropriate security measures.",
        ],
      },
      {
        heading: "6. Security",
        blocks: [
          "The website uses encrypted HTTPS connections. Only authorised staff can access the administration area, and passwords are stored encrypted. No method of transmission or storage over the Internet is completely secure; if we become aware of an incident involving your data, we will handle it and notify you as required by law.",
        ],
      },
      {
        heading: "7. Your rights",
        blocks: [
          "You may ask to see, correct or delete your personal information, withdraw your consent or stop receiving product advice, in accordance with Vietnamese personal data protection law. Send your request by email or phone using the contact details below; we reply within 5 working days.",
        ],
      },
      {
        heading: "8. Changes to this policy",
        blocks: [
          "We may update this policy when we change how the website works or when the law changes. A new version takes effect from the date it is published on this page.",
        ],
      },
    ],
  },
  "dieu-khoan-giao-dich": {
    description:
      "Terms for using this website and buying lubricants from Phuc Tho: quotations, order confirmation, payment, documents and disputes.",
    intro: `These terms apply between you and ${OWNER}. By using this website or sending a quote request, you agree to the terms below.`,
    sections: [
      {
        heading: "1. Product information on this website",
        blocks: [
          "Product descriptions and specifications are compiled from the manufacturers' documents (TDS, MSDS) and are for reference only; packaging in photos may differ from actual products. When choosing an oil for your equipment, please check the equipment manufacturer's recommendations.",
          "The cross-brand equivalent product finder gives initial suggestions only and is not a confirmation that one product can replace another. Please contact Phuc Tho's technical team to confirm before changing the product you use.",
        ],
      },
      {
        heading: "2. Quotations and orders",
        blocks: [
          "Prices are not listed on this website and online payment is not accepted. Add products to the quote cart and send your request; Phuc Tho will contact you and send a quotation with prices, packaging, delivery time and terms.",
          "Quotations are valid for 15 days from the date sent unless stated otherwise. An order is confirmed when both parties confirm it in writing (an acknowledged purchase order, a confirmation email or a sales contract).",
        ],
      },
      {
        heading: "3. Payment and invoices",
        blocks: [
          "Payment methods: bank transfer to a bank account held in the company's registered name, CÔNG TY TNHH THƯƠNG MẠI PHÚC THỌ, or cash on delivery for orders under VND 5,000,000. Payment terms are as agreed in the quotation, order or contract.",
          "Phuc Tho issues an electronic VAT invoice for each order as required by law.",
        ],
      },
      {
        heading: "4. Quality and documents",
        blocks: [
          "Phuc Tho supplies genuine Shell, Mobil, Total and Castrol products. For Shell, Phuc Tho is a regional distribution partner within the network of C.L Market Development Services JSC, the master distributor appointed by Shell Vietnam.",
          "A certificate of origin (CO) and a batch certificate of analysis (COA) are supplied with the goods on request.",
        ],
      },
      {
        heading: "5. Delivery, returns and privacy",
        blocks: [
          "Delivery, returns and the handling of your information follow the Delivery policy, Returns policy and Privacy policy published on this website.",
        ],
      },
      {
        heading: "6. Intellectual property",
        blocks: [
          "Shell, Mobil, Total, Castrol and the related product names are trademarks of their respective owners, used on this website to present their products. Articles and photos produced by Phuc Tho belong to Phuc Tho; please credit the source when quoting them.",
        ],
      },
      {
        heading: "7. Limitation of liability",
        blocks: [
          "Phuc Tho is not liable for damage caused by using products for purposes or in ways not recommended by the manufacturer, or by improper storage after delivery. Phuc Tho's liability for each order is as set out in the order or signed contract.",
        ],
      },
      {
        heading: "8. Governing law and disputes",
        blocks: [
          "These terms are governed by the laws of Vietnam. Disputes, if any, will first be settled by negotiation; failing that, either party may bring the matter before a competent court in Ho Chi Minh City.",
        ],
      },
    ],
  },
  "giao-hang": {
    description:
      "Delivery area, lead times, delivery charges and what to check when receiving lubricants from Phuc Tho.",
    sections: [
      {
        heading: "1. Delivery area",
        blocks: [
          "Phuc Tho delivers directly in Vung Tau, Ba Ria, Long Dien, Dat Do, Xuyen Moc and neighbouring wards and communes (Ho Chi Minh City). Other provinces and cities are served through a carrier agreed by both parties.",
        ],
      },
      {
        heading: "2. Delivery time",
        blocks: [
          {
            list: [
              "Goods in stock, delivered within the area above: 1–2 working days after the order is confirmed.",
              "Deliveries to other provinces or goods that must be ordered in: the lead time is stated in the quotation.",
            ],
          },
          "We deliver during business hours; if you need delivery outside these hours or to fit your plant's schedule, please tell us when ordering.",
        ],
      },
      {
        heading: "3. Delivery charges",
        blocks: [
          "Free delivery in the Vung Tau – Ba Ria area for orders of 1 drum (209 litres) or more; free delivery to other provinces and cities for orders of 6 drums or more. In other cases, the delivery charge is stated in the quotation before you confirm the order.",
        ],
      },
      {
        heading: "4. Preparing to receive goods",
        blocks: [
          "A 209-litre drum weighs about 180–200 kg. Please make sure the delivery vehicle can reach the unloading point and that suitable handling equipment (forklift, hoist) is available; if not, let us know in advance so we can arrange it.",
        ],
      },
      {
        heading: "5. Checking goods on delivery",
        blocks: [
          {
            list: [
              "Check the product code, packaging and quantity against the order.",
              "Check the packaging: seals, caps, labels, batch numbers; drums and pails should not be dented or leaking.",
              "Sign the delivery note. If anything is missing or damaged, record it on the delivery note (with photos if possible) and tell Phuc Tho straight away.",
            ],
          },
        ],
      },
      {
        heading: "6. Documents",
        blocks: [
          "Each delivery comes with a delivery note; the electronic VAT invoice is issued as required by law. A certificate of origin (CO) and a batch certificate of analysis (COA) are supplied on request.",
        ],
      },
    ],
  },
  "doi-tra": {
    description:
      "When Phuc Tho accepts returns of lubricants, the conditions, the process and how refunds are made.",
    sections: [
      {
        heading: "1. When returns are accepted",
        blocks: [
          {
            list: [
              "The wrong product, packaging or quantity was delivered compared with the confirmed order.",
              "The packaging was damaged, leaking or unsealed during Phuc Tho's delivery.",
              "The product has a manufacturing quality defect, confirmed by sample inspection or laboratory analysis.",
            ],
          },
        ],
      },
      {
        heading: "2. Conditions",
        blocks: [
          {
            list: [
              "Missing quantities or damaged packaging: record them on the delivery note at the time of delivery.",
              "Wrong product or quality defect: notify us within 7 days of receiving the goods.",
              "The product must be sealed and unused (except for quality defects), with its labels and batch number, and come with the purchase documents.",
            ],
          },
        ],
      },
      {
        heading: "3. When returns are not accepted",
        blocks: [
          {
            list: [
              "The product has been opened or used and has no quality defect.",
              "Damage caused by improper storage after delivery (kept outdoors, water contamination, high temperature…) or by use contrary to instructions.",
              "Change-of-mind returns are only considered if the goods are still sealed, within 7 days, and the customer pays the transport costs.",
            ],
          },
        ],
      },
      {
        heading: "4. Process",
        blocks: [
          {
            list: [
              "Contact Phuc Tho by phone or email with the order/invoice number, product code, batch number and photos.",
              "Phuc Tho checks and replies within 3 working days; where a quality defect is suspected, we may take a sample for analysis.",
              "Once confirmed, Phuc Tho replaces the product or refunds as agreed.",
            ],
          },
        ],
      },
      {
        heading: "5. Costs and refunds",
        blocks: [
          "Where the fault lies with Phuc Tho or the manufacturer, Phuc Tho pays all transport costs for the return. Refunds are made by bank transfer within 7 working days after Phuc Tho receives the goods back; the invoice is adjusted as required by law.",
        ],
      },
    ],
  },
};
