import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { FunctionDeclaration, Type, Schema } from '@google/genai';

export type ToolConfig<T> = {
  description: string;
  inputSchema: z.ZodType<T>;
  execute: (args: T) => Promise<any>;
};

export type GoogleTool<T> = {
  declaration: FunctionDeclaration;
  execute: (args: T) => Promise<any>;
};

// Recursively map JSON Schema types to Google's Type enum
function mapSchema(jsonSchema: any): Schema {
  const schema: Schema = {
    type: jsonSchema.type?.toUpperCase() as Type,
    description: jsonSchema.description,
  };

  if (jsonSchema.type === 'object') {
    schema.properties = {};
    for (const key in jsonSchema.properties) {
      schema.properties[key] = mapSchema(jsonSchema.properties[key]);
    }
    if (jsonSchema.required) {
      schema.required = jsonSchema.required;
    }
  } else if (jsonSchema.type === 'array') {
    schema.items = mapSchema(jsonSchema.items);
  }

  // Handle enums
  if (jsonSchema.enum) {
      schema.enum = jsonSchema.enum;
  }

  return schema;
}

export function defineTool<T>(config: ToolConfig<T>): GoogleTool<T> {
  // Use zodToJsonSchema and force target to jsonSchema7 which is standard
  const jsonSchema: any = zodToJsonSchema(config.inputSchema as any, { target: 'jsonSchema7' });
  
  // Google's format requires stripping out the root $schema and mapping types to the Type enum
  const mappedSchema = mapSchema(jsonSchema);

  return {
    declaration: {
      name: '', // The name must be injected by the consumer based on the export name, or we can assume it's set later.
      description: config.description,
      parameters: mappedSchema as any,
    },
    execute: config.execute
  };
}
