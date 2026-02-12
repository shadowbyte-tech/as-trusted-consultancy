/**
 * Safe AI integration wrapper that prevents build issues
 */

export async function safeGenerateMarketInsights(plots: any[]) {
  // Return fallback insights since AI is disabled for build
  return getFallbackInsights();
}

export async function safeGeneratePlotDescription(input: any) {
  throw new Error('AI features are temporarily disabled');
}

export async function safeAnalyzeVastu(input: any) {
  throw new Error('AI features are temporarily disabled');
}

export async function safeGenerateSitePlan(input: any) {
  throw new Error('AI features are temporarily disabled');
}

export async function safeGetNearbyAmenities(input: any) {
  throw new Error('AI features are temporarily disabled');
}

export async function safeVisualizeFutureDevelopment(input: any) {
  throw new Error('AI features are temporarily disabled');
}

function getFallbackInsights() {
  return {
    hotspotArea: "Multiple premium locations with excellent connectivity and growth potential.",
    trendingOpportunity: "High-demand plots with optimal facing directions and sizes for modern construction.",
    investmentTeaser: "Exclusive properties in emerging areas with strong appreciation prospects."
  };
}