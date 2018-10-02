import isPlainObject from 'is-plain-object';

interface Obj {
  [key: string]: any;
}

export default function deepMap(obj: any, fn: (value: any) => any): any {
  if (isPlainObject(obj)) {
    // tslint:disable:no-unsafe-any
    
    const res: Obj = {};
    for (const key in obj)
      res[key] = deepMap(obj[key], fn);
    
    return res;
    
    // tslint:enable:no-unsafe-any
  }
  
  return fn(obj);
}
