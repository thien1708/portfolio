const fs = require('fs');
const path = require('path');
const {
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
  ShadingType,
  Header,
  Footer,
  PageNumber,
  ImageRun
} = require('docx');

const mdPath = path.resolve(__dirname, '../docs/SRS.md');
const outDocxPath = path.resolve(__dirname, '../docs/SRS_Portfolio_TranVuThien.docx');
const imgDir = path.resolve(__dirname, '../docs/images');

console.log('Reading Markdown:', mdPath);
const mdContent = fs.readFileSync(mdPath, 'utf8');

const PRIMARY_COLOR = '1E3A8A';   // Dark Blue
const SECONDARY_COLOR = '2563EB'; // Blue
const TEXT_COLOR = '1F2937';      // Dark Slate
const BORDER_COLOR = 'CBD5E1';    // Slate border
const TOTAL_TABLE_WIDTH = 9360;   // 6.5 inches in dxa

// Helper: parse inline markdown
function parseInlineRuns(text, options = {}) {
  const runs = [];
  let cleaned = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  const regex = /(\*\*.*?\*\*|`.*?`)/g;
  const parts = cleaned.split(regex);

  for (const part of parts) {
    if (!part) continue;
    if (part.startsWith('**') && part.endsWith('**')) {
      runs.push(
        new TextRun({
          text: part.slice(2, -2),
          bold: true,
          font: options.font || 'Arial',
          size: options.size || 20,
          color: options.color || (options.isHeader ? 'FFFFFF' : TEXT_COLOR)
        })
      );
    } else if (part.startsWith('`') && part.endsWith('`')) {
      runs.push(
        new TextRun({
          text: part.slice(1, -1),
          font: 'Consolas',
          size: (options.size || 20) - 2,
          color: options.isHeader ? 'FFFFFF' : '0F172A',
          shading: options.isHeader ? undefined : { fill: 'F1F5F9', type: ShadingType.SOLID, color: 'auto' }
        })
      );
    } else {
      runs.push(
        new TextRun({
          text: part,
          bold: options.isHeader || false,
          font: options.font || 'Arial',
          size: options.size || 20,
          color: options.color || (options.isHeader ? 'FFFFFF' : TEXT_COLOR)
        })
      );
    }
  }
  return runs.length > 0 ? runs : [new TextRun({ text: '', size: options.size || 20 })];
}

// Helper: create a valid TableCell with multiple paragraphs if there are line breaks
function createTableCell(rawText, isHeader, colWidth) {
  const cleanStr = rawText.replace(/<br\s*\/?>/gi, '\n');
  const lines = cleanStr.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  const paragraphs = [];
  if (lines.length === 0) {
    paragraphs.push(new Paragraph({ children: [new TextRun({ text: '' })] }));
  } else {
    for (let idx = 0; idx < lines.length; idx++) {
      const line = lines[idx];
      paragraphs.push(
        new Paragraph({
          spacing: { before: idx === 0 ? 40 : 20, after: idx === lines.length - 1 ? 40 : 20 },
          children: parseInlineRuns(line, { isHeader, size: 19 })
        })
      );
    }
  }

  return new TableCell({
    width: { size: colWidth, type: WidthType.DXA },
    shading: isHeader ? { fill: PRIMARY_COLOR, type: ShadingType.SOLID, color: 'auto' } : undefined,
    margins: { top: 100, bottom: 100, left: 140, right: 140 },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
      left: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
      right: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR }
    },
    children: paragraphs
  });
}

function parseMarkdownTable(tableLines) {
  if (tableLines.length < 2) return null;
  const headerLine = tableLines[0];
  const dataLines = tableLines.slice(2);

  const parseCols = (line) =>
    line.split('|')
      .map(c => c.trim())
      .filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);

  const headers = parseCols(headerLine);
  if (headers.length === 0) return null;

  const numCols = headers.length;
  let colWidths = [];
  if (numCols === 2) {
    colWidths = [2800, 6560];
  } else if (numCols === 3) {
    colWidths = [2400, 4560, 2400];
  } else if (numCols === 4) {
    colWidths = [1800, 1800, 2200, 3560];
  } else if (numCols === 5) {
    colWidths = [1300, 2000, 2000, 2000, 2060];
  } else {
    const w = Math.floor(TOTAL_TABLE_WIDTH / numCols);
    colWidths = new Array(numCols).fill(w);
  }

  const rows = [];
  rows.push(
    new TableRow({
      tableHeader: true,
      children: headers.map((h, i) => createTableCell(h, true, colWidths[i] || 2000))
    })
  );

  for (const line of dataLines) {
    if (!line.includes('|')) continue;
    const cols = parseCols(line);
    if (cols.length >= numCols) {
      rows.push(
        new TableRow({
          children: cols.slice(0, numCols).map((c, i) => createTableCell(c, false, colWidths[i] || 2000))
        })
      );
    }
  }

  return new Table({
    columnWidths: colWidths,
    width: { size: TOTAL_TABLE_WIDTH, type: WidthType.DXA },
    rows
  });
}

