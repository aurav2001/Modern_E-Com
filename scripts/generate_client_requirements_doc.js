import fs from 'fs';
import path from 'path';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType
} from 'docx';

const NAVY = '1E293B';
const ORANGE = 'EA580C';
const LIGHT_BG = 'F8FAFC';
const BORDER_COLOR = 'CBD5E1';

function createHeading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 140 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 26,
        color: NAVY,
        font: 'Segoe UI'
      })
    ]
  });
}

function createHeading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 100 },
    children: [
      new TextRun({
        text,
        bold: true,
        size: 22,
        color: ORANGE,
        font: 'Segoe UI'
      })
    ]
  });
}

function createBullet(text, boldPrefix = '') {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 60, after: 60 },
    children: [
      ...(boldPrefix ? [new TextRun({ text: boldPrefix + ' ', bold: true, color: NAVY, font: 'Segoe UI' })] : []),
      new TextRun({ text, font: 'Segoe UI', size: 21, color: '334155' })
    ]
  });
}

function createParagraph(text) {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    children: [
      new TextRun({ text, font: 'Segoe UI', size: 21, color: '334155' })
    ]
  });
}

function createTable(rowsData) {
  const tableRows = rowsData.map((row, rowIndex) => {
    const isHeader = rowIndex === 0;
    return new TableRow({
      children: row.map((cellText, cellIndex) => {
        return new TableCell({
          width: {
            size: cellIndex === 0 ? 28 : (cellIndex === 1 ? 52 : 20),
            type: WidthType.PERCENTAGE
          },
          shading: {
            fill: isHeader ? NAVY : (rowIndex % 2 === 0 ? LIGHT_BG : 'FFFFFF'),
            type: ShadingType.CLEAR
          },
          margins: { top: 120, bottom: 120, left: 140, right: 140 },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: cellText,
                  bold: isHeader,
                  color: isHeader ? 'FFFFFF' : '1E293B',
                  font: 'Segoe UI',
                  size: isHeader ? 21 : 20
                })
              ]
            })
          ]
        });
      })
    });
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
      left: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
      right: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR }
    },
    rows: tableRows
  });
}

