

import * as _ from 'lodash';
import { walk } from 'lodash-walk-object';
import { CLASS } from 'typescript-class-helpers';
import { Log } from 'ng2-logger'
const log = Log.create('JSON10')

export type InDBType = { target: any; path: string; };
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
      if (!_.isUndefined(value)) {
        pathes.push(lodashPath)
      }

    })
    return pathes;
  }


  public static cleaned(json, onCircs?: (circs: Circ[]) => any, options?: { ommitProperties?: string[] }) {
    // console.log('BETTER SRUGUB', json)
    const result = _.isArray(json) ? [] : {}
    const classFN = CLASS.OBJECT(json).isClassObject && CLASS.getFromObject(json);
    const db = {}
    const stack = [];
    const circural: Circ[] = [];
    const { ommitProperties } = options;

    walk.Object(json, (value, lodashPath, changeValueTo, options) => {

      if (_.isArray(ommitProperties) && !!ommitProperties.find(p => lodashPath.startsWith(p))) {
        // console.log("SKIPPING", lodashPath)
        _.set(result, lodashPath, value)
        options.skipObject()
        return;
      }

      // console.log(lodashPath)
      if (_.isObject(value)) {
        let indexValue = CLASS.OBJECT(value).indexValue
        if (CLASS.OBJECT(value).isClassObject && !_.isUndefined(indexValue)) {
          let className = CLASS.getNameFromObject(value);
          let p = `${className}.id_${indexValue}`;
          const inDB: InDBType = _.get(db, p);
          if (inDB && CLASS.OBJECT(inDB.target).isEqual(value)) {
            const circ: Circ = {
              pathToObj: lodashPath,
              circuralTargetPath: inDB.path
            }
            circural.push(circ)
            _.set(result, lodashPath, null)
            options.skipObject()
          } else {
            _.set(db, p, {
              path: lodashPath,
              target: value
            } as InDBType)
            _.set(result, lodashPath, _.cloneDeep(value))
          }
        } else {
          const inStack = stack.find((c: InDBType) => c.target === value);
          if (!!inStack) {
            const circ: Circ = {
              pathToObj: lodashPath,
              circuralTargetPath: inStack.path
            }
            circural.push(circ)
            _.set(result, lodashPath, null)
            options.skipObject()
          } else {
            stack.push({
              path: lodashPath,
              target: value
            } as InDBType);
            _.set(result, lodashPath, _.cloneDeep(value))
          }

        }
      } else {
        _.set(result, lodashPath, value)
      }

    });

    if (_.isFunction(onCircs)) {
      onCircs(circural)
    }
    this.circural = circural;
    // log.i('db', db)
    return _.isFunction(classFN) ? _.merge(new (classFN as any)(), result) : result;
  }

  public static stringify(anyJSON: Object, replace?: any, spaces?: number) {
    const json = this.cleaned(anyJSON);
    return JSON.stringify(json, replace, spaces);
  }

  public static parse(json: string, circs: Circ[] = []) {
    let res = JSON.parse(json);
    if (_.isArray(circs)) {
      circs.forEach(({ circuralTargetPath, pathToObj }) => {

        if (circuralTargetPath === '') {
          _.set(res, pathToObj, res)
        } else {
          let v = _.get(res, circuralTargetPath);
          _.set(res, pathToObj, v)
        }

      })
    }
    return res;
  }




}
