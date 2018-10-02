import isFQDN from 'validator/lib/isFQDN';
import isFloat from 'validator/lib/isFloat';
import isIP from 'validator/lib/isIP';
import isInt from 'validator/lib/isInt';
import isPort from 'validator/lib/isPort';
import deepMap from './deep-map';

export type ReadFn<T> = (env: NodeJS.ProcessEnv, prefix?: string) => T;
export type ReadFnMap<T> = { [K in keyof T]: ReadFn<T[K]> | ReadFnMap<T[K]> };
export type ValidateFn<T, O> = (value: string, options?: O) => T;
export type Validator<T, O> = (name: string, defaultValue?: T, options?: O) => ReadFn<T>;

function concat(outerPrefix: string | undefined, prefix: string | undefined): string {
  if (outerPrefix && prefix)
    return `${outerPrefix}_${prefix}`;
  
  if (outerPrefix)
    return outerPrefix;
  
  if (prefix)
    return prefix;
  
  return '';
}

export function scope<T>(prefix: string, map: ReadFnMap<T>): ReadFn<T> {
  return (env, outerPrefix) => {
    const fullPrefix = concat(outerPrefix, prefix);
    
    return deepMap(map, fn => {
      // tslint:disable-next-line:no-unsafe-any
      return fn(env, fullPrefix);
    });
  };
}

export function createValidator<T, O>(validate: ValidateFn<T, O>): Validator<T, O> {
  return (name, defaultValue, options) => {
    return (env, prefix) => {
      const fullName = concat(prefix, name);
      const value = env[fullName];
      
      if (value === undefined) {
        if (defaultValue === undefined)
          throw new Error(`missing env var: "${fullName}"`);
        
        return defaultValue;
      }
      
      try {
        return validate(value, options);
      } catch (err) {
        const reason = (err as Error).message;
        const rethrow = new Error(`invalid env var "${fullName}": ${reason}`);
        
        throw rethrow;
      }
    };
  };
}

export type StringOptions = undefined;
export const str = createValidator<string, StringOptions>(value => value);

export type FloatOptions = ValidatorJS.IsFloatOptions;
export const float = createValidator<number, FloatOptions>((value, options) => {
  if (!isFloat(value, options))
    throw new Error('invalid float number');
  
  return parseFloat(value);
});

export type IntegerOptions = ValidatorJS.IsIntOptions;
export const integer = createValidator<number, IntegerOptions>((value, options) => {
  if (!isInt(value, options))
    throw new Error('invalid integer number');
  
  return parseInt(value, 10);
});

export type HostOptions = ValidatorJS.IsFQDNOptions & { ipVersion?: number };
export const host = createValidator<string, HostOptions>((value, options) => {
  if (!isFQDN(value, options) && !isIP(value, options && options.ipVersion))
    throw new Error('invalid host');
  
  return value;
});

export type PortOptions = undefined;
export const port = createValidator<number, PortOptions>(value => {
  if (!isPort(value))
    throw new Error('invalid port number');
  
  return parseInt(value, 10);
});
