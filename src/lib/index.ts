import { _ } from 'tnp-core/src';
import { walk, Models } from 'lodash-walk-object/src';
export type Circ = Models.Circ;
import { CLASS } from 'typescript-class-helpers/src';
// import { Log } from 'ng2-logger'
// const log = Log.create('JSON10')

// let counter = 0

export class JSON10 {

  public static structureArray(anyJSON: Object, options?: { include?: string[]; exclude?: string[] }) {
    let pathes = []
    const { include, exclude } = options || {} as any;
    walk.Object(anyJSON, (value, lodashPath) => {

      if (!_.isUndefined(value)) {
        pathes.push(lodashPath)
      }

    }, { include, exclude, checkCircural: true })
    return pathes;
  }


  public static cleaned(json, onCircs?: (circs: Circ[]) => any, options?:
    {
      exclude?: string[];
      include?: string[];
      breadthWalk?: boolean;
    }) {
    // console.log('BETTER SRUGUB', json)
    const result = _.isArray(json) ? [] : {}
    const classFN = CLASS.OBJECT(json).isClassObject && CLASS.getFromObject(json);

    const { exclude, include, breadthWalk } = options || { exclude: [], include: [], breadthWalk: false };

    const { circs } = walk.Object(json, (value, lodashPath, changeValueTo, options) => {

      if (_.isObject(value) && options.isCircural) {
        _.set(result, lodashPath, null)
      } else {
        _.set(result, lodashPath, _.cloneDeep(value))
      }

    }, { include, exclude, breadthWalk, checkCircural: true });

    if (_.isFunction(onCircs)) {
      onCircs(circs)
    }

    return _.isFunction(classFN) ? _.merge(new (classFN as any)(), result) : result;
  }

  public static stringify(anyJSON: Object, replace?: any, spaces?: number, onCircs?: (circs: Circ[]) => any) {
    const json = this.cleaned(anyJSON, onCircs);
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
