import { i } from "@instantdb/react";

const _schema = i.schema({
  entities: {
    subscribers: i.entity({
      email: i.string().unique().indexed(),
      source: i.string(),
      createdAt: i.number().indexed(),
    }),
    applications: i.entity({
      name: i.string(),
      email: i.string().unique().indexed(),
      whatYouBuild: i.string(),
      whyYouWantIn: i.string().optional(),
      socialLinks: i.json().optional(),
      appliedVia: i.string(),
      agentName: i.string().optional(),
      status: i.string().indexed(),
      createdAt: i.number().indexed(),
    }),
    conversations: i.entity({
      sessionId: i.string().unique().indexed(),
      messages: i.json(),
      lastResponse: i.string().optional(),
      visitorAgent: i.string().optional(),
      status: i.string().indexed(),
      hasUnknownQuestion: i.boolean(),
      createdAt: i.number().indexed(),
      updatedAt: i.number().indexed(),
    }),
    unknownQuestions: i.entity({
      question: i.string(),
      context: i.json(),
      status: i.string().indexed(),
      answer: i.string().optional(),
      sessionId: i.string().indexed(),
      createdAt: i.number().indexed(),
    }),
    visitorProfiles: i.entity({
      sessionId: i.string().unique().indexed(),
      email: i.string().optional(),
      linkedin: i.string().optional(),
      twitter: i.string().optional(),
      instagram: i.string().optional(),
      github: i.string().optional(),
      additionalInfo: i.json().optional(),
      createdAt: i.number().indexed(),
    }),
  },
});

export default _schema;