function createImageParagraph(imgName, targetWidth, targetHeight, captionText) {
  const filePath = path.join(imgDir, imgName);
  if (!fs.existsSync(filePath)) {
    console.warn('[WARN] Image not found:', filePath);
    return [];
  }
  const buf = fs.readFileSync(filePath);
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 180, after: 80 },
      children: [
        new ImageRun({
          data: buf,
          transformation: {
            width: targetWidth,
            height: targetHeight
          }
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 180 },
      children: [
        new TextRun({
          text: captionText,
          italics: true,
          size: 18,
          color: '64748B',
          font: 'Arial'
        })
      ]
    })
  ];
}

const allLines = mdContent.split(/\r?\n/);
const children = [];

// Cover Header
children.push(
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 100 },
    children: [
      new TextRun({
        text: 'TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS)',
        bold: true,
        size: 36,
        color: PRIMARY_COLOR,
        font: 'Arial'
      })
    ]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 100 },
    children: [
      new TextRun({
        text: 'SOFTWARE REQUIREMENTS SPECIFICATION',
        bold: true,
        size: 24,
        color: SECONDARY_COLOR,
        font: 'Arial'
      })
    ]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 180 },
    children: [
      new TextRun({
        text: 'HỆ THỐNG PORTFOLIO CÁ NHÂN & NỀN TẢNG QUẢN TRỊ NỘI DUNG (HEADLESS CMS)',
        italics: true,
        size: 22,
        color: '374151',
        font: 'Arial'
      })
    ]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 360 },
    children: [
      new TextRun({
        text: 'Tiêu chuẩn áp dụng: ISO/IEC/IEEE 29148:2018 (kế thừa IEEE 830-1998) | Tác giả: Trần Vũ Thiện',
        size: 18,
        color: '64748B',
        font: 'Arial'
      })
    ]
  })
);

let inCodeBlock = false;
let codeBlockLang = '';
let tableBuffer = [];

