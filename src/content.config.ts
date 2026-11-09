import { defineCollection, z } from 'astro:content';

const decisionSchema = z.object({
  options: z.array(z.string()),
  chosen: z.string(),
  rationale: z.string(),
  confidence: z.enum(['assumed', 'observed', 'validated']),
});

const caseStudies = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    tagline: z.string(),
    problem: z.string(),
    role: z.string(),
    team: z.string().optional(),
    timeline: z.string(),
    constraints: z.array(z.string()),
    decisions: z.array(decisionSchema).optional(),
    outcome: z.object({
      summary: z.string(),
      metrics: z.array(z.string()).optional(),
    }),
    reflection: z.string(),
    cover: z.string().optional(),
    order: z.number().default(99),
    draft: z.boolean().default(false),
    publishedAt: z.coerce.date().optional(),
  }),
});

export const collections = { 'case-studies': caseStudies };
