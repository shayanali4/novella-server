const fs = require('fs');
const random = require('crypto-random-string');
const epub = require('epub-gen');
const {
  AlignmentType,
  Document,
  HeadingLevel,
  Paragraph,
  Packer,
  TextRun,
  UnderlineType,
} = require('docx');
let htmlToRtf = require('html-to-rtf');

// pdf
const fonts = {
  Roboto: {
    normal: 'writter/fonts/Roboto-Regular.ttf',
    bold: 'writter/fonts/Roboto-Medium.ttf',
    italics: 'writter/fonts/Roboto-Italic.ttf',
    bolditalics: 'writter/fonts/Roboto-MediumItalic.ttf',
  },
};
const pdfPrinter = require('pdfmake/src/printer');
const printer = new pdfPrinter(fonts);

/**
 * .txt
 * @param {*} data contents from editor.
 */
module.exports.CreateText = async data => {
  let contents = '';
  let fileName = random({ length: 10 }) + '.txt';
  let filePath = `temp/` + fileName;

  // Prepare contents
  for (let [index, block] of data.entries()) {
    let text = '';
    let addons = index !== data.length - 1 ? '\n\n' : '';

    for (let child of block.children) {
      text += child.text;
    }

    contents += text + addons;
  }

  // Writting files
  await fs.writeFileSync(filePath, contents);

  // return as xxx.txt
  return fileName;
};

/**
 * .docx
 * @param {*} data contents from editor.
 */
module.exports.CreateDocx = async data => {
  let fileName = random({ length: 10 }) + '.docx';
  let filePath = `temp/` + fileName;

  // Prepare data
  let children = [];

  for (let block of data) {
    let content = [];

    for (let child of block.children) {
      let text = {
        text: child.text,
        bold: child.bold,
        italics: child.italics,
      };

      // has underline
      if (child.decoration === 'underline') {
        text.underline = {
          type: UnderlineType.SINGLE,
        };
      }

      content.push(new TextRun(text));
    }

    // Build a new paragraph
    let contents = {
      children: content,
    };

    // Sections, chapter and scene
    if (block.type === 'h1') {
      contents.heading = HeadingLevel.HEADING_1;
    }

    if (block.type === 'h2') {
      contents.heading = HeadingLevel.HEADING_2;
    }

    if (block.type === 'h3') {
      contents.heading = HeadingLevel.HEADING_3;
    }

    // Text alignment
    switch (block.textAlign) {
      case 'right':
        contents.alignment = AlignmentType.RIGHT;
        break;
      case 'center':
        contents.alignment = AlignmentType.CENTER;
        break;
      case 'justify':
        contents.alignment = AlignmentType.JUSTIFIED;
        break;
      default:
        contents.alignment = AlignmentType.LEFT;
        break;
    }

    // Insert to paragraph
    children.push(new Paragraph(contents));

    // New line
    children.push(
      new Paragraph({
        text: '',
      }),
    );
  }

  // Generating docx
  let doc = new Document();
  doc.addSection({
    properties: {},
    children: children,
  });

  // Used to export the file into a .docx file
  Packer.toBuffer(doc).then(buffer => {
    fs.writeFileSync(filePath, buffer);
  });

  // return as xxx.docx
  return fileName;
};

/**
 * .epub
 * @param {*} data contents from editor.
 */
module.exports.CreateEpub = async data => {
  let fileName = random({ length: 10 }) + '.epub';
  let filePath = `temp/` + fileName;

  // preapring data
  let contents = [{ title: '', data: '' }];
  let contentTitle = '';
  let contentData = '';

  for (let [index, block] of data.entries()) {
    // add new epub block then reset tile and content
    if (block.type === 'h1' && index) {
      contents.push({ title: '', data: '' });
      contentTitle = '';
      contentData = '';
    }

    // write content
    let blockContent = '';

    switch (block.type) {
      case 'h1':
        blockContent += '<h1>';
        break;
      default:
        blockContent = '<p>';
        break;
    }

    for (let child of block.children) {
      switch (block.type) {
        default:
          blockContent += `<span>${child.text}</span>`;
          break;
      }

      if (block.type === 'h1') {
        contentTitle += child.text;
      }
    }

    switch (block.type) {
      case 'h1':
        blockContent += '</h1>';
        break;
      default:
        blockContent += '</p>';
        break;
    }

    if (block.type !== 'h1') {
      contentData += blockContent;
    }

    // update lates block data
    contents[contents.length - 1] = { title: contentTitle, data: contentData };
  }

  // generate epub file
  let options = {
    title: fileName,
    author: 'Anonimous',
    output: filePath,
    content: contents,
  };

  return new Promise((res, rej) => {
    new epub(options).promise.then(() => res(fileName)).catch(() => rej(err));
  });
};

/**
 * .html
 * @param {*} data contents from editor.
 */
