import {
  AgentConfig,
  AgentCapability,
  ToolCategory,
} from '../tools/types';
import { agentCapabilitiesManager, DEFAULT_AGENT_CONFIGS } from './capabilities';

/**
 * Agent Registration System
 * Pre-registers common agent types for the system
 */

// Voice/Text-to-Speech Agents (Full tool access, just different I/O modality)
export const VOICE_AGENTS = {
  basicVoice: {
    id: 'basic-voice-assistant',
    name: 'Basic Voice Assistant',
    capabilities: [AgentCapability.BASIC],
    allowedToolCategories: [ToolCategory.UTILITY, ToolCategory.SEARCH, ToolCategory.WEATHER],
    maxConcurrentTools: 2,
    timeoutMs: 30000,
  },

  advancedVoice: {
    id: 'advanced-voice-assistant',
    name: 'Advanced Voice Assistant',
    capabilities: [AgentCapability.BASIC, AgentCapability.ADVANCED],
    allowedToolCategories: [
      ToolCategory.UTILITY,
      ToolCategory.SEARCH,
      ToolCategory.WEATHER,
      ToolCategory.CALCULATION,
      ToolCategory.COMMUNICATION
    ],
    maxConcurrentTools: 4,
    timeoutMs: 45000,
  },

  voiceConcierge: {
    id: 'voice-concierge',
    name: 'Voice Concierge',
    capabilities: [AgentCapability.BASIC, AgentCapability.ADVANCED, AgentCapability.ADMIN],
    allowedToolCategories: Object.values(ToolCategory), // Full access
    maxConcurrentTools: 6,
    timeoutMs: 60000,
  },
};

// Image Generation Agents (Tools for image processing)
export const IMAGE_AGENTS = {
  basicImageGen: {
    id: 'basic-image-generator',
    name: 'Basic Image Generator',
    capabilities: [AgentCapability.BASIC],
    allowedToolCategories: [ToolCategory.UTILITY], // Basic image utilities
    maxConcurrentTools: 2,
    timeoutMs: 60000,
  },

  advancedImageGen: {
    id: 'advanced-image-generator',
    name: 'Advanced Image Generator',
    capabilities: [AgentCapability.BASIC, AgentCapability.ADVANCED],
    allowedToolCategories: [ToolCategory.UTILITY, ToolCategory.DATA_PROCESSING],
    maxConcurrentTools: 4,
    timeoutMs: 120000,
  },

  imageEditor: {
    id: 'image-editor',
    name: 'Image Editor',
    capabilities: [AgentCapability.BASIC, AgentCapability.ADVANCED],
    allowedToolCategories: [ToolCategory.UTILITY, ToolCategory.DATA_PROCESSING, ToolCategory.CALCULATION],
    maxConcurrentTools: 3,
    timeoutMs: 90000,
  },
};

// Code Generation Agents (Full tool access)
export const CODE_AGENTS = {
  basicCoder: {
    id: 'basic-code-assistant',
    name: 'Basic Code Assistant',
    capabilities: [AgentCapability.BASIC],
    allowedToolCategories: [ToolCategory.UTILITY, ToolCategory.SEARCH],
    maxConcurrentTools: 3,
    timeoutMs: 60000,
  },

  advancedCoder: {
    id: 'advanced-code-assistant',
    name: 'Advanced Code Assistant',
    capabilities: [AgentCapability.BASIC, AgentCapability.ADVANCED],
    allowedToolCategories: [
      ToolCategory.UTILITY,
      ToolCategory.SEARCH,
      ToolCategory.CALCULATION,
      ToolCategory.DATA_PROCESSING,
      ToolCategory.COMMUNICATION,
    ],
    maxConcurrentTools: 6,
    timeoutMs: 120000,
  },

  fullStackCoder: {
    id: 'fullstack-code-assistant',
    name: 'Full-Stack Code Assistant',
    capabilities: [AgentCapability.BASIC, AgentCapability.ADVANCED, AgentCapability.ADMIN],
    allowedToolCategories: Object.values(ToolCategory), // All tools
    maxConcurrentTools: 10,
    timeoutMs: 180000,
  },
};

// Data Analysis Agents
export const DATA_AGENTS = {
  basicDataAnalyzer: {
    id: 'basic-data-analyzer',
    name: 'Basic Data Analyzer',
    capabilities: [AgentCapability.BASIC],
    allowedToolCategories: [ToolCategory.UTILITY, ToolCategory.CALCULATION],
    maxConcurrentTools: 4,
    timeoutMs: 90000,
  },

  advancedDataScientist: {
    id: 'advanced-data-scientist',
    name: 'Advanced Data Scientist',
    capabilities: [AgentCapability.BASIC, AgentCapability.ADVANCED],
    allowedToolCategories: [
      ToolCategory.UTILITY,
      ToolCategory.CALCULATION,
      ToolCategory.DATA_PROCESSING,
      ToolCategory.SEARCH,
    ],
    maxConcurrentTools: 8,
    timeoutMs: 180000,
  },

  mlEngineer: {
    id: 'ml-engineer',
    name: 'ML Engineer',
    capabilities: [AgentCapability.BASIC, AgentCapability.ADVANCED, AgentCapability.ADMIN],
    allowedToolCategories: Object.values(ToolCategory),
    maxConcurrentTools: 12,
    timeoutMs: 300000,
  },
};

