const PDFDocument = require('pdfkit');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType } = require('docx');
const fs = require('fs');
const path = require('path');

const REPORT_DIR = path.join(__dirname, '../../reports');

if (!fs.existsSync(REPORT_DIR)) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
}

const generatePDFReport = (diagnosis, user) => {
  return new Promise((resolve, reject) => {
    const filename = `诊断报告_${diagnosis.id}_${Date.now()}.pdf`;
    const filePath = path.join(REPORT_DIR, filename);

    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    doc.fontSize(20).text('司法鉴定诊断报告', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`报告编号: ${diagnosis.id}`, { align: 'right' });
    doc.text(`生成日期: ${new Date(diagnosis.created_at).toLocaleDateString()}`, { align: 'right' });
    doc.text(`鉴定医师: ${user.name}`, { align: 'right' });
    doc.moveDown(2);

    doc.fontSize(16).text('患者信息', { underline: true });
    doc.fontSize(12);
    doc.text(`患者姓名: ${diagnosis.patient_name || '未填写'}`);
    doc.text(`患者ID: ${diagnosis.patient_id || '未填写'}`);
    doc.moveDown(2);

    doc.fontSize(16).text('诊断结果', { underline: true });
    doc.fontSize(14).text(`诊断类型: ${diagnosis.diagnosis_type || '综合诊断'}`);
    doc.fontSize(14).text(`主要诊断: ${diagnosis.prediction_result}`);
    doc.fontSize(12).text(`置信度: ${(diagnosis.confidence * 100).toFixed(2)}%`);
    doc.moveDown(2);

    if (diagnosis.notes) {
      doc.fontSize(16).text('医师备注', { underline: true });
      doc.fontSize(12).text(diagnosis.notes);
      doc.moveDown(2);
    }

    doc.fontSize(16).text('诊断依据', { underline: true });
    doc.fontSize(12).text('基于深度学习CNN模型对病理切片图像进行分析，辅助法医进行初步诊断。');
    doc.text('诊断结果仅供参考，最终诊断需由专业法医确认。');

    doc.moveDown(3);
    doc.fontSize(10).text('本报告由司法鉴定辅助系统自动生成', { align: 'center' });

    doc.end();

    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
};

const generateWordReport = async (diagnosis, user) => {
  const filename = `诊断报告_${diagnosis.id}_${Date.now()}.docx`;
  const filePath = path.join(REPORT_DIR, filename);

  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: '司法鉴定诊断报告',
          heading: HeadingLevel.HEADING_1,
          alignment: 'center'
        }),
        new Paragraph({
          children: [
            new TextRun(`报告编号: ${diagnosis.id}`),
            new TextRun({ text: '          ', break: 1 }),
            new TextRun(`生成日期: ${new Date(diagnosis.created_at).toLocaleDateString()}`),
            new TextRun({ text: '          ', break: 1 }),
            new TextRun(`鉴定医师: ${user.name}`)
          ]
        }),
        new Paragraph({
          text: '患者信息',
          heading: HeadingLevel.HEADING_2
        }),
        new Paragraph(`患者姓名: ${diagnosis.patient_name || '未填写'}`),
        new Paragraph(`患者ID: ${diagnosis.patient_id || '未填写'}`),
        new Paragraph({
          text: '诊断结果',
          heading: HeadingLevel.HEADING_2
        }),
        new Paragraph(`诊断类型: ${diagnosis.diagnosis_type || '综合诊断'}`),
        new Paragraph(`主要诊断: ${diagnosis.prediction_result}`),
        new Paragraph(`置信度: ${(diagnosis.confidence * 100).toFixed(2)}%`),
        new Paragraph({
          text: '医师备注',
          heading: HeadingLevel.HEADING_2
        }),
        new Paragraph(diagnosis.notes || '无'),
        new Paragraph({
          text: '诊断依据',
          heading: HeadingLevel.HEADING_2
        }),
        new Paragraph('基于深度学习CNN模型对病理切片图像进行分析，辅助法医进行初步诊断。'),
        new Paragraph('诊断结果仅供参考，最终诊断需由专业法医确认。'),
        new Paragraph({
          text: '本报告由司法鉴定辅助系统自动生成',
          alignment: 'center'
        })
      ]
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(filePath, buffer);

  return filePath;
};

module.exports = { generatePDFReport, generateWordReport };
