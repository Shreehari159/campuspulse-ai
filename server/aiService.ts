import { GoogleGenAI } from '@google/genai';

// Initialize the Google GenAI SDK server-side
const apiKey = process.env.GEMINI_API_KEY || '';

const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export interface InterventionAiRequest {
  studentName: string;
  program: string;
  year: number;
  vitalityLabel: string;
  contributingFactors: Array<{ factor: string; impact: string; weight: number }>;
  currentGpa: number;
  recentAttendanceRate: number;
  identifiedBarrier?: string;
}

export interface InterventionAiResponse {
  humanCenteredSummary: string;
  empatheticOutreachMessage: string;
  actionSteps: string[];
  recommendedCampusResource: string;
  advisorDiscussionQuestions: string[];
}

export async function generateStudentInterventionStrategy(
  params: InterventionAiRequest
): Promise<InterventionAiResponse> {
  // If no API key is provided, return structured expert pedagogical fallback
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return generatePedagogicalFallback(params);
  }

  try {
    const prompt = `
You are a senior Higher Education Student Success specialist and cognitive development advisor operating within CampusPulse AI.
Core principle: STUDENT = PERSON, NOT RECORD. Emphasize empathy, dignity, growth mindset, and agency. Never use stigmatizing or punitive language.

Student Profile:
- Name: ${params.studentName}
- Degree Program: ${params.program} (Year ${params.year})
- Current GPA: ${params.currentGpa.toFixed(2)}
- Recent Course Attendance: ${(params.recentAttendanceRate * 100).toFixed(0)}%
- Academic Vitality Status: ${params.vitalityLabel}
- Primary Detected Early Indicators: ${params.contributingFactors.map(f => `${f.factor} (${f.impact})`).join(', ')}
${params.identifiedBarrier ? `- Identified Barrier from conversation: ${params.identifiedBarrier}` : ''}

Provide a structured JSON response with:
1. "humanCenteredSummary": A 2-sentence holistic, empathetic overview of the student's current learning context without clinical assumptions.
2. "empatheticOutreachMessage": A warm, supportive 3-4 sentence message draft that an advisor or professor can send to invite the student for a low-pressure check-in.
3. "actionSteps": An array of 3 specific, achievable collaborative steps to rebuild academic momentum.
4. "recommendedCampusResource": 1 specific campus service recommendation (e.g., Peer Tutoring, Writing Studio, Academic Time Management Coaching).
5. "advisorDiscussionQuestions": An array of 2 open-ended, active-listening questions for the 1-on-1 meeting.
`;

    const callPromise = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI inference timeout')), 3500)
    );

    const response = await Promise.race([callPromise, timeoutPromise]);

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text);
      return {
        humanCenteredSummary: parsed.humanCenteredSummary || 'Student is experiencing temporary academic friction in course pacing.',
        empatheticOutreachMessage: parsed.empatheticOutreachMessage || `Hi ${params.studentName}, I noticed we haven't connected in a few weeks and wanted to check in. Let's grab 15 minutes to chat about how your courses are feeling this semester!`,
        actionSteps: Array.isArray(parsed.actionSteps) ? parsed.actionSteps : [
          'Schedule an exploratory 20-minute advising check-in',
          'Review course milestone pacing for the upcoming midterm',
          'Connect with peer study group or department tutoring'
        ],
        recommendedCampusResource: parsed.recommendedCampusResource || 'Academic Success Center & Peer Tutoring',
        advisorDiscussionQuestions: Array.isArray(parsed.advisorDiscussionQuestions) ? parsed.advisorDiscussionQuestions : [
          'What part of the syllabus has felt most engaging so far, and where has the workload felt heaviest?',
          'How can we adjust your weekly study cadence to fit your current schedule?'
        ]
      };
    }
    return generatePedagogicalFallback(params);
  } catch (error) {
    console.warn('Gemini API call warning, utilizing pedagogical rule engine:', error);
    return generatePedagogicalFallback(params);
  }
}

function generatePedagogicalFallback(params: InterventionAiRequest): InterventionAiResponse {
  const isAttendanceConcern = params.recentAttendanceRate < 0.8;
  return {
    humanCenteredSummary: `${params.studentName} is navigating course workload demands in ${params.program}. Current signals indicate ${isAttendanceConcern ? 'scheduling or pace friction impacting class consistency' : 'submission timing adjustments needed to maintain high momentum'}.`,
    empatheticOutreachMessage: `Hi ${params.studentName}, I wanted to reach out because your academic journey is important to us. We have some great resources available this term, and I'd love to connect for 15 minutes to hear how your classes are going and how we can support you.`,
    actionSteps: [
      'Conduct a 15-minute supportive check-in to understand any scheduling or life barriers',
      'Co-create a realistic weekly assignment checklist for key course milestones',
      'Establish a standing bi-weekly touchpoint with department peer mentoring'
    ],
    recommendedCampusResource: isAttendanceConcern ? 'Student Success Coaching & Academic Advising' : 'Department Peer Tutoring & Writing Center',
    advisorDiscussionQuestions: [
      'What has been the most fulfilling part of your semester so far, and where have you encountered unexpected roadblocks?',
      'What support would make the biggest difference in your routine right now?'
    ]
  };
}
