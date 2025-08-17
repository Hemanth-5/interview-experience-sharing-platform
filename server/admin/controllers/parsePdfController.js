const multer = require('multer');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { isAdmin } = require('../../middleware/auth');

const upload = multer({ storage: multer.memoryStorage() });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @route   POST /admin/parse-pdf
// @desc    Admin: Parse PDF and create experience using Gemini LLM
// @access  Admin Only
module.exports = (router) => {
  router.post(
    '/parse-pdf',
    isAdmin,
    upload.single('pdf'),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ success: false, message: 'No PDF uploaded' });
        }

        // 1. Extract text from PDF
        const pdfData = await pdfParse(req.file.buffer);
        const pdfText = pdfData.text;

    // Get company id from form-data (body)
    const companyId = req.body.companyId || req.query.companyId || (req.fields && req.fields.companyId);
    if (!companyId) {
      return res.status(400).json({ success: false, message: 'No company ID found' });
    }
    const companyName = req.body.companyName || req.query.companyName || (req.fields && req.fields.companyName);

        // 2. Prepare prompt for Gemini
        const prompt = `
You are an expert at extracting structured data from interview experience PDFs for a job portal.
Return a JSON object strictly matching this schema (fill missing fields with null/empty):

{
  "companyInfo": {
    "companyId": "${companyId}",
    "companyName": "${companyName}",
    "role": "" (required),
    "department": "" (required) (if not found use Engineering),
    "internshipType": enum('Summer', 'Winter', 'Full-time', 'Part-time', 'PPO', 'Contract') (required),
    "duration": "" (required) (if not choose yourself),
    "location": enum('Remote', 'On-site', 'Hybrid') (required),
    "applicationDate": Date (required),
    "city": null,
    "country": null,
    "stipend": 0,

  },
  "rounds": [
    {
      "roundType": enum('Online Assessment', 'Technical', 'HR', 'Group Discussion', 'Presentation', 'Case Study', 'Coding Round', 'System Design') (required),
      "duration": 1 (in mins) (required),
      "technicalQuestions": [{
        "question": "" (required),
        "difficulty": enum("Easy", "Medium", "Hard"),
        "solution": ""
      }],
      "behavioralQuestions": [{
        "question": "",
        "category": enum('Personal', 'Behavioral', 'Situational', 'Company-specific'),
        "yourAnswer": "",
        "tips": ""
      }],
      "mcqSection": {
        "totalQuestions": 0,
        "timeLimit": 0,
        "topics": [],
        "difficulty": enum("Easy", "Medium", "Hard"),
        "cutoff": 0
      },
      "interviewerDetails": [{
        "role": "",
        "team": "",
        "experienceLevel": enum('Junior', 'Senior', 'Lead', 'Manager', 'Director')
      }],
      "roundResult": enum('Selected', 'Rejected', 'Pending', 'Waitlisted') (required),
      "feedback": null,
      "tips": "" (required) (choose from user's POV),
      "overallExperience": 0 (min-1, max-5) (required) (choose from user's POV)
    }
  ],
  "overallRating": 0 (min-1, max-5) (required) (choose from user's POV),
  "overallExperience": "" (required),
  "finalResult": enum('Selected', 'Rejected', 'Withdrawn', 'Pending'),
  "wouldRecommend": true,
  "preparationTime": 0 (in weeks),
  "resourcesUsed": [""],
  "keyTips": "" (required),
  "mistakesToAvoid": "" (required),
  "backgroundInfo": {
    "cgpa": null,
    "previousInternships": 0,
    "relevantProjects": [],
    "skills": [],
    "yearOfStudy": enum('1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate', 'Postgraduate') (required)
  }
}

PDF TEXT:
${pdfText}
`;

        // 3. Call Gemini API
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const output = result.response.text();
        const cleaned = output.replace(/```json|```/g, '').trim();

        // 4. Parse Gemini output
        let experienceData;
        try {
          experienceData = JSON.parse(cleaned);
        } catch (e) {
          return res.status(500).json({ success: false, message: 'Failed to parse Gemini output', error: e.message, raw: output });
        }

        // 5. Attach userId
        experienceData.userId = req.user._id;
        experienceData.isAnonymous = true;

        // 6. Return parsed data (or you can forward to experience creation logic)
        res.json({ success: true, data: experienceData });
      } catch (error) {
        res.status(500).json({ success: false, message: 'Error parsing PDF', error: error.message });
      }
    }
  );
};
