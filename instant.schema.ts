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
  },
});

export default _schema;
