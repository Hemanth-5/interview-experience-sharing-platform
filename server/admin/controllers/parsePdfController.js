const multer = require('multer');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { isAdmin } = require('../../middleware/auth');

const upload = multer({ storage: multer.memoryStorage() });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Define the response schema for structured output
const experienceSchema = {
  type: "object",
  properties: {
    companyInfo: {
      type: "object",
      properties: {
        companyId: { type: "string" },
        companyName: { type: "string" },
        role: { type: "string" },
        department: { type: "string" },
        internshipType: {
          type: "string",
          enum: ["Summer", "Winter", "Full-time", "Part-time", "PPO", "Contract"]
        },
        duration: { type: "string" },
        location: {
          type: "string",
          enum: ["Remote", "On-site", "Hybrid"]
        },
        applicationDate: { type: "string" },
        city: { type: "string", nullable: true },
        country: { type: "string", nullable: true },
        stipend: { type: "number" }
      },
      required: ["companyId", "companyName", "role", "department", "internshipType", "duration", "location", "applicationDate", "stipend"],
      propertyOrdering: ["companyId", "companyName", "role", "department", "internshipType", "duration", "location", "applicationDate", "city", "country", "stipend"]
    },
    rounds: {
      type: "array",
      items: {
        type: "object",
        properties: {
          roundType: {
            type: "string",
            enum: ["Online Assessment", "Technical", "HR", "Group Discussion", "Presentation", "Case Study", "Coding Round", "System Design"]
          },
          duration: { type: "number" },
          technicalQuestions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                question: { type: "string" },
                difficulty: {
                  type: "string",
                  enum: ["Easy", "Medium", "Hard"]
                },
                solution: { type: "string" }
              },
              required: ["question", "difficulty", "solution"],
              propertyOrdering: ["question", "difficulty", "solution"]
            }
          },
          behavioralQuestions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                question: { type: "string" },
                category: {
                  type: "string",
                  enum: ["Personal", "Behavioral", "Situational", "Company-specific"]
                },
                yourAnswer: { type: "string" },
                tips: { type: "string" }
              },
              required: ["question", "category", "yourAnswer", "tips"],
              propertyOrdering: ["question", "category", "yourAnswer", "tips"]
            }
          },
          mcqSection: {
            type: "object",
            properties: {
              totalQuestions: { type: "number" },
              timeLimit: { type: "number" },
              topics: {
                type: "array",
                items: { type: "string" }
              },
              difficulty: {
                type: "string",
                enum: ["Easy", "Medium", "Hard"]
              },
              cutoff: { type: "number" }
            },
            required: ["totalQuestions", "timeLimit", "topics", "difficulty", "cutoff"],
            propertyOrdering: ["totalQuestions", "timeLimit", "topics", "difficulty", "cutoff"]
          },
          interviewerDetails: {
            type: "array",
            items: {
              type: "object",
              properties: {
                role: { type: "string" },
                team: { type: "string" },
                experienceLevel: {
                  type: "string",
                  enum: ["Junior", "Senior", "Lead", "Manager", "Director"]
                }
              },
              required: ["role", "team", "experienceLevel"],
              propertyOrdering: ["role", "team", "experienceLevel"]
            }
          },
          roundResult: {
            type: "string",
            enum: ["Selected", "Rejected", "Pending", "Waitlisted"]
          },
          feedback: { type: "string", nullable: true },
          tips: { type: "string" },
          overallExperience: { type: "number", minimum: 1, maximum: 5 }
        },
        required: ["roundType", "duration", "technicalQuestions", "behavioralQuestions", "mcqSection", "interviewerDetails", "roundResult", "tips", "overallExperience"],
        propertyOrdering: ["roundType", "duration", "technicalQuestions", "behavioralQuestions", "mcqSection", "interviewerDetails", "roundResult", "feedback", "tips", "overallExperience"]
      }
    },
    overallRating: { type: "number", minimum: 1, maximum: 5 },
    overallExperience: { type: "string" },
    finalResult: {
      type: "string",
      enum: ["Selected", "Rejected", "Withdrawn", "Pending"]
    },
    wouldRecommend: { type: "boolean" },
    preparationTime: { type: "number" },
    resourcesUsed: {
      type: "array",
      items: { type: "string" }
    },
    keyTips: { type: "string" },
    mistakesToAvoid: { type: "string" },
    backgroundInfo: {
      type: "object",
      properties: {
        cgpa: { type: "number", nullable: true },
        previousInternships: { type: "number" },
        relevantProjects: {
          type: "array",
          items: { type: "string" }
        },
        skills: {
          type: "array",
          items: { type: "string" }
        },
        yearOfStudy: {
          type: "string",
          enum: ["1st Year", "2nd Year", "3rd Year", "4th Year", "Graduate", "Postgraduate"]
        }
      },
      required: ["previousInternships", "relevantProjects", "skills", "yearOfStudy"],
      propertyOrdering: ["cgpa", "previousInternships", "relevantProjects", "skills", "yearOfStudy"]
    }
  },
  required: ["companyInfo", "rounds", "overallRating", "overallExperience", "finalResult", "wouldRecommend", "preparationTime", "resourcesUsed", "keyTips", "mistakesToAvoid", "backgroundInfo"],
  propertyOrdering: ["companyInfo", "rounds", "overallRating", "overallExperience", "finalResult", "wouldRecommend", "preparationTime", "resourcesUsed", "keyTips", "mistakesToAvoid", "backgroundInfo"]
};

// @route   POST /admin/parse-pdf
// @desc    Admin: Parse PDF and create experience using Gemini LLM with structured output
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

        // 2. Prepare prompt for Gemini with structured output
        const prompt = `
You are an expert at extracting structured data from interview experience PDFs for a job portal.
Extract all available information from the PDF and structure it according to the provided schema.

Important guidelines:
- Fill ALL fields in the schema
- Use null for truly missing string/object fields, 0 for missing numbers, empty arrays for missing lists, false for missing booleans
- For enum fields, ONLY use the exact values provided in the enum list
- If department is not mentioned, use "Engineering"
- If duration is not mentioned, make a reasonable estimate
- Rate experiences from 1-5 based on the tone and content
- For company info, use the provided companyId: "${companyId}" and companyName: "${companyName || 'Unknown Company'}"
- Infer missing information from context where possible
- For dates, use ISO format (YYYY-MM-DD)
- For tips and experiences, write from the candidate's perspective

PDF Content:
${pdfText}
`;

        // 3. Call Gemini API with structured output
        const model = genAI.getGenerativeModel({ 
          model: "gemini-1.5-flash",
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: experienceSchema
          }
        });

        const result = await model.generateContent(prompt);
        const experienceData = JSON.parse(result.response.text());

        // 4. Attach userId and set as anonymous
        experienceData.userId = req.user._id;
        experienceData.isAnonymous = true;

        // 5. Ensure companyId and companyName are set correctly
        experienceData.companyInfo.companyId = companyId;
        if (companyName) {
          experienceData.companyInfo.companyName = companyName;
        }

        // 6. Return parsed data
        res.json({ 
          success: true, 
          data: experienceData,
          message: 'PDF parsed successfully with structured output'
        });

      } catch (error) {
        console.error('Error parsing PDF:', error);
        res.status(500).json({ 
          success: false, 
          message: 'Error parsing PDF', 
          error: error.message 
        });
      }
    }
  );
};