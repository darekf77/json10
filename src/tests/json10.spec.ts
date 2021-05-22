import { _ } from 'tnp-core';
import { describe, before, it, beforeEach } from 'mocha'
import { expect } from 'chai';
import { CLASS } from 'typescript-class-helpers';

import * as jsonStrinigySafe from 'json-stringify-safe';


import { JSON10 } from '../index';
import { Log } from 'ng2-logger'
const log = Log.create('Spec JSON10')
// log == 500

@CLASS.NAME('Proj', {
  uniqueKey: 'location'
})
class Proj {
  static locationsID = 0;
  constructor() {
    this.location = `location_${Proj.locationsID++}`
  }
  parent: Proj;
  isProjectInstance = true;
  location: string;
  browser: {
    child?: Proj;
    children: Proj[];
  } = {
      children: []
    }
}

@CLASS.NAME('Test')
export class Test {
  static id = 0;

  id: number;

  users: User[];

  name: string;
  constructor() {
    this.id = Test.id++;
  }
}


@CLASS.NAME('User')
export class User {
  static id = 0;

  static users = [new User(), new User()]

  browser: User = {} as any

  dupa() {
    console.log('jest em!')
    return true;
  }

  id: number;

  authors: User[];
  friend: User;
  friend2?: User;
  get authorsGetter() {
    return this.browser.authors;
  }
  test: Test;
  constructor(id?: number, public realId: string = void 0) {
    if (_.isNumber(id)) {
      this.id = id;
    } else {
      this.id = User.id++;
    }

  }
}



// const instance = BrowserDB.instance;