module.exports.CreateHTML = async data => {
  let fileName = random({ length: 10 }) + '.html';
  let filePath = `temp/` + fileName;
  let contents = '';

  for (let block of data) {
    let content = '';

    for (let child of block.children) {
      let style = '';

      style += child.bold ? 'font-weight: 700;' : '';
      style += child.italics ? 'font-style: italic;' : '';
      style +=
        child.decoration === 'underline' ? 'text-decoration: underline;' : '';

      if (child.type === 'a') {
        content += `<a href="${child.link}"${
          style.length ? ' style="' + style + '"' : ''
        }>${child.text}</a>`;
      } else {
        content += `<${child.type}${
          style.length ? ' style="' + style + '"' : ''
        }>${child.text}</${child.type}>`;
      }
    }

    contents += `<${block.type} style="text-align: ${block.textAlign};">${content}</${block.type}>`;
  }

  let html = `<div>${contents}</div>`;

  await fs.writeFileSync(filePath, html);

  return fileName;
};

/**
 * .md
 * @param {*} data contents from editor.
 */
module.exports.CreateMD = async data => {
  let fileName = random({ length: 10 }) + '.md';
  let filePath = `temp/` + fileName;
  let contents = '';

  // Prepare contents
  for (let [index, block] of data.entries()) {
    let text = '';
    let addons = index !== data.length - 1 ? '\n\n' : '';

    for (let child of block.children) {
      let bold = child.bold ? '**' : '';
      let italic = child.italics ? '_' : '';

      if (child.type === 'a') {
        text += `[${italic + bold + child.text + bold + italic}](${child.url})`;
      }

      if (child.type === 'span') {
        text += italic + bold + child.text + bold + italic;
      }
    }

    // Section, chapter and scene
    if (block.type === 'h1') {
      contents = '# ' + text + addons;
    }

    if (block.type === 'h2') {
      contents = '## ' + text + addons;
    }

    if (block.type === 'h3') {
      contents = '## ' + text + addons;
    }

    // Sections or normal text
    if (block.type === 'section') {
      contents += text + addons;
    }
  }

  // Writting files
  await fs.writeFileSync(filePath, contents);

  // return as xxx.md
  return fileName;
};

/**
 * .pdf
 * @param {*} data contents from editor.
 */
module.exports.CreatePDF = async data => {
  let fileName = random({ length: 10 }) + '.pdf';
  let filePath = `temp/` + fileName;
  let contents = [];

  // Prepare contents
  for (let [index, block] of data.entries()) {
    let text = [];
    let textAlign = {
      left: 'left',
      right: 'right',
      center: 'center',
      justify: 'justify',
    };

    let content = { text: text, alignment: textAlign[block.textAlign] };

    for (let child of block.children) {
      let content = {
        text: child.text,
        bold: child.bold,
        italics: child.italics,
      };

      // text decoration
      if (child.decoration !== 'none') {
        content.decoration = child.decoration;
      }

      // links
      if (child.url) {
        content.link = child.link;
        content.color = '#00bfff';
      }

      text.push(content);
    }

    // section, chapter and scene
    if (block.type === 'h1') {
      content.fontSize = 18;
    }

    if (block.type === 'h2') {
      content.fontSize = 16;
    }

    if (block.type === 'h3') {
      content.fontSize = 14;
    }

    // add content
    contents.push(content);

    // line break
    if (index + 1 !== data.length) {
      contents.push({ text: ' ' });
    }
  }

  // generate pdf
  let docDefinition = {
    content: contents,
  };

  let pdfDoc = printer.createPdfKitDocument(docDefinition);
  pdfDoc.pipe(fs.createWriteStream(filePath));
  pdfDoc.end();

  // return as xxx.pdf
  return fileName;
};

/**
 * .rtf
 * @param {*} data contents from editor.
 */
module.exports.CreateRtf = async data => {
  let fileName = random({ length: 10 }) + '.rtf';
  let filePath = `temp/` + fileName;
  let html = ``;

  for (let block of data) {
    let text = '';

    for (let child of block.children) {
      if (child.bold) text += '<strong>';
      if (child.italics) text += '<i>';
      if (child.decoration === 'underline') text += '<u>';

      text += child.text;

      if (child.decoration === 'underline') text += '</u>';
      if (child.italics) text += '<i>';
      if (child.bold) text += '</strong>';
    }

    if (['h1', 'h2', 'h3'].includes(block.type)) {
      let size = {
        h1: '55px',
        h2: '48px',
        h3: '40px',
      };

      html += `<${block.type} style="font-size: ${size[block.type]};" align="${
        block.textAlign
      }"><strong>${text}</strong></${block.type}>`;
    } else {
      html += `<p align="${block.textAlign}">${text}</p>`;
    }
  }

  htmlToRtf.saveRtfInFile(filePath, htmlToRtf.convertHtmlToRtf(html));

  return fileName;
};
