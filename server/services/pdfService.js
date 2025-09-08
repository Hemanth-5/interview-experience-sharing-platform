const PdfPrinter = require("pdfmake");
const fs = require("fs");
const path = require("path");
const archiver = require('archiver');
const https = require('https');
const http = require('http');
const User = require('../models/User');

class PdfService {
  constructor() {
    // Use built-in fonts to avoid path issues
    this.fonts = {
      Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique'
      }
    };
    this.printer = new PdfPrinter(this.fonts);
  }

  // Method to download image from URL and convert to base64
  async downloadImageAsBase64(imageUrl, timeout = 10000) {
    return new Promise((resolve, reject) => {
      if (!imageUrl || typeof imageUrl !== 'string') {
        resolve(null);
        return;
      }

      const protocol = imageUrl.startsWith('https:') ? https : http;
      const timeoutId = setTimeout(() => {
        resolve(null); // Return null instead of rejecting on timeout
      }, timeout);

      const request = protocol.get(imageUrl, (response) => {
        clearTimeout(timeoutId);
        
        // Check if response is an image
        const contentType = response.headers['content-type'];
        if (!contentType || !contentType.startsWith('image/')) {
          resolve(null);
          return;
        }

        // Check file size (limit to 5MB)
        const contentLength = parseInt(response.headers['content-length'] || '0');
        if (contentLength > 5 * 1024 * 1024) {
          resolve(null);
          return;
        }

        const chunks = [];
        let totalSize = 0;

        response.on('data', (chunk) => {
          totalSize += chunk.length;
          // Additional size check during download
          if (totalSize > 5 * 1024 * 1024) {
            request.abort();
            resolve(null);
            return;
          }
          chunks.push(chunk);
        });

        response.on('end', () => {
          try {
            const buffer = Buffer.concat(chunks);
            const base64 = buffer.toString('base64');
            const mimeType = contentType;
            const dataUrl = `data:${mimeType};base64,${base64}`;
            resolve(dataUrl);
          } catch (error) {
            // console.log('Error converting image to base64:', error.message);
            resolve(null);
          }
        });

        response.on('error', () => {
          resolve(null);
        });
      });

      request.on('error', () => {
        clearTimeout(timeoutId);
        resolve(null);
      });

      request.on('timeout', () => {
        request.abort();
        resolve(null);
      });
    });
  }

  async generateExperiencePdf(experienceDoc, outputPath) {
  const docDefinition = {
    content: [],
    styles: {
      header: { fontSize: 18, bold: true, margin: [0, 20, 0, 10], alignment: 'center' },
      subheader: { fontSize: 14, bold: true, margin: [0, 12, 0, 6] },
      text: { fontSize: 11, margin: [0, 3, 0, 3] },
      tableHeader: { bold: true, fillColor: "#f2f2f2", fontSize: 11 },
      question: { fontSize: 10, margin: [20, 2, 0, 2] },
      italic: { italics: true, fontSize: 10, margin: [20, 2, 0, 5] }
    },
    pageMargins: [50, 60, 50, 60],
    defaultStyle: {
      font: 'Helvetica',
      fontSize: 10,
      lineHeight: 1.3
    }
  };

  const { companyInfo, backgroundInfo, rounds } = experienceDoc;

  // Header
  docDefinition.content.push({
    text: "Interview Experience Report",
    style: "header"
  });
  if (companyInfo?.companyName && companyInfo?.role) {
    docDefinition.content.push({
      text: `${companyInfo.companyName} - ${companyInfo.role}`,
      alignment: "center",
      bold: true,
      fontSize: 12,
      margin: [0, 0, 0, 15]
    });
  }

  // Company Information
  if (companyInfo) {
    docDefinition.content.push({ text: "Company Information", style: "subheader" });

    const companyTable = [
      [{ text: "Field", style: "tableHeader" }, { text: "Details", style: "tableHeader" }]
    ];
    if (companyInfo.companyName) companyTable.push(["Company", companyInfo.companyName]);
    if (companyInfo.role) companyTable.push(["Role", companyInfo.role]);
    if (companyInfo.department) companyTable.push(["Department", companyInfo.department]);
    if (companyInfo.internshipType) companyTable.push(["Type", companyInfo.internshipType]);
    if (companyInfo.duration) companyTable.push(["Duration", companyInfo.duration]);
    if (companyInfo.location) companyTable.push(["Work Mode", companyInfo.location]);
    if (companyInfo.city || companyInfo.country) companyTable.push(["Location", [companyInfo.city, companyInfo.country].filter(Boolean).join(", ")]);
    if (companyInfo.stipend) companyTable.push(["Compensation", `${companyInfo.stipend} ${companyInfo.currency || 'INR'}`]);
    if (companyInfo.applicationDate) companyTable.push(["Application Date", new Date(companyInfo.applicationDate).toLocaleDateString()]);
    if (companyInfo.resultDate) companyTable.push(["Result Date", new Date(companyInfo.resultDate).toLocaleDateString()]);

    docDefinition.content.push({
      table: { headerRows: 1, widths: ['35%', '65%'], body: companyTable },
      margin: [0, 0, 0, 15]
    });
  }

  // Candidate Profile
  if (backgroundInfo) {
    docDefinition.content.push({ text: "Candidate Profile", style: "subheader" });

    const bgTable = [
      [{ text: "Aspect", style: "tableHeader" }, { text: "Details", style: "tableHeader" }]
    ];
    if (experienceDoc.userId?.name) bgTable.push(["Student Name", experienceDoc.userId.name]);
    if (experienceDoc.userId?.email) bgTable.push(["Email", experienceDoc.userId.email]);
    if (experienceDoc.userId?.university) bgTable.push(["University", experienceDoc.userId.university]);
    if (backgroundInfo.yearOfStudy) bgTable.push(["Year of Study", backgroundInfo.yearOfStudy]);
    if (backgroundInfo.cgpa) bgTable.push(["CGPA", `${backgroundInfo.cgpa}/10`]);
    if (backgroundInfo.previousInternships > 0) bgTable.push(["Previous Internships", backgroundInfo.previousInternships.toString()]);
    if (backgroundInfo.skills?.length) bgTable.push(["Technical Skills", backgroundInfo.skills.join(", ")]);
    if (backgroundInfo.relevantProjects?.length) bgTable.push(["Projects", backgroundInfo.relevantProjects.join(", ")]);

    docDefinition.content.push({
      table: { headerRows: 1, widths: ['35%', '65%'], body: bgTable },
      margin: [0, 0, 0, 15]
    });
  }

  // Interview Rounds
  if (rounds && rounds.length) {
    docDefinition.content.push({ text: "Interview Process & Rounds", style: "subheader" });

    rounds.forEach((round, idx) => {
      docDefinition.content.push({
        text: `Round ${idx + 1}: ${round.roundType}`,
        bold: true,
        margin: [0, 8, 0, 4]
      });

      const roundTable = [];
      if (round.duration) roundTable.push(["Duration", `${round.duration} minutes`]);
      if (round.platform) roundTable.push(["Platform", round.platform]);
      if (round.roundResult) roundTable.push(["Result", round.roundResult]);
      if (round.overallExperience) roundTable.push(["Experience Rating", `${round.overallExperience}/5`]);

      if (roundTable.length) {
        docDefinition.content.push({
          table: { widths: ['30%', '70%'], body: roundTable },
          margin: [15, 0, 0, 8]
        });
      }

      if (round.technicalQuestions?.length) {
        docDefinition.content.push({ text: "Technical Questions", bold: true, margin: [15, 6, 0, 4] });
        round.technicalQuestions.forEach((q, i) => {
          docDefinition.content.push({ text: `${i + 1}. ${q.question}`, style: "question" });
          const details = [];
          if (q.difficulty) details.push(`Difficulty: ${q.difficulty}`);
          if (q.topics?.length) details.push(`Topics: ${q.topics.join(", ")}`);
          if (q.timeGiven) details.push(`Time: ${q.timeGiven} mins`);
          if (details.length) docDefinition.content.push({ text: details.join(" | "), style: "italic" });
          if (q.leetcodeLink) docDefinition.content.push({ text: q.leetcodeLink, link: q.leetcodeLink, color: "blue", margin: [20, 0, 0, 2] });
          if (q.solution) docDefinition.content.push({ text: `Solution: ${q.solution}`, style: "italic" });
        });
      }

      if (round.behavioralQuestions?.length) {
        docDefinition.content.push({ text: "Behavioral Questions", bold: true, margin: [15, 6, 0, 4] });
        round.behavioralQuestions.forEach((q, i) => {
          docDefinition.content.push({ text: `${i + 1}. ${q.question}`, style: "question" });
          if (q.category) docDefinition.content.push({ text: `Category: ${q.category}`, style: "italic" });
          if (q.yourAnswer) docDefinition.content.push({ text: `Answer: ${q.yourAnswer}`, style: "italic" });
          if (q.tips) docDefinition.content.push({ text: `Tips: ${q.tips}`, style: "italic" });
        });
      }

      if (round.feedback) {
        docDefinition.content.push({ text: `Feedback: ${round.feedback}`, style: "italic" });
      }
      if (round.tips) {
        docDefinition.content.push({ text: `Tips: ${round.tips}`, style: "italic" });
      }
    });
  }

  // Overall Experience Summary
  docDefinition.content.push({ text: "Overall Experience Summary", style: "subheader" });

  const summaryTable = [
    [{ text: "Aspect", style: "tableHeader" }, { text: "Details", style: "tableHeader" }]
  ];
  if (experienceDoc.overallRating) summaryTable.push(["Overall Rating", `${experienceDoc.overallRating}/5`]);
  if (experienceDoc.finalResult) summaryTable.push(["Final Result", experienceDoc.finalResult]);
  if (experienceDoc.wouldRecommend !== undefined) summaryTable.push(["Would Recommend", experienceDoc.wouldRecommend ? "Yes" : "No"]);
  if (experienceDoc.preparationTime !== undefined) summaryTable.push(["Preparation Time", `${experienceDoc.preparationTime} week(s)`]);
  if (experienceDoc.resourcesUsed?.length) summaryTable.push(["Resources Used", experienceDoc.resourcesUsed.join(", ")]);
  if (rounds?.length) summaryTable.push(["Total Rounds", rounds.length.toString()]);

  docDefinition.content.push({
    table: { headerRows: 1, widths: ['35%', '65%'], body: summaryTable },
    margin: [0, 0, 0, 15]
  });

  if (experienceDoc.keyTips) {
    docDefinition.content.push({ text: "Key Tips", bold: true, margin: [0, 5, 0, 3] });
    docDefinition.content.push({ text: experienceDoc.keyTips, style: "italic" });
  }
  if (experienceDoc.mistakesToAvoid) {
    docDefinition.content.push({ text: "Mistakes to Avoid", bold: true, margin: [0, 5, 0, 3] });
    docDefinition.content.push({ text: experienceDoc.mistakesToAvoid, style: "italic" });
  }
  if (experienceDoc.overallExperience) {
    docDefinition.content.push({ text: "Narrative", bold: true, margin: [0, 5, 0, 3] });
    docDefinition.content.push({ text: experienceDoc.overallExperience, style: "text" });
  }

  // Footer
  docDefinition.footer = (currentPage, pageCount) => ({
    columns: [
      { text: `Generated on ${new Date().toLocaleDateString()}`, fontSize: 8, alignment: 'left' },
      { text: `Page ${currentPage} of ${pageCount}`, fontSize: 8, alignment: 'right' }
    ],
    margin: [40, 10]
  });

  return new Promise((resolve, reject) => {
    try {
      const pdfDoc = this.printer.createPdfKitDocument(docDefinition);
      pdfDoc.pipe(fs.createWriteStream(outputPath));
      pdfDoc.end();

      pdfDoc.on('end', () => resolve(outputPath));
      pdfDoc.on('error', (err) => reject(err));
    } catch (error) {
      reject(error);
    }
  });
}


  async generateMultipleExperiencesPdf(experiences, outputDir) {
    const generatedFiles = [];
    
    for (const experience of experiences) {
      try {
        const experienceUser = await User.findById(experience.userId).lean();
        const fileName = `${experienceUser.name}_${experience.companyInfo.companyName.replace(/[^a-zA-Z0-9]/g, '_')}_${experience._id}.pdf`;
        const filePath = path.join(outputDir, fileName);
        
        await this.generateExperiencePdf(experience, filePath);
        generatedFiles.push({
          originalName: fileName,
          path: filePath,
          experienceId: experience._id
        });
      } catch (error) {
        console.error(`Error generating PDF for experience ${experience._id}:`, error);
      }
    }
    
    return generatedFiles;
  }

  async createZipArchive(files, outputPath) {
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(outputPath);
      const archive = archiver('zip', {
        zlib: { level: 9 }
      });

      output.on('close', () => {
        resolve(outputPath);
      });

      archive.on('error', (err) => {
        reject(err);
      });

      archive.pipe(output);

      files.forEach(file => {
        archive.file(file.path, { name: file.originalName });
      });

      archive.finalize();
    });
  }

  async cleanupFiles(filePaths) {
    for (const filePath of filePaths) {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (error) {
        console.error(`Error cleaning up file ${filePath}:`, error);
      }
    }
  }
}

module.exports = new PdfService();
