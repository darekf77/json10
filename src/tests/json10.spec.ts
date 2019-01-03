import * as _ from 'lodash';
import { describe, before } from 'mocha'
import { expect } from 'chai';
import { CLASS } from 'typescript-class-helpers';

import { Log } from 'ng2-logger'
import { JSON10 } from '../index';
const log = Log.create('Spec JSON10')


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

  dupa() {
    console.log('jest em!')
    return true;
  }

  id: number;

  authors: User[];
  friend: User;
  test: Test;
  constructor() {
    this.id = User.id++;
  }
}



// const instance = BrowserDB.instance;

describe('Json 10 circural references tests', () => {




  it('Circural refences should works ', async () => {

    let u1 = new User()
    let u2 = new User()
    let before = new Test()
    u1.test = before;
    before.users = [u1, u2]
    // log.i('before', before)
    let cleanedBefore = JSON10.cleaned(before)

    let s = JSON10.stringify(before)
    // console.log(JSON10.circural)
    let after: Test = JSON10.parse(s, JSON10.circural)
    let cleanedAfter = JSON10.cleaned(after)
    // log.i('after', after)
    // console.log

    expect(_.isNull(after.users[0].test)).to.be.false;
    expect(JSON10.structureArray(cleanedBefore)).to.deep.eq(JSON10.structureArray(cleanedAfter))
  })


  it('Should clean objec', async () => {

    let u1 = new User()
    let u2 = new User()
    let test = new Test()
    u1.test = test;
    test.users = [u1, u2]
    u1.friend = new User();

    let s = JSON10.cleaned(test) as Test;
    // log.i('clean', s)

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

    let cleanArr = JSON10.cleaned(arr) as User[];

    expect(cleanArr[0]).to.be.instanceOf(User);
    expect(cleanArr[1]).to.be.instanceOf(User);
    expect(cleanArr[2]).to.be.instanceOf(User);

  })


})
