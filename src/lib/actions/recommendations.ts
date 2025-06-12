"use server";

import { recommendHospitals as recommendHospitalsFlow, type RecommendHospitalsInput, type RecommendHospitalsOutput } from '@/ai/flows/smart-hospital-recommendations';

interface ActionResult {
  success: boolean;
  data?: RecommendHospitalsOutput;
  error?: string;
}

export async function getSmartRecommendations(input: RecommendHospitalsInput): Promise<ActionResult> {
  try {
    // Input validation can be done here if needed, though the AI flow also has schema validation.
    if (!input.medicalRequirements || !input.location) {
      return { success: false, error: "Medical requirements and location are mandatory." };
    }

    const result = await recommendHospitalsFlow(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error getting smart recommendations:", error);
    // Consider logging the error more robustly in a real application
    
    // Check if it's a known error structure from Genkit or AI service
    if (error instanceof Error) {
        return { success: false, error: `An unexpected error occurred: ${error.message}` };
    }
    return { success: false, error: "An unexpected error occurred while fetching recommendations." };
  }
}