// Communication Agents
export const COMMUNICATION_AGENTS = {
  emailAssistant: {
    id: 'email-assistant',
    name: 'Email Assistant',
    capabilities: [AgentCapability.BASIC],
    allowedToolCategories: [ToolCategory.UTILITY, ToolCategory.SEARCH],
    maxConcurrentTools: 2,
    timeoutMs: 30000,
  },

  socialMediaManager: {
    id: 'social-media-manager',
    name: 'Social Media Manager',
    capabilities: [AgentCapability.BASIC, AgentCapability.ADVANCED],
    allowedToolCategories: [ToolCategory.UTILITY, ToolCategory.SEARCH, ToolCategory.COMMUNICATION],
    maxConcurrentTools: 5,
    timeoutMs: 60000,
  },
};

// Specialized Agents
export const SPECIALIZED_AGENTS = {
  weatherSpecialist: DEFAULT_AGENT_CONFIGS.weatherSpecialist,

  financialAdvisor: {
    id: 'financial-advisor',
    name: 'Financial Advisor',
    capabilities: [AgentCapability.BASIC, AgentCapability.ADVANCED],
    allowedToolCategories: [ToolCategory.CALCULATION, ToolCategory.DATA_PROCESSING, ToolCategory.SEARCH],
    maxConcurrentTools: 6,
    timeoutMs: 90000,
  },

  legalAssistant: {
    id: 'legal-assistant',
    name: 'Legal Assistant',
    capabilities: [AgentCapability.BASIC, AgentCapability.ADVANCED],
    allowedToolCategories: [ToolCategory.SEARCH, ToolCategory.UTILITY, ToolCategory.DATA_PROCESSING],
    maxConcurrentTools: 4,
    timeoutMs: 120000,
  },

  medicalAssistant: {
    id: 'medical-assistant',
    name: 'Medical Assistant',
    capabilities: [AgentCapability.BASIC],
    allowedToolCategories: [ToolCategory.SEARCH, ToolCategory.UTILITY],
    maxConcurrentTools: 2,
    timeoutMs: 60000,
  },
};

/**
 * Register all predefined agents with the system
 */
export function registerAllAgents(): void {
  console.log('Registering all predefined agents...');

  // Register voice agents
  Object.values(VOICE_AGENTS).forEach(agent => {
    agentCapabilitiesManager.registerAgent(agent);
  });

  // Register image agents
  Object.values(IMAGE_AGENTS).forEach(agent => {
    agentCapabilitiesManager.registerAgent(agent);
  });

  // Register code agents
  Object.values(CODE_AGENTS).forEach(agent => {
    agentCapabilitiesManager.registerAgent(agent);
  });

  // Register data agents
  Object.values(DATA_AGENTS).forEach(agent => {
    agentCapabilitiesManager.registerAgent(agent);
  });

  // Register communication agents
  Object.values(COMMUNICATION_AGENTS).forEach(agent => {
    agentCapabilitiesManager.registerAgent(agent);
  });

  // Register specialized agents
  Object.values(SPECIALIZED_AGENTS).forEach(agent => {
    agentCapabilitiesManager.registerAgent(agent);
  });

  // Register default agents
  Object.values(DEFAULT_AGENT_CONFIGS).forEach(agent => {
    try {
      agentCapabilitiesManager.registerAgent(agent);
    } catch (error) {
      // Skip if already registered
    }
  });

  console.log('All agents registered successfully');
}

/**
 * Get agent by type and tier
 */
export function getAgentByType(type: string, tier: 'basic' | 'advanced' | 'admin' = 'basic'): AgentConfig | undefined {
  const typeMap = {
    voice: VOICE_AGENTS,
    image: IMAGE_AGENTS,
    code: CODE_AGENTS,
    data: DATA_AGENTS,
    communication: COMMUNICATION_AGENTS,
    specialized: SPECIALIZED_AGENTS,
  };

  const agents = typeMap[type as keyof typeof typeMap];
  if (!agents) return undefined;

  const tierMap = {
    basic: `${tier}${type.charAt(0).toUpperCase() + type.slice(1)}`,
    advanced: `advanced${type.charAt(0).toUpperCase() + type.slice(1)}`,
    admin: type === 'code' ? 'fullStackCoder' : `${tier}${type.charAt(0).toUpperCase() + type.slice(1)}`,
  };

  const agentKey = tierMap[tier] as keyof typeof agents;
  return agents[agentKey];
}

/**
 * Create custom agent configuration
 */
export function createCustomAgent(config: {
  id: string;
  name: string;
  type: 'voice' | 'image' | 'code' | 'data' | 'communication' | 'general';
  capabilities: AgentCapability[];
  additionalCategories?: ToolCategory[];
  maxConcurrentTools?: number;
  timeoutMs?: number;
}): AgentConfig {
  const baseConfig = getAgentByType(config.type, 'basic') || DEFAULT_AGENT_CONFIGS.basicAssistant;

  return {
    id: config.id,
    name: config.name,
    capabilities: config.capabilities,
    allowedToolCategories: [
      ...baseConfig.allowedToolCategories,
      ...(config.additionalCategories || []),
    ],
    maxConcurrentTools: config.maxConcurrentTools || baseConfig.maxConcurrentTools,
    timeoutMs: config.timeoutMs || baseConfig.timeoutMs,
  };
}
