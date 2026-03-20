// Extract text from DOCX XML
const { readFileSync, writeFileSync, mkdirSync, existsSync } = require('fs');
const path = require('path');

function extractDocxText(xml) {
  // Extract all text from w:t tags
  const matches = xml.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
  return matches.map(m => m.replace(/<[^>]+>/g, '')).join('');
}

function extractDocxParagraphs(xml) {
  // Split by paragraph tags to preserve structure
  const paraRegex = /<w:p[^>]*>([\s\S]*?)<\/w:p>/g;
  const paras = [];
  let match;
  while ((match = paraRegex.exec(xml)) !== null) {
    const pContent = match[1];
    const text = extractDocxText(pContent);
    if (text.trim()) paras.push(text.trim());
  }
  return paras;
}

function docxToMarkdown(xml, title) {
  const paras = extractDocxParagraphs(xml);
  let md = `# ${title}\n\n`;
  for (const para of paras) {
    md += para + '\n\n';
  }
  return md;
}

function docxToSimpleHTML(xml, title) {
  const paras = extractDocxParagraphs(xml);
  let html = `<h1>${title}</h1>\n`;
  for (const para of paras) {
    if (para.length > 0) {
      html += `<p>${para}</p>\n`;
    }
  }
  return html;
}

// Extract Blazr Terms
const termsXML = readFileSync('/tmp/docx_extract/word/document.xml', 'utf8');
const termsMd = docxToMarkdown(termsXML, 'Blazr Terms & Conditions');
const termsHtml = docxToSimpleHTML(termsXML, 'Blazr Terms & Conditions');
writeFileSync('/home/node/.openclaw/workspace/blazr-app/public/docs/blazr-terms.md', termsMd);
writeFileSync('/home/node/.openclaw/workspace/blazr-app/public/docs/blazr-terms.html', termsHtml);

// Extract POPIA
const popiaXML = readFileSync('/tmp/docx_extract/popia/word/document.xml', 'utf8');
const popiaMd = docxToMarkdown(popiaXML, 'POPIA Compliance Policy');
const popiaHtml = docxToSimpleHTML(popiaXML, 'POPIA Compliance Policy');
writeFileSync('/home/node/.openclaw/workspace/blazr-app/public/docs/popia.md', popiaMd);
writeFileSync('/home/node/.openclaw/workspace/blazr-app/public/docs/popia.html', popiaHtml);

// Extract General terms
if (existsSync('/home/node/.openclaw/workspace/blazr-assets/Blazr Terms & Conditions/General/Terms and conditions of membership of the Blazr cannabis Club.docx')) {
  const { execSync } = require('child_process');
  execSync(`unzip -o "/home/node/.openclaw/workspace/blazr-assets/Blazr Terms & Conditions/General/Terms and conditions of membership of the Blazr cannabis Club.docx" "word/document.xml" -d /tmp/docx_extract/general/`, { stdio: 'pipe' });
  const generalXML = readFileSync('/tmp/docx_extract/general/word/document.xml', 'utf8');
  const generalMd = docxToMarkdown(generalXML, 'Terms and Conditions of Membership');
  const generalHtml = docxToSimpleHTML(generalXML, 'Terms and Conditions of Membership');
  writeFileSync('/home/node/.openclaw/workspace/blazr-app/public/docs/club-membership.md', generalMd);
  writeFileSync('/home/node/.openclaw/workspace/blazr-app/public/docs/club-membership.html', generalHtml);
}

console.log('✅ Legal docs extracted to public/docs/');