for (let i = 0; i < allLines.length; i++) {
  const rawLine = allLines[i];
  const trimmed = rawLine.trim();

  // Code block handling
  if (trimmed.startsWith('```')) {
    if (!inCodeBlock) {
      inCodeBlock = true;
      codeBlockLang = trimmed.replace('```', '').trim().toLowerCase();
    } else {
      inCodeBlock = false;
      codeBlockLang = '';
      children.push(new Paragraph({ spacing: { after: 120 } }));
    }
    continue;
  }

  // If in code block
  if (inCodeBlock) {
    if (codeBlockLang === 'mermaid') {
      continue;
    }
    children.push(
      new Paragraph({
        spacing: { before: 20, after: 20 },
        children: [
          new TextRun({
            text: rawLine,
            font: 'Consolas',
            size: 18,
            color: '1E293B'
          })
        ]
      })
    );
    continue;
  }

  // Table buffering
  if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
    tableBuffer.push(trimmed);
    continue;
  } else if (tableBuffer.length > 0) {
    const table = parseMarkdownTable(tableBuffer);
    if (table) {
      children.push(table);
      children.push(new Paragraph({ spacing: { after: 140 } }));
    }
    tableBuffer = [];
  }

  // Skip empty lines or dividers
  if (trimmed === '' || trimmed === '---') {
    continue;
  }

  // Headings
  if (trimmed.startsWith('# ')) {
    continue;
  } else if (trimmed.startsWith('## ')) {
    const text = trimmed.replace(/^##\s+/, '');
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 360, after: 140 },
        children: [
          new TextRun({
            text,
            bold: true,
            size: 28,
            color: PRIMARY_COLOR,
            font: 'Arial'
          })
        ]
      })
    );
  } else if (trimmed.startsWith('### ')) {
    const text = trimmed.replace(/^###\s+/, '');
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 100 },
        children: [
          new TextRun({
            text,
            bold: true,
            size: 24,
            color: SECONDARY_COLOR,
            font: 'Arial'
          })
        ]
      })
    );

    // If entering Section 2.2, insert the 3 clear architecture diagram images
    if (text.includes('2.2')) {
      children.push(...createImageParagraph('diagram_architecture_overview.png', 570, 579, 'Sơ đồ 2.1: Kiến trúc phân tầng 4 lớp tổng thể hệ thống'));
      children.push(...createImageParagraph('diagram_public_web.png', 570, 390, 'Sơ đồ 2.2: Luồng chức năng & Tương tác Phân hệ Public Web'));
      children.push(...createImageParagraph('diagram_admin_cms.png', 570, 398, 'Sơ đồ 2.3: Luồng bảo mật & Điều hành Phân hệ Admin CMS'));
    }

  } else if (trimmed.startsWith('#### ')) {
    const text = trimmed.replace(/^####\s+/, '');
    if (text.includes('Sơ đồ 2.1') || text.includes('Sơ đồ 2.2') || text.includes('Sơ đồ 2.3') || text.includes('Sơ đồ 2.4')) {
      continue;
    }
    if (text.includes('Sơ đồ 5.1')) {
      children.push(...createImageParagraph('diagram_erd_auth.png', 570, 218, 'Sơ đồ 5.1: ERD Phân hệ Xác thực & Quản lý phiên (users ↔ refresh_tokens)'));
      continue;
    }
    if (text.includes('Sơ đồ 5.2')) {
      children.push(...createImageParagraph('diagram_erd_portfolio.png', 570, 316, 'Sơ đồ 5.2: ERD Phân hệ Hồ sơ cá nhân & Năng lực (profile ↔ 5 bảng con)'));
      continue;
    }
    if (text.includes('Sơ đồ 5.3')) {
      children.push(...createImageParagraph('diagram_erd_blog.png', 570, 273, 'Sơ đồ 5.3: ERD Phân hệ Blog, Tương tác & Giám sát (posts, contact, analytics)'));
      continue;
    }

    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 180, after: 80 },
        children: [
          new TextRun({
            text,
            bold: true,
            size: 22,
            color: '334155',
            font: 'Arial'
          })
        ]
      })
    );
  } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
    const itemText = trimmed.replace(/^[-*]\s+/, '');
    children.push(
      new Paragraph({
        bullet: { level: 0 },
        spacing: { before: 30, after: 30 },
        children: parseInlineRuns(itemText, { size: 20 })
      })
    );
  } else if (/^\d+\.\s+/.test(trimmed)) {
    const itemText = trimmed.replace(/^\d+\.\s+/, '');
    children.push(
      new Paragraph({
        bullet: { level: 0 },
        spacing: { before: 30, after: 30 },
        children: parseInlineRuns(itemText, { size: 20 })
      })
    );
  } else {
    // Normal paragraph
    children.push(
      new Paragraph({
        spacing: { before: 40, after: 80 },
        children: parseInlineRuns(trimmed, { size: 20 })
      })
    );
  }
}

// Flush any table at end
if (tableBuffer.length > 0) {
  const table = parseMarkdownTable(tableBuffer);
  if (table) children.push(table);
}

const doc = new Document({
  styles: {
    default: {
      document: {
        run: {
          font: 'Arial',
          size: 20,
          color: TEXT_COLOR
        }
      }
    }
  },
  sections: [
    {
      properties: {
        page: {
          margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 }
        }
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  text: 'Đặc tả Yêu cầu Phần mềm (SRS) — Portfolio & CMS (Trần Vũ Thiện)',
                  size: 16,
                  color: '94A3B8',
                  font: 'Arial'
                })
              ]
            })
          ]
        })
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: 'Trang ',
                  size: 16,
                  color: '94A3B8'
                }),
                new TextRun({
                  children: [PageNumber.CURRENT],
                  size: 16,
                  color: '94A3B8'
                }),
                new TextRun({
                  text: ' / ',
                  size: 16,
                  color: '94A3B8'
                }),
                new TextRun({
                  children: [PageNumber.TOTAL_PAGES],
                  size: 16,
                  color: '94A3B8'
                })
              ]
            })
          ]
        })
      },
      children
    }
  ]
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(outDocxPath, buffer);
  console.log(`[SUCCESS] Word document generated at: ${outDocxPath} (${buffer.length} bytes)`);
});
