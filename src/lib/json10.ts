import { _ } from 'tnp-core/src';
import { walk, Models } from 'lodash-walk-object/src';
export { Circ } from 'lodash-walk-object/src';
import { Circ } from 'lodash-walk-object/src';
import { CLASS } from 'typescript-class-helpers/src';
// import { Log } from 'ng2-logger'
// const log = Log.create('JSON10')

// let counter = 0

export class JSON10 {
  public static structureArray(
    anyJSON: Object,
    options?: { include?: string[]; exclude?: string[] },
  ) {
    let pathes = [];
    const { include, exclude } = options || ({} as any);
    walk.Object(
      anyJSON,
      (value, lodashPath) => {
        if (!_.isUndefined(value)) {
          pathes.push(lodashPath);
        }
      },
      { include, exclude, checkCircural: true },
    );
    return pathes;
  }

  public static cleaned(
    json,
    onCircs?: (circs: Circ[]) => any,
    options?: {
      exclude?: string[];
      include?: string[];
      breadthWalk?: boolean;
    },
  ) {
    // console.log('BETTER SRUGUB', json)
    const result = _.isArray(json) ? [] : {};

    const { exclude, include, breadthWalk } = options || {
      exclude: [],
      include: [],
      breadthWalk: false,
    };

    const { circs } = walk.Object(
      json,
      (value, lodashPath, changeValueTo, options) => {
        if (_.isObject(value) && options.isCircural) {
          _.set(result, lodashPath, null);
        } else {
          _.set(result, lodashPath, _.cloneDeep(value));
        }
      },
      { include, exclude, breadthWalk, checkCircural: true },
    );

    if (_.isFunction(onCircs)) {
      onCircs(circs);
    }

    return result;
  }

  public static stringify(
    anyJSON: Object,
    replace?: any,
    spaces?: number,
    onCircs?: (circs: Circ[]) => any,
  ): string {
    const json = this.cleaned(anyJSON, onCircs);
    return JSON.stringify(json, replace, spaces);
  }

  public static applyCircularMapping(json: object, circs: Circ[] = []): any {
    if (circs && _.isArray(circs)) {
      circs.forEach(({ circuralTargetPath, pathToObj }) => {
        if (_.isString(circuralTargetPath)) {
          if (circuralTargetPath === '') {
            _.set(json, pathToObj, json);
          } else {
            let v = _.get(json, circuralTargetPath);
            _.set(json, pathToObj, v);
          }
        } else {
          _.set(json, pathToObj, circuralTargetPath);
        }
      });
    }
    return json;
  }

  public static parse(json: string, circs: Circ[] = []): any {
    let res = JSON.parse(json);
    res = JSON10.applyCircularMapping(res, circs);
    return res;
  }
}
