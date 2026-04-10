const { z } = require("zod");

const adminSignupSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    organizationName: z.string().min(2, "Organization name must be at least 2 characters"),
});

const adminLoginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
});

const addAgentSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email format"),
    serviceCategory: z.string().min(2, "Service category must be at least 2 characters"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

const addOperatorSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    assignedAgents: z.array(z.string()).optional(),
});

module.exports = {
    adminSignupSchema,
    adminLoginSchema,
    addAgentSchema,
    addOperatorSchema
};
