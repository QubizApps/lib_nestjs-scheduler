import { getSchemaPath } from '@nestjs/swagger';

export const ApiResultDtoResponse = (
  // eslint-disable-next-line @typescript-eslint/ban-types
  model: string | Function,
  isArray: boolean,
): Record<string, any> => ({
  properties: {
    data: isArray
      ? { type: 'array', items: { $ref: getSchemaPath(model) } }
      : { $ref: getSchemaPath(model) },
    total: { type: 'number' },
    offset: { type: 'number' },
    limit: { type: 'number' },
  },
  required: ['data'],
});
