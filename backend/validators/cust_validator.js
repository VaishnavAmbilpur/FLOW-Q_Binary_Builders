const { z } = require("zod");

const customerZodSchema = z.object({
  name: z.string()
    .min(1, "Customer name is required")
    .max(100, "Name is too long"),

  agentId: z.string()
    .min(1, "Agent ID is required"),

  description: z.string()
    .max(500, "Description is too long")
    .optional()
    .or(z.literal("")),

  number: z.string()
    .min(5, "Phone number requires at least 5 characters")
    .max(20, "Phone number is too long"),

  tokenNumber: z
    .number()
    .int()
    .positive()
    .optional(),

  status: z
    .enum(["waiting", "completed", "cancelled"])
    .optional()
    .default("waiting"),

  uniqueLinkId: z
    .string()
    .min(1, "Unique link ID is required")
    .optional(),

  createdAt: z
    .date()
    .optional(),

  completedAt: z
    .date()
    .optional(),
});

// Schema for adding a customer (only required fields from frontend)
const addCustomerSchema = customerZodSchema.pick({
  name: true,
  description: true,
  number: true,
}).extend({
  agentId: z.string().optional(), // Optional: required for operators, not for agents
  notes: z.string().max(300, "Note is too long").optional().or(z.literal("")) // Personnel service note
});

module.exports = {
  customerZodSchema,
  addCustomerSchema,
};
