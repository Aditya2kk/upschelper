const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, 'public', 'newspapers');

const newspapers = [
  { filename: 'the-hindu-23-aug-2026.pdf', title: 'The Hindu', subtitle: 'Delhi Edition', date: '23 August 2026', pages: 32 },
  { filename: 'indian-express-23-aug-2026.pdf', title: 'The Indian Express', subtitle: 'All India Edition', date: '23 August 2026', pages: 24 },
  { filename: 'hindustan-times-23-aug-2026.pdf', title: 'Hindustan Times', subtitle: 'Delhi NCR Edition', date: '23 August 2026', pages: 28 },
  { filename: 'dainik-jagran-23-aug-2026.pdf', title: 'Dainik Jagran', subtitle: 'National Edition', date: '23 August 2026', pages: 20 },
  { filename: 'the-hindu-editorial-23-aug-2026.pdf', title: 'The Hindu', subtitle: 'Editorial & Op-Ed Pages', date: '23 August 2026', pages: 4 },
  { filename: 'indian-express-explained-23-aug-2026.pdf', title: 'Indian Express', subtitle: 'Explained & Ideas Pages', date: '23 August 2026', pages: 4 },
  { filename: 'pib-bulletin-23-aug-2026.pdf', title: 'PIB Daily Bulletin', subtitle: 'Government of India', date: '23 August 2026', pages: 8 },
  { filename: 'the-hindu-22-aug-2026.pdf', title: 'The Hindu', subtitle: 'Delhi Edition', date: '22 August 2026', pages: 32 },
  { filename: 'yojana-aug-2026.pdf', title: 'Yojana Magazine', subtitle: 'Ministry of I&B', date: 'August 2026', pages: 52 },
  { filename: 'kurukshetra-aug-2026.pdf', title: 'Kurukshetra Magazine', subtitle: 'Ministry of Rural Development', date: 'August 2026', pages: 48 },
];

function generatePDF(paper) {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ size: 'A4', margin: 60 });
    const filePath = path.join(outputDir, paper.filename);
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Cover page
    doc.rect(0, 0, 595, 842).fill('#0f172a');

    // Header accent bar
    doc.rect(0, 0, 595, 6).fill('#6366f1');

    // Title
    doc.fillColor('#ffffff').fontSize(32).font('Helvetica-Bold')
      .text(paper.title, 60, 200, { width: 475, align: 'center' });

    // Subtitle
    doc.fillColor('#94a3b8').fontSize(16).font('Helvetica')
      .text(paper.subtitle, 60, 250, { width: 475, align: 'center' });

    // Date
    doc.fillColor('#818cf8').fontSize(20).font('Helvetica-Bold')
      .text(paper.date, 60, 300, { width: 475, align: 'center' });

    // Divider
    doc.rect(200, 350, 195, 2).fill('#334155');

    // Source info
    doc.fillColor('#64748b').fontSize(12).font('Helvetica')
      .text('Sourced via Telegram · @abvcdsdf', 60, 380, { width: 475, align: 'center' });

    doc.fillColor('#475569').fontSize(11).font('Helvetica')
      .text('UPSC NewsHub AI — Smart Current Affairs Platform', 60, 410, { width: 475, align: 'center' });

    // Page count
    doc.fillColor('#334155').fontSize(10).font('Helvetica')
      .text(`${paper.pages} Pages · Placeholder Document for Demo`, 60, 460, { width: 475, align: 'center' });

    // Footer
    doc.fillColor('#1e293b').fontSize(9).font('Helvetica')
      .text('This is a placeholder PDF generated for demonstration purposes.', 60, 750, { width: 475, align: 'center' });

    // Bottom accent bar
    doc.rect(0, 836, 595, 6).fill('#6366f1');

    doc.end();
    stream.on('finish', () => {
      console.log(`  ✓ ${paper.filename}`);
      resolve();
    });
  });
}

async function main() {
  console.log('Generating newspaper PDFs...\n');
  for (const paper of newspapers) {
    await generatePDF(paper);
  }
  console.log(`\nDone! Generated ${newspapers.length} PDFs in ${outputDir}`);
}

main();