describe('Json 10 circural references tests', () => {

  beforeEach(() => {
    Proj.locationsID = 0;
  })

  it('Circural refences should works ', async () => {

    let u1 = new User()
    let u2 = new User()
    let test = new Test()

    u1.test = test;
    test.users = [u1, u2]

    // log.i('test', test)
    let cc = []
    let cleaned = JSON10.cleaned(test, ccc => cc = ccc)
    // log.i('cleaned', cleaned)
    // log.i('cc', cc)
    expect(_.isNull(cleaned.users[0].test)).to.be.true;
    // console.log('circs', JSON10.circural)

    // log.i('test', test)

    let circural = []
    let stringify = JSON10.stringify(test, void 0, void 0, circs => {
      circural = circs;
    })
    // console.log('circs', JSON10.circural)
    let after: Test = JSON10.parse(stringify, circural)
    // log.i('after', after)


    expect(_.isNull(after.users[0].test.users)).to.be.false;

    // expect(JSON10.structureArray(cleaned)).to.deep.eq(JSON10.structureArray(after))
  })


  it('Should clean objec', async () => {

    let u1 = new User()
    let u2 = new User()
    let test = new Test()
    u1.test = test;
    test.users = [u1, u2]
    u1.friend = new User();

    let s = JSON10.cleaned(test, circs => {
      // console.log('circs', circs)
    }) as Test;
    // log.i('cleaned', s)

    // console.log(CLASS.getNameFromObject(s.users[0]))
    expect(s).to.be.instanceOf(Test)
    expect(s.users[0]).to.be.instanceOf(User);

    expect(s.users[0].friend).to.be.instanceOf(User);
    expect(s.users[1]).to.be.instanceOf(User);

  })



  it('Should array of objects', async () => {


    // console.clear()
    let u1 = new User()
    let u2 = new User()
    let u3 = new User()
    u1.friend = u2;
    u2.friend = u1;
    u3.authors = [u1, u2]
    let arr = [
      u1,
      u2,
      u3
    ]

    let cleanArr = JSON10.cleaned(arr, circs => {
      // console.log('circs', circs)
    }) as User[];
    // log.i('cleanArr',cleanArr)
    expect(cleanArr[0]).to.be.instanceOf(User);
    expect(cleanArr[1]).to.be.null;
    expect(cleanArr[2]).to.be.instanceOf(User);

  })

  it('Should hadnle ids', async () => {
    const jedynka = 'jedynka'
    let u1 = new User(111, jedynka)
    // let u2 = new User(222)
    // let u3 = new User(333)
    let u4asu1 = new User(111, 'czwórka')

    u1.friend = u4asu1;
    u4asu1.friend = u1;

    const arr = [u1, u4asu1]

    const cleanNormal = JSON10.cleaned(arr) as User[]

    // log.i('cleanNormal', cleanNormal)


    // log.i(cleanBatter)

    expect(cleanNormal[1]).to.be.null;
    expect(cleanNormal[0].friend).to.be.null;
    expect(cleanNormal[0].realId).to.be.eq(jedynka);
  })


  it('Should hadnle ommiting properties', async () => {
    const jedynka = 'jedynka'
    let u1 = new User(111, jedynka)
    // let u2 = new User(222)
    // let u3 = new User(333)
    let u4asu1 = new User(111, 'czwórka')

    u1.friend = u4asu1;
    u4asu1.friend = u1;

    const obj = { u1, u4asu1, hello: u1 }

    let cc = []
    const cleanNormal = JSON10.cleaned(obj, ccc => (cc = ccc)) as any;

    // log.i('ommittt', cleanNormal)
    // log.i('cc', cc)


    // log.i(cleanBatter)

    expect(cleanNormal.u1).to.be.instanceOf(User)
  })

  // xit("Should handle normal", async () => {
  //   let p1 = new Proj()
  //   let p2 = new Proj()
  //   let p3 = new Proj()
  //   let p4 = new Proj()

  //   p1.browser.child = p2;
  //   p2.browser.child = p1;
  //   let oo = {
  //     p1, p2
  //   }

  //   // p1.browser.children = [p2, p3]
  //   // p2.browser.children = [p1, p4]
  //   // let oo = [
  //   //   p1, p2, p3, p4
  //   // ];


  //   const res = JSON10.cleaned(oo)
  //   // log.i('res', res)
  //   // log.i('cc', JSON10.circural)

  // });

  // xit("Should handle normal", async () => {

  //   let p1 = new Proj()
  //   let p2 = new Proj()
  //   let p3 = new Proj()
  //   let p4 = new Proj()

  //   p1.parent = p1;
  //   p2.parent = p1;

  //   // log.i('res', JSON10.cleaned([ p1, p2 ]))
  //   // log.i('cc', JSON10.circural)
  //   const o = { p1, p2 }
  //   log.i('res', JSON10.cleaned(o))
  //   log.i('cc', JSON10.circural)

  // });

  // it("Should handle uniqueIndexes", async () => {
  //   let oo = [
  //     {
  //       "browser": {
  //         "children": [
  //           {
  //             "browser": {},
  //             "requiredLibs": [],
  //             "reinstallCounter": 1,
  //             "location": "/Users/dfilipiak/projects/npm/morphi/examples",
  //             "type": "workspace",
  //             "__defaultPort": 5000
  //           },
  //           {
  //             "browser": {},
  //             "requiredLibs": [],
  //             "reinstallCounter": 1,
  //             "location": "/Users/dfilipiak/projects/npm/morphi/super-simple-morphi-example",
  //             "type": "isomorphic-lib",
  //             "__defaultPort": 4000
  //           }
  //         ],
  //         "name": "morphi",
  //         "isWorkspace": false,
  //         "isCloud": true
  //       },
  //       "requiredLibs": [],
  //       "reinstallCounter": 1,
  //       "location": "/Users/dfilipiak/projects/npm/morphi",
  //       "type": "isomorphic-lib",
  //       "__defaultPort": 4000
  //     },
  //     {
  //       "browser": {},
  //       "requiredLibs": [],
  //       "reinstallCounter": 1,
  //       "location": "/Users/dfilipiak/projects/npm/morphi/examples",
  //       "type": "workspace",
  //       "__defaultPort": 5000
  //     },
  //     {
  //       "browser": {},
  //       "requiredLibs": [],
  //       "reinstallCounter": 1,
  //       "location": "/Users/dfilipiak/projects/npm/morphi/examples/isomorphic-lib",
  //       "type": "isomorphic-lib",
  //       "__defaultPort": 4000
  //     },
  //     {
  //       "browser": {},
  //       "requiredLibs": [],
  //       "reinstallCounter": 1,
  //       "location": "/Users/dfilipiak/projects/npm/morphi/super-simple-morphi-example",
  //       "type": "isomorphic-lib",
  //       "__defaultPort": 4000
  //     }
  //   ]

  //   oo = oo.map(o => {
  //     let res = _.merge(new Proj(), o);
  //     if (res.browser && res.browser.children) {
  //       res.browser.children = res.browser.children.map(child => _.merge(new Proj(), child)) as any;
  //     }
  //     return res;
  //   })
  //   console.log(JSON10.structureArray(oo))
  //   const res = JSON10.cleaned(oo)
  //   // expect(JSON10.structureArray(res).length).below(JSON10.structureArray(oo).length)
  //   log.i(res)

  //   // console.log(CLASSNAME.getClassFamilyByClassName('Proj'))
  // })




})