async function generateDocx() {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: 'RISHIKAR SPORTS — E-COMMERCE WEBSITE',
                bold: true,
                size: 32,
                color: NAVY,
                font: 'Segoe UI'
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 300 },
            children: [
              new TextRun({
                text: 'Client Requirement & Launch Checklist (Hinglish Version)',
                italics: true,
                size: 22,
                color: ORANGE,
                font: 'Segoe UI'
              })
            ]
          }),

          // Introduction in Hinglish
          createParagraph(
            'Hello Sir, aapki e-commerce website (Rishikar Sports) ka frontend aur backend ready ho chuka hai. Website ko live domain par launch karne aur real online payments shuru karne ke liye hume aapse niche di gayi essential details, access aur photos ki requirement hai. Kripya is checklist ke hisaab se details provide kar dijiye:'
          ),

          // Section 1: Payment Gateway
          createHeading1('1. Online Payment Gateway (Direct Bank Payment)'),
          createParagraph('Website par customers se UPI (PhonePe, GPay, Paytm), Cards aur Net Banking se payment direct aapke bank account me lene ke liye:'),
          createTable([
            ['Requirement Item', 'Kya Chahiye (Details)', 'Status'],
            ['Payment Gateway Account', 'Razorpay / PhonePe Payment Gateway / Cashfree me merchant account banana aur KYC verify karna.', 'Pending'],
            ['API Keys (Live)', 'Live Key ID aur Key Secret provide karna (taki hum website ko secure tarike se bank se jod sakein).', 'Pending'],
            ['Bank Current Account', 'Company / Firm ka current account jisme payment har din settle hogi.', 'Pending'],
            ['Cash on Delivery (COD)', 'Kya COD order lena hai? Agar haan, to koi extra COD charge lagana hai ya prepaid advance token rakhna hai?', 'Pending']
          ]),

          // Section 2: Domain & Production Hosting
          createHeading1('2. Domain & Server Hosting (Website Live Karne Ke Liye)'),
          createParagraph('Website ko aapke official address (jaise rishikarsports.com) par permanently chalane ke liye:'),
          createTable([
            ['Requirement Item', 'Kya Chahiye (Details)', 'Status'],
            ['Domain Name Access', 'GoDaddy / Hostinger jahan se domain buy kiya hai, uska login ya DNS access (A Record / CNAME add karne ke liye).', 'Pending'],
            ['Hosting / Cloud Server', 'Production cloud server jahan Node.js backend aur MongoDB database 24/7 host hoga.', 'Pending'],
            ['Official Business Email', 'Customer care email jaise support@rishikarsports.com ya sales@rishikarsports.com (Zoho / Google Workspace).', 'Pending'],
            ['SSL Security (HTTPS)', 'Website secure green/lock icon (Cloudflare ya hosting se free auto-setup ho jayega).', 'Ready']
          ]),

          // Section 3: SMS & WhatsApp Notifications
          createHeading1('3. WhatsApp & SMS Notifications'),
          createParagraph('Order place hone par aur delivery update ke time customer ko instant message bhejne ke liye:'),
          createTable([
            ['Requirement Item', 'Kya Chahiye (Details)', 'Status'],
            ['WhatsApp Business Number', 'Official contact number jisme customer directly WhatsApp chat kar sakein (Abhi: 6299094402 set hai).', 'Confirmed'],
            ['WhatsApp API / Bot (Optional)', 'Agar order confirm hone par automatic WhatsApp bill/message bhejna hai to WATI / Interakt account.', 'Optional / Pending'],
            ['SMS Gateway (Optional)', 'Customer mobile login par OTP bhejne ke liye Fast2SMS ya Msg91 account.', 'Optional']
          ]),

          // Section 4: Products, Photos & Catalog
          createHeading1('4. Products, HD Photos & Final Rate List'),
          createParagraph('Store me original products, actual photos aur sahi pricing show karne ke liye:'),
          createTable([
            ['Requirement Item', 'Kya Chahiye (Details)', 'Status'],
            ['Real Studio Product Photos', 'Jerseys, Tracksuits, Polos, Hoodies aur Kit Bags ki real HD photoshoot photos (Clean/White background).', 'Pending'],
            ['Product Details & Fabric', 'Har product ka fabric type (Spandex, Dry-Fit, Heavy Poly, GSM) aur size chart (S se 4XL).', 'Pending'],
            ['Final Pricing & MOQ', 'Single piece retail rate, bulk/teamwear wholesale rate, aur Minimum Order Quantity (MOQ: abhi 11 pieces set hai).', 'Confirmed'],
            ['Custom Kit Portfolio', 'Custom team kits ke past samples / 3D mockups jo website gallery me showcase kiye ja sakein.', 'Pending']
          ]),

          // Section 5: Legal & Business Policies
          createHeading1('5. Legal Business Details & Store Policies'),
          createParagraph('Payment Gateway approval aur legal compliance ke liye zaroori details:'),
          createTable([
            ['Requirement Item', 'Kya Chahiye (Details)', 'Status'],
            ['GST Number & Firm Name', 'GSTIN certificate aur registered firm name (Invoices aur Razorpay KYC ke liye).', 'Pending'],
            ['Factory / Office Address', 'Exact physical address aur support hours (Dahiawan Tola, Tari, Chapra, Bihar confirm hai ya kuch change hai?).', 'Confirmed'],
            ['Return & Exchange Policy', 'Custom printed jerseys aur plain stock items ke liye return/refund ke clear rules.', 'Draft Ready'],
            ['Delivery Timeframes', 'Pan-India delivery me average kitna working days lagta hai (Abhi: 10–12 days mention hai).', 'Confirmed']
          ]),

          // Section 6: Courier & Shipping Integration
          createHeading1('6. Courier & Delivery Partner (Shipping)'),
          createParagraph('Automatic doorstep parcel pickup aur customer live tracking ke liye:'),
          createTable([
            ['Requirement Item', 'Kya Chahiye (Details)', 'Status'],
            ['Courier Partner Account', 'Shiprocket / Delhivery / NimbusPost merchant account.', 'Pending'],
            ['Shiprocket API Keys', 'Courier panel ki API keys (jisse admin panel se 1-click me shipping label generate ho sake).', 'Pending'],
            ['Shipping Charges Rules', 'Free delivery kitne amount ke order par deni hai (jaise ₹999+) ya flat ₹99 delivery charge lagana hai.', 'Pending']
          ]),

          // Section 7: Admin Panel
          createHeading1('7. Admin Panel & Features Handover'),
          createParagraph('Store manage karne ke liye aapko complete Admin Dashboard provide kiya jayega:'),
          createBullet('Admin Panel URL: /admin (PIN / Password Protected)', '•'),
          createBullet('New orders check karna aur status update karna (Processing, Dispatched, Delivered).', '•'),
          createBullet('Bulk custom kit quotation inquiries check karna aur 1-click WhatsApp par baat karna.', '•'),
          createBullet('New products add karna, price/stock change karna aur discount coupons create karna.', '•'),
          createBullet('Full training aur guidance humari taraf se provide ki jayegi.', '•'),

          // Footer / Next Action Items
          new Paragraph({ spacing: { before: 300, after: 100 } }),
          createHeading2('Next Action Steps (Abhi Kya Karna Hai):'),
          createParagraph('1. Step 1: Payment Gateway (Razorpay/PhonePe) aur Domain access provide karein.'),
          createParagraph('2. Step 2: High-Quality Product Photos aur updated Rate List share karein.'),
          createParagraph('3. Jaise hi ye details mil jayengi, agle 2-3 working days me website successfully LIVE ho jayegi.'),

          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { before: 400, after: 100 },
            children: [
              new TextRun({ text: 'Prepared for: ', font: 'Segoe UI', size: 20 }),
              new TextRun({ text: 'Rishikar Sports Management\n', bold: true, font: 'Segoe UI', size: 22, color: NAVY }),
              new TextRun({ text: 'Doc: Client Requirements & Launch Checklist (Hinglish)\n', font: 'Segoe UI', size: 18, color: '64748B' }),
              new TextRun({ text: 'Date: October 2026', font: 'Segoe UI', size: 18, color: '64748B' })
            ]
          })
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = path.resolve('c:/Users/Gulshan Pandey/Desktop/Ecom-tyka/Rishikar_Sports_Client_Requirements_Hinglish.docx');
  fs.writeFileSync(outputPath, buffer);
  console.log('Document updated successfully in Hinglish at:', outputPath);
}

generateDocx().catch((err) => {
  console.error('Error generating docx:', err);
  process.exit(1);
});
