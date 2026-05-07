const PDFDocument = require('pdfkit');
const fs          = require('fs');
const path        = require('path');

const pdfDir = process.env.PDF_DIR || path.join(__dirname, '..', 'reports');

function fmt(n, decimals = 0) {
    if (n == null || isNaN(n)) return 'N/A';
    return `R ${Number(n).toLocaleString('en-ZA', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}
function pct(n) { return n == null ? 'N/A' : `${Number(n).toFixed(1)}%`; }

async function generate(reportId, inputs, results) {
    fs.mkdirSync(pdfDir, { recursive: true });
    const outPath = path.join(pdfDir, `report_${reportId}.pdf`);

    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const out = fs.createWriteStream(outPath);
        doc.pipe(out);

        const summary = results?.summary || {};
        const details = results?.details || {};

        // Header bar
        doc.rect(0, 0, doc.page.width, 70).fill('#1a5c2a');
        doc.fillColor('white').fontSize(22).font('Helvetica-Bold')
           .text('ShepherdAI Farm Report', 50, 20);
        doc.fontSize(11).font('Helvetica')
           .text(`Report #${reportId}  |  Generated ${new Date().toLocaleDateString('en-ZA')}`, 50, 46);
        doc.fillColor('black').moveDown(3);

        // Executive summary box
        _sectionHeader(doc, 'Executive Summary');
        const status = summary.status || 'UNKNOWN';
        const statusColour = status === 'PROFITABLE' ? '#1a5c2a' : status === 'MARGINAL' ? '#b8860b' : '#b81818';
        doc.roundedRect(50, doc.y, 495, 90, 6).fill('#f4f4f4');
        doc.fillColor(statusColour).fontSize(16).font('Helvetica-Bold')
           .text(status, 70, doc.y - 82);
        doc.fillColor('black').fontSize(10).font('Helvetica');
        const col1x = 70, col2x = 310;
        const ey = doc.y;
        doc.text(`Total Revenue:   ${fmt(summary.totalRevenue)}`,    col1x, ey - 60);
        doc.text(`Total Costs:     ${fmt(summary.totalCosts)}`,      col1x, ey - 47);
        doc.text(`Net Profit:      ${fmt(summary.netProfit)}`,       col1x, ey - 34);
        doc.text(`Profit Margin:   ${pct(summary.profitMargin)}`,    col2x, ey - 60);
        doc.text(`Break-even:      ${summary.breakEvenLambs ?? 'N/A'} lambs`, col2x, ey - 47);
        doc.moveDown(3);

        // Farm details
        _sectionHeader(doc, 'Farm Details');
        _row(doc, 'Land area',          `${details.landHa ?? inputs.landHa ?? '-'} ha`);
        _row(doc, 'Flock size',         `${details.flockSize ?? inputs.flockSize ?? '-'} ewes`);
        _row(doc, 'Breed',              details.breed || inputs.breed || '-');
        _row(doc, 'Production system',  details.productionSystem || inputs.productionSystem || '-');
        _row(doc, 'Market channel',     inputs.marketChannel || '-');
        _row(doc, 'Feed source',        inputs.feedSource || '-');
        doc.moveDown(0.5);

        // Production
        _sectionHeader(doc, 'Production');
        _row(doc, 'Lambs weaned',       details.lambsWeaned ?? '-');
        _row(doc, 'Lambs sold',         details.lambsSold ?? '-');
        _row(doc, 'Max recommended stock', details.maxRecommendedStock ? `${details.maxRecommendedStock.toFixed(0)} ewes` : '-');
        _row(doc, 'Overstocked',        details.isOverstocked ? 'YES — reduce flock' : 'No');
        doc.moveDown(0.5);

        // Revenue breakdown
        _sectionHeader(doc, 'Revenue Breakdown');
        _row(doc, 'Meat revenue',       fmt(details.meatRevenue));
        _row(doc, 'Wool revenue',       fmt(details.woolRevenue));
        _row(doc, 'Other revenue',      fmt(details.otherRevenue));
        _row(doc, 'Total revenue',      fmt(summary.totalRevenue), true);
        doc.moveDown(0.5);

        // Cost breakdown
        _sectionHeader(doc, 'Cost Breakdown');
        _row(doc, 'Variable costs',     fmt(details.variableCosts));
        _row(doc, 'Labour costs',       fmt(details.labourCosts));
        _row(doc, 'Fixed costs',        fmt(details.fixedCosts));
        _row(doc, 'Total costs',        fmt(summary.totalCosts), true);
        doc.moveDown(0.5);

        // Warnings
        const warnings = results?.warnings || [];
        if (warnings.length) {
            _sectionHeader(doc, 'Alerts');
            for (const w of warnings) {
                const c = w.severity === 'CRITICAL' ? '#b81818' : w.severity === 'HIGH' ? '#b86818' : '#1a5c2a';
                doc.fillColor(c).fontSize(9).font('Helvetica-Bold').text(`[${w.severity}] `, { continued: true });
                doc.fillColor('black').font('Helvetica').text(w.message);
            }
            doc.moveDown(0.5);
        }

        // Recommendations
        const recs = results?.recommendations || [];
        if (recs.length) {
            _sectionHeader(doc, 'Top Recommendations');
            for (const rec of recs.slice(0, 5)) {
                doc.fontSize(10).font('Helvetica-Bold').fillColor('#1a5c2a')
                   .text(`• ${rec.category || rec.title}:`);
                if (rec.items) rec.items.forEach(i => doc.fontSize(9).font('Helvetica').fillColor('black').text(`  – ${i}`));
                if (rec.actions) rec.actions.slice(0, 2).forEach(a => doc.fontSize(9).font('Helvetica').fillColor('black').text(`  – ${a}`));
            }
            doc.moveDown(0.5);
        }

        // Footer
        doc.fontSize(8).fillColor('#888')
           .text('ShepherdAI  |  shepherdai.co.za  |  Report generated for licensed use only', 50, doc.page.height - 40, { align: 'center' });

        doc.end();
        out.on('finish', () => resolve(outPath));
        out.on('error', reject);
    });
}

function _sectionHeader(doc, title) {
    doc.rect(50, doc.y, 495, 18).fill('#e8f0e8');
    doc.fillColor('#1a5c2a').fontSize(11).font('Helvetica-Bold')
       .text(title, 55, doc.y - 14);
    doc.fillColor('black').moveDown(0.8);
}

function _row(doc, label, value, bold = false) {
    doc.fontSize(10)
       .font(bold ? 'Helvetica-Bold' : 'Helvetica')
       .text(`${label}:`, 70, doc.y, { continued: true, width: 200 })
       .font(bold ? 'Helvetica-Bold' : 'Helvetica')
       .text(String(value ?? '-'), { align: 'left' });
}

module.exports = { generate };
