const db = require("../config/db");
const axios = require("axios");
require("dotenv").config();

// Helper function to call Gemini API
const callGemini = async (prompt, systemInstruction = "") => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null; // Fallback to mock
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await axios.post(url, {
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined
    });

    if (
      response.data &&
      response.data.candidates &&
      response.data.candidates[0] &&
      response.data.candidates[0].content &&
      response.data.candidates[0].content.parts &&
      response.data.candidates[0].content.parts[0]
    ) {
      return response.data.candidates[0].content.parts[0].text;
    }
    return null;
  } catch (error) {
    console.error("Gemini API call failed, using mock fallback:", error.message);
    return null;
  }
};

// 1. AI Chatbot
exports.chatbotResponse = async (req, res) => {
  try {
    const { message, context = {} } = req.body;
    const { courseTitle = "", moduleTitle = "" } = context;

    let prompt = `User query: "${message}"\n`;
    if (courseTitle || moduleTitle) {
      prompt += `Current Learning Context: Course is "${courseTitle}" and Module is "${moduleTitle}". Please provide a helpful, concise answer relating to this technical domain.`;
    }

    const systemInstruction = "You are a friendly, highly intelligent AI Coding and Learning assistant on the Emerging Technologies Learning Portal (ETLP). Help students understand concepts in AI, ML, Cloud Computing, Cyber Security, Blockchain, Web/Mobile Dev, DevOps, and UI/UX. Keep explanations clear, technical, and format code snippets beautifully if requested.";

    // Try calling real Gemini API
    let answer = await callGemini(prompt, systemInstruction);

    // Fallback to high-quality mockup responses
    if (!answer) {
      const lowerMsg = message.toLowerCase();
      if (lowerMsg.includes("hello") || lowerMsg.includes("hi")) {
        answer = `Hello! I am your AI Learning Assistant. I'm here to help you study **${courseTitle || "Emerging Technologies"}**. What questions do you have today?`;
      } else if (lowerMsg.includes("code") || lowerMsg.includes("example") || lowerMsg.includes("write")) {
        answer = `Here is a quick concept example relating to **${courseTitle || "programming"}**:\n\n\`\`\`javascript\n// Emerging Technologies Example\nconst learnTechnology = async (techName) => {\n  console.log(\`Initializing study path for \${techName}...\`);\n  // AI, ML, Cloud, DevOps, Blockchain, Cybersecurity\n  return new Promise(resolve => setTimeout(() => resolve("Success!"), 1000));\n};\n\nlearnTechnology("${courseTitle || "AI"}").then(res => console.log(res));\n\`\`\`\nLet me know if you need me to explain this or write code in a specific language!`;
      } else {
        answer = `That is a great question! Regarding **"${message}"** in the context of **${courseTitle || "this course"}**, here is an overview:\n\n1. **Core Concept**: Understanding this involves analyzing standard industry practices in emerging tech.\n2. **Best Practices**: Ensure you review the modules, complete the related quizzes, and check out the interactive labs.\n3. **Practical Application**: This is widely used in real-world scalable deployments (e.g. MLOps, CI/CD pipelines, or cloud hosting).\n\nFeel free to ask more specific questions or request a code example!`;
      }
    }

    res.json({
      success: true,
      reply: answer
    });
  } catch (error) {
    console.error("Chatbot controller error:", error);
    res.status(500).json({ success: false, message: "Chatbot Error" });
  }
};

// 2. AI Video Summary Generator
exports.generateSummary = async (req, res) => {
  try {
    const { videoId, videoTitle = "this lesson", duration = "10 minutes" } = req.body;

    const prompt = `Generate a structured, professional learning summary for a video lecture titled "${videoTitle}" (Duration: ${duration}). Include 3 Key Takeaways, a 2-paragraph Summary, and 2 Study Check questions. Use markdown formatting.`;

    let summary = await callGemini(prompt);

    if (!summary) {
      summary = `### 📝 Learning Summary: **${videoTitle}**

#### 🔑 Key Takeaways
1. **Core Architecture**: Understand how this technology forms the baseline for high-performance deployments.
2. **Implementation Flow**: Learn the exact sequence of instructions required to setup and debug the environment.
3. **Common Pitfalls**: Avoid insecure protocols, unparameterized inputs, and lack of rate-limiting in routing configurations.

#### 📖 Lecture Summary
This lesson covers the fundamental models of **${videoTitle}**. It explains how to structure systems to achieve maximum availability and throughput. By reviewing real-world application examples, we establish why industry leaders prioritize these practices.

Additionally, the session highlights the integration of robust security configurations, payload encryption techniques, and role isolation protocols to safeguard enterprise data assets.

#### 🧠 Study Check
* **Question 1**: How does this mechanism differ from classic legacy systems?
* **Question 2**: What is the performance impact of caching modules locally?`;
    }

    res.json({
      success: true,
      summary
    });
  } catch (error) {
    console.error("Summary controller error:", error);
    res.status(500).json({ success: false, message: "Summary Generation Error" });
  }
};

// 3. AI Course Recommendation System
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get courses user is currently enrolled in
    const [enrolled] = await db.query(
      "SELECT course_id FROM enrollments WHERE user_id = ?",
      [userId]
    );

    const enrolledIds = enrolled.map(e => e.course_id);

    // Get all courses
    const [allCourses] = await db.query("SELECT * FROM courses");

    let recommended = [];

    if (enrolledIds.length === 0) {
      // If not enrolled in any, recommend trending courses (just slice first 3)
      recommended = allCourses.slice(0, 3);
    } else {
      // Find what categories the student likes
      const [userCategories] = await db.query(
        `SELECT DISTINCT category FROM courses WHERE id IN (${enrolledIds.length > 0 ? enrolledIds.join(",") : "0"})`
      );
      const categories = userCategories.map(c => c.category);

      // Recommend courses from same categories or general complementary ones that the user is not enrolled in
      recommended = allCourses.filter(c => !enrolledIds.includes(c.id));
      
      // Sort by category match (put matching categories first)
      recommended.sort((a, b) => {
        const aMatch = categories.includes(a.category) ? 1 : 0;
        const bMatch = categories.includes(b.category) ? 1 : 0;
        return bMatch - aMatch;
      });

      // Take top 3
      recommended = recommended.slice(0, 3);
    }

    res.json({
      success: true,
      recommendations: recommended
    });
  } catch (error) {
    console.error("Recommendation controller error:", error);
    res.status(500).json({ success: false, message: "Recommendations Error" });
  }
};
