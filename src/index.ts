

import * as _ from 'lodash';
import * as jsonStrinigySafe from 'json-stringify-safe';
import { walk } from 'lodash-walk-object';
import { CLASS } from 'typescript-class-helpers';

export type Circ = { pathToObj: string; circuralTargetPath: string; };

function type(o) {
  if (Array.isArray(o)) {
    return 'array'
  }
  return typeof o;
}

export class JSON10 {
  public static circural: Circ[] = [];

  public static structureArray(anyJSON: Object) {
    let pathes = []
    walk.Object(anyJSON, (value, lodashPath) => {
      pathes.push(lodashPath)
    })
    return pathes;
  }

  public static cleaned(anyJSON: Object) {
    this.circural = [];
    let jsonstring = jsonStrinigySafe(anyJSON)
    let json = JSON.parse(jsonstring);

    walk.Object(json, (value, lodashPath, changeValueTo) => {

      if (_.isString(value) && value.startsWith('[Circular')) {

        const circ: Circ = {
          pathToObj: lodashPath,
          circuralTargetPath: this._getCircuralObjectPath(value)
        }
        this.circural.push(circ)

        changeValueTo(null);

      } else {
        const v = _.get(anyJSON, lodashPath)
        const newValue = this.merge(value, v)
        changeValueTo(newValue)
      }
    })

    let res = this.merge(json, anyJSON)
    return res;
  }

  public static merge(newValue, existedValue) {
    let className = CLASS.getNameFromObject(existedValue);
    if (className === 'Date') {
      return new Date(newValue)
    }
    let classFunction = CLASS.getBy(className)
    if (_.isFunction(classFunction)) {
      let res = new (classFunction as any)();
      for (const key in existedValue) {
        if (existedValue.hasOwnProperty(key)) {
          res[key] = newValue[key]
        }
      }
      return res;
    }
    return newValue;
  }

  public static stringify(anyJSON: Object, replace?: any, spaces?: number) {
    const json = this.cleaned(anyJSON);
    return JSON.stringify(json, replace, spaces);
  }


  public static parse(json: string, circs: Circ[] = []) {
    let res = JSON.parse(json);
    circs.forEach(({ circuralTargetPath, pathToObj }) => {

      if (circuralTargetPath === '') {
        _.set(res, pathToObj, res)
      } else {
        let v = _.get(res, circuralTargetPath);
        _.set(res, pathToObj, v)
      }

    })
    return res;
  }



  private static _getCircuralObjectPath(circuralTilda: string) {
    circuralTilda = circuralTilda.replace(/^\[Circular \~\.?/, '')

    return this._fixPath(circuralTilda
      .replace(/\]$/, ''))
  }

  private static _fixPath(almostLodashPath: string) {
    if (almostLodashPath === '') {
      return ''
    }
    const s = almostLodashPath.split('.');

    for (let index = 0; index < s.length; index++) {
      const part = s[index];
      if (!_.isNaN(Number(part))) {
        s[index] = `[${s[index]}]`
      } else if (index > 0) {
        s[index] = `.${s[index]}`
      }
    }
    return s.join('')
  }







}
