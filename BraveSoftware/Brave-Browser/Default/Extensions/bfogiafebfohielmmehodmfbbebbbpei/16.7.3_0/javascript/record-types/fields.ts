import fieldsJSON from './fields.json';

export interface Field {
  $id: string,
  type: string,
  multiple?: boolean,
  lookup?: string
}

export const field = fieldsJSON as Field[]