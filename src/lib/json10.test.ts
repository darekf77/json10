import { JSON10 } from './json10';

describe('JSON10', () => {
  describe('structureArray', () => {
    it('should return paths for nested object', () => {
      const obj = {
        name: 'Darek',
        address: {
          city: 'Warsaw',
          zip: 12345,
        },
      };

      const paths = JSON10.structureArray(obj);

      expect(paths).toContain('name');
      expect(paths).toContain('address');
      expect(paths).toContain('address.city');
      expect(paths).toContain('address.zip');
    });

    it('should not include undefined values', () => {
      const obj = {
        a: 1,
        b: undefined,
        c: 'hello',
      };

      const paths = JSON10.structureArray(obj);

      expect(paths).toContain('a');
      expect(paths).toContain('c');
      expect(paths).not.toContain('b');
    });

    it('should handle circular structures', () => {
      const obj: any = {
        name: 'root',
      };

      obj.self = obj;

      expect(() => JSON10.structureArray(obj)).not.toThrow();
    });
  });

  describe('cleaned', () => {
    it('should clone a normal object', () => {
      const source = {
        name: 'Darek',
        nested: {
          value: 123,
        },
      };

      const result = JSON10.cleaned(source);

      expect(result).toEqual(source);
      expect(result).not.toBe(source);
      expect(result.nested).not.toBe(source.nested);
    });

    it('should preserve array root', () => {
      const source = [{ id: 1 }, { id: 2 }];

      const result = JSON10.cleaned(source);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(source);
      expect(result).not.toBe(source);
    });

    it('should replace circular reference with null', () => {
      const source: any = {
        name: 'root',
      };

      source.self = source;

      const result = JSON10.cleaned(source);

      expect(result.name).toBe('root');
      expect(result.self).toBeNull();
    });

    it('should detect nested circular reference', () => {
      const source: any = {
        parent: {
          name: 'parent',
        },
      };

      source.parent.self = source.parent;

      const result = JSON10.cleaned(source);

      expect(result.parent.name).toBe('parent');
      expect(result.parent.self).toBeNull();
    });

    it('should detect circular reference pointing to root from deeply nested object', () => {
      const source: any = {
        a: {
          b: {
            c: {},
          },
        },
      };

      source.a.b.c.root = source;

      const result = JSON10.cleaned(source);

      expect(result.a.b.c.root).toBeNull();
    });

    it('should report circular mappings through onCircs', () => {
      const source: any = {
        name: 'root',
      };

      source.self = source;

      const onCircs = vi.fn();

      JSON10.cleaned(source, onCircs);

      expect(onCircs).toHaveBeenCalledOnce();

      const circs = onCircs.mock.calls[0][0];

      expect(Array.isArray(circs)).toBe(true);
      expect(circs.length).toBeGreaterThan(0);
    });

    it('should provide mapping allowing circular reference to be restored', () => {
      const source: any = {
        name: 'root',
      };

      source.self = source;

      let circs: any[] = [];

      const cleaned = JSON10.cleaned(source, value => {
        circs = value;
      });

      expect(cleaned.self).toBeNull();

      const restored = JSON10.applyCircularMapping(cleaned, circs);

      expect(restored.self).toBe(restored);
    });

    // it('should not walk getter properties', () => {
    //   let getterCalls = 0;

    //   const source = {
    //     normal: 123,

    //     get dangerousGetter() {
    //       getterCalls++;
    //       throw new Error('Getter should not be executed');
    //     },
    //   };

    //   expect(() => JSON10.cleaned(source)).not.toThrow();

    //   expect(getterCalls).toBe(0);

    //   const result = JSON10.cleaned(source);

    //   expect(result.normal).toBe(123);
    //   expect(getterCalls).toBe(0);
    // });

    it('should handle multiple circular references', () => {
      const source: any = {
        a: {
          name: 'A',
        },
        b: {
          name: 'B',
        },
      };

      source.a.self = source.a;
      source.b.self = source.b;
      source.a.root = source;
      source.b.root = source;

      let circs: any[] = [];

      const cleaned = JSON10.cleaned(source, value => {
        circs = value;
      });

      expect(cleaned.a.self).toBeNull();
      expect(cleaned.b.self).toBeNull();
      expect(cleaned.a.root).toBeNull();
      expect(cleaned.b.root).toBeNull();

      const restored = JSON10.applyCircularMapping(cleaned, circs);

      expect(restored.a.self).toBe(restored.a);
      expect(restored.b.self).toBe(restored.b);
      expect(restored.a.root).toBe(restored);
      expect(restored.b.root).toBe(restored);
    });
  });

  describe('stringify', () => {
    it('should stringify normal object', () => {
      const source = {
        name: 'Darek',
        age: 123,
      };

      expect(JSON10.stringify(source)).toBe(JSON.stringify(source));
    });

    it('should stringify circular object without throwing', () => {
      const source: any = {
        name: 'root',
      };

      source.self = source;

      expect(() => JSON10.stringify(source)).not.toThrow();

      expect(JSON10.stringify(source)).toBe(
        JSON.stringify({
          name: 'root',
          self: null,
        }),
      );
    });

    it('should support spaces argument', () => {
      const source = {
        a: 1,
      };

      const result = JSON10.stringify(source, undefined, 2);

      expect(result).toBe(JSON.stringify(source, undefined, 2));
    });

    it('should return circular mappings through callback', () => {
      const source: any = {
        name: 'root',
      };

      source.self = source;

      const onCircs = vi.fn();

      JSON10.stringify(source, undefined, undefined, onCircs);

      expect(onCircs).toHaveBeenCalledOnce();

      const circs = onCircs.mock.calls[0][0];

      expect(circs.length).toBeGreaterThan(0);
    });
  });

  describe('applyCircularMapping', () => {
    it('should restore reference to root object', () => {
      const json: any = {
        name: 'root',
        self: null,
      };

      const result = JSON10.applyCircularMapping(json, [
        {
          pathToObj: 'self',
          circuralTargetPath: '',
        } as any,
      ]);

      expect(result.self).toBe(result);
    });

    it('should restore reference to nested object', () => {
      const json: any = {
        user: {
          name: 'Darek',
        },
        reference: null,
      };

      const result = JSON10.applyCircularMapping(json, [
        {
          pathToObj: 'reference',
          circuralTargetPath: 'user',
        } as any,
      ]);

      expect(result.reference).toBe(result.user);
    });

    it('should restore deeply nested circular reference', () => {
      const json: any = {
        parent: {
          child: {
            parent: null,
          },
        },
      };

      const result = JSON10.applyCircularMapping(json, [
        {
          pathToObj: 'parent.child.parent',
          circuralTargetPath: 'parent',
        } as any,
      ]);

      expect(result.parent.child.parent).toBe(result.parent);
    });

    it('should use direct value when circuralTargetPath is not a string', () => {
      const target = {
        external: true,
      };

      const json: any = {
        ref: null,
      };

      const result = JSON10.applyCircularMapping(json, [
        {
          pathToObj: 'ref',
          circuralTargetPath: target,
        } as any,
      ]);

      expect(result.ref).toBe(target);
    });

    it('should do nothing for empty mappings', () => {
      const json = {
        a: 1,
      };

      expect(JSON10.applyCircularMapping(json, [])).toBe(json);
    });

    it('should return the same root object', () => {
      const json = {
        a: 1,
      };

      const result = JSON10.applyCircularMapping(json);

      expect(result).toBe(json);
    });
  });

  describe('parse', () => {
    it('should behave like JSON.parse without circular mappings', () => {
      const result = JSON10.parse('{"name":"Darek","age":123}');

      expect(result).toEqual({
        name: 'Darek',
        age: 123,
      });
    });

    it('should restore root circular reference', () => {
      const result = JSON10.parse('{"name":"root","self":null}', [
        {
          pathToObj: 'self',
          circuralTargetPath: '',
        } as any,
      ]);

      expect(result.name).toBe('root');
      expect(result.self).toBe(result);
    });

    it('should restore nested circular reference', () => {
      const result = JSON10.parse(
        JSON.stringify({
          parent: {
            name: 'parent',
            child: {
              parent: null,
            },
          },
        }),
        [
          {
            pathToObj: 'parent.child.parent',
            circuralTargetPath: 'parent',
          } as any,
        ],
      );

      expect(result.parent.child.parent).toBe(result.parent);
    });
  });

  describe('full circular round trip', () => {
    it('should stringify and parse root circular object', () => {
      const source: any = {
        name: 'root',
        value: 123,
      };

      source.self = source;

      let circs: any[] = [];

      const json = JSON10.stringify(source, undefined, undefined, value => {
        circs = value;
      });

      const restored = JSON10.parse(json, circs);

      expect(restored).toEqual({
        name: 'root',
        value: 123,
        self: restored,
      });

      expect(restored.self).toBe(restored);
    });

    it('should restore complex object graph', () => {
      const source: any = {
        users: [
          {
            name: 'Alice',
          },
          {
            name: 'Bob',
          },
        ],
      };

      source.users[0].friend = source.users[1];
      source.users[1].friend = source.users[0];

      source.users[0].root = source;
      source.users[1].root = source;

      let circs: any[] = [];

      const json = JSON10.stringify(source, undefined, undefined, value => {
        circs = value;
      });

      const restored = JSON10.parse(json, circs);

      expect(restored.users[0].name).toBe('Alice');
      expect(restored.users[1].name).toBe('Bob');

      expect(restored.users[0].friend).toBe(restored.users[1]);
      expect(restored.users[1].friend).toBe(restored.users[0]);

      expect(restored.users[0].root).toBe(restored);
      expect(restored.users[1].root).toBe(restored);
    });
  });
});
