// utils/caseConverter.ts
export const toCamelCase = (str: string): string => {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
};

export const toSnakeCase = (str: string): string => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

export const convertKeysToCamelCase = <T = any>(obj: any): T => {
  if (obj === null || obj === undefined) return obj;
  
  if (obj instanceof Date) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => convertKeysToCamelCase(item)) as T;
  }
  
  if (typeof obj === 'object' && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = toCamelCase(key);
      result[camelKey] = convertKeysToCamelCase(obj[key]);
      return result;
    }, {} as any) as T;
  }
  
  return obj;
};

export const convertKeysToSnakeCase = <T = any>(obj: any): T => {
  if (obj === null || obj === undefined) return obj;
  
  if (obj instanceof Date) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => convertKeysToSnakeCase(item)) as T;
  }
  
  if (typeof obj === 'object' && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const snakeKey = toSnakeCase(key);
      result[snakeKey] = convertKeysToSnakeCase(obj[key]);
      return result;
    }, {} as any) as T;
  }
  
  return obj;
};